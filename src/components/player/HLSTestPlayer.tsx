'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface HLSTestPlayerProps {
  src: string;
  title?: string;
}

export default function HLSTestPlayer({ src, title = 'HLS Test Player' }: HLSTestPlayerProps) {
  const videoRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hlsSupported, setHlsSupported] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const audio = videoRef.current;
    
    // Check HLS support
    if (Hls.isSupported()) {
      setHlsSupported(true);
      addLog('HLS.js is supported');
      
      const hls = new Hls({
        debug: true,
        enableWorker: false,
        // Enable CORS for cross-origin requests
        xhrSetup: (xhr) => {
          xhr.withCredentials = true;
        }
      });
      
      hlsRef.current = hls;

      // Error handling
      hls.on(Hls.Events.ERROR, (event, data) => {
        addLog(`HLS Error: ${data.type} - ${data.details}`);
        if (data.fatal) {
          setError(`Fatal error: ${data.details}`);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              addLog('Network error occurred, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              addLog('Media error occurred, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              addLog('Unrecoverable error');
              hls.destroy();
              break;
          }
        }
      });

      // Success events
      hls.on(Hls.Events.MANIFEST_LOADED, () => {
        addLog('Manifest loaded successfully');
        setIsLoading(false);
      });

      hls.on(Hls.Events.KEY_LOADED, () => {
        addLog('Decryption key loaded successfully');
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        addLog(`Fragment loaded: ${data.frag.url}`);
      });

      hls.on(Hls.Events.LEVEL_LOADED, () => {
        addLog('Level loaded');
      });

      // Load the source
      addLog(`Loading HLS source: ${src}`);
      hls.loadSource(src);
      hls.attachMedia(audio);

      // Audio events
      audio.addEventListener('loadstart', () => addLog('Audio: Load start'));
      audio.addEventListener('loadedmetadata', () => addLog('Audio: Metadata loaded'));
      audio.addEventListener('canplay', () => addLog('Audio: Can play'));
      audio.addEventListener('playing', () => addLog('Audio: Playing'));
      audio.addEventListener('pause', () => addLog('Audio: Paused'));
      audio.addEventListener('error', (_e) => {
        addLog(`Audio error: ${audio.error?.message || 'Unknown error'}`);
        setError(`Audio error: ${audio.error?.message || 'Unknown error'}`);
      });

    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      setHlsSupported(true);
      addLog('Native HLS support detected');
      audio.src = src;
      setIsLoading(false);
    } else {
      setHlsSupported(false);
      setError('HLS is not supported in this browser');
      addLog('HLS not supported');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  const clearLogs = () => setLogs([]);

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      
      {/* Player Controls */}
      <div className="mb-4">
        <audio
          ref={videoRef}
          controls
          className="w-full"
          preload="metadata"
        />
      </div>

      {/* Status Display */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">HLS Support:</span>
          <span className={hlsSupported ? 'text-green-600' : 'text-red-600'}>
            {hlsSupported ? '✓ Supported' : '✗ Not Supported'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="font-semibold">Status:</span>
          <span className={isLoading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'}>
            {isLoading ? 'Loading...' : error ? 'Error' : 'Ready'}
          </span>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Source Info */}
      <div className="mb-4 text-sm">
        <strong>Source:</strong> <code className="bg-gray-200 px-1 rounded">{src}</code>
      </div>

      {/* Debug Logs */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">Debug Logs:</h4>
          <button
            onClick={clearLogs}
            className="text-sm bg-gray-300 hover:bg-gray-400 px-2 py-1 rounded"
          >
            Clear
          </button>
        </div>
        <div className="bg-black text-green-400 text-xs p-3 rounded h-48 overflow-y-auto font-mono">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
