package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Config 應用程式配置結構
type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	ServerPort string
	CORSOrigin string
}

// DB 全域資料庫連接
var DB *gorm.DB

// AppConfig 全域配置
var AppConfig *Config

// LoadConfig 載入環境變數配置
func LoadConfig() *Config {
	// 載入 .env 檔案
	if err := godotenv.Load(); err != nil {
		log.Println("警告: 未找到 .env 檔案，使用環境變數")
	}

	AppConfig = &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "easy_chat"),
		JWTSecret:  getEnv("JWT_SECRET", "default-secret-key"),
		ServerPort: getEnv("SERVER_PORT", "8080"),
		CORSOrigin: getEnv("CORS_ORIGIN", "http://localhost:5173"),
	}

	return AppConfig
}

// InitDB 初始化資料庫連接
func InitDB(cfg *Config) error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return fmt.Errorf("無法連接到資料庫: %v", err)
	}

	log.Println("✓ 資料庫連接成功")
	return nil
}

// GetDB 取得資料庫連接
func GetDB() *gorm.DB {
	return DB
}

// getEnv 取得環境變數，如果不存在則返回預設值
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
