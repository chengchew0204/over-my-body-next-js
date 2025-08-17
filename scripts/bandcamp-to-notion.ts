#!/usr/bin/env tsx

/**
 * Bandcamp to Notion Sync Script
 * 
 * Crawls https://overmybody.bandcamp.com/music and syncs albums/tracks to Notion databases.
 * 
 * Usage:
 *   pnpm bandcamp:sync                    - Full sync
 *   pnpm bandcamp:dry                     - Dry run (no actual Notion writes)
 *   pnpm bandcamp:sync --only <url>       - Process single album/track page
 * 
 * Manual execution:
 *   npx tsx scripts/bandcamp-to-notion.ts [--dry-run] [--only <url>]
 * 
 * Scheduling options:
 *   - Cron: Add to crontab with `0 2 * * * cd /path/to/project && pnpm bandcamp:sync`
 *   - GitHub Actions: Create .github/workflows/bandcamp-sync.yml with scheduled trigger
 *   - Vercel Cron: Use Vercel's cron jobs feature with API endpoint
 */

import axios from 'axios'
import * as cheerio from 'cheerio'
import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { format } from 'date-fns'
import pLimit from 'p-limit'
import { z } from 'zod'
import crypto from 'crypto'
import { URL } from 'url'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Environment configuration
const CONFIG = {
  NOTION_TOKEN: process.env.NOTION_TOKEN!,
  ALBUMS_DB_ID: process.env.ALBUMS_DB_ID!,
  TRACKS_DB_ID: process.env.TRACKS_DB_ID!,
  BANDCAMP_BASE: process.env.BANDCAMP_BASE || 'https://overmybody.bandcamp.com',
  REQUEST_DELAY_MS: parseInt(process.env.REQUEST_DELAY_MS || '1000'),
  CONCURRENCY: parseInt(process.env.CONCURRENCY || '2'),
  // Iframe styling configuration
  IFRAME_BG: process.env.IFRAME_BG || '333333',
  IFRAME_LINK: process.env.IFRAME_LINK || 'ffffff',
  IFRAME_ALBUM_ARTWORK_W: parseInt(process.env.IFRAME_ALBUM_ARTWORK_W || '350'),
  IFRAME_ALBUM_ARTWORK_H: parseInt(process.env.IFRAME_ALBUM_ARTWORK_H || '350'),
  IFRAME_ALBUM_SLIM_H: parseInt(process.env.IFRAME_ALBUM_SLIM_H || '42'),
  IFRAME_ALBUM_STD_W: parseInt(process.env.IFRAME_ALBUM_STD_W || '350'),
  IFRAME_ALBUM_STD_H: parseInt(process.env.IFRAME_ALBUM_STD_H || '687'),
  IFRAME_TRACK_ARTWORK_W: parseInt(process.env.IFRAME_TRACK_ARTWORK_W || '350'),
  IFRAME_TRACK_ARTWORK_H: parseInt(process.env.IFRAME_TRACK_ARTWORK_H || '470'),
  IFRAME_TRACK_SLIM_H: parseInt(process.env.IFRAME_TRACK_SLIM_H || '42'),
  IFRAME_TRACK_STD_W: parseInt(process.env.IFRAME_TRACK_STD_W || '350'),
  IFRAME_TRACK_STD_H: parseInt(process.env.IFRAME_TRACK_STD_H || '120'),
}

// Validate required environment variables
const requiredEnvVars = ['NOTION_TOKEN', 'ALBUMS_DB_ID', 'TRACKS_DB_ID']
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`)
    process.exit(1)
  }
}

// Initialize clients
const notion = new Client({ auth: CONFIG.NOTION_TOKEN })
const limit = pLimit(CONFIG.CONCURRENCY)

// Simplified types for JSON-LD structure - using loose typing to handle variations
interface JsonLdData {
  '@type'?: any
  name?: string
  datePublished?: string
  image?: string
  byArtist?: {
    name?: string
  }
  albumRelease?: any[]
  track?: {
    itemListElement?: any[]
  }
}

interface AlbumData {
  title: string
  type: string
  release_date?: string
  url: string
  external_id: string
  cover_url?: string
  artist?: string
  about_html?: string
  about_text?: string
  iframe_artwork?: string
  iframe_slim?: string
  iframe_standard?: string
}

interface TrackData {
  title: string
  track_number?: number
  duration_sec?: number
  stream_url?: string
  track_url: string
  external_track_id?: string
  album_external_id: string
  iframe_artwork?: string
  iframe_slim?: string
  iframe_standard?: string
}

interface MusicGridItem {
  url: string
  cover_url?: string
  title: string
  artist?: string
  external_id?: string
}

// Utilities
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generateExternalId(url: string): string {
  return crypto.createHash('sha1').update(url).digest('hex').substring(0, 12)
}

function normalizeUrl(href: string, base: string): string {
  return new URL(href, base).toString()
}

function extractJsonLd(html: string): any {
  const regex = /<script type="application\/ld\+json">\s*({[\s\S]*?})\s*<\/script>/
  const match = html.match(regex)
  if (match) {
    try {
      return JSON.parse(match[1])
    } catch (error) {
      console.warn('Failed to parse JSON-LD:', error)
    }
  }
  return null
}

function extractJavaScriptVar(html: string, varName: string): any {
  const regex = new RegExp(`var ${varName} = ({[\\s\\S]*?});`, 'g')
  const match = regex.exec(html)
  if (match) {
    try {
      return JSON.parse(match[1])
    } catch (error) {
      console.warn(`Failed to parse ${varName}:`, error)
    }
  }
  return null
}

function parseDuration(duration: string): number | undefined {
  // Parse ISO 8601 duration format P00H03M42S to seconds
  const match = duration.match(/P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return undefined
  
  const [, years, months, days, hours, minutes, seconds] = match
  return (
    (parseInt(hours || '0') * 3600) +
    (parseInt(minutes || '0') * 60) +
    parseInt(seconds || '0')
  )
}

function getPropertyValue(properties: any[], name: string): any {
  const prop = properties?.find(p => p.name === name)
  return prop?.value
}

// Iframe generation utilities
function buildAlbumIframes(id: number | string, title: string, artist?: string, url?: string): {
  artwork: string
  slim: string
  standard: string
} {
  const albumId = String(id)
  const linkText = `${title}${artist ? ` by ${artist}` : ''}`
  const linkUrl = url || ''
  
  const artwork = `<iframe style="border: 0; width: ${CONFIG.IFRAME_ALBUM_ARTWORK_W}px; height: ${CONFIG.IFRAME_ALBUM_ARTWORK_H}px;" src="https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=large/bgcol=${CONFIG.IFRAME_BG}/linkcol=${CONFIG.IFRAME_LINK}/minimal=true/transparent=true/" seamless><a href="${linkUrl}">${linkText}</a></iframe>`
  
  const slim = `<iframe style="border: 0; width: 100%; height: ${CONFIG.IFRAME_ALBUM_SLIM_H}px;" src="https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=small/bgcol=${CONFIG.IFRAME_BG}/linkcol=${CONFIG.IFRAME_LINK}/artwork=none/transparent=true/" seamless><a href="${linkUrl}">${linkText}</a></iframe>`
  
  const standard = `<iframe style="border: 0; width: ${CONFIG.IFRAME_ALBUM_STD_W}px; height: ${CONFIG.IFRAME_ALBUM_STD_H}px;" src="https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=large/bgcol=${CONFIG.IFRAME_BG}/linkcol=${CONFIG.IFRAME_LINK}/transparent=true/" seamless><a href="${linkUrl}">${linkText}</a></iframe>`
  
  return { artwork, slim, standard }
}

function buildTrackIframes(id: number | string, title: string, artist?: string, url?: string): {
  artwork: string
  slim: string
  standard: string
} {
  const trackId = String(id)
  const linkText = `${title}${artist ? ` by ${artist}` : ''}`
  const linkUrl = url || ''
  
  const artwork = `<iframe style="border: 0; width: ${CONFIG.IFRAME_TRACK_ARTWORK_W}px; height: ${CONFIG.IFRAME_TRACK_ARTWORK_H}px;" src="https://bandcamp.com/EmbeddedPlayer/track=${trackId}/size=large/bgcol=${CONFIG.IFRAME_BG}/linkcol=${CONFIG.IFRAME_LINK}/minimal=true/transparent=true/" seamless><a href="${linkUrl}">${linkText}</a></iframe>`
  
  const slim = `<iframe style="border: 0; width: 100%; height: ${CONFIG.IFRAME_TRACK_SLIM_H}px;" src="https://bandcamp.com/EmbeddedPlayer/track=${trackId}/size=small/bgcol=${CONFIG.IFRAME_BG}/linkcol=${CONFIG.IFRAME_LINK}/artwork=none/transparent=true/" seamless><a href="${linkUrl}">${linkText}</a></iframe>`
  
  const standard = `<iframe style="border: 0; width: ${CONFIG.IFRAME_TRACK_STD_W}px; height: ${CONFIG.IFRAME_TRACK_STD_H}px;" src="https://bandcamp.com/EmbeddedPlayer/track=${trackId}/size=large/bgcol=${CONFIG.IFRAME_BG}/linkcol=${CONFIG.IFRAME_LINK}/transparent=true/" seamless><a href="${linkUrl}">${linkText}</a></iframe>`
  
  return { artwork, slim, standard }
}

function parseDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined
  
  try {
    // Handle various date formats from Bandcamp
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return undefined
    
    return format(date, 'yyyy-MM-dd')
  } catch (error) {
    console.warn(`Failed to parse date: ${dateStr}`, error)
    return undefined
  }
}

// Bandcamp crawling functions
async function fetchMusicGrid(): Promise<MusicGridItem[]> {
  console.log('Fetching music grid from:', `${CONFIG.BANDCAMP_BASE}/music`)
  
  try {
    const response = await axios.get(`${CONFIG.BANDCAMP_BASE}/music`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    const $ = cheerio.load(response.data)
    const items: MusicGridItem[] = []
    
    // Only process items within the specified container
    $('div.leftMiddleColumns ol#music-grid li.music-grid-item').each((_, element) => {
      const $item = $(element)
      const $link = $item.find('a[href]').first()
      const href = $link.attr('href')
      
      if (!href || (!href.includes('/album/') && !href.includes('/track/'))) {
        return // Skip non-album/track items
      }
      
      const url = normalizeUrl(href, CONFIG.BANDCAMP_BASE)
      const $img = $item.find('img').first()
      const cover_url = $img.attr('data-original') || $img.attr('src')
      
      const $title = $item.find('p.title').first()
      const title = $title.clone().children().remove().end().text().trim()
      const artist = $title.find('span.artist-override').text().trim() || undefined
      
      const dataItemId = $item.attr('data-item-id')
      let external_id: string | undefined
      if (dataItemId) {
        const match = dataItemId.match(/\d+/)
        external_id = match ? match[0] : undefined
      }
      
      items.push({
        url,
        cover_url,
        title,
        artist,
        external_id
      })
    })
    
    console.log(`Found ${items.length} items in music grid`)
    return items
  } catch (error) {
    console.error('Failed to fetch music grid:', error)
    throw error
  }
}

async function fetchAlbumPage(url: string): Promise<{ album: AlbumData, tracks: TrackData[] }> {
  console.log('Fetching album page:', url)
  
  try {
    await delay(CONFIG.REQUEST_DELAY_MS)
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    const html = response.data
    const $ = cheerio.load(html)
    
    // Extract both JSON-LD and JavaScript variables
    const jsonLdData: JsonLdData = extractJsonLd(html)
    const tralbumData = extractJavaScriptVar(html, 'TralbumData')
    const embedData = extractJavaScriptVar(html, 'EmbedData')
    
    if (!jsonLdData && !tralbumData) {
      throw new Error('Failed to extract album data from page')
    }
    
    // Extract metadata
    const ogImage = $('meta[property="og:image"]').attr('content')
    const canonical = $('link[rel="canonical"]').attr('href') || url
    const ogTitle = $('meta[property="og:title"]').attr('content')
    
    // Extract album about section
    const aboutEl = $('div.tralbum-about').first()
    let aboutHtml: string | undefined
    let aboutText: string | undefined
    if (aboutEl.length) {
      aboutHtml = aboutEl.html()?.trim() || undefined
      aboutText = aboutEl.text().split('\n').map(s => s.trim()).filter(Boolean).join('\n') || undefined
    }
    
    // Prefer TralbumData for detailed info, fallback to JSON-LD
    let title: string
    let type: string
    let releaseDate: string | undefined
    let externalId: string
    let artist: string | undefined
    
    if (tralbumData?.current) {
      title = tralbumData.current.title || ogTitle || 'Untitled'
      
      // Determine type
      const itemType = tralbumData.current.type || tralbumData.item_type
      if (itemType === 'a') type = 'album'
      else if (itemType === 't') type = 'track'  
      else if (itemType === 'e') type = 'ep'
      else if (itemType === 's') type = 'single'
      else type = itemType || 'album'
      
      releaseDate = parseDate(tralbumData.current.release_date || tralbumData.current.publish_date)
      externalId = tralbumData.current.item_id?.toString() || generateExternalId(canonical)
      artist = embedData?.artist
    } else {
      // Fallback to JSON-LD
      title = jsonLdData.name || ogTitle || 'Untitled'
      const albumRelease = jsonLdData.albumRelease?.[0]
      const albumProperties = albumRelease?.additionalProperty || []
      const itemType = getPropertyValue(albumProperties, 'item_type') as string
      
      if (itemType === 'a') type = 'album'
      else if (itemType === 't') type = 'track'
      else if (itemType === 'e') type = 'ep' 
      else if (itemType === 's') type = 'single'
      else type = 'album'
      
      releaseDate = parseDate(jsonLdData.datePublished)
      externalId = (getPropertyValue(albumProperties, 'item_id') as number)?.toString() || generateExternalId(canonical)
      artist = jsonLdData.byArtist?.name
    }
    
    // Generate album iframes
    const albumIframes = buildAlbumIframes(externalId, title, artist, canonical)
    
    // Build album data
    const album: AlbumData = {
      title,
      type,
      release_date: releaseDate,
      url: canonical,
      external_id: externalId,
      cover_url: jsonLdData?.image || ogImage,
      artist,
      about_html: aboutHtml,
      about_text: aboutText,
      iframe_artwork: albumIframes.artwork,
      iframe_slim: albumIframes.slim,
      iframe_standard: albumIframes.standard,
    }
    
    // Build tracks data - prefer TralbumData for detailed track info
    const tracks: TrackData[] = []
    
    if (tralbumData?.trackinfo && Array.isArray(tralbumData.trackinfo)) {
      // Use TralbumData for comprehensive track info including stream URLs
      for (const t of tralbumData.trackinfo) {
        // Parse track URL from title_link
        const tl = t.title_link as any
        let trackPageUrl: string
        if (tl) {
          const href = typeof tl === 'string' ? tl : tl.href
          if (href) {
            trackPageUrl = new URL(href, CONFIG.BANDCAMP_BASE).toString()
          } else {
            const tid = String(t.track_id ?? t.id ?? '')
            trackPageUrl = tid ? `${canonical}#track-${tid}` : canonical
          }
        } else {
          const tid = String(t.track_id ?? t.id ?? '')
          trackPageUrl = tid ? `${canonical}#track-${tid}` : canonical
        }
        
        // Parse stream URL with fallback priorities
        const fileObj = (t.file ?? {}) as Record<string, string | undefined>
        const streamUrl = fileObj['mp3-128'] ?? fileObj['mp3-320'] ?? fileObj['mp3-v0'] ?? fileObj['stream'] ?? undefined
        
        // Generate track iframes
        const trackId = String(t.track_id ?? t.id ?? '')
        const trackIframes = trackId ? buildTrackIframes(trackId, t.title, artist, trackPageUrl) : undefined
        
        tracks.push({
          title: t.title,
          track_number: t.track_num,
          duration_sec: t.duration,
          stream_url: streamUrl,
          track_url: trackPageUrl,
          external_track_id: trackId,
          album_external_id: album.external_id,
          iframe_artwork: trackIframes?.artwork,
          iframe_slim: trackIframes?.slim,
          iframe_standard: trackIframes?.standard,
        })
      }
    } else if (jsonLdData?.track?.itemListElement) {
      // Fallback to JSON-LD track data
      for (const trackItem of jsonLdData.track.itemListElement) {
        const trackProperties = trackItem.item.additionalProperty || []
        const trackId = getPropertyValue(trackProperties, 'track_id')
        const trackUrl = trackId 
          ? `${canonical}#track-${trackId}`
          : trackItem.item['@id']
        
        // Generate track iframes
        const trackIframes = trackId ? buildTrackIframes(trackId, trackItem.item.name, artist, trackUrl) : undefined
        
        tracks.push({
          title: trackItem.item.name,
          track_number: trackItem.position,
          duration_sec: trackItem.item.duration ? parseDuration(trackItem.item.duration) : undefined,
          stream_url: undefined,
          track_url: trackUrl,
          external_track_id: trackId?.toString(),
          album_external_id: album.external_id,
          iframe_artwork: trackIframes?.artwork,
          iframe_slim: trackIframes?.slim,
          iframe_standard: trackIframes?.standard,
        })
      }
    } else if (type === 'track') {
      // Single track page - create one track entry
      const trackIframes = buildTrackIframes(album.external_id, album.title, artist, canonical)
      
      tracks.push({
        title: album.title,
        track_number: 1,
        stream_url: undefined,
        track_url: canonical,
        external_track_id: album.external_id,
        album_external_id: album.external_id,
        iframe_artwork: trackIframes.artwork,
        iframe_slim: trackIframes.slim,
        iframe_standard: trackIframes.standard,
      })
    }
    
    return { album, tracks }
  } catch (error) {
    console.error(`Failed to fetch album page ${url}:`, error)
    throw error
  }
}

// Notion operations
async function findAlbumByExternalId(externalId: string): Promise<string | null> {
  try {
    const response = await notion.databases.query({
      database_id: CONFIG.ALBUMS_DB_ID,
      filter: {
        property: 'External ID',
        rich_text: {
          equals: externalId
        }
      }
    })
    
    return response.results.length > 0 ? (response.results[0] as any).id : null
  } catch (error) {
    console.error('Error finding album by external ID:', error)
    return null
  }
}

async function findAlbumByUrl(url: string): Promise<string | null> {
  try {
    const response = await notion.databases.query({
      database_id: CONFIG.ALBUMS_DB_ID,
      filter: {
        property: 'Bandcamp URL',
        url: {
          equals: url
        }
      }
    })
    
    return response.results.length > 0 ? (response.results[0] as any).id : null
  } catch (error) {
    console.error('Error finding album by URL:', error)
    return null
  }
}

async function findTrackByExternalId(externalId: string): Promise<string | null> {
  if (!externalId) return null
  
  try {
    const response = await notion.databases.query({
      database_id: CONFIG.TRACKS_DB_ID,
      filter: {
        property: 'External Track ID',
        rich_text: {
          equals: externalId
        }
      }
    })
    
    return response.results.length > 0 ? (response.results[0] as any).id : null
  } catch (error) {
    console.error('Error finding track by external ID:', error)
    return null
  }
}

async function upsertAlbum(album: AlbumData, dryRun: boolean = false): Promise<string | null> {
  try {
    // Find existing album
    let existingId = await findAlbumByExternalId(album.external_id)
    if (!existingId) {
      existingId = await findAlbumByUrl(album.url)
    }
    
    const properties: any = {
      'Name': {
        title: [{ text: { content: album.title } }]
      },
      'Type': {
        select: { name: album.type }
      },
      'Bandcamp URL': {
        url: album.url
      },
      'External ID': {
        rich_text: [{ text: { content: album.external_id } }]
      }
    }
    
    if (album.release_date) {
      properties['Release Date'] = {
        date: { start: album.release_date }
      }
    }
    
    if (album.cover_url) {
      properties['Cover'] = {
        files: [{
          type: 'external',
          name: `${album.title} Cover`,
          external: { url: album.cover_url }
        }]
      }
    }
    
    if (album.artist) {
      properties['Artist'] = {
        rich_text: [{ text: { content: album.artist } }]
      }
    }
    
    if (album.about_html) {
      // Notion rich text content limit is 2000 characters
      const htmlContent = album.about_html.length > 2000 
        ? album.about_html.substring(0, 1997) + '...'
        : album.about_html
      properties['About (HTML)'] = {
        rich_text: [{ text: { content: htmlContent } }]
      }
    }
    
    if (album.about_text) {
      // Notion rich text content limit is 2000 characters
      const textContent = album.about_text.length > 2000 
        ? album.about_text.substring(0, 1997) + '...'
        : album.about_text
      properties['About (Plain)'] = {
        rich_text: [{ text: { content: textContent } }]
      }
    }
    
    if (album.iframe_artwork) {
      properties['Iframe (Artwork)'] = {
        rich_text: [{ text: { content: album.iframe_artwork } }]
      }
    }
    
    if (album.iframe_slim) {
      properties['Iframe (Slim)'] = {
        rich_text: [{ text: { content: album.iframe_slim } }]
      }
    }
    
    if (album.iframe_standard) {
      properties['Iframe (Standard)'] = {
        rich_text: [{ text: { content: album.iframe_standard } }]
      }
    }
    
    if (dryRun) {
      console.log('DRY RUN - Album payload:', JSON.stringify({
        database_id: CONFIG.ALBUMS_DB_ID,
        properties,
        ...(existingId ? { page_id: existingId } : {})
      }, null, 2))
      return existingId || 'dry-run-id'
    }
    
    if (existingId) {
      // Update existing
      await notion.pages.update({
        page_id: existingId,
        properties
      })
      console.log(`Updated album: ${album.title}`)
      return existingId
    } else {
      // Create new
      const response = await notion.pages.create({
        parent: { database_id: CONFIG.ALBUMS_DB_ID },
        properties
      })
      console.log(`Created album: ${album.title}`)
      return response.id
    }
  } catch (error) {
    console.error(`Failed to upsert album ${album.title}:`, error)
    return null
  }
}

async function upsertTrack(track: TrackData, albumPageId: string, dryRun: boolean = false, forceIframes: boolean = false): Promise<void> {
  try {
    // Find existing track
    let existingId: string | null = null
    if (track.external_track_id) {
      existingId = await findTrackByExternalId(track.external_track_id)
    }
    
    const properties: any = {
      'Name': {
        title: [{ text: { content: track.title } }]
      },
      'Album': {
        relation: [{ id: albumPageId }]
      }
      // Note: No longer writing to 'Bandcamp Track URL' (deprecated)
    }
    
    if (track.track_number !== undefined) {
      properties['Track Number'] = { number: track.track_number }
    }
    
    if (track.duration_sec !== undefined) {
      properties['Duration (sec)'] = { number: track.duration_sec }
    }
    
    if (track.stream_url) {
      properties['Stream URL'] = { url: track.stream_url }
    }
    
    if (track.external_track_id) {
      properties['External Track ID'] = {
        rich_text: [{ text: { content: track.external_track_id } }]
      }
    }
    
    // Add iframe properties
    if (track.iframe_artwork) {
      properties['Iframe (Artwork)'] = {
        rich_text: [{ text: { content: track.iframe_artwork } }]
      }
    }
    
    if (track.iframe_slim) {
      properties['Iframe (Slim)'] = {
        rich_text: [{ text: { content: track.iframe_slim } }]
      }
    }
    
    if (track.iframe_standard) {
      properties['Iframe (Standard)'] = {
        rich_text: [{ text: { content: track.iframe_standard } }]
      }
    }
    
    if (dryRun) {
      console.log('DRY RUN - Track payload:', JSON.stringify({
        database_id: CONFIG.TRACKS_DB_ID,
        properties,
        ...(existingId ? { page_id: existingId } : {})
      }, null, 2))
      return
    }
    
    if (existingId) {
      // Update existing
      await notion.pages.update({
        page_id: existingId,
        properties
      })
      console.log(`  Updated track: ${track.title}`)
    } else {
      // Create new
      await notion.pages.create({
        parent: { database_id: CONFIG.TRACKS_DB_ID },
        properties
      })
      console.log(`  Created track: ${track.title}`)
    }
  } catch (error) {
    console.error(`Failed to upsert track ${track.title}:`, error)
  }
}

// Main processing functions
async function processAlbumUrl(url: string, dryRun: boolean = false, forceIframes: boolean = false): Promise<void> {
  try {
    const { album, tracks } = await fetchAlbumPage(url)
    
    console.log(`Processing album: ${album.title} (${tracks.length} tracks)`)
    
    const albumPageId = await upsertAlbum(album, dryRun)
    if (!albumPageId) {
      console.error(`Failed to upsert album: ${album.title}`)
      return
    }
    
    // Process tracks
    for (const track of tracks) {
      await upsertTrack(track, albumPageId, dryRun, forceIframes)
    }
  } catch (error) {
    console.error(`Failed to process album URL ${url}:`, error)
  }
}

// Schema validation and auto-update functions
async function ensureAlbumsSchema(dryRun: boolean = false): Promise<void> {
  try {
    const database = await notion.databases.retrieve({ database_id: CONFIG.ALBUMS_DB_ID })
    const properties = (database as any).properties
    
    const requiredProperties = {
      'About (HTML)': { type: 'rich_text' as const, rich_text: {} },
      'About (Plain)': { type: 'rich_text' as const, rich_text: {} },
      'Iframe (Artwork)': { type: 'rich_text' as const, rich_text: {} },
      'Iframe (Slim)': { type: 'rich_text' as const, rich_text: {} },
      'Iframe (Standard)': { type: 'rich_text' as const, rich_text: {} }
    }
    
    const updates: any = {}
    let needsUpdate = false
    
    for (const [propName, propConfig] of Object.entries(requiredProperties)) {
      if (!properties[propName]) {
        updates[propName] = propConfig
        needsUpdate = true
        console.log(`Adding missing property to Albums database: ${propName}`)
      }
    }
    
    if (needsUpdate && !dryRun) {
      await notion.databases.update({
        database_id: CONFIG.ALBUMS_DB_ID,
        properties: updates
      })
      console.log('Albums database schema updated')
    }
  } catch (error) {
    console.warn('Failed to check/update Albums schema:', error)
  }
}

async function ensureTracksSchema(dryRun: boolean = false): Promise<void> {
  try {
    const database = await notion.databases.retrieve({ database_id: CONFIG.TRACKS_DB_ID })
    const properties = (database as any).properties
    
    const updates: any = {}
    let needsUpdate = false
    
    // Rename deprecated field if it exists
    if (properties['Bandcamp Track URL'] && !properties['Bandcamp Track URL (deprecated)']) {
      updates['Bandcamp Track URL'] = { name: 'Bandcamp Track URL (deprecated)' }
      needsUpdate = true
      console.log('Renaming Bandcamp Track URL to deprecated')
    }
    
    // Add missing properties
    const requiredProperties = {
      'Stream URL': { type: 'url' as const, url: {} },
      'Iframe (Artwork)': { type: 'rich_text' as const, rich_text: {} },
      'Iframe (Slim)': { type: 'rich_text' as const, rich_text: {} },
      'Iframe (Standard)': { type: 'rich_text' as const, rich_text: {} }
    }
    
    for (const [propName, propConfig] of Object.entries(requiredProperties)) {
      if (!properties[propName]) {
        updates[propName] = propConfig
        needsUpdate = true
        console.log(`Adding missing property to Tracks database: ${propName}`)
      }
    }
    
    if (needsUpdate && !dryRun) {
      await notion.databases.update({
        database_id: CONFIG.TRACKS_DB_ID,
        properties: updates
      })
      console.log('Tracks database schema updated')
    }
  } catch (error) {
    console.warn('Failed to check/update Tracks schema:', error)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const forceIframes = args.includes('--force-iframes')
  const onlyUrlIndex = args.indexOf('--only')
  const onlyUrl = onlyUrlIndex !== -1 && args[onlyUrlIndex + 1] ? args[onlyUrlIndex + 1] : null
  
  console.log('Bandcamp to Notion Sync Script')
  console.log('================================')
  console.log(`Dry run: ${dryRun}`)
  console.log(`Force iframes: ${forceIframes}`)
  console.log(`Concurrency: ${CONFIG.CONCURRENCY}`)
  console.log(`Request delay: ${CONFIG.REQUEST_DELAY_MS}ms`)
  console.log('')
  
  // Ensure database schemas are up to date
  if (!dryRun) {
    console.log('Checking database schemas...')
    await ensureAlbumsSchema(dryRun)
    await ensureTracksSchema(dryRun)
    console.log('')
  }
  
  const errors: string[] = []
  let albumCount = 0
  let trackCount = 0
  
  try {
    if (onlyUrl) {
      console.log(`Processing single URL: ${onlyUrl}`)
      await processAlbumUrl(onlyUrl, dryRun, forceIframes)
      albumCount = 1
    } else {
      // Fetch music grid
      const gridItems = await fetchMusicGrid()
      const urls = [...new Set(gridItems.map(item => item.url))] // Deduplicate
      
      console.log(`Found ${urls.length} unique album/track URLs`)
      console.log('')
      
      // Process URLs with concurrency limit
      await Promise.all(
        urls.map(url =>
          limit(async () => {
            try {
              await processAlbumUrl(url, dryRun, forceIframes)
              albumCount++
            } catch (error) {
              errors.push(`${url}: ${error}`)
            }
          })
        )
      )
    }
    
    console.log('')
    console.log('Sync completed!')
    console.log(`Albums processed: ${albumCount}`)
    if (dryRun) {
      console.log('(This was a dry run - no actual changes were made)')
    }
    
    if (errors.length > 0) {
      console.log('')
      console.log('Errors encountered:')
      errors.forEach(error => console.log(`  - ${error}`))
    }
    
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
}

export { main, processAlbumUrl, fetchMusicGrid, fetchAlbumPage }
