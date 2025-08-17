// TODO: Notion or Airtable accessors for /store data (getAllProducts, getProductBySlug)

/**
 * Content Management System utilities
 * Future implementation will integrate with Notion or Airtable for store data
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  slug: string;
}

export async function getAllProducts(): Promise<Product[]> {
  // TODO: Implement CMS integration for product data
  throw new Error('Not implemented yet');
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // TODO: Implement single product fetch by slug
  throw new Error('Not implemented yet');
}
