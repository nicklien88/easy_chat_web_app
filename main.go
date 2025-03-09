package main

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// WebSocket 升級器
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// 共享變數(使用 Mutex 保護)
var (
	clients   = make(map[*websocket.Conn]string) // 用戶連線對應名稱
	friends   = make(map[string]map[string]bool) // 用戶 -> 他的好友名單
	broadcast = make(chan Message)               // 廣播管道
	mutex     = sync.Mutex{}                     // 用於保護 clients 這個共享資源
)

type Message struct {
	Type     string   `json:"type"`
	Username string   `json:"username,omitempty"`
	Text     string   `json:"text,omitempty"`
	To       string   `json:"to,omitempty"`
	Users    []string `json:"users,omitempty"`
}

func handleConnections(c *gin.Context) {
	// 升級 HTTP 連線為 WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("WebSocket 連線失敗:", err)
		return
	}

	defer conn.Close()

	//讀取用戶名稱
	var msg Message
	err = conn.ReadJSON(&msg)
	if err != nil {
		fmt.Println("讀取用戶名稱錯:", err)
		return
	}

	// 加鎖, 防止併發讀寫 clients 發生錯誤
	mutex.Lock()
	clients[conn] = msg.Username // 紀錄用戶名稱
	if _, exists := friends[msg.Username]; !exists {
		friends[msg.Username] = make(map[string]bool) //初始化好友列表
	}
	mutex.Unlock()

	sendUserList()

	// 廣播新用戶加入
	broadcast <- Message{Type: "publicMessage", Username: "系統", Text: msg.Username + "加入了聊天室"}

	// 監聽 WebSocket 訊息
	for {
		err := conn.ReadJSON(&msg)
		if err != nil {
			fmt.Println("讀取訊息錯誤:", err)

			// 加鎖, 確保 clients 修改是安全的
			mutex.Lock()
			username := clients[conn] // 先讀取名稱, 避免刪除後取不到
			delete(clients, conn)
			mutex.Unlock()

			sendUserList()
			// 廣播用戶離開聊訊息
			broadcast <- Message{Username: "系統", Text: username + "離開了聊天室"}
			break
		}

		// 處理不同的類型的訊息
		switch msg.Type {
		case "friendRequest":
			handleFriendRequest(msg)
		case "privateMessage":
			handlePrivateMessage(msg)
		case "publicMessage":
			broadcast <- msg
		}
	}
}

func sendUserList() {
	var users []string
	mutex.Lock()
	for _, name := range clients {
		users = append(users, name)
	}
	mutex.Unlock()

	message := Message{Type: "userList", Users: users}
	for client := range clients {
		client.WriteJSON(message)
	}
}

func handleFriendRequest(msg Message) {
	mutex.Lock()
	defer mutex.Unlock()

	// 確保請求的對象存在
	if _, exists := friends[msg.To]; !exists {
		fmt.Println("好友請求失敗, 找不到使用者", msg.To)
		return
	}

	//記錄好友關係
	for client, name := range clients {
		if name == msg.To || name == msg.Username {
			client.WriteJSON(Message{
				Type:     "friendAccepted",
				Username: msg.Username,
				Text:     msg.Username + " 和 " + msg.To + "已成為好友！",
			})
		}
	}
}

// 處理私聊訊息
func handlePrivateMessage(msg Message) {
	mutex.Lock()
	defer mutex.Unlock()

	// 檢查是否為好友
	if !friends[msg.Username][msg.To] {
		fmt.Println("錯誤: " + msg.Username + " 不是 " + msg.To + " 的好友")
		return
	}

	for client, name := range clients {
		if name == msg.To || name == msg.Username {
			client.WriteJSON(msg)
		}
	}
}

func handleMessages() {
	for {
		msg := <-broadcast
		// 發送訊息給所有連線用戶
		mutex.Lock() // 加鎖, 避免競爭條件
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				fmt.Println("發送訊息錯誤:", err)
				client.Close()
				delete(clients, client)
			}
		}
		mutex.Unlock()
	}
}

func main() {
	r := gin.Default()
	r.Static("/static", "./static") // 提供靜態 HTML 頁面
	r.GET("/ws", handleConnections) // WebSocket 連線

	go handleMessages() // 啟動 WebSocket 廣播

	fmt.Println("伺服器運行中, 請訪問 http://localhost:8080/static")
	r.Run(":8080")
}
