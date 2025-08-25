// src/app/api/hls/key/route.ts
import { NextRequest, NextResponse } from "next/server";
import { client } from '@/lib/sanity';

/**
 * HLS Key API - 從 Sanity 資料庫讀取解密金鑰
 * 
 * Security note:
 * - Prefer to require CloudFront Signed Cookies so only authorized sessions can fetch the key.
 * - Make sure your Signed Cookies' Domain is set to the parent domain (e.g. `.yourdomain.com`)
 *   so this API (app subdomain) can see them.
 */

async function loadKeyFromDatabase(trackId: string): Promise<string | null> {
  try {
    // 從資料庫查詢 track 的金鑰
    const track = await client.fetch(`
      *[_type == "track" && externalTrackId == $trackId][0]{
        hlsKey
      }
    `, { trackId });
    
    return track?.hlsKey || null;
  } catch (error) {
    console.error('Error loading key from database:', error);
    return null;
  }
}

function hexToBytes(hex: string): Uint8Array {
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length !== 32) {
    throw new Error("key must be 16 bytes hex (32 hex chars)");
  }
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export async function GET(req: NextRequest) {
  const track = req.nextUrl.searchParams.get("track") || "";
  if (!track) return new NextResponse("bad request", { status: 400 });

  // Optional gate: require CloudFront Signed Cookies (recommended in prod)
  const hasCfCookies = ["CloudFront-Policy","CloudFront-Signature","CloudFront-Key-Pair-Id"]
    .every((n) => !!req.cookies.get(n)?.value);
  
  // TEMPORARY: Relax cookie check for testing
  // TODO: Re-enable this check when CloudFront is properly configured
  if (!hasCfCookies) {
    console.warn(`[DEV] CloudFront cookies not found for track: ${track}. Allowing for testing.`);
    // return new NextResponse("forbidden", { status: 403 });
  }

  const hex = await loadKeyFromDatabase(track);
  if (!hex) return new NextResponse("not found", { status: 404 });

  try {
    const bytes = hexToBytes(hex);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse("server key invalid", { status: 500 });
  }
}
