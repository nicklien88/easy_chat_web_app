package utils

import "github.com/gin-gonic/gin"

// Response 統一響應格式
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// SuccessResponse 成功響應
func SuccessResponse(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, Response{
		Code:    code,
		Message: message,
		Data:    data,
	})
}

// ErrorResponse 錯誤響應
func ErrorResponse(c *gin.Context, code int, message string) {
	c.JSON(code, Response{
		Code:    code,
		Message: message,
	})
}

// SuccessWithData 成功響應（帶資料）
func SuccessWithData(c *gin.Context, data interface{}) {
	c.JSON(200, Response{
		Code:    200,
		Message: "success",
		Data:    data,
	})
}

// Success 成功響應（無資料）
func Success(c *gin.Context, message string) {
	c.JSON(200, Response{
		Code:    200,
		Message: message,
	})
}

// BadRequest 錯誤請求 400
func BadRequest(c *gin.Context, message string) {
	ErrorResponse(c, 400, message)
}

// Unauthorized 未授權 401
func Unauthorized(c *gin.Context, message string) {
	ErrorResponse(c, 401, message)
}

// Forbidden 禁止訪問 403
func Forbidden(c *gin.Context, message string) {
	ErrorResponse(c, 403, message)
}

// NotFound 未找到 404
func NotFound(c *gin.Context, message string) {
	ErrorResponse(c, 404, message)
}

// InternalError 內部錯誤 500
func InternalError(c *gin.Context, message string) {
	ErrorResponse(c, 500, message)
}
