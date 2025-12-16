#!/bin/bash

# Easy Chat Phase 4 - 前後端整合測試

echo "🎯 Easy Chat Phase 4 - 前後端整合測試"
echo "========================================"
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 檢查後端是否運行
echo "1️⃣  檢查後端伺服器..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo -e "${GREEN}✓ 後端伺服器運行正常 (http://localhost:8080)${NC}"
else
    echo -e "${RED}✗ 後端伺服器未運行${NC}"
    echo "   請先啟動: cd backend && go run main.go"
    exit 1
fi

# 檢查前端是否運行
echo "2️⃣  檢查前端伺服器..."
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✓ 前端伺服器運行正常 (http://localhost:5173)${NC}"
else
    echo -e "${RED}✗ 前端伺服器未運行${NC}"
    echo "   請先啟動: cd frontend && npm run dev"
    exit 1
fi

echo ""
echo -e "${BLUE}測試環境準備完成！${NC}"
echo "========================================"
echo ""

echo "📋 完整功能清單:"
echo ""
echo "✅ Phase 1 - 基礎架構 (6 個 API)"
echo "   • POST /api/register - 使用者註冊"
echo "   • POST /api/login - 使用者登入"
echo "   • GET /api/user/profile - 取得使用者資料"
echo "   • PUT /api/user/profile - 更新使用者資料"
echo "   • PUT /api/user/password - 更新密碼"
echo "   • Middleware: JWT 認證、CORS、錯誤處理"
echo ""

echo "✅ Phase 2 - 好友與聊天 (12 個 API)"
echo "   好友系統 (7 個):"
echo "   • POST /api/friends/request - 發送好友請求"
echo "   • GET /api/friends/requests - 取得收到的請求"
echo "   • GET /api/friends/sent - 取得發送的請求"
echo "   • POST /api/friends/accept/:id - 接受好友請求"
echo "   • POST /api/friends/reject/:id - 拒絕好友請求"
echo "   • GET /api/friends - 取得好友列表"
echo "   • DELETE /api/friends/:id - 刪除好友"
echo ""
echo "   聊天功能 (5 個):"
echo "   • POST /api/chat/send - 發送訊息"
echo "   • GET /api/chat/:friendId/messages - 取得聊天記錄"
echo "   • PUT /api/messages/:id/read - 標記已讀"
echo "   • GET /api/messages/unread - 取得未讀數量"
echo "   • GET /api/chat/recent - 取得最近聊天"
echo ""

echo "✅ Phase 3 - WebSocket 即時通訊 (3 個 API)"
echo "   • GET /api/ws - WebSocket 連接"
echo "   • GET /api/online/users - 查詢在線使用者"
echo "   • GET /api/online/check/:userId - 檢查使用者在線"
echo ""

echo "✅ Phase 4 - 前端整合"
echo "   • React 18 + Vite"
echo "   • React Router v7 路由"
echo "   • Axios HTTP 客戶端"
echo "   • WebSocket 客戶端"
echo "   • Tailwind CSS 樣式"
echo "   • 完整認證流程"
echo "   • 即時聊天介面"
echo "   • 好友管理功能"
echo ""

echo "========================================"
echo -e "${GREEN}🎉 所有功能開發完成！${NC}"
echo ""
echo "🌐 測試步驟:"
echo "   1. 打開瀏覽器訪問: http://localhost:5173"
echo "   2. 註冊兩個測試帳號"
echo "   3. 使用其中一個帳號登入"
echo "   4. 新增好友 (輸入另一個帳號的使用者名稱)"
echo "   5. 使用另一個帳號登入並接受好友請求"
echo "   6. 開始聊天測試即時訊息功能"
echo ""
echo "📊 技術架構:"
echo "   後端: Go 1.24 + Gin + GORM + MySQL + WebSocket"
echo "   前端: React 18 + Vite + React Router + Axios + Tailwind"
echo "   資料庫: MySQL 8.0+"
echo "   即時通訊: WebSocket (Gorilla)"
echo ""
echo "📁 項目結構:"
echo "   backend/"
echo "   ├── config/          # 環境配置"
echo "   ├── models/          # 資料模型"
echo "   ├── controllers/     # 控制器"
echo "   ├── middleware/      # 中間件"
echo "   ├── services/        # 服務層 (WebSocket Hub)"
echo "   ├── utils/           # 工具函數"
echo "   └── routes/          # 路由配置"
echo ""
echo "   frontend/"
echo "   ├── src/"
echo "   │   ├── api/         # API 客戶端"
echo "   │   ├── components/  # React 組件"
echo "   │   ├── contexts/    # React Context"
echo "   │   └── pages/       # 頁面組件"
echo "   └── public/          # 靜態資源"
echo ""

echo "🔗 相關文件:"
echo "   • README.md - 項目說明"
echo "   • backend/test_phase1.sh - Phase 1 測試"
echo "   • backend/test_phase2.sh - Phase 2 測試"
echo "   • backend/test_phase3.sh - Phase 3 測試"
echo ""

echo "========================================"
echo -e "${GREEN}✨ Easy Chat 開發完成！✨${NC}"
echo "========================================"
