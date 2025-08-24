import type { Metadata } from 'next';
import { sanity } from '@/lib/sanity';
import { groq } from 'next-sanity';
import { Suspense } from 'react';
import ReleasesClient from './ReleasesClient';

type Release = {
  _id: string;
  name: string;
  slug: string;
  artist: string;
  bandcampUrl?: string;
  coverUrl?: string;
  externalId?: string;
  releaseDate?: string;
  type?: string;
  aboutHtml?: string;
};

export const metadata: Metadata = {
  title: '跨我身體 OVER MY BODY - Releases',
  description: 'Discover our catalog of avant-garde sounds and experimental compositions from emerging and established artists.',
};

const RELEASES = groq`*[_type == "release"]|order(coalesce(releaseDate, "1900-01-01") desc){
  _id, name, "slug": slug.current, artist, bandcampUrl,
  "coverUrl": cover.asset->url, externalId, releaseDate, type, aboutHtml
}`;

export const revalidate = 60;

/**
 * Releases page component - displays the catalog of music releases
 * Data sourced from Sanity CMS
 */
export default async function ReleasesPage() {
  const releases = await sanity.fetch<Release[]>(RELEASES, {}, { next: { tags: ['releases'] } });

  return (
    <>
      <h1>RELEASE</h1>
      <p className="lead">Discover our catalog of avant-garde sounds and experimental compositions from emerging and established artists.</p>
      <Suspense fallback={<div>Loading...</div>}>
        <ReleasesClient releases={releases} />
      </Suspense>
    </>
  );
}
