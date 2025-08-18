import { sanity } from '@/lib/sanity';
import { groq } from 'next-sanity';
import Image from 'next/image';
import { getSanityImageUrl } from '@/lib/image-utils';

const RELEASE = groq`*[_type=="release" && slug.current==$slug][0]{
  _id, name, "slug": slug.current, artist, bandcampUrl,
  cover, "coverUrl": cover.asset->url, externalId, releaseDate, type, aboutHtml
}`;

const TRACKS = groq`*[_type=="track" && album->slug.current==$slug]|order(trackNumber asc){
  _id, name, durationSec, externalTrackId, streamUrl, trackNumber
}`;

export async function generateStaticParams() {
  const slugs = await sanity.fetch(groq`*[_type=="release"]{ "slug": slug.current }`);
  return slugs?.filter(Boolean).map((s: any) => ({ slug: s.slug })) || [];
}

export const revalidate = 60;

export default async function ReleaseDetail({ params: { slug } }: { params: { slug: string } }) {
  const [release, tracks] = await Promise.all([
    sanity.fetch(RELEASE, { slug }, { next: { tags: ['releases'] } }),
    sanity.fetch(TRACKS, { slug }, { next: { tags: ['tracks'] } }),
  ]);

  if (!release) return null;

  return (
    <main>
      <header>
        {release.coverUrl && (
          <Image
            src={getSanityImageUrl(release.coverUrl, 'large', 98)}
            alt={release.name}
            width={1000}
            height={1000}
          />
        )}
        <h1>{release.name}</h1>
        <p>{release.artist}</p>
        {release.bandcampUrl && (
          <p><a href={release.bandcampUrl} target="_blank" rel="noreferrer">Listen on Bandcamp</a></p>
        )}
      </header>

      {release.aboutHtml && (
        <section dangerouslySetInnerHTML={{ __html: release.aboutHtml }} />
      )}

      <section>
        <h2>Tracks</h2>
        <ol>
          {tracks?.map((t: any) => (
            <li key={t._id}>
              {t.trackNumber ? `${t.trackNumber}. ` : ''}{t.name}
              {t.durationSec ? ` — ${Math.floor(t.durationSec / 60)}:${String(t.durationSec % 60).padStart(2, '0')}` : ''}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
