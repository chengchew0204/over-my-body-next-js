import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { writeClient } from '@/lib/sanity-write';

interface CreateTrackRequest {
  name: string;
  albumId: string;
  trackNumber: number;
  durationSec?: number;
  streamUrl?: string;
  originalFileLink?: string;
  externalTrackId?: string;
  hlsKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTrackRequest = await request.json();
    
    const { name, albumId, trackNumber, durationSec, streamUrl, originalFileLink, externalTrackId, hlsKey } = body;

    // Validate required fields
    if (!name || !albumId || !trackNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: name, albumId, or trackNumber' },
        { status: 400 }
      );
    }

    // Check if album exists
    const album = await client.fetch(
      `*[_type == "release" && _id == $albumId][0]`,
      { albumId }
    );

    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    // Check for duplicate track numbers in the same album
    const existingTrack = await client.fetch(
      `*[_type == "track" && album._ref == $albumId && trackNumber == $trackNumber][0]`,
      { albumId, trackNumber }
    );

    if (existingTrack) {
      return NextResponse.json(
        { error: `Track number ${trackNumber} already exists in this album` },
        { status: 409 }
      );
    }

    // Create track document
    const trackData = {
      _type: 'track',
      name,
      album: {
        _type: 'reference',
        _ref: albumId,
      },
      trackNumber,
      ...(durationSec && { durationSec }),
      ...(streamUrl && { streamUrl }),
      ...(originalFileLink && { originalFileLink }),
      ...(externalTrackId && { externalTrackId }),
      ...(hlsKey && { hlsKey }),
    };

    const createdTrack = await writeClient.create(trackData);

    return NextResponse.json({
      success: true,
      track: createdTrack,
    });

  } catch (error) {
    console.error('Error creating track:', error);
    
    // 檢查是否是 Sanity 權限錯誤
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json(
        { 
          error: 'Sanity permissions error', 
          details: 'SANITY_API_TOKEN 可能沒有足夠的權限或未正確配置',
          originalError: error.message
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create track', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackId, ...updates } = body;

    if (!trackId) {
      return NextResponse.json(
        { error: 'Missing trackId' },
        { status: 400 }
      );
    }

    // Check if track exists
    const existingTrack = await client.fetch(
      `*[_type == "track" && _id == $trackId][0]`,
      { trackId }
    );

    if (!existingTrack) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    // Update track
    const updatedTrack = await writeClient
      .patch(trackId)
      .set(updates)
      .commit();

    return NextResponse.json({
      success: true,
      track: updatedTrack,
    });

  } catch (error) {
    console.error('Error updating track:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update track', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
