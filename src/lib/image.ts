// src/lib/image.ts
import imageUrlBuilder from '@sanity/image-url';
import { sanity } from './sanity';

const builder = imageUrlBuilder(sanity);
export const urlFor = (source: any) => builder.image(source);
