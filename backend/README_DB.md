# Easy Chat 資料庫設置指南

## 前置條件

確保您已安裝 MySQL（建議版本 8.0+）

## 設置步驟

### 1. 啟動 MySQL 服務

#### macOS (使用 Homebrew)
```bash
brew services start mysql
# 或
mysql.server start
```

#### Linux
```bash
sudo systemctl start mysql
```

#### Windows
在服務管理器中啟動 MySQL 服務

### 2. 登入 MySQL

```bash
mysql -u root -p
```

### 3. 建立資料庫並執行結構腳本

```sql
-- 方法 1: 在 MySQL 命令列中執行
source /Users/nicklien/easy_chat_web_app/backend/database/schema.sql;

-- 方法 2: 或使用以下命令
CREATE DATABASE IF NOT EXISTS easy_chat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE easy_chat;
```

然後執行：
```bash
mysql -u root -p easy_chat < database/schema.sql
```

### 4. 驗證資料表

```sql
USE easy_chat;
SHOW TABLES;

-- 應該看到以下資料表:
-- - users
-- - friendships
-- - messages
-- - chat_rooms
-- - room_members
```

### 5. 配置環境變數

確保 `backend/.env` 檔案包含正確的資料庫設定：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password  # 修改為您的 MySQL 密碼
DB_NAME=easy_chat
```

### 6. 測試連接

啟動應用程式，應該會看到：
```
✓ 配置載入成功
✓ 資料庫連接成功
✓ 資料表遷移成功
✓ 伺服器啟動成功，監聽端口: 8080
```

## 常見問題

### Q: 無法連接資料庫
A: 檢查：
- MySQL 服務是否運行
- .env 中的密碼是否正確
- 資料庫名稱是否存在

### Q: 字符集錯誤
A: 確保資料庫使用 utf8mb4：
```sql
ALTER DATABASE easy_chat CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
```

### Q: 自動遷移失敗
A: 手動執行 schema.sql：
```bash
mysql -u root -p easy_chat < database/schema.sql
```

## 使用 GORM AutoMigrate

應用程式啟動時會自動執行資料表遷移，但如果需要手動控制，可以修改 `main.go` 中的 AutoMigrate 部分。
