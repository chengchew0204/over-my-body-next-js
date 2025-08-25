# HLS 加密串流測試指南

## 🎯 測試目標
測試您現有的 HLS 加密音頻檔案是否能正常解密播放。

## 📋 測試準備清單

### 1. 創建環境變數檔案
在專案根目錄創建 `.env.local` 檔案：

```bash
# 在 overmybody-NextJS/ 目錄下執行
echo 'HLS_KEYS_JSON={"1-wrack-x-b-e-n-n-moon-beam":"f9b72200a6ca999082827a0b51ec41f5","2-wrack-x-b-e-n-n-shadow-garden":"cfc578a0db4a6031b01ddffdb2c3e687","3-wrack-x-b-e-n-n-moon-beam-t5umut5umu-remix":"27d7a425f0d308f6ee73364f31ab8f7f"}' > .env.local
```

### 2. 啟動開發伺服器
```bash
npm run dev
```

### 3. 前往測試頁面
開啟瀏覽器到：`http://localhost:3000/dev/audio-test`

## 🔍 測試檢查項目

### ✅ 成功指標
- [ ] HLS.js 成功載入
- [ ] 能夠取得 manifest (.m3u8) 檔案
- [ ] 金鑰端點 `/api/hls/key` 回應正常
- [ ] 音頻片段 (.ts) 成功解密
- [ ] 音頻能正常播放

### ❌ 可能的錯誤與解決方案

| 錯誤訊息 | 可能原因 | 解決方案 |
|---------|---------|---------|
| `403 Forbidden` | CloudFront cookies 檢查 | 已暫時停用，檢查金鑰端點 |
| `404 Not Found` | HLS 檔案路徑錯誤 | 檢查 `public/hls/` 目錄 |
| `Key loading failed` | 金鑰格式或端點問題 | 檢查環境變數和金鑰格式 |
| `Network Error` | CORS 或連線問題 | 檢查 Next.js 配置 |

## 🛠 已完成的設定

### HLS 檔案配置
- ✅ HLS 檔案已複製到 `public/hls/`
- ✅ m3u8 檔案中的金鑰 URI 已修正為相對路徑
- ✅ 支援 3 個測試音軌

### 播放器組件
- ✅ `HLSTestPlayer.tsx` - 完整的 HLS 測試播放器
- ✅ 詳細的除錯日誌
- ✅ 錯誤處理和狀態顯示

### API 端點
- ✅ `/api/hls/key` - 金鑰分發端點
- ✅ 暫時放寬 CloudFront cookies 檢查
- ✅ 支援 AES-128 解密

### Next.js 配置
- ✅ CORS 標頭配置
- ✅ HLS 檔案提供配置

## 🚀 測試步驟

1. **準備環境**：確保 `.env.local` 檔案包含正確的金鑰
2. **啟動伺服器**：`npm run dev`
3. **開啟測試頁**：前往 `/dev/audio-test`
4. **觀察日誌**：檢查瀏覽器開發者工具的 Console 和 Network 頁籤
5. **測試播放**：點擊每個播放器的播放按鈕

## 📊 測試結果記錄

請記錄以下資訊：
- 播放器是否能載入 manifest 檔案？
- 金鑰請求是否成功？
- 音頻是否能正常播放？
- 有無任何錯誤訊息？

## 🔧 進階除錯

如果遇到問題，可以：
1. 檢查瀏覽器 Network 頁籤的請求狀態
2. 查看 HLSTestPlayer 組件的除錯日誌
3. 驗證金鑰格式（應為 32 個十六進位字符）
4. 確認 HLS 檔案完整性

---

**下一步**：測試成功後，您可以開始整合到正式的發布頁面，並設定 CloudFront 的安全機制。
