# 專輯曲目上傳功能使用指南

## 功能概述

這個專輯曲目上傳介面提供了一個簡潔優雅的批次上傳解決方案，遵循 less-is-more 的設計理念，支援：

- 批次音檔上傳（WAV、MP3等格式）
- 自動WAV轉HLS串流處理
- 自動更新Sanity CMS中的Track資料
- 即時上傳進度顯示
- 錯誤處理與重試機制

## 訪問方式

1. 登入 Sanity Studio：`https://yourdomain.com/studio`
2. 在導航欄點擊「曲目上傳」
3. 或直接訪問：`https://yourdomain.com/studio/upload`

## 使用步驟

### 1. 選擇專輯
- 從下拉選單中選擇要上傳曲目的專輯
- 專輯列表來自Sanity CMS中的Release資料

### 2. 上傳音檔
- **拖拽上傳**：將音檔拖拽到上傳區域
- **點擊上傳**：點擊上傳區域選擇檔案
- 支援多檔案同時選擇
- 支援的格式：WAV、MP3等音頻格式

### 3. 編輯曲目資訊
- **曲目順序**：調整Track Number
- **曲名**：編輯曲目名稱（預設為檔案名稱）
- **移除檔案**：點擊X按鈕移除不需要的檔案

### 4. 開始處理
- 點擊「開始上傳」按鈕
- 系統會依序處理每個檔案：
  1. 讀取音檔時長
  2. 上傳到伺服器
  3. 轉換為HLS格式
  4. 上傳到AWS S3 + CloudFront
  5. 在Sanity CMS中創建Track紀錄

## 處理狀態說明

- **待處理**：檔案已加入列表，等待處理
- **上傳中**：檔案正在上傳到伺服器
- **處理中**：正在轉換為HLS格式並上傳到S3
- **完成**：Track已成功創建並可在前台播放
- **錯誤**：處理失敗，可查看錯誤詳情

## 自動化流程

### 音檔處理
1. **格式轉換**：WAV/MP3 → AAC
2. **HLS分割**：生成.m3u8播放列表和.ts片段檔案
3. **加密保護**：使用AES-128加密保護音檔
4. **CDN部署**：上傳到AWS S3並透過CloudFront分發

### 資料庫更新
系統會自動在Sanity CMS中創建Track記錄，包含：
- `name`: 曲名
- `album`: 關聯的專輯（Reference）
- `trackNumber`: 曲目順序
- `durationSec`: 音檔時長（秒）
- `streamUrl`: HLS串流URL
- `externalTrackId`: 外部追蹤ID

## 技術架構

### 前端
- **Next.js 15** + React
- **Framer Motion** 提供流暢動畫
- **TypeScript** 確保型別安全
- **Tailwind CSS** 實現 less-is-more 設計風格

### 後端
- **API Routes**: `/api/process-audio`, `/api/tracks/create`
- **FFmpeg**: 音檔格式轉換和HLS分割
- **AWS SDK**: S3上傳和CloudFront分發
- **Sanity Client**: CMS資料操作

### 儲存
- **Sanity CMS**: Track和Release資料管理
- **AWS S3**: HLS檔案儲存
- **CloudFront**: 全球CDN分發

## 環境變數設定

確保以下環境變數已正確配置：

```env
# AWS 配置
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
CLOUDFRONT_DOMAIN=your_cloudfront_domain

# Sanity 配置
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production

# Base URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 檔案大小限制

- 建議單檔不超過100MB
- 支援並行處理但會依序執行避免伺服器過載
- 如遇到大檔案或網路問題，系統會顯示錯誤並允許重試

## 故障排除

### 常見問題
1. **上傳失敗**：檢查網路連線和檔案格式
2. **處理超時**：大檔案可能需要更長時間
3. **權限錯誤**：確認AWS權限設定正確
4. **Sanity錯誤**：檢查CMS連線和Schema配置

### 錯誤恢復
- 系統提供自動錯誤處理
- 失敗的檔案可以單獨重試
- 完整的錯誤日誌記錄便於除錯

## 設計特色

### Less-is-More 設計理念
- **極簡介面**：去除不必要的視覺元素
- **精緻細節**：微妙的陰影和邊框效果
- **優雅動畫**：流暢但不花俏的過場效果
- **直覺操作**：拖拽上傳和即時編輯

### 色彩系統
- 主要使用中性色調（neutral-50 到 neutral-900）
- 避免過於鮮豔的色彩
- 狀態顏色：藍色（處理中）、橙色（轉換中）、綠色（完成）、紅色（錯誤）

## 未來擴展

可能的功能擴展：
- 支援更多音檔格式（FLAC、OGG等）
- 批次編輯曲目資訊
- 音檔品質設定選項
- 上傳進度統計和分析
- 自動音樂標籤識別
