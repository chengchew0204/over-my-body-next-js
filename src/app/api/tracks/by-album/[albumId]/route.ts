import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  try {
    const { albumId } = await params;

    // Fetch album details by slug
    const album = await client.fetch(`
      *[_type == "release" && slug.current == $albumId][0]{
        _id,
        name,
        artist,
        "slug": slug.current,
        "coverUrl": cover.asset->url,
        type,
        releaseDate
      }
    `, { albumId });

    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    // Fetch tracks for this album using album _id
    const tracks = await client.fetch(`
      *[_type == "track" && album._ref == $albumId] | order(trackNumber asc) {
        _id,
        name,
        trackNumber,
        durationSec,
        streamUrl,
        originalFileLink,
        externalTrackId
      }
    `, { albumId: album._id });

    return NextResponse.json({
      success: true,
      album,
      tracks,
    });

  } catch (error) {
    console.error('Error fetching album tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch album tracks' },
      { status: 500 }
    );
  }
}
