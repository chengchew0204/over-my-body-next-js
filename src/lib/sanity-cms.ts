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
  const products = await sanity.fetch(PRODUCTS_QUERY, {}, { next: { tags: ['products'] } });
  
  return products?.map((p: any) => ({
    id: p._id,
    slug: p.slug,
    title: p.title,
    coverImage: getSanityImageUrl(p.coverUrl, 'medium', 95),
    images: p.gallery?.map((img: any) => getSanityImageUrl(img.url, 'large', 95)).filter(Boolean) || [],
    priceText: p.price ? `$${p.price.toFixed(2)} ${p.currency || 'USD'}` : '',
    buyUrl: p.buyUrl,
    description: p.descriptionHtml,
    tags: p.tags || [],
  })) || [];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const p = await sanity.fetch(PRODUCT_BY_SLUG_QUERY, { slug }, { next: { tags: ['products'] } });
  
  if (!p) return null;
  
  return {
    id: p._id,
    slug: p.slug,
    title: p.title,
    coverImage: getSanityImageUrl(p.coverUrl, 'medium', 95),
    images: p.gallery?.map((img: any) => getSanityImageUrl(img.url, 'large', 95)).filter(Boolean) || [],
    priceText: p.price ? `$${p.price.toFixed(2)} ${p.currency || 'USD'}` : '',
    buyUrl: p.buyUrl,
    description: p.descriptionHtml,
    tags: p.tags || [],
  };
}

export async function fetchAllSlugs(): Promise<string[]> {
  const slugs = await sanity.fetch(ALL_PRODUCT_SLUGS_QUERY);
  return slugs?.filter(Boolean).map((s: any) => s.slug) || [];
}
