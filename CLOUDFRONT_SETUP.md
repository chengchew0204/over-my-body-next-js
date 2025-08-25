# CloudFront 配置指南

## 問題說明

目前 `streamUrl` 使用 `localhost:3000/api/proxy/...` 是因為沒有配置 CloudFront 域名。

## 解決方案

### 1. 設定環境變數

在你的 `.env.local` 檔案中添加：

```bash
# 如果你有 CloudFront 分發
CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net

# 如果沒有 CloudFront，直接使用 S3
# （留空 CLOUDFRONT_DOMAIN，系統會自動使用 S3 直接連結）
```

### 2. URL 優先順序

系統現在使用以下優先順序：

1. **CloudFront URL** (推薦用於生產環境)
   - `https://your-cloudfront-domain.cloudfront.net/hls/album/track/index.m3u8`
   - 全球 CDN 加速
   - 更好的快取控制

2. **S3 Direct URL** (開發環境可用)
   - `https://your-bucket.s3.amazonaws.com/hls/album/track/index.m3u8`
   - 直接從 S3 提供檔案

3. **Proxy URL** (僅測試用)
   - `http://localhost:3000/api/proxy/hls/album/track/index.m3u8`
   - 僅用於開發環境測試

### 3. 檢查目前設定

在終端機執行：

```bash
echo $CLOUDFRONT_DOMAIN
```

如果沒有輸出，表示沒有設定 CloudFront 域名。

### 4. CloudFront 設定建議

如果你有 AWS CloudFront：

1. **Origin**: 設定為你的 S3 bucket
2. **Behaviors**: 
   - `*.m3u8` → Cache Policy: No Cache
   - `*.ts` → Cache Policy: Optimized for static content
3. **Custom Headers**: 添加 CORS headers

### 5. 立即修復

如果你想要立即使用 S3 直接連結而不是 proxy：

1. 確保 S3 bucket 的 CORS 設定正確
2. 確保檔案權限為 public-read
3. 系統會自動使用 S3 URL

## 測試

上傳新的曲目後，檢查 Sanity Studio 中的 `streamUrl` 欄位：

- ✅ 正確：`https://your-domain.cloudfront.net/hls/...`
- ✅ 可接受：`https://your-bucket.s3.amazonaws.com/hls/...`
- ❌ 開發用：`http://localhost:3000/api/proxy/...`
