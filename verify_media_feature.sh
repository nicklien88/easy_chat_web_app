#!/bin/bash

echo "======================================"
echo "驗證圖片和影片傳送功能"
echo "======================================"
echo ""

# 1. 檢查資料庫
echo "✓ 檢查資料庫結構..."
docker exec -i easy_chat_mysql mysql -uroot -paAA88068 easy_chat -e "DESCRIBE messages;" 2>&1 | grep -E "file_url|file_name|file_size|message_type" | grep -v Warning
echo ""

# 2. 檢查上傳目錄
echo "✓ 檢查上傳目錄..."
ls -la backend/uploads/ 2>/dev/null && echo "上傳目錄已建立" || echo "❌ 上傳目錄不存在"
echo ""

# 3. 檢查後端文件
echo "✓ 檢查後端程式碼..."
grep -q "UploadFile" backend/controllers/chat_controller.go && echo "UploadFile 函數已新增" || echo "❌ UploadFile 函數未找到"
grep -q "FileURL" backend/models/message.go && echo "Message 模型已更新" || echo "❌ Message 模型未更新"
grep -q "/chat/upload" backend/routes/routes.go && echo "上傳路由已新增" || echo "❌ 上傳路由未找到"
echo ""

# 4. 檢查前端文件
echo "✓ 檢查前端程式碼..."
grep -q "uploadFile" frontend/src/api/chat.js && echo "uploadFile API 已新增" || echo "❌ uploadFile API 未找到"
grep -q "message_type === 'image'" frontend/src/pages/ChatPage.jsx && echo "圖片顯示已實作" || echo "❌ 圖片顯示未實作"
grep -q "message_type === 'video'" frontend/src/pages/ChatPage.jsx && echo "影片顯示已實作" || echo "❌ 影片顯示未實作"
echo ""

echo "======================================"
echo "驗證完成！"
echo "======================================"
echo ""
echo "下一步："
echo "1. 啟動後端: cd backend && go run main.go"
echo "2. 啟動前端: cd frontend && npm run dev"
echo "3. 測試上傳圖片和影片功能"
