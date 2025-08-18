// src/lib/image-utils.ts
// Utility functions for optimizing Sanity image URLs

export type ImageSize = 'thumbnail' | 'medium' | 'large' | 'original';

export function getSanityImageUrl(url: string, size: ImageSize = 'medium', quality: number = 90): string {
  if (!url || url === 'null') return '';
  
  const sizeParams = {
    thumbnail: 'w=400&h=400',
    medium: 'w=800&h=800', 
    large: 'w=1200&h=1200',
    original: 'w=2000&h=2000'
  };
  
  return `${url}?${sizeParams[size]}&fit=max&q=${quality}`;
}

export function getSanityImageUrlWithDimensions(
  url: string, 
  width: number, 
  height: number, 
  quality: number = 90
): string {
  if (!url || url === 'null') return '';
  return `${url}?w=${width}&h=${height}&fit=max&q=${quality}`;
}
