package controllers

import (
	"gin-project/config"
	"gin-project/models"
	"gin-project/utils"

	"github.com/gin-gonic/gin"
)

// RegisterRequest 註冊請求結構
type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginRequest 登入請求結構
type LoginRequest struct {
	Username string `json:"username"` // 使用者名稱（與 Email 二選一）
	Email    string `json:"email"`    // Email（與 Username 二選一）
	Password string `json:"password" binding:"required"`
}

// AuthResponse 認證響應結構
type AuthResponse struct {
	Token string              `json:"token"`
	User  models.UserResponse `json:"user"`
}

// Register 註冊新使用者
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "請求資料格式錯誤: "+err.Error())
		return
	}

	// 驗證輸入
	if !utils.IsUsernameValid(req.Username) {
		utils.BadRequest(c, "使用者名稱格式錯誤（3-50 字元，只能包含字母、數字、底線）")
		return
	}

	if !utils.IsEmailValid(req.Email) {
		utils.BadRequest(c, "電子郵件格式錯誤")
		return
	}

	if !utils.IsPasswordValid(req.Password) {
		utils.BadRequest(c, "密碼至少需要 6 個字元")
		return
	}

	// 檢查使用者名稱是否已存在
	var existingUser models.User
	if err := config.DB.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		utils.BadRequest(c, "使用者名稱已被使用")
		return
	}

	// 檢查電子郵件是否已存在
	if err := config.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		utils.BadRequest(c, "電子郵件已被註冊")
		return
	}

	// 加密密碼
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.InternalError(c, "密碼加密失敗")
		return
	}

	// 建立使用者
	user := models.User{
		Username:    req.Username,
		Email:       req.Email,
		Password:    hashedPassword,
		DisplayName: req.Username, // 預設顯示名稱為使用者名稱
	}

	if err := config.DB.Create(&user).Error; err != nil {
		utils.InternalError(c, "建立使用者失敗: "+err.Error())
		return
	}

	// 生成 token
	token, err := utils.GenerateToken(user.ID, user.Username, user.Email)
	if err != nil {
		utils.InternalError(c, "生成 token 失敗")
		return
	}

	utils.SuccessWithData(c, AuthResponse{
		Token: token,
		User:  user.ToResponse(),
	})
}

// Login 使用者登入
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "請求資料格式錯誤: "+err.Error())
		return
	}

	// 驗證至少提供 username 或 email
	if req.Username == "" && req.Email == "" {
		utils.BadRequest(c, "請提供使用者名稱或電子郵件")
		return
	}

	// 查詢使用者（支援使用者名稱或 email 登入）
	var user models.User
	query := config.DB
	if req.Username != "" {
		query = query.Where("username = ?", req.Username)
	} else {
		query = query.Where("email = ?", req.Email)
	}

	if err := query.First(&user).Error; err != nil {
		utils.Unauthorized(c, "使用者名稱或密碼錯誤")
		return
	}

	// 驗證密碼
	if err := utils.CheckPassword(user.Password, req.Password); err != nil {
		utils.Unauthorized(c, "使用者名稱或密碼錯誤")
		return
	}

	// 生成 token
	token, err := utils.GenerateToken(user.ID, user.Username, user.Email)
	if err != nil {
		utils.InternalError(c, "生成 token 失敗")
		return
	}

	utils.SuccessWithData(c, AuthResponse{
		Token: token,
		User:  user.ToResponse(),
	})
}
