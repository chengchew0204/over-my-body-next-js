# CloudFront CORS 設置指南

## 問題
播放器在生產環境中無法載入 HLS 串流，出現 CORS 錯誤：
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://d1bv0suzu50fal.cloudfront.net/hls/...
```

## 解決方案

### 1. 設置 S3 Bucket CORS

1. 登入 AWS Console
2. 前往 S3 → 你的 bucket (`omb-media-prod`)
3. 點擊 "Permissions" 標籤
4. 找到 "Cross-origin resource sharing (CORS)" 區塊
5. 點擊 "Edit"
6. 貼上以下配置：

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedOrigins": [
      "https://over-my-body-next-4zr9jjp3r-zack-wus-projects-609ed125.vercel.app",
      "https://over-my-body-next-js.vercel.app",
      "http://localhost:3000"
    ],
    "ExposeHeaders": [
      "Content-Length",
      "Content-Range",
      "Content-Type"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

7. 點擊 "Save changes"

### 2. 設置 CloudFront CORS

1. 前往 CloudFront → Distributions
2. 選擇你的 distribution (`d1bv0suzu50fal.cloudfront.net`)
3. 點擊 "Behaviors" 標籤
4. 選擇 HLS 路徑的 behavior（通常是 `/*` 或 `/hls/*`）
5. 點擊 "Edit"
6. 在 "Cache and origin request settings" 中：
   - 選擇 "Use legacy cache settings"
   - 在 "Cache Policy" 中選擇 "CachingDisabled" 或自定義策略
7. 在 "Response headers policy" 中：
   - 選擇 "Create response headers policy"
   - 添加以下 CORS 標頭：

**⚠️ 重要：只使用域名，不要包含路徑！**

```
Access-Control-Allow-Origin: https://over-my-body-next-4zr9jjp3r-zack-wus-projects-609ed125.vercel.app
Access-Control-Allow-Methods: GET, HEAD
Access-Control-Allow-Headers: *
Access-Control-Max-Age: 3000
```

**正確格式：**
- ✅ `https://over-my-body-next-4zr9jjp3r-zack-wus-projects-609ed125.vercel.app`
- ❌ `https://over-my-body-next-4zr9jjp3r-zack-wus-projects-609ed125.vercel.app/`
- ❌ `https://over-my-body-next-4zr9jjp3r-zack-wus-projects-609ed125.vercel.app/player-demo`

8. 點擊 "Create policy" 然後 "Save changes"

### 3. 清除 CloudFront 快取

1. 在 CloudFront distribution 頁面
2. 點擊 "Invalidations" 標籤
3. 創建新的 invalidation：
   - Path: `/hls/*`
   - 點擊 "Create invalidation"

### 4. 測試

等待幾分鐘讓設置生效，然後測試播放器：
- 離線：`http://localhost:3000/player-demo`
- 線上：`https://over-my-body-next-4zr9jjp3r-zack-wus-projects-609ed125.vercel.app/player-demo`

## 注意事項

- **Access-Control-Allow-Origin 只能包含域名，不能包含路徑**
- 確保所有 Vercel 部署 URL 都包含在 `AllowedOrigins` 中
- 如果使用自定義域名，也要添加到允許的來源
- CORS 設置可能需要幾分鐘才能生效
- 建議清除 CloudFront 快取以確保新設置生效

## 常見錯誤

**錯誤：** `The parameter Access-Control-Allow-Origin contains https://.../ which is not a valid URL.`

**解決方案：** 移除 URL 末尾的斜線 `/`，只保留域名部分。
