import type { Metadata } from 'next';
import Image from 'next/image';
import { sanity } from '@/lib/sanity';
import { groq } from 'next-sanity';
import { getSanityImageUrl } from '@/lib/image-utils';

export const metadata: Metadata = {
  title: '跨我身體 OVER MY BODY - Releases',
  description: 'Discover our catalog of avant-garde sounds and experimental compositions from emerging and established artists.',
};

const RELEASES = groq`*[_type == "release"]|order(coalesce(releaseDate, "1900-01-01") desc){
  _id, name, "slug": slug.current, artist, bandcampUrl,
  "coverUrl": cover.asset->url, externalId, releaseDate, type
}`;

export const revalidate = 60;

/**
 * Releases page component - displays the catalog of music releases
 * Data sourced from Sanity CMS
 */
export default async function ReleasesPage() {
  const releases = await sanity.fetch(RELEASES, {}, { next: { tags: ['releases'] } });

  return (
    <>
      <h1>RELEASE</h1>
      <p className="lead">Discover our catalog of avant-garde sounds and experimental compositions from emerging and established artists.</p>

      <div className="release-grid">
        {releases?.map((release: any) => {
          const bandcampUrl = release.bandcampUrl || `https://overmybody.bandcamp.com/album/${release.slug}`;
          
          return (
            <a
              key={release._id}
              href={bandcampUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="release-item"
            >
          <div className="release-art">
                {release.coverUrl && (
                  <Image
                    src={getSanityImageUrl(release.coverUrl, 'medium', 95)}
                    alt={release.name}
                    width={300}
                    height={300}
                  />
                )}
          </div>
          <div className="release-info">
                <h3>{release.name}</h3>
                <p>{release.artist}</p>
          </div>
        </a>
          );
        })}
      </div>
    </>
  );
}
