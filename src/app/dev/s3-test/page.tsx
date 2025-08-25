'use client';

import React, { useState, useRef } from 'react';
import HLSTestPlayer from '@/components/player/HLSTestPlayer';

interface UploadedFile {
  fileName: string;
  s3Key: string;
  url: string;
  cloudFrontUrl?: string | null;
}

interface UploadResult {
  success: boolean;
  message?: string;
  files?: UploadedFile[];
  albumPath?: string;
  error?: string;
}

interface QuickUploadSectionProps {
  onUploadSuccess: (urls: string[]) => void;
}

function QuickUploadSection({ onUploadSuccess }: QuickUploadSectionProps) {
  const [quickUploadStatus, setQuickUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [quickUploadResult, setQuickUploadResult] = useState<string | null>(null);

  const localHLSPaths = [
    {
      name: 'Moon Beam - Track 1',
      path: 'moon-beam-omb007/1-wrack-x-b-e-n-n-moon-beam',
      albumPath: 'moon-beam-track-1'
    },
    {
      name: 'Shadow Garden - Track 2',
      path: 'moon-beam-omb007/2-wrack-x-b-e-n-n-shadow-garden',
      albumPath: 'moon-beam-track-2'
    },
    {
      name: 'Moon Beam Remix - Track 3',
      path: 'moon-beam-omb007/3-wrack-x-b-e-n-n-moon-beam-t5umut5umu-remix',
      albumPath: 'moon-beam-track-3'
    }
  ];

  const handleQuickUpload = async (localPath: string, albumPath: string, name: string) => {
    setQuickUploadStatus('uploading');
    setQuickUploadResult(`正在上傳 ${name}...`);

    try {
      const response = await fetch('/api/upload/local-hls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          localPath,
          albumPath,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setQuickUploadStatus('success');
        setQuickUploadResult(`✅ ${name} 上傳成功！上傳了 ${result.files?.length || 0} 個檔案`);
        
        // Extract M3U8 URLs for testing
        const m3u8Files = result.files?.filter((f: UploadedFile) => f.fileName.endsWith('.m3u8')) || [];
        const urls = m3u8Files.map((f: UploadedFile) => f.cloudFrontUrl || f.url);
        onUploadSuccess(urls);
      } else {
        setQuickUploadStatus('error');
        setQuickUploadResult(`❌ 上傳失敗: ${result.error}`);
      }
    } catch (error) {
      setQuickUploadStatus('error');
      setQuickUploadResult(`❌ 上傳失敗: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {localHLSPaths.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium mb-2">{item.name}</h4>
            <p className="text-xs text-gray-500 mb-3 font-mono">{item.path}</p>
            <button
              onClick={() => handleQuickUpload(item.path, item.albumPath, item.name)}
              disabled={quickUploadStatus === 'uploading'}
              className={`w-full px-4 py-2 rounded text-sm font-medium ${
                quickUploadStatus === 'uploading'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {quickUploadStatus === 'uploading' ? '上傳中...' : '上傳到 S3'}
            </button>
          </div>
        ))}
      </div>

      {quickUploadResult && (
        <div className={`p-3 rounded-lg text-sm ${
          quickUploadStatus === 'success' 
            ? 'bg-green-100 text-green-800' 
            : quickUploadStatus === 'error'
            ? 'bg-red-100 text-red-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {quickUploadResult}
        </div>
      )}
    </div>
  );
}

export default function S3TestPage() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [albumPath, setAlbumPath] = useState('test-album');
  const [streamUrls, setStreamUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
    setUploadResult(null);
    setStreamUrls([]);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('請選擇要上傳的檔案');
      return;
    }

    setUploadStatus('uploading');
    setUploadResult(null);

    try {
      const formData = new FormData();
      
      // Add album path
      formData.append('albumPath', albumPath);
      
      // Add all selected files
      Array.from(selectedFiles).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload/hls', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResult = await response.json();

      if (result.success) {
        setUploadStatus('success');
        setUploadResult(result);
        
        // Extract M3U8 URLs for testing
        const m3u8Files = result.files?.filter(f => f.fileName.endsWith('.m3u8')) || [];
        const urls = m3u8Files.map(f => f.cloudFrontUrl || f.url);
        setStreamUrls(urls);
      } else {
        setUploadStatus('error');
        setUploadResult(result);
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  };

  const clearSelection = () => {
    setSelectedFiles(null);
    setUploadResult(null);
    setStreamUrls([]);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">S3 + CloudFront 串流測試</h1>
        
        {/* Test Information */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">測試流程</h2>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>選擇 HLS 檔案 (.m3u8 和 .ts 檔案)</li>
            <li>設定專輯路徑</li>
            <li>上傳到 S3</li>
            <li>透過 CloudFront 播放測試</li>
          </ol>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">📤 檔案上傳</h2>
          
          {/* Album Path Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">專輯路徑：</label>
            <input
              type="text"
              value={albumPath}
              onChange={(e) => setAlbumPath(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如: moon-beam-omb007"
              disabled={uploadStatus === 'uploading'}
            />
          </div>

          {/* File Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">選擇 HLS 檔案：</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".m3u8,.ts,.wav,.mp3,.aac"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploadStatus === 'uploading'}
            />
            {selectedFiles && (
              <div className="mt-2 text-sm text-gray-600">
                已選擇 {selectedFiles.length} 個檔案
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex space-x-4">
            <button
              onClick={handleUpload}
              disabled={!selectedFiles || uploadStatus === 'uploading'}
              className={`px-6 py-2 rounded-md text-white font-medium ${
                uploadStatus === 'uploading'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : selectedFiles
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {uploadStatus === 'uploading' ? '上傳中...' : '上傳到 S3'}
            </button>
            
            <button
              onClick={clearSelection}
              disabled={uploadStatus === 'uploading'}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md font-medium"
            >
              清除選擇
            </button>
          </div>
        </div>

        {/* Upload Status */}
        {uploadResult && (
          <div className={`p-4 rounded-lg mb-8 ${
            uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              uploadResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {uploadResult.success ? '✅ 上傳成功' : '❌ 上傳失敗'}
            </h3>
            
            {uploadResult.success && uploadResult.files && (
              <div className="text-sm text-green-700">
                <p className="mb-2">{uploadResult.message}</p>
                <div className="space-y-1">
                  {uploadResult.files.map((file, index) => (
                    <div key={index} className="font-mono text-xs">
                      <strong>{file.fileName}</strong> → {file.s3Key}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!uploadResult.success && (
              <p className="text-sm text-red-700">{uploadResult.error}</p>
            )}
          </div>
        )}

        {/* CloudFront Streaming Test */}
        {streamUrls.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">🌐 CloudFront 串流測試</h2>
            
            {streamUrls.map((url, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-1">
                <div className="mb-3 p-3 bg-gray-50">
                  <h3 className="font-semibold">Stream {index + 1}</h3>
                  <p className="text-sm text-gray-600 font-mono break-all">{url}</p>
                </div>
                <HLSTestPlayer
                  src={url}
                  title={`CloudFront Stream ${index + 1}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Environment Setup Guide */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">⚙️ 環境設定</h3>
          <p className="text-sm text-gray-700 mb-2">
            請確保您的 <code>.env.local</code> 檔案包含以下設定：
          </p>
          <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`# AWS 設定
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
S3_BUCKET_NAME=your_bucket_name

# CloudFront 設定 (可選)
CLOUDFRONT_DOMAIN=your_cloudfront_domain

# HLS 金鑰 (測試用)
HLS_KEYS_JSON={"track-id":"hex-key",...}`}
          </pre>
        </div>

        {/* Local Files Quick Upload */}
        <div className="mt-8 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold mb-2">🚀 快速測試 - 上傳本地 HLS 檔案</h3>
          <p className="text-sm text-gray-700 mb-4">
            直接上傳現有的 HLS 檔案到 S3 進行測試：
          </p>
          
          <QuickUploadSection onUploadSuccess={(urls) => setStreamUrls(prev => [...prev, ...urls])} />
        </div>
      </div>
    </div>
  );
}
