import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Path to store keys temporarily (in production, use a database)
const KEYS_FILE_PATH = path.join(process.cwd(), 'temp-hls-keys.json');

export async function POST(request: NextRequest) {
  try {
    const { trackId, encryptionKey } = await request.json();

    if (!trackId || !encryptionKey) {
      return NextResponse.json({ error: 'Missing trackId or encryptionKey' }, { status: 400 });
    }

    // Load existing keys
    let keys: Record<string, string> = {};
    
    try {
      const existingKeys = await fs.readFile(KEYS_FILE_PATH, 'utf-8');
      keys = JSON.parse(existingKeys);
    } catch {
      // File doesn't exist or is invalid, start with empty object
      console.log('Creating new keys file');
    }

    // Add new key
    keys[trackId] = encryptionKey;

    // Save updated keys
    await fs.writeFile(KEYS_FILE_PATH, JSON.stringify(keys, null, 2));

    console.log(`Added key for track: ${trackId}`);

    return NextResponse.json({
      success: true,
      message: `Key added for track: ${trackId}`,
      totalKeys: Object.keys(keys).length,
    });

  } catch (error) {
    console.error('Error managing keys:', error);
    return NextResponse.json({
      error: 'Failed to manage keys',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return current keys for debugging
    let keys: Record<string, string> = {};
    
    try {
      const existingKeys = await fs.readFile(KEYS_FILE_PATH, 'utf-8');
      keys = JSON.parse(existingKeys);
    } catch {
      // File doesn't exist
    }

    return NextResponse.json({
      success: true,
      keys: Object.keys(keys), // Only return track IDs, not the actual keys
      totalKeys: Object.keys(keys).length,
    });

  } catch (error) {
    console.error('Error reading keys:', error);
    return NextResponse.json({
      error: 'Failed to read keys',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
