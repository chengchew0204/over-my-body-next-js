// src/lib/sanity-write.ts
// 專門用於寫入操作的 Sanity client (僅限伺服器端)
import { createClient } from '@sanity/client';

// 確保只在伺服器端初始化
if (typeof window !== 'undefined') {
  throw new Error('writeClient 只能在伺服器端使用');
}

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '3km0musr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production',
  apiVersion: '2025-01-08',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // 需要寫入權限的 token
});

// 如果沒有配置 token，提供警告
if (!process.env.SANITY_API_TOKEN) {
  console.warn('⚠️  SANITY_API_TOKEN 未配置，無法執行寫入操作');
}

export default writeClient;
