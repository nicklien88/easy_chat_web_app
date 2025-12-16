package middleware

import (
	"gin-project/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware JWT 認證中介軟體
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 從 Header 取得 Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.Unauthorized(c, "未提供認證 token")
			c.Abort()
			return
		}

		// 檢查是否為 Bearer token
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.Unauthorized(c, "認證格式錯誤")
			c.Abort()
			return
		}

		tokenString := parts[1]

		// 驗證 token
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			utils.Unauthorized(c, "無效的 token: "+err.Error())
			c.Abort()
			return
		}

		// 將使用者資訊存入 context
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("email", claims.Email)

		c.Next()
	}
}

// GetUserID 從 context 取得當前使用者 ID
func GetUserID(c *gin.Context) uint {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0
	}
	return userID.(uint)
}

// GetUsername 從 context 取得當前使用者名稱
func GetUsername(c *gin.Context) string {
	username, exists := c.Get("username")
	if !exists {
		return ""
	}
	return username.(string)
}
