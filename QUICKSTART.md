# Easy Chat - 快速啟動指南

## 🎯 第一階段已完成！

已成功重構後端架構並實作認證系統。

## 📦 快速啟動

### 1️⃣ 準備資料庫

```bash
# 確保 MySQL 正在運行
brew services start mysql  # macOS
# 或
sudo systemctl start mysql  # Linux

# 建立資料庫
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS easy_chat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 執行資料表結構（可選，應用程式會自動遷移）
mysql -u root -p easy_chat < backend/database/schema.sql
```

### 2️⃣ 配置環境變數

編輯 `backend/.env`，修改資料庫密碼：

```bash
cd backend
vim .env  # 或使用任何編輯器

# 修改這一行：
DB_PASSWORD=your_mysql_password  # 改為您的 MySQL 密碼
```

### 3️⃣ 啟動後端

```bash
cd backend
go run main.go
```

成功啟動會看到：
```
✓ 配置載入成功
✓ 資料庫連接成功
✓ 資料表遷移成功
✓ 伺服器啟動成功，監聽端口: 8080
✓ API 端點: http://localhost:8080/api
✓ 健康檢查: http://localhost:8080/health
```

### 4️⃣ 啟動前端（稍後）

```bash
cd frontend
npm install
npm run dev
```

## ✅ 測試後端 API

### 測試健康檢查
```bash
curl http://localhost:8080/health
```

### 註冊新使用者
```bash
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "password123"
  }'
```

預期回應：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 1,
      "username": "alice",
      "email": "alice@example.com",
      ...
    }
  }
}
```

### 登入
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

### 取得個人資料（需要 token）
```bash
# 將 YOUR_TOKEN 替換為登入或註冊時返回的 token
curl http://localhost:8080/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 常見問題排除

### ❌ 無法連接資料庫
```
✗ 資料庫初始化失敗: dial tcp 127.0.0.1:3306: connect: connection refused
```

**解決方法：**
```bash
# 檢查 MySQL 是否運行
brew services list  # macOS
sudo systemctl status mysql  # Linux

# 啟動 MySQL
brew services start mysql  # macOS
sudo systemctl start mysql  # Linux
```

### ❌ 密碼錯誤
```
✗ 資料庫初始化失敗: Error 1045: Access denied for user 'root'@'localhost'
```

**解決方法：**
修改 `backend/.env` 中的 `DB_PASSWORD`

### ❌ 資料庫不存在
```
✗ 資料庫初始化失敗: Error 1049: Unknown database 'easy_chat'
```

**解決方法：**
```bash
mysql -u root -p -e "CREATE DATABASE easy_chat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### ❌ 端口被占用
```
bind: address already in use
```

**解決方法：**
```bash
# 查找占用 8080 端口的程序
lsof -i :8080

# 終止該程序
kill -9 PID

# 或修改 .env 中的 SERVER_PORT
```

## 📚 相關文件

- **資料庫設置詳細說明**: `backend/README_DB.md`
- **第一階段完成報告**: `backend/PHASE1_COMPLETE.md`
- **API 文件**: 見下方

## 📡 可用的 API 端點

### 公開端點（無需認證）
- `GET /health` - 健康檢查
- `POST /api/register` - 註冊
- `POST /api/login` - 登入

### 需要認證的端點（需要 Bearer Token）
- `GET /api/profile` - 取得個人資料
- `PUT /api/profile` - 更新個人資料
- `PUT /api/password` - 更新密碼

### 待實作（第二階段）
- 好友系統 API
- 聊天訊息 API
- WebSocket 即時通訊

## 🎉 恭喜！

第一階段已完成，您現在擁有：
- ✅ 完整的認證系統（註冊/登入/JWT）
- ✅ 資料庫持久化
- ✅ 安全的密碼加密
- ✅ 清晰的分層架構
- ✅ CORS 跨域支援

## 🚀 下一步

準備好開始第二階段（好友系統和聊天功能）時，請告訴我！
