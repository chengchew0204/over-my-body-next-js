# Bandcamp to Notion 同步系統

這個系統可以自動從 Bandcamp 爬取音樂資料並同步到 Notion 資料庫。

## 設定

1. **環境變數設定** (`.env.local`)：
```env
# DO NOT commit real secrets. Use local env files and CI/CD secrets.
NOTION_TOKEN=__YOUR_NOTION_TOKEN__
ALBUMS_DB_ID=__YOUR_ALBUMS_DATABASE_ID__
TRACKS_DB_ID=__YOUR_TRACKS_DATABASE_ID__
BANDCAMP_BASE=https://overmybody.bandcamp.com
REQUEST_DELAY_MS=1000
CONCURRENCY=2
```

2. **安裝依賴**：
```bash
npm install
```

## 使用方法

### 手動執行

```bash
# 完整同步
pnpm bandcamp:sync

# 預覽模式（不會實際寫入 Notion）
pnpm bandcamp:dry

# 只處理單一專輯/單曲頁面
pnpm bandcamp:sync --only https://overmybody.bandcamp.com/album/beni

# 直接使用 tsx 執行
npx tsx scripts/bandcamp-to-notion.ts --dry-run
```

### 功能說明

- 爬取清單頁：從 `/music` 頁面抓取所有專輯和單曲連結
- 解析專輯頁：提取專輯資訊和曲目資料
- 智慧去重：使用 External ID 和 URL 進行 Upsert 操作
- 錯誤處理：單一頁面失敗不會中斷整個流程
- 並發控制：可設定同時處理的頁面數量
- 節流限制：請求之間的延遲時間

## 排程執行

### 1. Cron Job
```bash
# 每天凌晨 2 點執行
0 2 * * * cd /path/to/project && pnpm bandcamp:sync
```

### 2. GitHub Actions（使用 Secrets）
建立 `.github/workflows/bandcamp-sync.yml`：

```yaml
name: Bandcamp Sync
on:
  schedule:
    - cron: '0 2 * * *'  # 每天 UTC 2:00
  workflow_dispatch:  # 手動觸發

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run bandcamp:sync
        env:
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
          ALBUMS_DB_ID: ${{ secrets.ALBUMS_DB_ID }}
          TRACKS_DB_ID: ${{ secrets.TRACKS_DB_ID }}
```

## Notion CMS 使用

在 Next.js 中使用 `src/lib/notion-cms.ts` 查詢資料：

```typescript
import { listAlbums, listTracksByAlbum, getAlbumWithTracks } from '@/lib/notion-cms'

// 列出所有專輯
const albums = await listAlbums({
  sortBy: 'release_date',
  sortDirection: 'descending'
})

// 取得專輯及其曲目
const albumWithTracks = await getAlbumWithTracks('album-page-id')

// 列出專輯的曲目
const tracks = await listTracksByAlbum('album-page-id')
```

## 故障排除

1. 確保 `.env.local` 中的 Token 和資料庫 ID 正確（不要提交到 Git）。
2. 調整 `REQUEST_DELAY_MS` 和 `CONCURRENCY` 參數以避免被封鎖。
3. 檢查 Notion API 使用量限制與錯誤訊息。


