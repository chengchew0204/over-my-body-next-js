// src/lib/cms.ts
// Adapter layer for Store. Later we can switch to a real CMS by replacing the data fetch logic.
// Keep this exported shape stable so pages do not change when we swap sources.

import fs from "node:fs/promises";
import path from "node:path";

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

async function readLocalProducts(): Promise<Product[]> {
  const file = path.join(process.cwd(), "src", "data", "Products.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as Product[];
}

export async function fetchProducts(): Promise<Product[]> {
  // TODO: replace with real CMS fetch; keep the same return shape
  const products = await readLocalProducts();
  // Show newest first if desired
  return products.slice().reverse();
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const products = await fetchProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function fetchAllSlugs(): Promise<string[]> {
  const products = await fetchProducts();
  return products.map((p) => p.slug);
}
