import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-sanity-secret');
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({} as any));
  const docType = body?.transition?.to?._type || body?._type || body?.type;

  if (docType === 'release') revalidateTag('releases');
  if (docType === 'track') revalidateTag('tracks');
  if (docType === 'product') revalidateTag('products');

  return NextResponse.json({ revalidated: true, docType: docType ?? 'unknown' });
}
