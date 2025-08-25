'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { getSanityImageUrl } from '@/lib/image-utils';
import { hasTracks } from '@/lib/sanity-cms';
import AlbumPlayer from './player/AlbumPlayer';

interface Release {
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
}

interface AlbumModalProps {
  release: Release | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AlbumModal({ release, isOpen, onClose }: AlbumModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [hasTracksAvailable, setHasTracksAvailable] = useState(false);
  const [isCheckingTracks, setIsCheckingTracks] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  }, [onClose]);

  // Handle ESC key and corner visibility
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
      // Hide corner overlays when modal is open
      document.body.classList.add('modal-open');
      setIsClosing(false);
    } else {
      document.body.style.overflow = 'unset';
      // Show corner overlays when modal is closed
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, handleClose]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  // Check if album has tracks when release changes
  useEffect(() => {
    if (release && isOpen) {
      setIsCheckingTracks(true);
      hasTracks(release.slug)
        .then((hasTracks) => {
          setHasTracksAvailable(hasTracks);
        })
        .catch((error) => {
          console.error('Error checking tracks:', error);
          setHasTracksAvailable(false);
        })
        .finally(() => {
          setIsCheckingTracks(false);
        });
    } else {
      setHasTracksAvailable(false);
    }
  }, [release, isOpen]);

  if (!isOpen || !release) return null;

      return (
      <div className={`album-modal-backdrop ${isClosing ? 'closing' : ''}`}>
        <div className={`album-modal ${isClosing ? 'closing' : ''}`} ref={modalRef}>
        <button className="album-modal-close" onClick={handleClose} aria-label="Close modal">
          ×
        </button>
        
        <div className="album-modal-content">
          <div className="album-modal-header">
            <div className="album-modal-cover">
              {release.coverUrl && (
                <Image
                  src={getSanityImageUrl(release.coverUrl, 'medium', 95)}
                  alt={release.name}
                  width={300}
                  height={300}
                  className="album-cover-image"
                />
              )}
            </div>
            
            <div className="album-modal-info">
              <h2 className="album-title">{release.name}</h2>
              <p className="album-artist">{release.artist}</p>
              {release.releaseDate && (
                <p className="album-date">
                  {new Date(release.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Album Player - only show if tracks are available */}
          {!isCheckingTracks && hasTracksAvailable && (
            <div className="album-player-section">
              <h3>Listen</h3>
              <AlbumPlayer albumId={release.slug} />
            </div>
          )}

          {release.aboutHtml && (
            <div className="album-about">
              <h3>About</h3>
              <div 
                className="album-about-content"
                dangerouslySetInnerHTML={{ __html: release.aboutHtml }} 
              />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .album-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.3s ease;
        }

        .album-modal-backdrop.closing {
          animation: fadeOut 0.3s ease;
        }

        .album-modal {
          background: var(--primary-bg);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          max-width: 800px;
          max-height: 90vh;
          width: 100%;
          height: 90vh;
          position: relative;
          overflow: hidden;
          animation: slideIn 0.3s ease;
          display: flex;
          flex-direction: column;
          font-family: var(--font-evo2), system-ui, -apple-system, sans-serif;
        }

        .album-modal.closing {
          animation: slideOut 0.3s ease;
        }

        .album-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          color: var(--text-white);
          font-size: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
        }

        .album-modal-close:hover {
          background: rgba(0, 0, 0, 0.8);
          transform: scale(1.1);
        }

        .album-modal-content {
          padding: 2rem;
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
          min-height: 0;
          font-family: var(--font-evo2), system-ui, -apple-system, sans-serif;
        }

        .album-modal-content::-webkit-scrollbar {
          width: 6px;
        }

        .album-modal-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .album-modal-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .album-modal-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .album-modal-header {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          align-items: flex-start;
        }

        .album-modal-cover {
          flex-shrink: 0;
        }

        .album-cover-image {
          border-radius: 4px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .album-modal-info {
          flex: 1;
          min-width: 0;
        }

        .album-title {
          font-size: 2rem;
          font-weight: 900;
          color: var(--text-white);
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        .album-artist {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
        }

        .album-date {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
          opacity: 0.8;
        }

        .album-about {
          margin-bottom: 2rem;
        }

        .album-about h3 {
          font-size: 1.25rem;
          color: var(--text-white);
          margin: 0 0 1rem 0;
          font-weight: 700;
        }

        .album-about-content {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .album-about-content p {
          margin: 0 0 1rem 0;
        }

        .album-about-content a {
          color: var(--text-white);
          text-decoration: underline;
          text-decoration-color: rgba(255, 255, 255, 0.3);
          transition: all 0.2s ease;
        }

        .album-about-content a:hover {
          text-decoration-color: var(--text-white);
        }

        .album-player-section {
          margin-top: 2rem;
          margin-bottom: 3rem;
        }

        .album-player-section h3 {
          font-size: 1.25rem;
          color: var(--text-white);
          margin: 0 0 1rem 0;
          font-weight: 700;
        }



        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .album-modal-backdrop {
            padding: 1rem;
          }

          .album-modal {
            height: 95vh;
            max-height: 95vh;
          }

          .album-modal-content {
            padding: 1.5rem;
          }

          .album-modal-header {
            flex-direction: column;
            gap: 1.5rem;
            align-items: center;
            text-align: center;
          }

          .album-modal-cover {
            align-self: center;
          }

          .album-title {
            font-size: 1.5rem;
          }

          .album-artist {
            font-size: 1.1rem;
          }
        }

        @media (max-width: 480px) {
          .album-modal {
            height: 98vh;
            max-height: 98vh;
          }

          .album-modal-content {
            padding: 1rem;
          }

          .album-modal-close {
            top: 0.5rem;
            right: 0.5rem;
            width: 36px;
            height: 36px;
            font-size: 20px;
          }

          .album-cover-image {
            width: 200px !important;
            height: 200px !important;
          }
        }
      `}</style>
    </div>
  );
}
