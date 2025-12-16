# Easy Chat Backend - 第一階段完成

## ✅ 已完成項目

### 1. 基礎架構
- ✅ 環境變數配置（.env）
- ✅ 資料庫配置管理（config/config.go）
- ✅ 資料庫結構設計（database/schema.sql）

### 2. 資料模型層
- ✅ User 模型（使用者）
- ✅ Message 模型（訊息）
- ✅ Friendship 模型（好友關係）
- ✅ ChatRoom 和 RoomMember 模型（群組聊天）

### 3. 工具函數
- ✅ 密碼加密/驗證（utils/password.go）
- ✅ JWT Token 生成/驗證（utils/jwt.go）
- ✅ 統一響應格式（utils/response.go）
- ✅ 輸入驗證（utils/validator.go）

### 4. 中介軟體
- ✅ JWT 認證中介軟體（middleware/auth_middleware.go）
- ✅ CORS 跨域中介軟體（middleware/cors_middleware.go）
- ✅ 錯誤處理中介軟體（middleware/error_middleware.go）

### 5. 認證 API
- ✅ 使用者註冊（POST /api/register）
- ✅ 使用者登入（POST /api/login）
- ✅ 取得個人資料（GET /api/profile）
- ✅ 更新個人資料（PUT /api/profile）
- ✅ 更新密碼（PUT /api/password）

## 📁 新增的檔案結構

```
backend/
├── .env                          # 環境變數配置
├── .env.example                  # 環境變數範例
├── main.go                       # 應用程式入口（已重構）
├── main.go.old                   # 原始 WebSocket 實作備份
├── README_DB.md                  # 資料庫設置指南
│
├── config/
│   └── config.go                 # 配置管理
│
├── database/
│   └── schema.sql                # 資料庫結構
│
├── models/
│   ├── user.go                   # 使用者模型
│   ├── message.go                # 訊息模型
│   ├── friendship.go             # 好友關係模型
│   └── room.go                   # 聊天室模型
│
├── controllers/
│   ├── auth_controller.go        # 認證控制器
│   ├── user_controller.go        # 使用者控制器
│   └── chat_controller.go        # （待實作）
│
├── middleware/
│   ├── auth_middleware.go        # JWT 認證
│   ├── cors_middleware.go        # CORS 處理
│   └── error_middleware.go       # 錯誤處理
│
├── utils/
│   ├── jwt.go                    # JWT 工具
│   ├── password.go               # 密碼工具
│   ├── response.go               # 響應工具
│   └── validator.go              # 驗證工具
│
└── routes/
    └── routes.go                 # 路由設定
```

## 🚀 啟動步驟

### 1. 設置資料庫
```bash
# 啟動 MySQL
brew services start mysql  # macOS
# 或
sudo systemctl start mysql  # Linux

# 建立資料庫
mysql -u root -p
CREATE DATABASE easy_chat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# 執行結構腳本
mysql -u root -p easy_chat < database/schema.sql
```

### 2. 配置環境變數
編輯 `.env` 檔案，設置正確的資料庫密碼：
```env
DB_PASSWORD=your_mysql_password
```

### 3. 安裝依賴並啟動
```bash
cd backend
go mod tidy
go run main.go
```

應該看到：
```
✓ 配置載入成功
✓ 資料庫連接成功
✓ 資料表遷移成功
✓ 伺服器啟動成功，監聽端口: 8080
```

## 🧪 測試 API

### 健康檢查
```bash
curl http://localhost:8080/health
```

### 註冊使用者
```bash
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 登入
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 取得個人資料（需要 token）
```bash
curl http://localhost:8080/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📋 待辦事項（第二階段）

- [ ] 實作好友系統 API
- [ ] 實作聊天訊息 API
- [ ] 重構 WebSocket 功能
- [ ] 實作即時訊息推送
- [ ] 實作檔案上傳功能

## 🔧 關鍵變更

1. **架構重構**：從單檔案混合邏輯改為分層架構（MVC + Middleware）
2. **資料持久化**：從記憶體存儲改為 MySQL 資料庫 + GORM ORM
3. **安全性提升**：新增 JWT 認證、密碼加密、輸入驗證
4. **API 標準化**：統一的響應格式和錯誤處理
5. **可擴展性**：模組化設計，易於新增功能

## 📝 注意事項

- 原始的 WebSocket 聊天室功能已暫時移除，將在第二階段重新實作
- 確保 MySQL 服務正常運行
- 確保 .env 檔案中的資料庫密碼正確
- 首次啟動時會自動建立資料表（AutoMigrate）
