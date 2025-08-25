'use client';

import React, { useState, useRef } from 'react';
import HLSTestPlayer from '@/components/player/HLSTestPlayer';

interface ProcessingResult {
  success: boolean;
  message?: string;
  trackId?: string;
  encryptionKey?: string;
  files?: Array<{
    fileName: string;
    s3Key: string;
    url: string;
    cloudFrontUrl?: string | null;
    proxyUrl?: string;
  }>;
  error?: string;
}

interface ProcessedTrack {
  trackId: string;
  title: string;
  albumPath: string;
  streamUrl: string;
  encryptionKey: string;
  files: Array<{
    fileName: string;
    s3Key: string;
    url: string;
    cloudFrontUrl?: string | null;
    proxyUrl?: string;
  }>;
}

export default function AudioPipelinePage() {
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [processedTracks, setProcessedTracks] = useState<ProcessedTrack[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [albumPath, setAlbumPath] = useState('test-album');
  const [playbackMode, setPlaybackMode] = useState<'proxy' | 's3' | 'cloudfront'>('proxy');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    
    // Auto-generate track title from filename
    if (file) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTrackTitle(nameWithoutExt);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile || !trackTitle || !albumPath) {
      alert('請填寫所有必要欄位');
      return;
    }

    setProcessingStatus('processing');
    setProcessingResult(null);

    try {
      const formData = new FormData();
      formData.append('audioFile', selectedFile);
      formData.append('trackTitle', trackTitle);
      formData.append('albumPath', albumPath);

      console.log('Starting audio processing...');
      
      const response = await fetch('/api/process-audio', {
        method: 'POST',
        body: formData,
      });

      const result: ProcessingResult = await response.json();

      if (result.success && result.trackId && result.encryptionKey) {
        // Add encryption key to the system
        await fetch('/api/keys/manage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trackId: result.trackId,
            encryptionKey: result.encryptionKey,
          }),
        });

        // Find the M3U8 file for streaming
        const m3u8File = result.files?.find(f => f.fileName === 'index.m3u8');
        // Choose streaming URL based on playback mode
        let streamUrl = '';
        if (playbackMode === 'cloudfront' && m3u8File?.cloudFrontUrl) {
          streamUrl = m3u8File.cloudFrontUrl;
        } else if (playbackMode === 's3' && m3u8File?.url) {
          streamUrl = m3u8File.url;
        } else {
          streamUrl = m3u8File?.proxyUrl || m3u8File?.url || '';
        }

        // Add to processed tracks
        const newTrack: ProcessedTrack = {
          trackId: result.trackId,
          title: trackTitle,
          albumPath,
          streamUrl,
          encryptionKey: result.encryptionKey,
          files: result.files || [],
        };

        setProcessedTracks(prev => [...prev, newTrack]);
        setProcessingStatus('success');
        setProcessingResult(result);

        // Reset form
        setSelectedFile(null);
        setTrackTitle('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setProcessingStatus('error');
        setProcessingResult(result);
      }
    } catch (error) {
      setProcessingStatus('error');
      setProcessingResult({
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      });
    }
  };

  const clearAll = () => {
    setProcessedTracks([]);
    setProcessingResult(null);
    setProcessingStatus('idle');
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🎵 完整音檔處理管道測試</h1>
        
        {/* Process Flow Info */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Processing Flow</h2>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>Upload WAV audio file</li>
            <li>FFmpeg converts to HLS format (.m3u8 + .ts segments)</li>
            <li>AES-128 encrypts audio segments</li>
            <li>Upload to S3</li>
            <li>Dynamically register decryption keys</li>
            <li>Select playback mode (Proxy endpoint/S3/CloudFront)</li>
            <li>Test cloud streaming playback</li>
          </ol>
        </div>

        {/* Audio Processing Section */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">🎤 Audio Processing</h2>
          
          {/* File Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select audio file (WAV, MP3, AAC):</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,.aac,.flac"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={processingStatus === 'processing'}
            />
            {selectedFile && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Track Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Track title:</label>
            <input
              type="text"
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Moon Beam"
              disabled={processingStatus === 'processing'}
            />
          </div>

          {/* Album Path */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Album path:</label>
            <input
              type="text"
              value={albumPath}
              onChange={(e) => setAlbumPath(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. moon-beam-omb007"
              disabled={processingStatus === 'processing'}
            />
          </div>

          {/* Playback Mode Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Playback mode:</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="proxy"
                  checked={playbackMode === 'proxy'}
                  onChange={(e) => setPlaybackMode(e.target.value as 'proxy')}
                  className="mr-2"
                  disabled={processingStatus === 'processing'}
                />
                <span className="text-sm">Proxy endpoint (Recommended for testing)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="s3"
                  checked={playbackMode === 's3'}
                  onChange={(e) => setPlaybackMode(e.target.value as 's3')}
                  className="mr-2"
                  disabled={processingStatus === 'processing'}
                />
                <span className="text-sm">S3 direct playback</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cloudfront"
                  checked={playbackMode === 'cloudfront'}
                  onChange={(e) => setPlaybackMode(e.target.value as 'cloudfront')}
                  className="mr-2"
                  disabled={processingStatus === 'processing'}
                />
                <span className="text-sm">CloudFront CDN</span>
              </label>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {playbackMode === 'proxy' && '透過 Next.js 代理端點播放，繞過 CORS 問題'}
              {playbackMode === 's3' && '直接從 S3 播放，可能遇到 CORS 問題'}
              {playbackMode === 'cloudfront' && '透過 CloudFront CDN 播放，需要設定 CLOUDFRONT_DOMAIN'}
            </div>
          </div>

          {/* Process Button */}
          <div className="flex space-x-4">
            <button
              onClick={handleProcess}
              disabled={!selectedFile || !trackTitle || !albumPath || processingStatus === 'processing'}
              className={`px-6 py-2 rounded-md text-white font-medium ${
                processingStatus === 'processing'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : selectedFile && trackTitle && albumPath
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {processingStatus === 'processing' ? 'Processing...' : 'Start Processing'}
            </button>
            
            <button
              onClick={clearAll}
              disabled={processingStatus === 'processing'}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md font-medium"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Processing Status */}
        {processingResult && (
          <div className={`p-4 rounded-lg mb-8 ${
            processingResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              processingResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {processingResult.success ? '✅ Processing Successful' : '❌ Processing Failed'}
            </h3>
            
            {processingResult.success && (
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Track ID:</strong> {processingResult.trackId}</p>
                <p><strong>Encryption Key:</strong> <code className="bg-green-100 px-1 rounded">{processingResult.encryptionKey}</code></p>
                <p><strong>Uploaded Files:</strong> {processingResult.files?.length || 0} files</p>
              </div>
            )}
            
            {!processingResult.success && (
              <p className="text-sm text-red-700">{processingResult.error}</p>
            )}
          </div>
        )}

        {/* Processed Tracks */}
        {processedTracks.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">🎧 Processed Tracks</h2>
            
            {processedTracks.map((track, _index) => (
              <div key={track.trackId} className="border border-gray-300 rounded-lg p-1">
                <div className="mb-3 p-3 bg-gray-50">
                  <h3 className="font-semibold">{track.title}</h3>
                  <p className="text-sm text-gray-600">專輯: {track.albumPath}</p>
                  <p className="text-xs text-gray-500 font-mono">ID: {track.trackId}</p>
                  <p className="text-xs text-gray-500 font-mono">Key: {track.encryptionKey}</p>
                  <p className="text-xs text-gray-500 font-mono break-all">URL: {track.streamUrl}</p>
                </div>
                <HLSTestPlayer
                  src={track.streamUrl}
                  title={`${track.title} - 雲端串流測試`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Quick Test Section */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">🚀 快速測試</h3>
          <p className="text-sm text-gray-700 mb-2">
            要測試現有的 WAV 檔案，可以從以下路徑選擇：
          </p>
          <code className="text-xs bg-gray-200 px-2 py-1 rounded block">
            /Users/zackwu204/Desktop/BENN/Tracks/B E N N x WRACK - Moon Beam [OMB007]/
          </code>
          <p className="text-xs text-gray-600 mt-2">
            選擇任一 WAV 檔案進行完整的處理流程測試
          </p>
        </div>

        {/* Environment Check */}
        <div className="mt-8 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold mb-2">⚙️ 環境需求</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>✅ FFmpeg 已安裝並可用</p>
            <p>🔧 需要設定 AWS 環境變數 (S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, 等)</p>
            <p>📁 臨時檔案會在處理完成後自動清理</p>
            <p>🔑 加密金鑰會動態註冊到系統中</p>
            <p>🌐 使用代理端點繞過 CORS 問題</p>
          </div>
        </div>
      </div>
    </div>
  );
}
