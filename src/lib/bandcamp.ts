// TODO: Server-side fetch + parse Bandcamp releases for /releases page (cheerio or RSS)
// TODO: Export function fetchBandcampReleases() returning { title, artist, cover, href }

/**
 * Bandcamp integration utilities
 * Future implementation will fetch and parse release data from Bandcamp
 */

export interface BandcampRelease {
  title: string;
  artist: string;
  cover: string;
  href: string;
}

export async function fetchBandcampReleases(): Promise<BandcampRelease[]> {
  // TODO: Implement server-side fetch from Bandcamp
  // Consider using cheerio for HTML parsing or RSS feed parsing
  throw new Error('Not implemented yet');
}
