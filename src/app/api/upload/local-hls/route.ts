import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function POST(request: NextRequest) {
  try {
    const { albumPath, localPath } = await request.json();

    if (!albumPath || !localPath) {
      return NextResponse.json({ error: 'Missing albumPath or localPath' }, { status: 400 });
    }

    console.log(`Uploading local HLS files from: ${localPath} to album: ${albumPath}`);

    // Construct the full local path
    const fullLocalPath = path.join(process.cwd(), 'public/hls', localPath);
    
    console.log(`Reading from: ${fullLocalPath}`);

    // Check if directory exists
    try {
      await fs.access(fullLocalPath);
    } catch {
      return NextResponse.json({ error: `Local path not found: ${fullLocalPath}` }, { status: 404 });
    }

    // Read all files in the directory
    const files = await fs.readdir(fullLocalPath);
    console.log(`Found ${files.length} files:`, files);

    const uploadResults = [];

    for (const fileName of files) {
      // Skip hidden files and directories
      if (fileName.startsWith('.')) continue;

      const filePath = path.join(fullLocalPath, fileName);
      const stats = await fs.stat(filePath);
      
      // Skip directories
      if (stats.isDirectory()) continue;

      console.log(`Reading file: ${filePath}`);
      const fileBuffer = await fs.readFile(filePath);
      
      // Determine content type
      const contentType = getContentType(fileName);
      
      // Create S3 key
      const s3Key = `hls/${albumPath}/${fileName}`;
      
      console.log(`Uploading ${fileName} to s3://${BUCKET_NAME}/${s3Key}`);

      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: contentType,
        // Set cache control for HLS files
        CacheControl: fileName.endsWith('.m3u8') ? 'no-cache' : 'max-age=31536000',
      });

      await s3Client.send(uploadCommand);

      uploadResults.push({
        fileName,
        s3Key,
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`,
        cloudFrontUrl: process.env.CLOUDFRONT_DOMAIN ? 
          `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}` : null,
        size: stats.size,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadResults.length} files from ${localPath}`,
      files: uploadResults,
      albumPath,
      localPath,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
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
