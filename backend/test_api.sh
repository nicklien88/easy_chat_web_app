#!/bin/bash

# Easy Chat API 測試腳本
# 使用方法: ./test_api.sh

BASE_URL="http://localhost:8080"
API_URL="$BASE_URL/api"

echo "🧪 Easy Chat API 測試腳本"
echo "=========================="
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 測試健康檢查
echo "1️⃣  測試健康檢查..."
response=$(curl -s "$BASE_URL/health")
if [[ $response == *"ok"* ]]; then
    echo -e "${GREEN}✓ 健康檢查通過${NC}"
    echo "   回應: $response"
else
    echo -e "${RED}✗ 健康檢查失敗${NC}"
    exit 1
fi
echo ""

# 生成隨機使用者名稱
RANDOM_NUM=$RANDOM
USERNAME="testuser_$RANDOM_NUM"
EMAIL="test_$RANDOM_NUM@example.com"
PASSWORD="password123"

# 測試註冊
echo "2️⃣  測試使用者註冊..."
register_response=$(curl -s -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if [[ $register_response == *"token"* ]]; then
    echo -e "${GREEN}✓ 註冊成功${NC}"
    echo "   使用者: $USERNAME"
    echo "   信箱: $EMAIL"
    TOKEN=$(echo $register_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "   Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ 註冊失敗${NC}"
    echo "   回應: $register_response"
    exit 1
fi
echo ""

# 測試登入
echo "3️⃣  測試使用者登入..."
login_response=$(curl -s -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if [[ $login_response == *"token"* ]]; then
    echo -e "${GREEN}✓ 登入成功${NC}"
    TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "   Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ 登入失敗${NC}"
    echo "   回應: $login_response"
    exit 1
fi
echo ""

# 測試取得個人資料
echo "4️⃣  測試取得個人資料..."
profile_response=$(curl -s "$API_URL/profile" \
  -H "Authorization: Bearer $TOKEN")

if [[ $profile_response == *"$USERNAME"* ]]; then
    echo -e "${GREEN}✓ 取得個人資料成功${NC}"
    echo "   回應: $profile_response"
else
    echo -e "${RED}✗ 取得個人資料失敗${NC}"
    echo "   回應: $profile_response"
    exit 1
fi
echo ""

# 測試更新個人資料
echo "5️⃣  測試更新個人資料..."
update_response=$(curl -s -X PUT "$API_URL/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"display_name\": \"測試使用者 $RANDOM_NUM\"
  }")

if [[ $update_response == *"測試使用者"* ]]; then
    echo -e "${GREEN}✓ 更新個人資料成功${NC}"
    echo "   回應: $update_response"
else
    echo -e "${RED}✗ 更新個人資料失敗${NC}"
    echo "   回應: $update_response"
fi
echo ""

# 測試無效 token
echo "6️⃣  測試無效 token（預期失敗）..."
invalid_response=$(curl -s "$API_URL/profile" \
  -H "Authorization: Bearer invalid_token_123")

if [[ $invalid_response == *"無效"* ]] || [[ $invalid_response == *"401"* ]]; then
    echo -e "${GREEN}✓ 正確拒絕無效 token${NC}"
else
    echo -e "${YELLOW}⚠ 未預期的回應${NC}"
    echo "   回應: $invalid_response"
fi
echo ""

echo "=========================="
echo -e "${GREEN}🎉 所有測試完成！${NC}"
echo ""
echo "測試帳號資訊："
echo "  使用者名稱: $USERNAME"
echo "  電子郵件: $EMAIL"
echo "  密碼: $PASSWORD"
echo "  Token: ${TOKEN:0:30}..."
