package routes

import (
	"gin-project/controllers"
	"gin-project/middleware"
	"gin-project/services"

	"github.com/gin-gonic/gin"
)

// SetupRoutes 設定所有路由
func SetupRoutes(r *gin.Engine, hub *services.Hub) {
	// 應用中介軟體
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.ErrorMiddleware())

	// 健康檢查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "message": "Easy Chat API is running"})
	})

	// API 路由組
	api := r.Group("/api")
	{
		// 公開路由（不需要認證）
		api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)
		
		// WebSocket 端點（自行處理認證）
		api.GET("/ws", controllers.HandleWebSocket(hub))

		// 需要認證的路由
		auth := api.Group("")
		auth.Use(middleware.AuthMiddleware())
		{
			// 使用者相關
			auth.GET("/profile", controllers.GetProfile)
			auth.PUT("/profile", controllers.UpdateProfile)
			auth.PUT("/password", controllers.UpdatePassword)

			// 好友相關
			auth.GET("/friends", controllers.GetFriends)
			auth.GET("/friends/requests", controllers.GetFriendRequests)
			auth.GET("/friends/sent", controllers.GetSentFriendRequests)
			auth.POST("/friends/request", controllers.SendFriendRequest(hub))
			auth.POST("/friends/accept/:id", controllers.AcceptFriendRequest(hub))
			auth.POST("/friends/reject/:id", controllers.RejectFriendRequest(hub))
			auth.DELETE("/friends/:id", controllers.RemoveFriend)

			// 聊天訊息
			auth.GET("/chat/:friendId/messages", controllers.GetMessages)
			auth.GET("/chat/recent", controllers.GetRecentChats)
			auth.POST("/chat/send", controllers.SendMessage)
			auth.POST("/chat/upload", controllers.UploadFile)
			auth.PUT("/messages/:id/read", controllers.MarkAsRead)
			auth.GET("/messages/unread", controllers.GetUnreadCount)

			// 在線狀態查詢
			auth.GET("/online/users", controllers.GetOnlineUsers(hub))
			auth.GET("/online/check/:userId", controllers.CheckUserOnline(hub))
		}
	}

	// 靜態檔案（保留原有功能）
	r.Static("/static", "./static")
	
	// 上傳檔案服務
	r.Static("/uploads", "./uploads")
}
