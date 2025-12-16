package main

import (
	"fmt"
	"log"

	"gin-project/config"
	"gin-project/models"
	"gin-project/routes"
	"gin-project/services"

	"github.com/gin-gonic/gin"
)

func main() {
	// 載入配置
	cfg := config.LoadConfig()
	log.Println("✓ 配置載入成功")

	// 初始化資料庫
	if err := config.InitDB(cfg); err != nil {
		log.Fatalf("資料庫初始化失敗: %v", err)
	}

	// 自動遷移資料表
	if err := config.DB.AutoMigrate(
		&models.User{},
		&models.Friendship{},
		&models.Message{},
		&models.ChatRoom{},
		&models.RoomMember{},
	); err != nil {
		log.Fatalf("資料表遷移失敗: %v", err)
	}
	log.Println("✓ 資料表遷移成功")

	// 建立 WebSocket Hub 並啟動
	hub := services.NewHub()
	go hub.Run()
	log.Println("✓ WebSocket Hub 啟動成功")

	// 設定 Gin 模式
	gin.SetMode(gin.ReleaseMode)

	// 建立 Gin 實例
	r := gin.Default()

	// 設定路由
	routes.SetupRoutes(r, hub)

	// 啟動伺服器
	serverAddr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("✓ 伺服器啟動成功，監聽端口: %s", cfg.ServerPort)
	log.Printf("✓ API 端點: http://localhost:%s/api", cfg.ServerPort)
	log.Printf("✓ WebSocket 端點: ws://localhost:%s/api/ws", cfg.ServerPort)
	log.Printf("✓ 健康檢查: http://localhost:%s/health", cfg.ServerPort)

	if err := r.Run(serverAddr); err != nil {
		log.Fatalf("伺服器啟動失敗: %v", err)
	}
}
