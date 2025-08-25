// src/lib/sanity-cms.ts
// Sanity CMS adapter for Store data
// Replaces the JSON-based CMS with Sanity queries

import { sanity } from './sanity';
import { groq } from 'next-sanity';
import { getSanityImageUrl } from './image-utils';

export type Product = {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  images?: string[];
  priceText: string;      // Free-form price string, e.g., "1,00 €" or "5,00 € – 50,00 €"
  buyUrl?: string;        // External checkout link (Bandcamp, Gumroad, custom, etc.)
  description?: string;
  tags?: string[];
};

type SanityProduct = {
  _id: string;
  title: string;
  slug: string;
  price?: number;
  currency?: string;
  sku?: string;
  stock?: number;
  status?: string;
  buyUrl?: string;
  externalProductId?: string;
  lzsProductId?: string;
  productType?: string;
  descriptionHtml?: string;
  coverUrl?: string;
  gallery?: Array<{ url: string; _key: string }>;
  tags?: string[];
};

type SanitySlug = {
  slug: string;
};

const PRODUCTS_QUERY = groq`*[_type=="product" && status=="published"]|order(_createdAt desc){
  _id, title, "slug": slug.current, price, currency, sku, stock,
  "coverUrl": coverImage.asset->url,
  "gallery": gallery[]{ "url": asset->url, _key },
  buyUrl, descriptionHtml, tags
}`;

const PRODUCT_BY_SLUG_QUERY = groq`*[_type=="product" && slug.current==$slug][0]{
  _id, title, "slug": slug.current, price, currency, sku, stock, status,
  buyUrl, externalProductId, lzsProductId, productType,
  descriptionHtml,
  "coverUrl": coverImage.asset->url,
  "gallery": gallery[]{ "url": asset->url, _key },
  tags
}`;

const ALL_PRODUCT_SLUGS_QUERY = groq`*[_type=="product" && defined(slug.current)]{ "slug": slug.current }`;

export async function fetchProducts(): Promise<Product[]> {
  const products = await sanity.fetch<SanityProduct[]>(PRODUCTS_QUERY, {}, { next: { tags: ['products'] } });
  
  return products?.map((p: SanityProduct) => ({
    id: p._id,
    slug: p.slug,
    title: p.title,
    coverImage: p.coverUrl ? getSanityImageUrl(p.coverUrl, 'medium', 95) : '',
    images: p.gallery?.map((img) => getSanityImageUrl(img.url, 'large', 95)).filter(Boolean) || [],
    priceText: p.price ? `$${p.price.toFixed(2)} ${p.currency || 'USD'}` : '',
    buyUrl: p.buyUrl,
    description: p.descriptionHtml,
    tags: p.tags || [],
  })) || [];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const p = await sanity.fetch<SanityProduct | null>(PRODUCT_BY_SLUG_QUERY, { slug }, { next: { tags: ['products'] } });
  
  if (!p) return null;
  
  return {
    id: p._id,
    slug: p.slug,
    title: p.title,
    coverImage: p.coverUrl ? getSanityImageUrl(p.coverUrl, 'medium', 95) : '',
    images: p.gallery?.map((img) => getSanityImageUrl(img.url, 'large', 95)).filter(Boolean) || [],
    priceText: p.price ? `$${p.price.toFixed(2)} ${p.currency || 'USD'}` : '',
    buyUrl: p.buyUrl,
    description: p.descriptionHtml,
    tags: p.tags || [],
  };
}

export async function fetchAllSlugs(): Promise<string[]> {
  const slugs = await sanity.fetch<SanitySlug[]>(ALL_PRODUCT_SLUGS_QUERY);
  return slugs?.filter(Boolean).map((s) => s.slug) || [];
}

// Track-related types and functions
export type Track = {
  _id: string;
  name: string;
  trackNumber: number;
  durationSec?: number;
  streamUrl?: string;
  originalFileLink?: string;
  externalTrackId?: string;
  hlsKey?: string;
};

export type AlbumWithTracks = {
  _id: string;
  name: string;
  artist: string;
  slug: string;
  coverUrl?: string;
  type?: string;
  releaseDate?: string;
  tracks: Track[];
};

const ALBUM_WITH_TRACKS_QUERY = groq`*[_type=="release" && slug.current==$slug][0]{
  _id,
  name,
  artist,
  "slug": slug.current,
  "coverUrl": cover.asset->url,
  type,
  releaseDate,
  "tracks": *[_type=="track" && album._ref==^._id] | order(trackNumber asc) {
    _id,
    name,
    trackNumber,
    durationSec,
    streamUrl,
    originalFileLink,
    externalTrackId,
    hlsKey
  }
}`;

const ALBUM_TRACKS_COUNT_QUERY = groq`count(*[_type=="track" && album._ref==*[_type=="release" && slug.current==$slug][0]._id])`;

export async function fetchAlbumWithTracks(slug: string): Promise<AlbumWithTracks | null> {
  const album = await sanity.fetch<AlbumWithTracks | null>(ALBUM_WITH_TRACKS_QUERY, { slug }, { next: { tags: ['releases', 'tracks'] } });
  
  if (!album) return null;
  
  return {
    ...album,
    coverUrl: album.coverUrl ? getSanityImageUrl(album.coverUrl, 'medium', 95) : undefined,
  };
}

export async function hasTracks(slug: string): Promise<boolean> {
  const trackCount = await sanity.fetch<number>(ALBUM_TRACKS_COUNT_QUERY, { slug }, { next: { tags: ['tracks'] } });
  return trackCount > 0;
}
