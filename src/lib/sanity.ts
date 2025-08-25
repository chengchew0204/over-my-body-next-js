// src/lib/sanity.ts
import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '3km0musr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || process.env.SANITY_API_VERSION || '2025-01-08',
  useCdn: false, // 關閉 CDN 以確保讀取最新資料
  token: process.env.SANITY_API_TOKEN, // 添加寫入權限的 token
});

// 保持向後兼容
export const sanity = client;
