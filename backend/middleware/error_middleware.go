package middleware

import (
	"gin-project/utils"
	"log"

	"github.com/gin-gonic/gin"
)

// ErrorMiddleware 統一錯誤處理中介軟體
func ErrorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Panic 錯誤: %v", err)
				utils.InternalError(c, "伺服器內部錯誤")
			}
		}()

		c.Next()

		// 檢查是否有錯誤
		if len(c.Errors) > 0 {
			err := c.Errors.Last()
			log.Printf("請求錯誤: %v", err.Error())
			utils.InternalError(c, err.Error())
		}
	}
}
