import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const albumPath = formData.get('albumPath') as string;

    if (!files.length || !albumPath) {
      return NextResponse.json({ error: 'Missing files or album path' }, { status: 400 });
    }

    console.log(`Uploading ${files.length} files to album: ${albumPath}`);

    const uploadResults = [];

    for (const file of files) {
      const fileName = file.name;
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      
      // Determine content type based on file extension
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
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${files.length} files`,
      files: uploadResults,
      albumPath,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const albumPath = searchParams.get('albumPath');

    if (!albumPath) {
      return NextResponse.json({ error: 'Missing album path' }, { status: 400 });
    }

    // List files in the album directory
    const prefix = `hls/${albumPath}/`;
    
    // For simplicity, we'll return a predefined structure
    // In production, you'd use ListObjectsV2Command to get actual files
    const files = [
      {
        fileName: 'index.m3u8',
        s3Key: `${prefix}index.m3u8`,
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${prefix}index.m3u8`,
        cloudFrontUrl: process.env.CLOUDFRONT_DOMAIN ? 
          `https://${process.env.CLOUDFRONT_DOMAIN}/${prefix}index.m3u8` : null,
      }
    ];

    return NextResponse.json({
      success: true,
      albumPath,
      files,
    });

  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: 'Failed to list files', details: error instanceof Error ? error.message : 'Unknown error' },
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
