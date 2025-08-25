# Environment Setup for HLS Testing

Create a `.env.local` file in the project root with the following content:

```env
# HLS Encryption Keys for Testing
# Based on _keys.csv file in hls/moon-beam-omb007/
HLS_KEYS_JSON={"1-wrack-x-b-e-n-n-moon-beam":"f9b72200a6ca999082827a0b51ec41f5","2-wrack-x-b-e-n-n-shadow-garden":"cfc578a0db4a6031b01ddffdb2c3e687","3-wrack-x-b-e-n-n-moon-beam-t5umut5umu-remix":"27d7a425f0d308f6ee73364f31ab8f7f"}

# Notion CMS (if needed)
# NOTION_TOKEN=your_notion_integration_token
# ALBUMS_DB_ID=your_albums_database_id  
# TRACKS_DB_ID=your_tracks_database_id

# CloudFront (for production)
# CLOUDFRONT_PRIVATE_KEY=your_private_key
# CLOUDFRONT_KEY_PAIR_ID=your_key_pair_id
```

## Testing Steps

1. Create the `.env.local` file with the keys above
2. Start the development server: `npm run dev`
3. Navigate to `/dev/audio-test` to test HLS playback
4. Check the browser console and network tab for any errors

## Expected Behavior

- HLS.js should load the manifest files
- Decryption keys should be fetched from `/api/hls/key`
- Audio should decrypt and play successfully

## Troubleshooting

- If key loading fails, check the console for error messages
- Ensure the HLS files are properly copied to `public/hls/`
- Verify the key format is correct (32 hex characters for 16 bytes)
