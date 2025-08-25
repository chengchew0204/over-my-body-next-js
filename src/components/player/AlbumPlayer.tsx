'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import styles from './AlbumPlayer.module.css';

// 滾動標題組件
const ScrollingTitle = ({ text, className = '', style = {} }: { text: string; className?: string; style?: React.CSSProperties }) => {
  const [shouldScroll, setShouldScroll] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        const shouldScrollText = textWidth > containerWidth;
        setShouldScroll(shouldScrollText);
        
        if (shouldScrollText) {
          // 計算需要滾動的距離：文字寬度 - 容器寬度 + 一些緩衝空間
          setScrollDistance(-(textWidth - containerWidth + 20));
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  if (!shouldScroll) {
    return (
      <div ref={containerRef} className={className} style={{ overflow: 'hidden', ...style }}>
        <div ref={textRef} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={{ overflow: 'hidden', ...style }}>
      <motion.div
        ref={textRef}
        style={{ whiteSpace: 'nowrap' }}
        animate={{
          x: [0, scrollDistance, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 3
        }}
      >
        {text}
      </motion.div>
    </div>
  );
};

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

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Update progress bar background
      const progressBar = document.querySelector('input[type="range"]') as HTMLInputElement;
      if (progressBar) {
        const percentage = (audio.currentTime / (duration || 1)) * 100;
        progressBar.style.background = `linear-gradient(to right, #ffffff 0%, #ffffff ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%, rgba(255, 255, 255, 0.1) 100%)`;
      }
    };
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
  }, [currentTrackIndex, tracks.length, duration]);

  // Initialize progress bar background
  useEffect(() => {
    const progressBar = document.querySelector('input[type="range"]') as HTMLInputElement;
    if (progressBar) {
      const percentage = (currentTime / (duration || 1)) * 100;
      progressBar.style.background = `linear-gradient(to right, #ffffff 0%, #ffffff ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%, rgba(255, 255, 255, 0.1) 100%)`;
    }
  }, [currentTime, duration]);

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
    
    // Auto-play the selected track after a short delay to allow state updates
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.log('Auto-play failed:', error);
          // Auto-play might be blocked by browser, but that's okay
        });
      }
    }, 100);
  };

  const nextTrack = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(prev => prev + 1);
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Auto-play the next track after a short delay to allow state updates
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((error) => {
            console.log('Auto-play failed:', error);
            // Auto-play might be blocked by browser, but that's okay
          });
        }
      }, 100);
    }
  };

  const prevTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(prev => prev - 1);
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Auto-play the previous track after a short delay to allow state updates
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((error) => {
            console.log('Auto-play failed:', error);
            // Auto-play might be blocked by browser, but that's okay
          });
        }
      }, 100);
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
      <div className={className} style={{
        background: 'transparent',
        borderRadius: '12px',
        padding: '24px',
        color: '#ffffff',
        width: '95%',
        maxWidth: '95%',
        margin: '0 auto',
        fontFamily: 'var(--font-evo2), system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          <div style={{
            height: '16px',
            background: '#333333',
            borderRadius: '4px',
            marginBottom: '16px',
            width: '75%'
          }}></div>
          <div style={{
            height: '128px',
            background: '#333333',
            borderRadius: '4px',
            marginBottom: '16px',
            width: '100%'
          }}></div>
          <div style={{
            height: '16px',
            background: '#333333',
            borderRadius: '4px',
            width: '50%'
          }}></div>
        </div>
      </div>
    );
  }

  if (error || !album || tracks.length === 0) {
    return (
      <div className={className} style={{
        background: 'transparent',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        color: '#cccccc',
        width: '95%',
        maxWidth: '95%',
        margin: '0 auto',
        fontFamily: 'var(--font-evo2), system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎵</div>
        <p>{error || 'No tracks found for this album'}</p>
      </div>
    );
  }

  return (
    <div className={className} style={{
      background: 'transparent',
      borderRadius: '12px',
      overflow: 'hidden',
      fontFamily: 'var(--font-evo2), system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      width: '95%',
      maxWidth: '95%',
      margin: '0 auto'
    }}>
      {/* Main Player Section */}
      <div style={{ 
        padding: '24px',
      }}>
        {/* Album Info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          marginBottom: '24px',
          paddingBottom: '16px',
        }}>
          {album.coverUrl && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <img
                src={album.coverUrl}
                alt={album.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </motion.div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <ScrollingTitle
              text={album.name}
              className=""
              style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#ffffff',
                margin: '0 0 4px 0'
              }}
            />
            <ScrollingTitle
              text={album.artist}
              className=""
              style={{
                color: '#999999',
                margin: '0',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Current Track Info and Time */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          padding: '0 16px'
        }}>
          <div style={{ flex: 1, marginRight: '16px', minWidth: 0 }}>
            <ScrollingTitle
              text={currentTrack?.name || 'No track selected'}
              style={{
                fontSize: '18px',
                fontWeight: '400',
                color: '#ffffff',
                margin: 0
              }}
            />
          </div>
          <p style={{
            fontSize: '14px',
            color: '#999999',
            margin: 0,
            flexShrink: 0,
            minWidth: 'fit-content'
          }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>

        {/* Progress Bar with Controls */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Play/Pause Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              style={{
                padding: '8px',
                borderRadius: '50%',
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isPlaying ? (
                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '16px', height: '16px' }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '16px', height: '16px' }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </motion.button>

            {/* Progress Bar */}
            <div style={{ flex: 1 }}>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className={styles.progressBar}
                onMouseDown={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.background = `linear-gradient(to right, #ffffff 0%, #ffffff ${(currentTime / (duration || 1)) * 100}%, #333333 ${(currentTime / (duration || 1)) * 100}%, #333333 100%)`;
                }}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseFloat(target.value);
                  const percentage = (value / (duration || 1)) * 100;
                  target.style.background = `linear-gradient(to right, #ffffff 0%, #ffffff ${percentage}%, #333333 ${percentage}%, #333333 100%)`;
                }}
                onMouseUp={(e) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseFloat(target.value);
                  const percentage = (value / (duration || 1)) * 100;
                  target.style.background = `linear-gradient(to right, #ffffff 0%, #ffffff ${percentage}%, #333333 ${percentage}%, #333333 100%)`;
                }}
              />
            </div>

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0
            }}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevTrack}
                disabled={currentTrackIndex === 0}
                style={{
                  padding: '4px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: currentTrackIndex === 0 ? 0.3 : 1,
                  color: currentTrackIndex === 0 ? '#666666' : '#ffffff'
                }}
              >
                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '16px', height: '16px' }}>
                  <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextTrack}
                disabled={currentTrackIndex === tracks.length - 1}
                style={{
                  padding: '4px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: currentTrackIndex === tracks.length - 1 ? 0.3 : 1,
                  color: currentTrackIndex === tracks.length - 1 ? '#666666' : '#ffffff'
                }}
              >
                <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '16px', height: '16px' }}>
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                </svg>
              </motion.button>
            </div>
          </div>
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
              background: 'transparent',
              border: '1px solid #333333',
              color: '#cccccc',
              cursor: 'pointer',
              fontSize: '14px',
              borderRadius: '0',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-evo2), system-ui, -apple-system, sans-serif'
            }}
          >
            <span>{showPlaylist ? 'Hide' : 'More'}</span>
            <motion.svg
              animate={{ rotate: showPlaylist ? 180 : 0 }}
              style={{ width: '14px', height: '14px', transition: 'transform 0.2s ease' }}
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
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.01)'
            }}
          >
            {tracks.map((track, index) => (
              <motion.div
                key={track._id}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                onClick={() => playTrack(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  borderLeft: '3px solid transparent',
                  backgroundColor: index === currentTrackIndex ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  borderLeftColor: index === currentTrackIndex ? '#ffffff' : 'transparent'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: index === currentTrackIndex ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: index === currentTrackIndex ? '#000000' : 'rgba(255, 255, 255, 0.6)',
                  flexShrink: 0
                }}>
                  {track.trackNumber}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {index === currentTrackIndex ? (
                    <ScrollingTitle
                      text={track.name}
                      style={{
                        fontWeight: '400',
                        margin: '0 0 2px 0',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  ) : (
                    <p style={{
                      fontWeight: '400',
                      margin: '0 0 2px 0',
                      color: '#cccccc',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {track.name}
                    </p>
                  )}
                  {track.durationSec && (
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.5)',
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
                      width: '6px',
                      height: '6px',
                      background: '#ffffff',
                      borderRadius: '50%',
                      flexShrink: 0
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