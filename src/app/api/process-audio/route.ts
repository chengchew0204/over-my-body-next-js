import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

interface ProcessingResult {
  success: boolean;
  message?: string;
  trackId?: string;
  encryptionKey?: string;
  files?: Array<{
    fileName: string;
    s3Key: string;
    url: string;
    cloudFrontUrl?: string | null;
    proxyUrl?: string;
  }>;
  originalFile?: {
    fileName: string;
    s3Key: string;
    url: string;
    cloudFrontUrl?: string | null;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ProcessingResult>> {
  let tempDir: string | null = null;

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audioFile') as File;
    const trackTitle = formData.get('trackTitle') as string;
    const albumPath = formData.get('albumPath') as string;

    if (!audioFile || !trackTitle || !albumPath) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: audioFile, trackTitle, or albumPath' 
      }, { status: 400 });
    }

    console.log(`Processing audio: ${trackTitle} for album: ${albumPath}`);

    // Create temporary directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hls-processing-'));
    console.log(`Created temp directory: ${tempDir}`);

    // Save uploaded file
    const inputFileName = `input${path.extname(audioFile.name)}`;
    const inputPath = path.join(tempDir, inputFileName);
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    await fs.writeFile(inputPath, audioBuffer);
    console.log(`Saved input file: ${inputPath}`);

    // Generate encryption key and track ID
    const encryptionKey = crypto.randomBytes(16).toString('hex');
    const trackId = generateTrackId(trackTitle, albumPath);
    
    console.log(`Generated track ID: ${trackId}`);
    console.log(`Generated encryption key: ${encryptionKey}`);

    // Create key info file for FFmpeg
    const keyInfoPath = path.join(tempDir, 'key.info');
    const keyFilePath = path.join(tempDir, 'key.bin');
    
    // Write binary key file
    const keyBuffer = Buffer.from(encryptionKey, 'hex');
    await fs.writeFile(keyFilePath, keyBuffer);

    // Create key info file
    const keyInfoContent = [
      'key.bin', // Key URI (will be replaced in m3u8)
      keyFilePath, // Key file path
      crypto.randomBytes(16).toString('hex') // IV (initialization vector)
    ].join('\n');
    
    await fs.writeFile(keyInfoPath, keyInfoContent);

    // Run FFmpeg to convert to HLS with encryption
    const outputDir = path.join(tempDir, 'output');
    await fs.mkdir(outputDir);
    
    const m3u8Path = path.join(outputDir, 'index.m3u8');
    
    await runFFmpeg([
      '-i', inputPath,
      '-c:a', 'aac',
      '-b:a', '128k',
      '-hls_time', '6',
      '-hls_playlist_type', 'vod',
      '-hls_key_info_file', keyInfoPath,
      '-hls_segment_filename', path.join(outputDir, 'seg_%04d.ts'),
      m3u8Path
    ]);

    console.log('FFmpeg conversion completed');

    // Read and modify the m3u8 file to use our key endpoint
    let m3u8Content = await fs.readFile(m3u8Path, 'utf-8');
    
    // Use absolute URL for the key endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const keyUrl = `${baseUrl}/api/hls/key?track=${encodeURIComponent(trackId)}`;
    
    m3u8Content = m3u8Content.replace(
      /URI="[^"]*"/,
      `URI="${keyUrl}"`
    );
    await fs.writeFile(m3u8Path, m3u8Content);

    console.log('Updated m3u8 file with custom key URI');

    // Upload all files to S3
    const outputFiles = await fs.readdir(outputDir);
    const uploadResults = [];

    for (const fileName of outputFiles) {
      const filePath = path.join(outputDir, fileName);
      const fileBuffer = await fs.readFile(filePath);
      
      const s3Key = `hls/${albumPath}/${trackId}/${fileName}`;
      const contentType = getContentType(fileName);
      
      console.log(`Uploading ${fileName} to S3: ${s3Key}`);

      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: contentType,
        CacheControl: fileName.endsWith('.m3u8') ? 'no-cache' : 'max-age=31536000',
      });

      await s3Client.send(uploadCommand);

      // Create all possible URLs
      const s3DirectUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
      const cloudFrontUrl = process.env.CLOUDFRONT_DOMAIN ? 
        `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}` : null;
      const proxyUrl = `${baseUrl}/api/proxy/hls/${s3Key.replace('hls/', '')}`;
      
      uploadResults.push({
        fileName,
        s3Key,
        url: s3DirectUrl,
        cloudFrontUrl,
        proxyUrl,
        // 主要串流URL：優先 CloudFront > S3 Direct > Proxy
        primaryUrl: cloudFrontUrl || s3DirectUrl || proxyUrl,
      });
    }

    console.log(`Successfully uploaded ${uploadResults.length} files to S3`);

    // Upload original file to backup directory
    let originalFileResult: ProcessingResult['originalFile'] = undefined;
    try {
      const originalFileName = `${trackId}.wav`;
      const originalS3Key = `original_files/${albumPath}/${originalFileName}`;
      
      console.log(`Uploading original file to S3: ${originalS3Key}`);

      const originalUploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: originalS3Key,
        Body: audioBuffer, // Use the original audio buffer
        ContentType: 'audio/wav',
        CacheControl: 'max-age=31536000', // Cache for 1 year
      });

      await s3Client.send(originalUploadCommand);

      const originalS3Url = `https://${BUCKET_NAME}.s3.amazonaws.com/${originalS3Key}`;
      const originalCloudFrontUrl = process.env.CLOUDFRONT_DOMAIN ? 
        `https://${process.env.CLOUDFRONT_DOMAIN}/${originalS3Key}` : null;

      originalFileResult = {
        fileName: originalFileName,
        s3Key: originalS3Key,
        url: originalS3Url,
        cloudFrontUrl: originalCloudFrontUrl,
      };

      console.log(`Successfully uploaded original file: ${originalFileName}`);
    } catch (originalUploadError) {
      console.error('Error uploading original file:', originalUploadError);
      // Don't fail the entire process if original file upload fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed and uploaded ${trackTitle}`,
      trackId,
      encryptionKey,
      files: uploadResults,
      originalFile: originalFileResult,
    });

  } catch (error) {
    console.error('Audio processing error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed',
    }, { status: 500 });
  } finally {
    // Clean up temporary directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        console.log(`Cleaned up temp directory: ${tempDir}`);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
  }
}

function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Running FFmpeg with args:', args.join(' '));
    
    const ffmpeg = spawn('ffmpeg', args);
    
    let stderr = '';
    
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('FFmpeg completed successfully');
        resolve();
      } else {
        console.error('FFmpeg failed with code:', code);
        console.error('FFmpeg stderr:', stderr);
        reject(new Error(`FFmpeg failed with exit code ${code}`));
      }
    });
    
    ffmpeg.on('error', (error) => {
      console.error('FFmpeg spawn error:', error);
      reject(error);
    });
  });
}

function generateTrackId(title: string, albumPath: string): string {
  // Create a clean track ID from title and album
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const cleanAlbum = albumPath
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${cleanAlbum}-${cleanTitle}`;
}

function getContentType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();
  
  switch (ext) {
    case 'm3u8':
      return 'application/vnd.apple.mpegurl';
    case 'ts':
      return 'video/mp2t';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'aac':
      return 'audio/aac';
    default:
      return 'application/octet-stream';
  }
}
