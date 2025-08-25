# 🎵 完整音檔處理管道指南

## 🎯 功能概述

這個系統提供從原始音檔到安全雲端串流的完整處理流程：

```
WAV/MP3/AAC → FFmpeg 轉換 → HLS 切片 → AES-128 加密 → S3 上傳 → CloudFront 分發 → 安全播放
```

## 🚀 使用步驟

### 1. 環境準備

確保您的 `.env.local` 包含：

```env
# AWS 設定
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# CloudFront 設定 (可選)
CLOUDFRONT_DOMAIN=your-distribution.cloudfront.net

# 現有的測試金鑰 (會自動與新金鑰合併)
HLS_KEYS_JSON={"1-wrack-x-b-e-n-n-moon-beam":"f9b72200a6ca999082827a0b51ec41f5"}
```

### 2. 啟動測試

```bash
npm run dev
```

前往：`http://localhost:3000/dev/audio-pipeline`

### 3. 處理音檔

1. **選擇音檔**：支援 WAV, MP3, AAC, FLAC 格式
2. **設定標題**：會自動從檔名提取
3. **設定專輯路徑**：用於組織 S3 結構
4. **開始處理**：點擊「開始處理」按鈕

## 🔧 技術細節

### 處理流程

1. **檔案上傳**：接收原始音檔
2. **FFmpeg 轉換**：
   ```bash
   ffmpeg -i input.wav \
     -c:a aac -b:a 128k \
     -hls_time 6 \
     -hls_playlist_type vod \
     -hls_key_info_file key.info \
     -hls_segment_filename seg_%04d.ts \
     index.m3u8
   ```
3. **加密設定**：
   - 生成隨機 16 字節 AES-128 金鑰
   - 創建金鑰資訊檔案
   - 修改 m3u8 檔案指向我們的金鑰端點
4. **S3 上傳**：
   - 上傳所有 HLS 檔案 (.m3u8, .ts)
   - 設定適當的 Content-Type 和 Cache-Control
5. **金鑰註冊**：動態註冊解密金鑰到系統

### 檔案結構

上傳到 S3 的檔案結構：
```
s3://your-bucket/
└── hls/
    └── {albumPath}/
        └── {trackId}/
            ├── index.m3u8
            ├── seg_0000.ts
            ├── seg_0001.ts
            └── ...
```

### 安全機制

- **AES-128 加密**：音頻切片加密
- **動態金鑰**：每個音軌使用獨特金鑰
- **金鑰端點**：`/api/hls/key?track={trackId}`
- **CloudFront 準備**：支援 Signed URLs/Cookies

## 📊 測試驗證

### 成功指標

- [ ] 音檔成功轉換為 HLS 格式
- [ ] 加密金鑰正確生成和註冊
- [ ] 檔案成功上傳到 S3
- [ ] HLS 播放器能載入遠端檔案
- [ ] 音頻正常解密和播放
- [ ] 音質保持良好

### 故障排除

| 問題 | 可能原因 | 解決方案 |
|------|---------|---------|
| FFmpeg 錯誤 | 音檔格式不支援 | 檢查音檔完整性，嘗試其他格式 |
| 上傳失敗 | AWS 認證問題 | 檢查環境變數設定 |
| 播放失敗 | 金鑰端點問題 | 檢查金鑰是否正確註冊 |
| 音質問題 | 編碼參數設定 | 調整 FFmpeg 參數 |

## 🎼 測試音檔建議

### 快速測試

使用現有的 WAV 檔案：
```
/Users/zackwu204/Desktop/BENN/Tracks/B E N N x WRACK - Moon Beam [OMB007]/
```

選擇任一 WAV 檔案進行測試。

### 測試場景

1. **短音檔** (< 1 分鐘)：快速驗證流程
2. **標準音軌** (3-5 分鐘)：完整功能測試
3. **長音檔** (> 10 分鐘)：性能和穩定性測試

## 🔄 與現有系統整合

### 金鑰管理

- 新處理的音軌會自動加入金鑰系統
- 與現有環境變數金鑰相容
- 支援動態新增和查詢

### API 端點

- `POST /api/process-audio`：處理音檔
- `POST /api/keys/manage`：管理金鑰
- `GET /api/keys/manage`：查詢金鑰
- `GET /api/hls/key`：提供解密金鑰

## 📈 效能考量

### 處理時間

- 短音檔 (< 1 分鐘)：約 10-20 秒
- 標準音軌 (3-5 分鐘)：約 30-60 秒
- 長音檔 (> 10 分鐘)：約 2-5 分鐘

時間包含：轉換 + 加密 + 上傳

### 資源使用

- 臨時檔案會自動清理
- 記憶體使用隨音檔大小而定
- CPU 使用在轉換期間較高

## 🔒 生產環境建議

1. **金鑰儲存**：使用資料庫取代檔案系統
2. **監控**：加入處理狀態和錯誤監控
3. **限制**：設定檔案大小和處理時間限制
4. **佇列**：使用背景佇列處理大檔案
5. **安全**：啟用 CloudFront Signed Cookies

---

**準備開始測試？** 🎵

1. 設定環境變數
2. 前往 `/dev/audio-pipeline`
3. 上傳一個 WAV 檔案
4. 觀察完整的處理流程！
