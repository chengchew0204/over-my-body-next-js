'use client';

import { useState, useEffect } from 'react';
import { client } from '@/lib/sanity';
import UploadErrorBoundary from '@/components/UploadErrorBoundary';
import styles from './upload.module.css';

interface Release {
  _id: string;
  name: string;
  artist: string;
  type: string;
  slug: {
    current: string;
  };
}

interface UploadFile {
  id: string;
  file: File;
  name: string;
  trackNumber: number;
  duration?: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  trackId?: string;
}

function UploadPageContent() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const query = `*[_type == "release"] | order(_createdAt desc) {
          _id,
          name,
          artist,
          type,
          slug
        }`;
        const data = await client.fetch(query);
        setReleases(data);
      } catch (error) {
        console.error('Failed to fetch releases:', error);
      }
    };

    fetchReleases();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('audio/') || file.name.endsWith('.wav') || file.name.endsWith('.mp3')
    );

    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadFile[] = files.map((file, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      trackNumber: uploadFiles.length + index + 1,
      status: 'pending',
      progress: 0,
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const updateFileInfo = (id: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => 
      prev.map(file => file.id === id ? { ...file, ...updates } : file)
    );
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== id));
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
        URL.revokeObjectURL(url);
      });
      
      audio.addEventListener('error', () => {
        resolve(0);
        URL.revokeObjectURL(url);
      });
      
      audio.src = url;
    });
  };

  const processFile = async (uploadFile: UploadFile) => {
    if (!selectedRelease) return;

    try {
      updateFileInfo(uploadFile.id, { status: 'uploading', progress: 10 });

      // Get audio duration
      const duration = await getAudioDuration(uploadFile.file);
      updateFileInfo(uploadFile.id, { duration, progress: 20 });

      // Prepare form data for audio processing
      const formData = new FormData();
      formData.append('audioFile', uploadFile.file);
      formData.append('trackTitle', uploadFile.name);
      formData.append('albumPath', selectedRelease.slug.current);

      updateFileInfo(uploadFile.id, { status: 'processing', progress: 30 });

      // Process audio to HLS
      const response = await fetch('/api/process-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Audio processing failed');
      }

      const result = await response.json();
      updateFileInfo(uploadFile.id, { progress: 70 });

      if (result.success) {
        updateFileInfo(uploadFile.id, { progress: 80 });

        // Create track record via API
        const trackResponse = await fetch('/api/tracks/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: uploadFile.name,
            albumId: selectedRelease._id,
            trackNumber: uploadFile.trackNumber,
            durationSec: Math.round(duration),
            streamUrl: result.files?.find((f: { fileName: string; cloudFrontUrl?: string; primaryUrl?: string; url?: string }) => f.fileName === 'index.m3u8')?.cloudFrontUrl || 
                      result.files?.find((f: { fileName: string; cloudFrontUrl?: string; primaryUrl?: string; url?: string }) => f.fileName === 'index.m3u8')?.primaryUrl || 
                      result.files?.find((f: { fileName: string; cloudFrontUrl?: string; primaryUrl?: string; url?: string }) => f.fileName === 'index.m3u8')?.url || '',
            originalFileLink: result.originalFile?.cloudFrontUrl || result.originalFile?.url || '',
            externalTrackId: result.trackId,
            hlsKey: result.encryptionKey, // 保存 HLS 解密金鑰
          }),
        });

        if (!trackResponse.ok) {
          const errorText = await trackResponse.text();
          console.error('Track creation failed:', errorText);
          throw new Error(`Failed to create track record: ${trackResponse.status} ${trackResponse.statusText}`);
        }

        const trackResult = await trackResponse.json();
        
        updateFileInfo(uploadFile.id, { 
          status: 'completed', 
          progress: 100,
          trackId: trackResult.track._id 
        });
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      updateFileInfo(uploadFile.id, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        progress: 0 
      });
    }
  };

  const uploadAll = async () => {
    if (!selectedRelease || uploadFiles.length === 0) return;

    setIsLoading(true);
    
    // Process files sequentially to avoid overwhelming the server
    for (const file of uploadFiles.filter(f => f.status === 'pending')) {
      await processFile(file);
    }
    
    setIsLoading(false);
  };

  const getStatusText = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'uploading': return 'Uploading';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return '';
    }
  };

  const getStatusClass = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return styles.statusPending;
      case 'uploading': return styles.statusUploading;
      case 'processing': return styles.statusProcessing;
      case 'completed': return styles.statusCompleted;
      case 'error': return styles.statusError;
      default: return styles.statusPending;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Album Track Upload</h1>
            <p className={styles.subtitle}>Batch upload audio files and automatically process to HLS streaming format</p>
          </div>

          {/* Release Selection */}
          <div className={styles.section}>
            <label className={styles.label}>
              Select Album
            </label>
            <select
              value={selectedRelease?._id || ''}
              onChange={(e) => {
                const release = releases.find(r => r._id === e.target.value);
                setSelectedRelease(release || null);
              }}
              className={styles.select}
            >
              <option value="">Please select an album...</option>
              {releases.map((release) => (
                <option key={release._id} value={release._id}>
                  {release.artist} - {release.name} ({release.type})
                </option>
              ))}
            </select>
          </div>

          {/* File Upload Area */}
          <div className={styles.uploadSection}>
            <div
              className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <svg
                className={styles.uploadIcon}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className={styles.uploadText}>
                <span className={styles.uploadTextPrimary}>
                  Click to upload files
                </span>
                <span className={styles.uploadTextSecondary}> or drag files here</span>
              </div>
              <p className={styles.uploadHint}>
                Supports WAV, MP3 and other audio formats
              </p>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="audio/*,.wav,.mp3"
                onChange={handleFileSelect}
                className={styles.fileInput}
              />
            </div>
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className={styles.fileListSection}>
              <div className={styles.fileListHeader}>
                <h3 className={styles.fileListTitle}>
                  Track List ({uploadFiles.length})
                </h3>
                <button
                  onClick={uploadAll}
                  disabled={!selectedRelease || isLoading || uploadFiles.every(f => f.status !== 'pending')}
                  className={styles.uploadButton}
                >
                  {isLoading ? 'Processing...' : 'Start Upload'}
                </button>
              </div>

              <div className={styles.fileList}>
                {uploadFiles.map((file) => (
                  <div key={file.id} className={styles.fileItem}>
                    <div className={styles.fileItemContent}>
                      <div className={styles.fileInfo}>
                        <div className={styles.fileControls}>
                          <input
                            type="number"
                            value={file.trackNumber}
                            onChange={(e) => updateFileInfo(file.id, { trackNumber: parseInt(e.target.value) || 1 })}
                            className={styles.trackNumber}
                            min="1"
                          />
                          <input
                            type="text"
                            value={file.name}
                            onChange={(e) => updateFileInfo(file.id, { name: e.target.value })}
                            className={styles.trackName}
                            placeholder="Track name"
                          />
                          <span className={`${styles.status} ${getStatusClass(file.status)}`}>
                            {getStatusText(file.status)}
                          </span>
                        </div>
                        
                        {file.progress > 0 && file.status !== 'completed' && (
                          <div className={styles.progressContainer}>
                            <div className={styles.progressBar}>
                              <div
                                className={styles.progressFill}
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {file.error && (
                          <p className={styles.errorMessage}>{file.error}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === 'uploading' || file.status === 'processing'}
                        className={styles.removeButton}
                      >
                        <svg className={styles.removeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <UploadErrorBoundary>
      <UploadPageContent />
    </UploadErrorBoundary>
  );
}