-- 圖片和影片傳送功能 - 資料庫遷移腳本
-- 執行日期: 2026-01-03
-- 說明: 為 messages 表新增媒體檔案支援

-- 修改 message_type 欄位支援更多類型
ALTER TABLE messages MODIFY COLUMN message_type ENUM('text', 'image', 'video', 'file') DEFAULT 'text';

-- 新增檔案 URL 欄位
ALTER TABLE messages ADD COLUMN file_url VARCHAR(500) AFTER message_type;

-- 新增檔案名稱欄位
ALTER TABLE messages ADD COLUMN file_name VARCHAR(255) AFTER file_url;

-- 新增檔案大小欄位（以 bytes 為單位）
ALTER TABLE messages ADD COLUMN file_size BIGINT AFTER file_name;

-- 查看變更結果
DESCRIBE messages;
