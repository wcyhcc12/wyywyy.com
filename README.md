# wyywyy.com 後台使用說明

這個網站的「後台」就是 GitHub。文字、連結、照片都放在 `_data/` 和 `images/`，在 GitHub 上改完按 **Commit changes**，約 1 分鐘後 https://wyywyy.com 自動更新。版面程式（`_includes/`、`assets/`）平常不用動。

## 檔案在哪

| 要改的東西 | 檔案 |
|---|---|
| Email、IG、照片清單與分類、學經歷年份、作品連結與截圖 | `_data/shared.json` |
| 所有中文文字（含照片名稱） | `_data/zh.json` |
| 所有英文文字 | `_data/en.json` |
| 照片 | `images/photos/`（大圖 `w04.webp`＋小圖 `w04-t.webp`） |
| 作品列的網站截圖 | `images/sites/` |
| 分享到 LINE／IG 時的預覽圖 | `images/og.jpg`（1200×630） |

## 在 GitHub 上改字

1. 打開要改的檔案（例如 `_data/zh.json`），按右上角的鉛筆圖示。
2. 只改雙引號裡的文字。
3. 按 **Commit changes…** → 再按一次 **Commit changes**。
4. 等 1 分鐘，重新整理網站。

## JSON 三條規則（寫錯網站不會壞，只是不會更新）

1. 文字一律用**雙引號**。
2. 項目之間要有**逗號**，**最後一項後面不能有逗號**。
3. 括號要成對：`{ }`、`[ ]`。

沒更新時，到 repo 上方的 **Actions** 分頁，點紅色叉叉那一筆，會寫出錯在哪一行。修好之前，網站會繼續顯示上一個正確版本。

## 新增照片

1. 把原圖交給 Claude 處理（壓縮、轉 WebP、移除 GPS 定位），會得到 `w22.webp` 和 `w22-t.webp`。
2. 到 GitHub 的 `images/photos/` 按 **Add file → Upload files** 上傳這兩個檔。
3. `shared.json` 的 `photos` 加一行：`{ "id": "w22", "cat": "city" }`
   分類代號：`stage` 舞台演出、`city` 城市街拍、`sky` 天空自然、`temple` 人文廟宇、`event` 活動紀錄。
4. `zh.json` 與 `en.json` 的 `photos` 各加一行名稱：`"w22": "照片名稱"`。

`photos` 排在最前面的 20 張會出現在首頁的照片環（手機顯示前 12 張）。順序就是清單順序。
有可辨識人像的照片，公開前請先取得被攝者同意。

## 新增作品

`shared.json` 的 `works` 加一段（前一段結尾補逗號）：

```json
{
  "id": "chinese-history",
  "url": "https://wcyhcc12.github.io/Chinese-History/",
  "year": "2026",
  "status": "live",
  "images": ["/images/sites/chinese-history-1.webp", "/images/sites/chinese-history-2.webp", "/images/sites/chinese-history-3.webp"],
  "romanized": "Chung-kuo-shih Pi-chi"
}
```

- `status`：`live` 上線中；`building` 顯示「建置中」。
- `images`：2–4 張截圖或照片，第二張會置中。截圖可以請 Claude 代拍。
- `romanized`：中文名稱拼音。英文版還沒翻譯時會顯示它。

再到 `zh.json` 與 `en.json` 的 `works` 加：

```json
"chinese-history": {
  "title": "中國史筆記網站",
  "kind": "課程筆記網站",
  "desc": "一句話介紹。"
}
```

英文還沒翻譯就先不加。

## 學經歷

年份在 `shared.json` 的 `timeline`，文字在 zh／en 的 `timeline`。`end` 寫 `"now"` 顯示「至今」；`"current": true` 前面是粉紅色圓點。要新增一組（例如「得獎」），在 `timeline` 加一個 group，並在 zh／en 的 `groups` 加名稱。

## 不要刪的檔案

`CNAME`（自訂網域）、`_config.yml`、`_includes/`、`assets/`、`index.html`、`en/index.html`。
