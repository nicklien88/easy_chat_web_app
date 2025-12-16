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
