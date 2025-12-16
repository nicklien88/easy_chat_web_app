#!/bin/bash

# Easy Chat 快速啟動腳本

echo "🚀 Easy Chat 快速啟動"
echo "===================="
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 檢查 MySQL
echo -e "${BLUE}1. 檢查 MySQL 服務...${NC}"
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✓ MySQL 已安裝${NC}"
    
    # 嘗試連接測試
    if mysql -u root -e "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}✓ MySQL 服務運行中${NC}"
    else
        echo -e "${YELLOW}⚠ MySQL 未運行或需要密碼${NC}"
        echo "  請執行: brew services start mysql  (macOS)"
        echo "  或: sudo systemctl start mysql  (Linux)"
    fi
else
    echo -e "${RED}✗ MySQL 未安裝${NC}"
    echo "  請先安裝 MySQL 8.0+"
    exit 1
fi
echo ""

# 檢查資料庫
echo -e "${BLUE}2. 檢查資料庫...${NC}"
DB_EXISTS=$(mysql -u root -e "SHOW DATABASES LIKE 'easy_chat';" 2>/dev/null | grep -c "easy_chat")
if [ "$DB_EXISTS" -eq 1 ]; then
    echo -e "${GREEN}✓ easy_chat 資料庫已存在${NC}"
else
    echo -e "${YELLOW}⚠ easy_chat 資料庫不存在${NC}"
    read -p "是否要建立資料庫？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mysql -u root -e "CREATE DATABASE easy_chat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ 資料庫建立成功${NC}"
        else
            echo -e "${RED}✗ 資料庫建立失敗，可能需要密碼${NC}"
            echo "  請手動執行: mysql -u root -p"
            echo "  然後執行: CREATE DATABASE easy_chat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        fi
    fi
fi
echo ""

# 檢查 Go
echo -e "${BLUE}3. 檢查 Go 環境...${NC}"
if command -v go &> /dev/null; then
    GO_VERSION=$(go version | awk '{print $3}')
    echo -e "${GREEN}✓ Go 已安裝 ($GO_VERSION)${NC}"
else
    echo -e "${RED}✗ Go 未安裝${NC}"
    echo "  請先安裝 Go 1.24+"
    exit 1
fi
echo ""

# 檢查環境變數
echo -e "${BLUE}4. 檢查環境變數配置...${NC}"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓ .env 檔案已存在${NC}"
else
    echo -e "${YELLOW}⚠ .env 檔案不存在${NC}"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}✓ 已複製 .env.example 到 .env${NC}"
        echo -e "${YELLOW}⚠ 請編輯 backend/.env 設置資料庫密碼${NC}"
    fi
fi
echo ""

# 安裝依賴
echo -e "${BLUE}5. 安裝後端依賴...${NC}"
cd backend
if go mod download &> /dev/null; then
    echo -e "${GREEN}✓ 依賴安裝成功${NC}"
else
    echo -e "${RED}✗ 依賴安裝失敗${NC}"
    exit 1
fi
cd ..
echo ""

# 提供選項
echo "===================="
echo -e "${GREEN}準備完成！${NC}"
echo ""
echo "接下來您可以："
echo "  1) 執行 'cd backend && go run main.go' 啟動後端"
echo "  2) 執行 'cd backend && ./test_api.sh' 測試 API"
echo "  3) 查看 QUICKSTART.md 獲取詳細說明"
echo ""
echo "API 端點："
echo "  - http://localhost:8080/health"
echo "  - http://localhost:8080/api/register"
echo "  - http://localhost:8080/api/login"
echo ""

read -p "是否現在啟動後端？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}正在啟動後端伺服器...${NC}"
    cd backend
    go run main.go
fi
