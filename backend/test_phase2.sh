#!/bin/bash

# Easy Chat Phase 2 API 測試腳本
# 測試好友系統和聊天功能

BASE_URL="http://localhost:8080"
API_URL="$BASE_URL/api"

echo "🧪 Easy Chat Phase 2 API 測試"
echo "=============================="
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 建立兩個測試使用者
RANDOM1=$RANDOM
RANDOM2=$RANDOM
USER1_NAME="alice_$RANDOM1"
USER1_EMAIL="alice_$RANDOM1@test.com"
USER1_PASS="password123"

USER2_NAME="bob_$RANDOM2"
USER2_EMAIL="bob_$RANDOM2@test.com"
USER2_PASS="password123"

echo -e "${BLUE}準備階段：建立測試使用者${NC}"
echo "=============================="

# 註冊使用者1
echo "1️⃣  註冊使用者 Alice..."
register1=$(curl -s -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USER1_NAME\",
    \"email\": \"$USER1_EMAIL\",
    \"password\": \"$USER1_PASS\"
  }")

if [[ $register1 == *"token"* ]]; then
    echo -e "${GREEN}✓ Alice 註冊成功${NC}"
    TOKEN1=$(echo $register1 | jq -r '.data.token')
    USER1_ID=$(echo $register1 | jq -r '.data.user.id')
else
    echo -e "${RED}✗ Alice 註冊失敗${NC}"
    echo "   回應: $register1"
    exit 1
fi

# 註冊使用者2
echo "2️⃣  註冊使用者 Bob..."
register2=$(curl -s -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USER2_NAME\",
    \"email\": \"$USER2_EMAIL\",
    \"password\": \"$USER2_PASS\"
  }")

if [[ $register2 == *"token"* ]]; then
    echo -e "${GREEN}✓ Bob 註冊成功${NC}"
    TOKEN2=$(echo $register2 | jq -r '.data.token')
    USER2_ID=$(echo $register2 | jq -r '.data.user.id')
else
    echo -e "${RED}✗ Bob 註冊失敗${NC}"
    echo "   回應: $register2"
    exit 1
fi

echo ""
echo -e "${BLUE}好友系統測試${NC}"
echo "=============================="

# 測試發送好友請求
echo "3️⃣  Alice 發送好友請求給 Bob..."
friend_request=$(curl -s -X POST "$API_URL/friends/request" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d "{\"friend_username\": \"$USER2_NAME\"}")

if [[ $friend_request == *"好友請求已發送"* ]]; then
    echo -e "${GREEN}✓ 好友請求發送成功${NC}"
else
    echo -e "${RED}✗ 好友請求發送失敗${NC}"
    echo "   回應: $friend_request"
fi

# 測試查看收到的好友請求
echo "4️⃣  Bob 查看收到的好友請求..."
requests=$(curl -s "$API_URL/friends/requests" \
  -H "Authorization: Bearer $TOKEN2")

if [[ $requests == *"$USER1_NAME"* ]]; then
    echo -e "${GREEN}✓ 成功看到 Alice 的好友請求${NC}"
    REQUEST_ID=$(echo $requests | jq -r '.data[0].id')
    echo "   請求 ID: $REQUEST_ID"
else
    echo -e "${RED}✗ 未找到好友請求${NC}"
    echo "   回應: $requests"
fi

# 測試接受好友請求
echo "5️⃣  Bob 接受 Alice 的好友請求..."
accept=$(curl -s -X POST "$API_URL/friends/accept/$REQUEST_ID" \
  -H "Authorization: Bearer $TOKEN2")

if [[ $accept == *"已接受好友請求"* ]]; then
    echo -e "${GREEN}✓ 成功接受好友請求${NC}"
else
    echo -e "${RED}✗ 接受好友請求失敗${NC}"
    echo "   回應: $accept"
fi

# 測試取得好友列表
echo "6️⃣  Alice 查看好友列表..."
friends1=$(curl -s "$API_URL/friends" \
  -H "Authorization: Bearer $TOKEN1")

if [[ $friends1 == *"$USER2_NAME"* ]]; then
    echo -e "${GREEN}✓ Alice 的好友列表中有 Bob${NC}"
else
    echo -e "${YELLOW}⚠ 好友列表可能為空${NC}"
    echo "   回應: $friends1"
fi

echo ""
echo -e "${BLUE}聊天功能測試${NC}"
echo "=============================="

# 測試發送訊息
echo "7️⃣  Alice 發送訊息給 Bob..."
send_msg=$(curl -s -X POST "$API_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d "{
    \"receiver_id\": $USER2_ID,
    \"content\": \"Hi Bob! 這是測試訊息 😊\"
  }")

if [[ $send_msg == *"content"* ]]; then
    echo -e "${GREEN}✓ 訊息發送成功${NC}"
    echo "   內容: Hi Bob! 這是測試訊息 😊"
else
    echo -e "${RED}✗ 訊息發送失敗${NC}"
    echo "   回應: $send_msg"
fi

# Bob 回覆訊息
USER1_ID=$(echo $register1 | grep -o '"id":[0-9]*' | cut -d':' -f2)

echo "8️⃣  Bob 回覆訊息給 Alice..."
reply_msg=$(curl -s -X POST "$API_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d "{
    \"receiver_id\": $USER1_ID,
    \"content\": \"Hello Alice! 收到你的訊息了 👋\"
  }")

if [[ $reply_msg == *"content"* ]]; then
    echo -e "${GREEN}✓ 回覆訊息成功${NC}"
    echo "   內容: Hello Alice! 收到你的訊息了 👋"
else
    echo -e "${RED}✗ 回覆訊息失敗${NC}"
    echo "   回應: $reply_msg"
fi

# 測試取得聊天記錄
echo "9️⃣  Alice 取得與 Bob 的聊天記錄..."
messages=$(curl -s "$API_URL/chat/$USER2_ID/messages" \
  -H "Authorization: Bearer $TOKEN1")

if [[ $messages == *"messages"* ]]; then
    echo -e "${GREEN}✓ 成功取得聊天記錄${NC}"
    MSG_COUNT=$(echo $messages | grep -o '"id"' | wc -l)
    echo "   訊息數量: $MSG_COUNT"
else
    echo -e "${RED}✗ 取得聊天記錄失敗${NC}"
    echo "   回應: $messages"
fi

# 測試未讀訊息數
echo "🔟  Alice 查看未讀訊息數..."
unread=$(curl -s "$API_URL/messages/unread" \
  -H "Authorization: Bearer $TOKEN1")

if [[ $unread == *"total"* ]]; then
    echo -e "${GREEN}✓ 成功取得未讀訊息數${NC}"
    UNREAD_TOTAL=$(echo $unread | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "   未讀訊息: $UNREAD_TOTAL 則"
else
    echo -e "${YELLOW}⚠ 未讀訊息查詢可能失敗${NC}"
    echo "   回應: $unread"
fi

# 測試最近聊天列表
echo "1️⃣1️⃣  Bob 查看最近聊天列表..."
recent=$(curl -s "$API_URL/chat/recent" \
  -H "Authorization: Bearer $TOKEN2")

if [[ $recent == *"last_message"* ]]; then
    echo -e "${GREEN}✓ 成功取得最近聊天列表${NC}"
else
    echo -e "${YELLOW}⚠ 最近聊天列表可能為空${NC}"
    echo "   回應: $recent"
fi

echo ""
echo -e "${BLUE}進階功能測試${NC}"
echo "=============================="

# 測試刪除好友
echo "1️⃣2️⃣  Alice 刪除好友 Bob..."
remove=$(curl -s -X DELETE "$API_URL/friends/$USER2_ID" \
  -H "Authorization: Bearer $TOKEN1")

if [[ $remove == *"已刪除好友"* ]]; then
    echo -e "${GREEN}✓ 成功刪除好友${NC}"
else
    echo -e "${RED}✗ 刪除好友失敗${NC}"
    echo "   回應: $remove"
fi

# 驗證刪除後無法發送訊息
echo "1️⃣3️⃣  驗證刪除好友後無法發送訊息..."
fail_msg=$(curl -s -X POST "$API_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d "{
    \"receiver_id\": $USER2_ID,
    \"content\": \"這則訊息應該發送失敗\"
  }")

if [[ $fail_msg == *"只能發訊息給好友"* ]] || [[ $fail_msg == *"403"* ]]; then
    echo -e "${GREEN}✓ 正確阻止向非好友發送訊息${NC}"
else
    echo -e "${YELLOW}⚠ 權限檢查可能有問題${NC}"
    echo "   回應: $fail_msg"
fi

echo ""
echo "=============================="
echo -e "${GREEN}🎉 Phase 2 測試完成！${NC}"
echo ""
echo "測試帳號資訊："
echo "  Alice: $USER1_EMAIL / $USER1_PASS"
echo "  Bob: $USER2_EMAIL / $USER2_PASS"
echo ""
echo "新增的 API 端點："
echo "  好友系統: 7 個端點"
echo "  聊天功能: 5 個端點"
echo "  總計: 12 個新端點"
