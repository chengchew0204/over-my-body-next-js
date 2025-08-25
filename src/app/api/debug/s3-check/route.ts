import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || 'hls/';

    console.log(`Checking S3 bucket: ${BUCKET_NAME} with prefix: ${prefix}`);

    // List objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 100,
    });

    const listResult = await s3Client.send(listCommand);
    
    const files = listResult.Contents?.map(obj => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
    })) || [];

    // Try to read the m3u8 file content
    let m3u8Content = null;
    const m3u8File = files.find(f => f.key?.endsWith('.m3u8'));
    
    if (m3u8File?.key) {
      try {
        const getCommand = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: m3u8File.key,
        });
        
        const getResult = await s3Client.send(getCommand);
        m3u8Content = await getResult.Body?.transformToString();
      } catch (error) {
        console.error('Error reading m3u8 file:', error);
      }
    }

    return NextResponse.json({
      success: true,
      bucket: BUCKET_NAME,
      region: process.env.AWS_REGION,
      prefix,
      files,
      m3u8Content,
      totalFiles: files.length,
    });

  } catch (error) {
    console.error('S3 check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
