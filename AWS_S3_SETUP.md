# AWS S3 + CloudFront 設定指南

## 🎯 目標
建立從本地檔案 → S3 → CloudFront → 安全播放的完整流程

## 📋 必要設定

### 1. AWS 帳戶設定

#### S3 Bucket 設定
```bash
# 創建 S3 Bucket (替換為您的 bucket 名稱)
aws s3 mb s3://your-bucket-name --region us-east-1

# 設定 CORS 政策
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors-policy.json
```

#### CORS 政策檔案 (cors-policy.json)
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": [],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 2. 環境變數設定

在 `.env.local` 檔案中加入：

```env
# AWS 基本設定
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# CloudFront 設定 (可選，用於 CDN 分發)
CLOUDFRONT_DOMAIN=your-distribution-domain.cloudfront.net

# HLS 金鑰 (現有的測試金鑰)
HLS_KEYS_JSON={"1-wrack-x-b-e-n-n-moon-beam":"f9b72200a6ca999082827a0b51ec41f5","2-wrack-x-b-e-n-n-shadow-garden":"cfc578a0db4a6031b01ddffdb2c3e687","3-wrack-x-b-e-n-n-moon-beam-t5umut5umu-remix":"27d7a425f0d308f6ee73364f31ab8f7f"}
```

### 3. IAM 權限設定

您的 AWS IAM 用戶需要以下權限：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

## 🧪 測試步驟

### 方法 1：測試頁面上傳
1. 前往 `/dev/s3-test`
2. 選擇 HLS 檔案 (.m3u8 和 .ts)
3. 設定專輯路徑
4. 點擊上傳
5. 測試雲端播放

### 方法 2：使用現有檔案快速測試
從以下路徑選擇檔案進行上傳：
```
/Users/zackwu204/Desktop/BENN/overmybody-NextJS/public/hls/moon-beam-omb007/1-wrack-x-b-e-n-n-moon-beam/
```

選擇：
- `index.m3u8`
- 所有 `seg_*.ts` 檔案

## 🔍 驗證檢查項目

### ✅ 成功指標
- [ ] 檔案成功上傳到 S3
- [ ] S3 URL 可以存取
- [ ] CloudFront URL 可以存取 (如果設定)
- [ ] HLS 播放器能載入遠端檔案
- [ ] 音頻正常解密播放

### ❌ 常見問題

| 問題 | 可能原因 | 解決方案 |
|------|---------|---------|
| 上傳失敗 | AWS 認證錯誤 | 檢查環境變數設定 |
| CORS 錯誤 | S3 CORS 未設定 | 設定 S3 CORS 政策 |
| 404 錯誤 | 檔案路徑錯誤 | 檢查 S3 Key 路徑 |
| 播放失敗 | 金鑰端點問題 | 確認 `/api/hls/key` 正常 |

## 🚀 下一步

測試成功後：
1. 整合到正式發布頁面
2. 設定 CloudFront Signed URLs/Cookies
3. 建立自動化上傳流程
4. 從 `Tracks/` 目錄自動轉換和上傳

## 🔒 安全考量

- 使用 CloudFront Signed URLs 限制存取
- 設定適當的 S3 Bucket 政策
- 定期輪換 AWS 存取金鑰
- 監控 S3 存取日誌
