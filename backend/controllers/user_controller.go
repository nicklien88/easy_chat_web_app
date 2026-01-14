package controllers

import (
	"fmt"
	"gin-project/config"
	"gin-project/middleware"
	"gin-project/models"
	"gin-project/utils"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

// GetProfile 取得當前使用者資料
func GetProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "使用者不存在")
		return
	}

	utils.SuccessWithData(c, user.ToResponse())
}

// UpdateProfileRequest 更新個人資料請求
type UpdateProfileRequest struct {
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url"`
}

// UpdateProfile 更新個人資料
func UpdateProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "使用者不存在")
		return
	}

	// 統一使用 multipart form 處理
	displayName := c.PostForm("display_name")
	if displayName != "" {
		user.DisplayName = displayName
	}

	// 處理頭像上傳
	file, err := c.FormFile("avatar")
	if err == nil {
		// 生成唯一的文件名
		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("avatar_%d_%d%s", userID, time.Now().Unix(), ext)
		savePath := filepath.Join("uploads", "avatars", filename)

		// 確保目錄存在
		os.MkdirAll(filepath.Join("uploads", "avatars"), 0755)

		// 保存文件
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			utils.InternalError(c, "頭像上傳失敗")
			return
		}

		user.AvatarURL = "/" + savePath
	}

	if err := config.DB.Save(&user).Error; err != nil {
		utils.InternalError(c, "更新失敗")
		return
	}

	utils.SuccessWithData(c, user.ToResponse())
}

// UpdatePasswordRequest 更新密碼請求
type UpdatePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

// UpdatePassword 更新密碼
func UpdatePassword(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "請求資料格式錯誤")
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "使用者不存在")
		return
	}

	// 驗證舊密碼
	if err := utils.CheckPassword(user.Password, req.OldPassword); err != nil {
		utils.BadRequest(c, "舊密碼錯誤")
		return
	}

	// 驗證新密碼格式
	if !utils.IsPasswordValid(req.NewPassword) {
		utils.BadRequest(c, "新密碼至少需要 6 個字元")
		return
	}

	// 加密新密碼
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		utils.InternalError(c, "密碼加密失敗")
		return
	}

	user.Password = hashedPassword
	if err := config.DB.Save(&user).Error; err != nil {
		utils.InternalError(c, "更新密碼失敗")
		return
	}

	utils.Success(c, "密碼更新成功")
}
