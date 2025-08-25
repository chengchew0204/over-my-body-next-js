import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // optional filter by type

    let query = `*[_type == "release"`;
    
    if (type) {
      query += ` && type == "${type}"`;
    }
    
    query += `] | order(_createdAt desc) [${offset}...${offset + limit}] {
      _id,
      _createdAt,
      name,
      artist,
      type,
      slug,
      releaseDate,
      cover {
        asset -> {
          _id,
          url
        }
      }
    }`;

    const albums = await client.fetch(query);

    // Get total count for pagination
    let countQuery = `count(*[_type == "release"`;
    if (type) {
      countQuery += ` && type == "${type}"`;
    }
    countQuery += `])`;
    
    const total = await client.fetch(countQuery);

    return NextResponse.json({
      success: true,
      albums,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch albums', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
