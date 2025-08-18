/**
 * Utility functions for working with album data
 */

export interface Album {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  images: string[];
  priceText: string;
  buyUrl: string;
  description: string;
  tags: string[];
}

/**
 * Extract artist name from album description
 * Descriptions typically follow the pattern: "Artist - Album [OMB###]"
 * 
 * @param description The album description string
 * @returns The extracted artist name or 'Various Artists' if not found
 */
export function extractArtistFromDescription(description: string): string {
  if (!description) return 'Various Artists';
  
  // Look for pattern like "Artist - Album [OMB###]" at the start of description
  const artistMatch = description.match(/^([^-\[]+)\s*-\s*[^-\[]+\s*\[OMB\d+\]/);
  if (artistMatch) {
    return artistMatch[1].trim();
  }
  
  // Alternative pattern: look for first line ending with [OMB###]
  const lines = description.split('\n');
  const firstLine = lines[0]?.trim();
  if (firstLine && firstLine.includes('[OMB')) {
    const parts = firstLine.split(' - ');
    if (parts.length >= 2) {
      return parts[0].trim();
    }
  }
  
  // Fallback: if no pattern matches, return 'Various Artists'
  return 'Various Artists';
}

/**
 * Generate Bandcamp URL from album slug
 * 
 * @param slug The album slug
 * @returns The Bandcamp URL
 */
export function generateBandcampUrl(slug: string): string {
  // Remove spaces and special characters, convert to lowercase
  const cleanSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `https://overmybody.bandcamp.com/album/${cleanSlug}`;
}
