// TODO: Handle on-demand revalidation when content changes externally (e.g., Vercel Cron)

import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for on-demand revalidation
 * Future implementation will handle cache invalidation for external content updates
 */
export async function POST(request: NextRequest) {
  // TODO: Implement revalidation logic
  // Example: revalidatePath('/releases') when Bandcamp releases change
  
  return NextResponse.json({ 
    message: 'Revalidation endpoint - not implemented yet' 
  }, { status: 501 });
}
