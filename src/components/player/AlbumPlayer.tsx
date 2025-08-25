'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';

interface Track {
  _id: string;
  name: string;
  trackNumber: number;
  durationSec?: number;
  streamUrl?: string;
  originalFileLink?: string;
  externalTrackId?: string;
}

interface Album {
  _id: string;
  name: string;
  artist: string;
  slug: string;
  coverUrl?: string;
  type?: string;
  releaseDate?: string;
}

interface AlbumPlayerProps {
  albumId: string;
  className?: string;
}

export default function AlbumPlayer({ albumId, className = '' }: AlbumPlayerProps) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  // Fetch album data
  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tracks/by-album/${albumId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch album data');
        }
        const data = await response.json();
        setAlbum(data.album);
        setTracks(data.tracks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbumData();
  }, [albumId]);

  // Initialize HLS player
  const initializeHLS = useCallback((src: string) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    console.log('Loading HLS stream:', src);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
        debug: false,
        xhrSetup: (xhr, url) => {
          // Handle key requests - redirect to our key API
          if (url.includes('/key')) {
            const trackId = url.split('track=')[1];
            if (trackId) {
              console.log('Requesting key for track:', trackId);
              xhr.open('GET', `/api/hls/key?track=${trackId}`, true);
            }
          }
        }
      });
      
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest loaded successfully');
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, attempting to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, attempting to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error, destroying HLS instance');
              hls.destroy();
              setError(`HLS Error: ${data.details}`);
              break;
          }
        }
      });

      hls.loadSource(src);
      hls.attachMedia(audio);
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      console.log('Using native HLS support');
      audio.src = src;
    } else {
      setError('HLS is not supported in this browser');
    }
  }, []);

  // Load track
  useEffect(() => {
    if (!currentTrack?.streamUrl) return;

    setError(null);
    initializeHLS(currentTrack.streamUrl);
  }, [currentTrack, initializeHLS]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, tracks.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const nextTrack = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(prev => prev + 1);
    }
  };

  const prevTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(prev => prev - 1);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        ...className
      }}>
        <div style={{
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          <div style={{
            height: '16px',
            background: '#e5e7eb',
            borderRadius: '4px',
            marginBottom: '16px',
            width: '75%'
          }}></div>
          <div style={{
            height: '128px',
            background: '#e5e7eb',
            borderRadius: '4px',
            marginBottom: '16px',
            width: '100%'
          }}></div>
          <div style={{
            height: '16px',
            background: '#e5e7eb',
            borderRadius: '4px',
            width: '50%'
          }}></div>
        </div>
      </div>
    );
  }

  if (error || !album || tracks.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        textAlign: 'center',
        color: '#6b7280',
        ...className
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎵</div>
        <p>{error || 'No tracks found for this album'}</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      ...className
    }}>
      {/* Album Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {album.coverUrl && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              <img
                src={album.coverUrl}
                alt={album.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </motion.div>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 4px 0'
            }}>{album.name}</h2>
            <p style={{
              color: '#6b7280',
              margin: '0 0 8px 0'
            }}>{album.artist}</p>
            {album.type && (
              <span style={{
                display: 'inline-block',
                padding: '4px 8px',
                background: '#f3f4f6',
                color: '#6b7280',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {album.type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Player Controls */}
      <div style={{ padding: '24px' }}>
        {/* Current Track Info */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#111827',
            margin: '0 0 4px 0'
          }}>
            {currentTrack?.name || 'No track selected'}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Track {currentTrack?.trackNumber || 0} of {tracks.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '12px',
              color: '#6b7280',
              width: '40px',
              textAlign: 'center'
            }}>
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              style={{
                flex: 1,
                height: '4px',
                background: '#e5e7eb',
                borderRadius: '2px',
                appearance: 'none',
                cursor: 'pointer'
              }}
            />
            <span style={{
              fontSize: '12px',
              color: '#6b7280',
              width: '40px',
              textAlign: 'center'
            }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevTrack}
            disabled={currentTrackIndex === 0}
            style={{
              padding: '8px',
              borderRadius: '50%',
              background: '#f3f4f6',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentTrackIndex === 0 ? 0.5 : 1
            }}
          >
            <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '20px', height: '20px', color: '#374151' }}>
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            style={{
              padding: '16px',
              borderRadius: '50%',
              background: '#111827',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isPlaying ? (
              <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '24px', height: '24px' }}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '24px', height: '24px' }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextTrack}
            disabled={currentTrackIndex === tracks.length - 1}
            style={{
              padding: '8px',
              borderRadius: '50%',
              background: '#f3f4f6',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentTrackIndex === tracks.length - 1 ? 0.5 : 1
            }}
          >
            <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '20px', height: '20px', color: '#374151' }}>
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
            </svg>
          </motion.button>
        </div>

        {/* Playlist Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowPlaylist(!showPlaylist)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'color 0.2s ease'
            }}
          >
            <span>{showPlaylist ? 'Hide' : 'Show'} Playlist</span>
            <motion.svg
              animate={{ rotate: showPlaylist ? 180 : 0 }}
              style={{ width: '16px', height: '16px', transition: 'transform 0.2s ease' }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </motion.svg>
          </motion.button>
        </div>
      </div>

      {/* Playlist */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              borderTop: '1px solid #f3f4f6',
              maxHeight: '256px',
              overflowY: 'auto'
            }}
          >
            {tracks.map((track, index) => (
              <motion.div
                key={track._id}
                whileHover={{ backgroundColor: '#f9fafb' }}
                onClick={() => playTrack(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  borderLeft: '4px solid transparent',
                  backgroundColor: index === currentTrackIndex ? '#eff6ff' : 'transparent',
                  borderLeftColor: index === currentTrackIndex ? '#3b82f6' : 'transparent'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280'
                }}>
                  {track.trackNumber}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontWeight: '500',
                    margin: '0 0 4px 0',
                    color: index === currentTrackIndex ? '#3b82f6' : '#111827'
                  }}>
                    {track.name}
                  </p>
                  {track.durationSec && (
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {formatTime(track.durationSec)}
                    </p>
                  )}
                </div>
                {index === currentTrackIndex && isPlaying && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                      width: '8px',
                      height: '8px',
                      background: '#3b82f6',
                      borderRadius: '50%'
                    }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
} 