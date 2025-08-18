import type { Metadata } from 'next';
import Image from 'next/image';
import { extractArtistFromDescription, generateBandcampUrl, type Album } from '@/lib/albumUtils';
import albumsData from '@/data/Album.json';

export const metadata: Metadata = {
  title: '跨我身體 OVER MY BODY - Releases',
  description: 'Discover our catalog of avant-garde sounds and experimental compositions from emerging and established artists.',
};

/**
 * Releases page component - displays the catalog of music releases
 * Data sourced from Album.json
 */
export default function ReleasesPage() {
  const albums = albumsData as Album[];

  return (
    <>
      <h1>RELEASE</h1>
      <p className="lead">Discover our catalog of avant-garde sounds and experimental compositions from emerging and established artists.</p>

      <div className="release-grid">
        {albums.map((album) => {
          const artist = extractArtistFromDescription(album.description);
          const bandcampUrl = album.buyUrl || generateBandcampUrl(album.slug);
          
          return (
            <a
              key={album.id}
              href={bandcampUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="release-item"
            >
          <div className="release-art">
                <Image
                  src={album.coverImage}
                  alt={album.title}
                  width={300}
                  height={300}
                />
          </div>
          <div className="release-info">
                <h3>{album.title}</h3>
                <p>{artist}</p>
          </div>
        </a>
          );
        })}
      </div>
    </>
  );
}
