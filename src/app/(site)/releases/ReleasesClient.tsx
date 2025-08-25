'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getSanityImageUrl } from '@/lib/image-utils';
import AlbumModal from '@/components/AlbumModal';
import ScrollingTitle from '@/components/ScrollingTitle';

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

interface ReleasesClientProps {
  releases: Release[];
}

export default function ReleasesClient({ releases }: ReleasesClientProps) {
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle URL-based navigation (direct links with slug)
  useEffect(() => {
    const albumSlug = searchParams.get('album');
    if (albumSlug && releases) {
      const release = releases.find(r => r.slug === albumSlug);
      if (release) {
        setSelectedRelease(release);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, releases]);

  const handleReleaseClick = (release: Release) => {
    setSelectedRelease(release);
    setIsModalOpen(true);
    
    // Update URL without full page reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('album', release.slug);
    router.push(newUrl.pathname + newUrl.search, { scroll: false });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRelease(null);
    
    // Remove album parameter from URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('album');
    router.push(newUrl.pathname + newUrl.search, { scroll: false });
  };

  return (
    <>
      <div className="release-grid">
        {releases?.map((release: Release) => (
          <button
            key={release._id}
            onClick={() => handleReleaseClick(release)}
            className="release-item"
            type="button"
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
              <ScrollingTitle
                text={release.name}
                style={{
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: 'var(--text-white)',
                  margin: '0 0 0.25rem 0',
                  lineHeight: '1.3',
                  letterSpacing: '0.02em',
                  fontFamily: 'var(--font-evo2), system-ui, -apple-system, sans-serif'
                }}
              />
              <p>{release.artist}</p>
            </div>
          </button>
        ))}
      </div>

      <AlbumModal
        release={selectedRelease}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
