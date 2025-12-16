package services

import (
	"encoding/json"
	"gin-project/models"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

// Client 代表一個 WebSocket 客戶端連接
type Client struct {
	Hub      *Hub
	Conn     *websocket.Conn
	UserID   uint
	Username string
	Send     chan []byte
}

// Message 定義 WebSocket 訊息結構
type Message struct {
	Type       string      `json:"type"`        // message, typing, read, online, offline
	SenderID   uint        `json:"sender_id"`   // 發送者 ID
	ReceiverID uint        `json:"receiver_id"` // 接收者 ID
	Content    string      `json:"content"`     // 訊息內容
	MessageID  uint        `json:"message_id"`  // 訊息 ID（用於已讀回執）
	Timestamp  string      `json:"timestamp"`   // 時間戳
	Data       interface{} `json:"data"`        // 額外數據
}

// Hub 管理所有 WebSocket 連接
type Hub struct {
	// 已註冊的客戶端，key 為 UserID
	Clients map[uint]*Client

	// 廣播訊息通道
	Broadcast chan *Message

	// 註冊新客戶端
	Register chan *Client

	// 註銷客戶端
	Unregister chan *Client

	// 讀寫鎖
	mu sync.RWMutex
}

// NewHub 建立新的 Hub
func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[uint]*Client),
		Broadcast:  make(chan *Message),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

// Run 啟動 Hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			h.Clients[client.UserID] = client
			h.mu.Unlock()
			log.Printf("✓ 使用者 %s (ID: %d) 已連接 WebSocket", client.Username, client.UserID)

			// 通知使用者上線
			h.BroadcastOnlineStatus(client.UserID, true)

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Clients[client.UserID]; ok {
				delete(h.Clients, client.UserID)
				close(client.Send)
				log.Printf("✓ 使用者 %s (ID: %d) 已斷開 WebSocket", client.Username, client.UserID)
			}
			h.mu.Unlock()

			// 通知使用者下線
			h.BroadcastOnlineStatus(client.UserID, false)

		case message := <-h.Broadcast:
			h.mu.RLock()
			// 根據接收者 ID 發送訊息
			if client, ok := h.Clients[message.ReceiverID]; ok {
				select {
				case client.Send <- h.encodeMessage(message):
				default:
					close(client.Send)
					delete(h.Clients, client.UserID)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// SendToUser 發送訊息給指定使用者
func (h *Hub) SendToUser(userID uint, message *Message) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if client, ok := h.Clients[userID]; ok {
		select {
		case client.Send <- h.encodeMessage(message):
		default:
			log.Printf("⚠ 發送訊息給使用者 %d 失敗：通道已滿", userID)
		}
	}
}

// BroadcastOnlineStatus 廣播使用者在線狀態
func (h *Hub) BroadcastOnlineStatus(userID uint, isOnline bool) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	status := "offline"
	if isOnline {
		status = "online"
	}

	message := &Message{
		Type:     status,
		SenderID: userID,
		Data: map[string]interface{}{
			"user_id":   userID,
			"is_online": isOnline,
		},
	}

	// 發送給所有已連接的使用者
	for _, client := range h.Clients {
		if client.UserID != userID {
			select {
			case client.Send <- h.encodeMessage(message):
			default:
			}
		}
	}
}

// IsUserOnline 檢查使用者是否在線
func (h *Hub) IsUserOnline(userID uint) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	_, ok := h.Clients[userID]
	return ok
}

// GetOnlineUsers 取得所有在線使用者
func (h *Hub) GetOnlineUsers() []uint {
	h.mu.RLock()
	defer h.mu.RUnlock()

	users := make([]uint, 0, len(h.Clients))
	for userID := range h.Clients {
		users = append(users, userID)
	}
	return users
}

// encodeMessage 將訊息編碼為 JSON
func (h *Hub) encodeMessage(message *Message) []byte {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("❌ JSON 編碼失敗: %v", err)
		return []byte{}
	}
	return data
}

// readPump 從 WebSocket 連接讀取訊息
func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, messageData, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("❌ WebSocket 讀取錯誤: %v", err)
			}
			break
		}

		var message Message
		if err := json.Unmarshal(messageData, &message); err != nil {
			log.Printf("❌ JSON 解碼失敗: %v", err)
			continue
		}

		// 設置發送者資訊
		message.SenderID = c.UserID

		// 根據訊息類型處理
		switch message.Type {
		case "message":
			// 發送訊息給接收者
			c.Hub.Broadcast <- &message

		case "typing":
			// 轉發正在輸入狀態
			c.Hub.SendToUser(message.ReceiverID, &message)

		case "read":
			// 轉發已讀回執
			c.Hub.SendToUser(message.ReceiverID, &message)
		}
	}
}

// writePump 向 WebSocket 連接寫入訊息
func (c *Client) WritePump() {
	defer func() {
		c.Conn.Close()
	}()

	for {
		message, ok := <-c.Send
		if !ok {
			// Hub 關閉了通道
			c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
			return
		}

		if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Printf("❌ WebSocket 寫入錯誤: %v", err)
			return
		}
	}
}

// SaveMessageToDB 將訊息儲存到資料庫
func SaveMessageToDB(senderID, receiverID uint, content string) (*models.Message, error) {
	// 這個函數會在 chat_controller.go 中實現
	// 這裡只是定義介面
	return nil, nil
}
