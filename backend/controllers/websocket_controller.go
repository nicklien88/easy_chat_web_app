package controllers

import (
	"gin-project/middleware"
	"gin-project/services"
	"gin-project/utils"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// 允許所有來源（生產環境應該限制）
		return true
	},
}

// HandleWebSocket 處理 WebSocket 連接
func HandleWebSocket(hub *services.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 嘗試從 URL 參數或 Header 獲取 token
		token := c.Query("token")
		if token == "" {
			token = c.GetHeader("Authorization")
			if len(token) > 7 && token[:7] == "Bearer " {
				token = token[7:]
			}
		}

		// 驗證 token 並獲取使用者資訊
		var userID uint
		var username string

		if token != "" {
			claims, err := utils.ValidateToken(token)
			if err == nil {
				userID = claims.UserID
				username = claims.Username
			}
		}

		// 如果無法從 token 獲取，嘗試從 context 獲取（已通過 middleware）
		if userID == 0 {
			userID = middleware.GetUserID(c)
			username = middleware.GetUsername(c)
		}

		if userID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "未授權"})
			return
		}

		// 升級 HTTP 連接為 WebSocket
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("❌ WebSocket 升級失敗: %v", err)
			return
		}

		// 建立新客戶端
		client := &services.Client{
			Hub:      hub,
			Conn:     conn,
			UserID:   userID,
			Username: username,
			Send:     make(chan []byte, 256),
		}

		// 註冊客戶端
		client.Hub.Register <- client

		// 啟動讀寫 goroutine
		go client.WritePump()
		go client.ReadPump()
	}
}

// GetOnlineUsers 取得在線使用者列表
func GetOnlineUsers(hub *services.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := middleware.GetUserID(c)
		if userID == 0 {
			utils.Unauthorized(c, "請先登入")
			return
		}

		onlineUsers := hub.GetOnlineUsers()
		utils.SuccessWithData(c, gin.H{
			"online_users": onlineUsers,
			"total":        len(onlineUsers),
		})
	}
}

// CheckUserOnline 檢查指定使用者是否在線
func CheckUserOnline(hub *services.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := middleware.GetUserID(c)
		if userID == 0 {
			utils.Unauthorized(c, "請先登入")
			return
		}

		// 從 URL 參數取得要檢查的使用者 ID
		userIDStr := c.Param("userId")
		checkID, err := strconv.ParseUint(userIDStr, 10, 32)
		if err != nil {
			utils.BadRequest(c, "無效的使用者 ID")
			return
		}

		isOnline := hub.IsUserOnline(uint(checkID))
		utils.SuccessWithData(c, gin.H{
			"user_id":   uint(checkID),
			"is_online": isOnline,
		})
	}
}
