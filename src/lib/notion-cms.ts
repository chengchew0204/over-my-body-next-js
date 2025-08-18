/**
 * Notion CMS utilities for querying Albums and Tracks databases
 * 
 * Provides minimal query functions for Next.js to use Notion as a CMS
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Client } from '@notionhq/client'

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const ALBUMS_DB_ID = process.env.ALBUMS_DB_ID!
const TRACKS_DB_ID = process.env.TRACKS_DB_ID!

// Types for the data we expect from Notion
export interface AlbumRecord {
  id: string
  title: string
  type: string
  releaseDate?: string
  bandcampUrl?: string
  externalId?: string
  coverUrl?: string
  artist?: string
  createdTime: string
  lastEditedTime: string
}

export interface TrackRecord {
  id: string
  title: string
  albumId?: string
  trackNumber?: number
  durationSec?: number
  streamUrl?: string
  bandcampTrackUrl?: string
  externalTrackId?: string
  createdTime: string
  lastEditedTime: string
}

// Helper function to extract text from rich text
function extractRichText(richText: any[]): string {
  if (!Array.isArray(richText)) return ''
  return richText.map(item => item.plain_text || '').join('')
}

// Helper function to extract title text
function extractTitle(title: any[]): string {
  if (!Array.isArray(title)) return ''
  return title.map(item => item.plain_text || '').join('')
}

// Helper function to extract date
function extractDate(date: any): string | undefined {
  if (!date || !date.start) return undefined
  return date.start
}

// Helper function to extract URL
function extractUrl(url: any): string | undefined {
  return url || undefined
}

// Helper function to extract number
function extractNumber(number: any): number | undefined {
  return typeof number === 'number' ? number : undefined
}

// Helper function to extract select value
function extractSelect(select: any): string {
  return select?.name || ''
}

// Helper function to extract files
function extractFiles(files: any[]): string | undefined {
  if (!Array.isArray(files) || files.length === 0) return undefined
  const firstFile = files[0]
  if (firstFile.type === 'external') {
    return firstFile.external?.url
  } else if (firstFile.type === 'file') {
    return firstFile.file?.url
  }
  return undefined
}

// Helper function to extract relation IDs
function extractRelation(relation: any[]): string[] {
  if (!Array.isArray(relation)) return []
  return relation.map(item => item.id).filter(Boolean)
}

/**
 * List all albums from the Albums database
 * 
 * @param options Query options
 * @returns Promise<AlbumRecord[]>
 */
export async function listAlbums(options: {
  pageSize?: number
  startCursor?: string
  sortBy?: 'created_time' | 'last_edited_time' | 'release_date'
  sortDirection?: 'ascending' | 'descending'
  filterByType?: string
} = {}): Promise<{
  results: AlbumRecord[]
  hasMore: boolean
  nextCursor?: string
}> {
  try {
    const {
      pageSize = 100,
      startCursor,
      sortBy = 'created_time',
      sortDirection = 'descending',
      filterByType
    } = options

    const queryOptions: any = {
      database_id: ALBUMS_DB_ID,
      page_size: pageSize,
    }

    if (startCursor) {
      queryOptions.start_cursor = startCursor
    }

    // Add sorting
    if (sortBy === 'release_date') {
      queryOptions.sorts = [{
        property: 'Release Date',
        direction: sortDirection
      }]
    } else {
      queryOptions.sorts = [{
        timestamp: sortBy,
        direction: sortDirection
      }]
    }

    // Add filtering
    if (filterByType) {
      queryOptions.filter = {
        property: 'Type',
        select: {
          equals: filterByType
        }
      }
    }

    const response = await notion.databases.query(queryOptions)

    const albums: AlbumRecord[] = response.results.map((page: any) => ({
      id: page.id,
      title: extractTitle(page.properties['Name']?.title || []),
      type: extractSelect(page.properties['Type']?.select),
      releaseDate: extractDate(page.properties['Release Date']?.date),
      bandcampUrl: extractUrl(page.properties['Bandcamp URL']?.url),
      externalId: extractRichText(page.properties['External ID']?.rich_text || []),
      coverUrl: extractFiles(page.properties['Cover']?.files || []),
      artist: extractRichText(page.properties['Artist']?.rich_text || []),
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
    }))

    return {
      results: albums,
      hasMore: response.has_more,
      nextCursor: response.next_cursor || undefined
    }
  } catch (error) {
    console.error('Error fetching albums:', error)
    throw error
  }
}

/**
 * Get a single album by ID
 * 
 * @param albumId Notion page ID
 * @returns Promise<AlbumRecord | null>
 */
export async function getAlbumById(albumId: string): Promise<AlbumRecord | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: albumId })
    
    if (!('properties' in page)) {
      return null
    }

    return {
      id: page.id,
      title: extractTitle((page.properties as any)['Name']?.title || []),
      type: extractSelect((page.properties as any)['Type']?.select),
      releaseDate: extractDate((page.properties as any)['Release Date']?.date),
      bandcampUrl: extractUrl((page.properties as any)['Bandcamp URL']?.url),
      externalId: extractRichText((page.properties as any)['External ID']?.rich_text || []),
      coverUrl: extractFiles((page.properties as any)['Cover']?.files || []),
      artist: extractRichText((page.properties as any)['Artist']?.rich_text || []),
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
    }
  } catch (error) {
    console.error('Error fetching album by ID:', error)
    return null
  }
}

/**
 * List tracks for a specific album
 * 
 * @param albumPageId Notion page ID of the album
 * @param options Query options
 * @returns Promise<TrackRecord[]>
 */
export async function listTracksByAlbum(albumPageId: string, options: {
  pageSize?: number
  startCursor?: string
  sortBy?: 'track_number' | 'created_time'
  sortDirection?: 'ascending' | 'descending'
} = {}): Promise<{
  results: TrackRecord[]
  hasMore: boolean
  nextCursor?: string
}> {
  try {
    const {
      pageSize = 100,
      startCursor,
      sortBy = 'track_number',
      sortDirection = 'ascending'
    } = options

    const queryOptions: any = {
      database_id: TRACKS_DB_ID,
      page_size: pageSize,
      filter: {
        property: 'Album',
        relation: {
          contains: albumPageId
        }
      }
    }

    if (startCursor) {
      queryOptions.start_cursor = startCursor
    }

    // Add sorting
    if (sortBy === 'track_number') {
      queryOptions.sorts = [{
        property: 'Track Number',
        direction: sortDirection
      }]
    } else {
      queryOptions.sorts = [{
        timestamp: sortBy,
        direction: sortDirection
      }]
    }

    const response = await notion.databases.query(queryOptions)

    const tracks: TrackRecord[] = response.results.map((page: any) => {
      const albumRelation = extractRelation(page.properties['Album']?.relation || [])
      
      return {
        id: page.id,
        title: extractTitle(page.properties['Name']?.title || []),
        albumId: albumRelation[0], // Take first related album
        trackNumber: extractNumber(page.properties['Track Number']?.number),
        durationSec: extractNumber(page.properties['Duration (sec)']?.number),
        streamUrl: extractUrl(page.properties['Stream URL']?.url),
        bandcampTrackUrl: extractUrl(page.properties['Bandcamp Track URL']?.url),
        externalTrackId: extractRichText(page.properties['External Track ID']?.rich_text || []),
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
      }
    })

    return {
      results: tracks,
      hasMore: response.has_more,
      nextCursor: response.next_cursor || undefined
    }
  } catch (error) {
    console.error('Error fetching tracks by album:', error)
    throw error
  }
}

/**
 * List all tracks with optional filtering
 * 
 * @param options Query options
 * @returns Promise<TrackRecord[]>
 */
export async function listTracks(options: {
  pageSize?: number
  startCursor?: string
  sortBy?: 'track_number' | 'created_time'
  sortDirection?: 'ascending' | 'descending'
} = {}): Promise<{
  results: TrackRecord[]
  hasMore: boolean
  nextCursor?: string
}> {
  try {
    const {
      pageSize = 100,
      startCursor,
      sortBy = 'created_time',
      sortDirection = 'descending'
    } = options

    const queryOptions: any = {
      database_id: TRACKS_DB_ID,
      page_size: pageSize,
    }

    if (startCursor) {
      queryOptions.start_cursor = startCursor
    }

    // Add sorting
    if (sortBy === 'track_number') {
      queryOptions.sorts = [{
        property: 'Track Number',
        direction: sortDirection
      }]
    } else {
      queryOptions.sorts = [{
        timestamp: sortBy,
        direction: sortDirection
      }]
    }

    const response = await notion.databases.query(queryOptions)

    const tracks: TrackRecord[] = response.results.map((page: any) => {
      const albumRelation = extractRelation(page.properties['Album']?.relation || [])
      
      return {
        id: page.id,
        title: extractTitle(page.properties['Name']?.title || []),
        albumId: albumRelation[0], // Take first related album
        trackNumber: extractNumber(page.properties['Track Number']?.number),
        durationSec: extractNumber(page.properties['Duration (sec)']?.number),
        streamUrl: extractUrl(page.properties['Stream URL']?.url),
        bandcampTrackUrl: extractUrl(page.properties['Bandcamp Track URL']?.url),
        externalTrackId: extractRichText(page.properties['External Track ID']?.rich_text || []),
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
      }
    })

    return {
      results: tracks,
      hasMore: response.has_more,
      nextCursor: response.next_cursor || undefined
    }
  } catch (error) {
    console.error('Error fetching tracks:', error)
    throw error
  }
}

/**
 * Get album with its tracks
 * 
 * @param albumId Notion page ID of the album
 * @returns Promise<{ album: AlbumRecord, tracks: TrackRecord[] } | null>
 */
export async function getAlbumWithTracks(albumId: string): Promise<{
  album: AlbumRecord
  tracks: TrackRecord[]
} | null> {
  try {
    const album = await getAlbumById(albumId)
    if (!album) return null

    const { results: tracks } = await listTracksByAlbum(albumId, {
      sortBy: 'track_number',
      sortDirection: 'ascending'
    })

    return { album, tracks }
  } catch (error) {
    console.error('Error fetching album with tracks:', error)
    return null
  }
}

/**
 * Search albums by title or artist
 * 
 * @param query Search query
 * @returns Promise<AlbumRecord[]>
 */
export async function searchAlbums(query: string): Promise<AlbumRecord[]> {
  try {
    // Note: Notion doesn't have full-text search in the API, so we'll fetch all and filter
    // For production use, consider implementing a more sophisticated search solution
    const { results: albums } = await listAlbums({ pageSize: 100 })
    
    const lowerQuery = query.toLowerCase()
    return albums.filter(album => 
      album.title.toLowerCase().includes(lowerQuery) ||
      album.artist?.toLowerCase().includes(lowerQuery)
    )
  } catch (error) {
    console.error('Error searching albums:', error)
    return []
  }
}
