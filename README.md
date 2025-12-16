# Easy Chat Web App 💬

一個現代化的線上即時通訊網頁應用程式，支援好友系統、私人聊天和即時訊息推送。

## 🎯 專案狀態

**當前進度**: 第一階段完成 ✅ (25%)

- ✅ **第一階段**: 基礎設施與認證系統（已完成）
- 🔄 **第二階段**: 好友系統與聊天功能（計劃中）
- ⏳ **第三階段**: WebSocket 即時通訊（待開發）
- ⏳ **第四階段**: 進階功能與優化（待開發）

詳細狀態請見 [PROJECT_STATUS.md](./PROJECT_STATUS.md)

## ✨ 功能特點

### 已實作 ✅
- 🔐 使用者註冊與登入
- 🎫 JWT Token 認證
- 🔒 密碼 bcrypt 加密
- 👤 個人資料管理
- 💾 MySQL 資料持久化
- 🌐 CORS 跨域支援

### 規劃中 📋
- 👥 好友系統（請求/接受/管理）
- 💬 私人聊天訊息
- ⚡ WebSocket 即時通訊
- 📁 檔案上傳分享
- 👪 群組聊天
- 🔍 訊息搜尋

## 🚀 快速開始

### 前置需求
- Go 1.24+
- MySQL 8.0+
- Node.js 18+ (前端)

### 1. 克隆專案
```bash
git clone https://github.com/nicklien88/easy_chat_web_app.git
cd easy_chat_web_app
```

### 2. 設置資料庫
```bash
# 啟動 MySQL
brew services start mysql  # macOS
# 或
sudo systemctl start mysql  # Linux

# 建立資料庫
mysql -u root -p -e "CREATE DATABASE easy_chat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. 配置後端
```bash
cd backend
cp .env.example .env
# 編輯 .env，設置資料庫密碼
vim .env
```

### 4. 啟動後端
```bash
cd backend
go mod tidy
go run main.go
```

成功啟動後會看到：
```
✓ 配置載入成功
✓ 資料庫連接成功
✓ 資料表遷移成功
✓ 伺服器啟動成功，監聽端口: 8080
```

### 5. 測試 API
```bash
# 執行自動化測試腳本
cd backend
./test_api.sh
```

詳細說明請見 [QUICKSTART.md](./QUICKSTART.md)

## 📁 專案結構

```
easy_chat_web_app/
├── backend/              # Go 後端
│   ├── config/          # 配置管理
│   ├── controllers/     # 請求處理器
│   ├── middleware/      # 中介軟體
│   ├── models/          # 資料模型
│   ├── routes/          # 路由設定
│   ├── utils/           # 工具函數
│   ├── database/        # 資料庫腳本
│   ├── main.go          # 應用程式入口
│   └── test_api.sh      # API 測試腳本
│
├── frontend/            # React 前端（待重構）
│   ├── src/
│   │   ├── components/  # React 組件
│   │   ├── pages/       # 頁面組件
│   │   └── api/         # API 封裝
│   └── package.json
│
└── docs/                # 文件
    ├── QUICKSTART.md    # 快速啟動指南
    ├── PROJECT_STATUS.md # 項目狀態
    └── SUMMARY.md       # 階段總結
```

## 🛠️ 技術棧

### 後端
- **框架**: [Gin](https://gin-gonic.com/) - 高效能的 Go Web 框架
- **資料庫**: MySQL 8.0+ 
- **ORM**: [GORM](https://gorm.io/) - Go 語言的 ORM 函式庫
- **認證**: JWT (JSON Web Tokens)
- **密碼加密**: bcrypt
- **WebSocket**: [Gorilla WebSocket](https://github.com/gorilla/websocket)

### 前端
- **框架**: React 18
- **路由**: React Router v7
- **UI**: Tailwind CSS + Shadcn/ui
- **狀態管理**: Context API
- **HTTP**: Axios

## 📡 API 端點

### 公開端點
- `GET /health` - 健康檢查
- `POST /api/register` - 使用者註冊
- `POST /api/login` - 使用者登入

### 需要認證的端點
- `GET /api/profile` - 取得個人資料
- `PUT /api/profile` - 更新個人資料
- `PUT /api/password` - 更新密碼

### 計劃中
- 好友系統相關 API
- 聊天訊息相關 API
- WebSocket 連接端點

詳細 API 文件見 [API.md](./docs/API.md)（待建立）

## 🧪 測試

```bash
# 執行後端測試
cd backend
./test_api.sh

# 手動測試範例
curl http://localhost:8080/health
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'
```

## 📚 文件

- [快速啟動指南](./QUICKSTART.md) - 如何快速運行專案
- [資料庫設置](./backend/README_DB.md) - MySQL 設置詳細說明
- [專案狀態](./PROJECT_STATUS.md) - 當前進度與待辦事項
- [第一階段總結](./SUMMARY.md) - 架構重構成果
- [第一階段報告](./backend/PHASE1_COMPLETE.md) - 技術實作細節

## 🔄 重構歷史

本專案經過一次重大架構重構：

### 重構前
- 單一 `main.go` 檔案包含所有邏輯
- 使用記憶體存儲（map）
- 無認證機制
- 無密碼加密

### 重構後
- 清晰的分層架構（MVC + Middleware）
- MySQL 資料庫持久化
- JWT 認證系統
- bcrypt 密碼加密
- 完整的文件與測試

詳見 [SUMMARY.md](./SUMMARY.md)

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 👤 作者

**nicklien88**
- GitHub: [@nicklien88](https://github.com/nicklien88)

## 🙏 致謝

- [Gin Framework](https://gin-gonic.com/)
- [GORM](https://gorm.io/)
- [Gorilla WebSocket](https://github.com/gorilla/websocket)
- [Shadcn/ui](https://ui.shadcn.com/)

---

**最後更新**: 2025-12-15  
**版本**: v0.1.0-phase1  
**狀態**: 🟢 第一階段完成，可運行
