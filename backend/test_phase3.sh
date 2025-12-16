#!/bin/bash

# Easy Chat Phase 3 WebSocket 測試腳本
# 測試即時聊天和在線狀態功能

BASE_URL="http://localhost:8080"
API_URL="$BASE_URL/api"
WS_URL="ws://localhost:8080/api/ws"

echo "🧪 Easy Chat Phase 3 WebSocket 測試"
echo "====================================="
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
USER1_NAME="wsuser1_$RANDOM1"
USER1_EMAIL="wsuser1_$RANDOM1@test.com"
USER1_PASS="password123"

USER2_NAME="wsuser2_$RANDOM2"
USER2_EMAIL="wsuser2_$RANDOM2@test.com"
USER2_PASS="password123"

echo -e "${BLUE}準備階段：建立測試使用者${NC}"
echo "====================================="

# 註冊使用者1
echo "1️⃣  註冊使用者 User1..."
register1=$(curl -s -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USER1_NAME\",
    \"email\": \"$USER1_EMAIL\",
    \"password\": \"$USER1_PASS\"
  }")

if [[ $register1 == *"token"* ]]; then
    echo -e "${GREEN}✓ User1 註冊成功${NC}"
    TOKEN1=$(echo $register1 | jq -r '.data.token')
    USER1_ID=$(echo $register1 | jq -r '.data.user.id')
else
    echo -e "${RED}✗ User1 註冊失敗${NC}"
    echo "   回應: $register1"
    exit 1
fi

# 註冊使用者2
echo "2️⃣  註冊使用者 User2..."
register2=$(curl -s -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USER2_NAME\",
    \"email\": \"$USER2_EMAIL\",
    \"password\": \"$USER2_PASS\"
  }")

if [[ $register2 == *"token"* ]]; then
    echo -e "${GREEN}✓ User2 註冊成功${NC}"
    TOKEN2=$(echo $register2 | jq -r '.data.token')
    USER2_ID=$(echo $register2 | jq -r '.data.user.id')
else
    echo -e "${RED}✗ User2 註冊失敗${NC}"
    echo "   回應: $register2"
    exit 1
fi

# 建立好友關係
echo "3️⃣  建立好友關係..."
curl -s -X POST "$API_URL/friends/request" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d "{\"friend_username\": \"$USER2_NAME\"}" > /dev/null

requests=$(curl -s "$API_URL/friends/requests" -H "Authorization: Bearer $TOKEN2")
REQUEST_ID=$(echo $requests | jq -r '.data[0].id')

curl -s -X POST "$API_URL/friends/accept/$REQUEST_ID" \
  -H "Authorization: Bearer $TOKEN2" > /dev/null

echo -e "${GREEN}✓ User1 和 User2 已成為好友${NC}"

echo ""
echo -e "${BLUE}在線狀態測試${NC}"
echo "====================================="

# 測試取得在線使用者列表（無人在線）
echo "4️⃣  查看在線使用者列表（應該為空）..."
online_users=$(curl -s "$API_URL/online/users" \
  -H "Authorization: Bearer $TOKEN1")

count=$(echo $online_users | jq -r '.data.total')
if [[ $count -eq 0 ]]; then
    echo -e "${GREEN}✓ 在線使用者列表正確（0 人）${NC}"
else
    echo -e "${YELLOW}⚠ 在線使用者: $count 人${NC}"
    echo "   可能有其他測試連接未關閉"
fi

# 測試檢查特定使用者是否在線
echo "5️⃣  檢查 User2 是否在線（應該離線）..."
check_online=$(curl -s "$API_URL/online/check/$USER2_ID" \
  -H "Authorization: Bearer $TOKEN1")

is_online=$(echo $check_online | jq -r '.data.is_online')
if [[ $is_online == "false" ]]; then
    echo -e "${GREEN}✓ User2 狀態正確（離線）${NC}"
else
    echo -e "${RED}✗ User2 狀態錯誤（應該離線）${NC}"
fi

echo ""
echo -e "${BLUE}WebSocket 連接測試${NC}"
echo "====================================="

# 檢查是否安裝了 Node.js 和 ws 模組
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠ Node.js 未安裝，跳過 WebSocket 即時測試${NC}"
    echo -e "${BLUE}ℹ️  你可以手動測試 WebSocket:${NC}"
    echo "   使用瀏覽器 console 測試:"
    echo "      const ws = new WebSocket('ws://localhost:8080/api/ws');"
    echo "      ws.onopen = () => console.log('Connected');"
    echo ""
    SKIP_WS_LIVE_TEST=true
else
    # 確保 ws 模組存在（使用本地安裝）
    WS_TEST_DIR="$(dirname "$0")/ws_test"
    if [ ! -d "$WS_TEST_DIR/node_modules/ws" ]; then
        echo "6️⃣  安裝 WebSocket 測試依賴..."
        mkdir -p "$WS_TEST_DIR"
        cd "$WS_TEST_DIR"
        npm init -y >/dev/null 2>&1
        npm install ws >/dev/null 2>&1
        cd - >/dev/null
        echo -e "${GREEN}✓ WebSocket 測試環境準備完成${NC}"
    fi
    SKIP_WS_LIVE_TEST=false
fi

if [[ $SKIP_WS_LIVE_TEST == false ]]; then
    # 創建測試 WebSocket 連接的 Node.js 腳本
    cat > /tmp/ws_test.js << 'EOFJS'
const WebSocket = require('ws');

const token1 = process.argv[2];
const token2 = process.argv[3];
const user1Id = process.argv[4];
const user2Id = process.argv[5];

let ws1, ws2;
let messagesReceived = 0;
let testsPassed = 0;
let totalTests = 4;

// 測試結果
const results = {
    connection1: false,
    connection2: false,
    messageFromUser1: false,
    messageFromUser2: false
};

// 連接 User1
ws1 = new WebSocket(`ws://localhost:8080/api/ws`, {
    headers: {
        'Authorization': `Bearer ${token1}`
    }
});

ws1.on('open', () => {
    console.log('✓ User1 WebSocket 連接成功');
    results.connection1 = true;
    testsPassed++;
    
    // 延遲後連接 User2
    setTimeout(() => {
        ws2 = new WebSocket(`ws://localhost:8080/api/ws`, {
            headers: {
                'Authorization': `Bearer ${token2}`
            }
        });

        ws2.on('open', () => {
            console.log('✓ User2 WebSocket 連接成功');
            results.connection2 = true;
            testsPassed++;

            // User1 發送訊息給 User2
            setTimeout(() => {
                const message = {
                    type: 'message',
                    receiver_id: parseInt(user2Id),
                    content: 'Hello from User1! 👋',
                    timestamp: new Date().toISOString()
                };
                ws1.send(JSON.stringify(message));
                console.log('📤 User1 發送訊息: Hello from User1! 👋');
            }, 500);
        });

        ws2.on('message', (data) => {
            const msg = JSON.parse(data.toString());
            console.log('📨 User2 收到訊息:', msg);
            
            if (msg.type === 'message' && msg.content === 'Hello from User1! 👋') {
                console.log('✓ User2 成功接收 User1 的訊息');
                results.messageFromUser1 = true;
                testsPassed++;
                messagesReceived++;

                // User2 回覆訊息
                setTimeout(() => {
                    const reply = {
                        type: 'message',
                        receiver_id: parseInt(user1Id),
                        content: 'Hi User1! Message received! 🎉',
                        timestamp: new Date().toISOString()
                    };
                    ws2.send(JSON.stringify(reply));
                    console.log('📤 User2 回覆訊息: Hi User1! Message received! 🎉');
                }, 500);
            }
        });

        ws2.on('error', (error) => {
            console.error('❌ User2 WebSocket 錯誤:', error.message);
        });

    }, 1000);
});

ws1.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    console.log('📨 User1 收到訊息:', msg);
    
    if (msg.type === 'message' && msg.content === 'Hi User1! Message received! 🎉') {
        console.log('✓ User1 成功接收 User2 的回覆');
        results.messageFromUser2 = true;
        testsPassed++;
        messagesReceived++;

        // 所有測試完成
        setTimeout(() => {
            console.log('\n===================================');
            console.log('測試摘要:');
            console.log(`通過測試: ${testsPassed}/${totalTests}`);
            console.log(`訊息交換: ${messagesReceived} 則`);
            console.log('===================================\n');

            // 關閉連接
            ws1.close();
            ws2.close();
            
            process.exit(testsPassed === totalTests ? 0 : 1);
        }, 1000);
    }
});

ws1.on('error', (error) => {
    console.error('❌ User1 WebSocket 錯誤:', error.message);
    process.exit(1);
});

// 超時保護
setTimeout(() => {
    console.error('\n❌ 測試超時');
    console.log('測試摘要:');
    console.log(`通過測試: ${testsPassed}/${totalTests}`);
    if (ws1) ws1.close();
    if (ws2) ws2.close();
    process.exit(1);
}, 10000);
EOFJS

    # 執行 WebSocket 測試
    echo ""
    echo "7️⃣  執行 WebSocket 即時通訊測試..."
    echo "-----------------------------------"
    
    # 將測試腳本複製到 ws_test 目錄並執行
    cp /tmp/ws_test.js "$WS_TEST_DIR/test.js"
    cd "$WS_TEST_DIR"
    node test.js "$TOKEN1" "$TOKEN2" "$USER1_ID" "$USER2_ID"
    cd - >/dev/null
    WS_TEST_RESULT=$?

    if [ $WS_TEST_RESULT -eq 0 ]; then
        echo -e "${GREEN}✓ WebSocket 測試全部通過${NC}"
    else
        echo -e "${RED}✗ WebSocket 測試失敗${NC}"
    fi
else
    WS_TEST_RESULT=1
    echo -e "${YELLOW}⚠ WebSocket 即時測試已跳過${NC}"
fi

echo ""
echo -e "${BLUE}清理階段${NC}"
echo "====================================="

# 等待連接關閉
sleep 2

# 再次檢查在線使用者（應該為空）
echo "8️⃣  驗證連接已關閉..."
online_users=$(curl -s "$API_URL/online/users" \
  -H "Authorization: Bearer $TOKEN1")

count=$(echo $online_users | jq -r '.data.total')
if [[ $count -eq 0 ]]; then
    echo -e "${GREEN}✓ 所有 WebSocket 連接已關閉${NC}"
else
    echo -e "${YELLOW}⚠ 仍有 $count 個連接未關閉${NC}"
fi

echo ""
echo "====================================="
if [ $WS_TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}🎉 Phase 3 測試完成！${NC}"
else
    echo -e "${YELLOW}⚠ Phase 3 測試部分通過${NC}"
fi
echo ""

echo "測試帳號資訊："
echo "  User1: $USER1_EMAIL / password123"
echo "  User2: $USER2_EMAIL / password123"
echo ""

echo "新增的 WebSocket 端點："
echo "  即時通訊: GET /api/ws"
echo "  在線列表: GET /api/online/users"
echo "  檢查在線: GET /api/online/check/:userId"
echo "  總計: 3 個新端點"
