import HLSTestPlayer from '@/components/player/HLSTestPlayer';

export default function AudioTestPage() {
  // Test URLs for the HLS streams
  const testStreams = [
    {
      title: 'Moon Beam - Track 1',
      url: '/hls/moon-beam-omb007/1-wrack-x-b-e-n-n-moon-beam/index.m3u8',
      description: 'WRACK x B E N N - Moon Beam'
    },
    {
      title: 'Shadow Garden - Track 2', 
      url: '/hls/moon-beam-omb007/2-wrack-x-b-e-n-n-shadow-garden/index.m3u8',
      description: 'WRACK x B E N N - Shadow Garden'
    },
    {
      title: 'Moon Beam Remix - Track 3',
      url: '/hls/moon-beam-omb007/3-wrack-x-b-e-n-n-moon-beam-t5umut5umu-remix/index.m3u8', 
      description: 'WRACK x B E N N - Moon Beam (T5UMUT5UMU REMIX)'
    }
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">HLS Audio Streaming Test</h1>
        
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Test Information</h2>
          <p className="text-sm text-gray-700 mb-2">
            This page tests the HLS encrypted audio streaming functionality.
            Each player below attempts to load and decrypt an encrypted HLS stream.
          </p>
          <div className="text-xs text-gray-600">
            <p><strong>Expected behavior:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>HLS.js should load the manifest (.m3u8) file</li>
              <li>Request decryption keys from /api/hls/key endpoint</li>
              <li>Decrypt and play audio segments (.ts files)</li>
              <li>CloudFront Signed Cookies should be validated</li>
            </ul>
          </div>
        </div>

        <div className="space-y-8">
          {testStreams.map((stream, index) => (
            <div key={index} className="border border-gray-300 rounded-lg p-1">
              <div className="mb-3 p-3 bg-gray-50">
                <h3 className="font-semibold">{stream.title}</h3>
                <p className="text-sm text-gray-600">{stream.description}</p>
              </div>
              <HLSTestPlayer 
                src={stream.url}
                title={`Player ${index + 1}: ${stream.title}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">Troubleshooting</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>If you see "403 Forbidden" errors:</strong> CloudFront Signed Cookies are not properly configured</p>
            <p><strong>If you see "404 Not Found" errors:</strong> HLS files are not accessible or paths are incorrect</p>
            <p><strong>If you see "Key loading failed":</strong> The /api/hls/key endpoint is not working properly</p>
            <p><strong>If audio doesn't play:</strong> Decryption may be failing or audio codec issues</p>
          </div>
        </div>
      </div>
    </div>
  );
}
