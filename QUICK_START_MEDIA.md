# 圖片和影片傳送功能 - 快速開始

## 🚀 快速啟動步驟

### 1. 執行資料庫遷移

```bash
# 連接到 MySQL
mysql -u root -p easy_chat

# 或使用 Docker
docker exec -i easy_chat-db-1 mysql -uroot -proot easy_chat < backend/migrations/add_media_support.sql
```

手動執行 SQL：
```sql
ALTER TABLE messages MODIFY COLUMN message_type ENUM('text', 'image', 'video', 'file') DEFAULT 'text';
ALTER TABLE messages ADD COLUMN file_url VARCHAR(500) AFTER message_type;
ALTER TABLE messages ADD COLUMN file_name VARCHAR(255) AFTER file_url;
ALTER TABLE messages ADD COLUMN file_size BIGINT AFTER file_name;
```

### 2. 確認上傳目錄已建立

```bash
cd backend
ls -la uploads/
# 應該看到 images/, videos/, files/ 目錄
```

### 3. 重啟後端服務

```bash
# 如果使用 Docker
docker-compose restart backend

# 或手動重啟
cd backend
go run main.go
```

### 4. 重啟前端服務

```bash
cd frontend
npm run dev
```

## ✅ 功能測試

1. 登入系統
2. 選擇一個好友開始聊天
3. 點擊輸入框左側的 📎 按鈕
4. 選擇一張圖片或影片
5. 檔案會自動上傳並顯示在聊天中

## 📋 支援的檔案類型

- **圖片**: JPG, PNG, GIF, WebP
- **影片**: MP4, MOV, AVI, MKV, WebM
- **檔案大小限制**: 50MB

## 🔍 問題排查

### 上傳失敗
- 檢查 `backend/uploads/` 目錄權限
- 檢查檔案大小是否超過 50MB
- 查看瀏覽器開發者工具的 Network 標籤

### 圖片或影片不顯示
- 檢查 `VITE_API_URL` 環境變數設定
- 確認後端的靜態檔案服務正常運作
- 檢查檔案是否成功儲存到 `uploads/` 目錄

### 資料庫錯誤
- 確認已執行遷移 SQL
- 檢查 `messages` 表結構是否正確
- 使用 `DESCRIBE messages;` 查看欄位

## 🎯 主要變更

### 後端
- `models/message.go`: 新增檔案欄位
- `controllers/chat_controller.go`: 新增 `UploadFile` 函數
- `routes/routes.go`: 新增上傳路由和靜態檔案服務

### 前端
- `api/chat.js`: 新增 `uploadFile` 函數
- `pages/ChatPage.jsx`: 新增檔案上傳 UI 和媒體顯示

## 📝 注意事項

1. 檔案會儲存在本地 `uploads/` 目錄
2. 正式環境建議使用雲端儲存（如 AWS S3）
3. 建議定期備份上傳的檔案
4. 可考慮增加圖片壓縮功能以節省空間
