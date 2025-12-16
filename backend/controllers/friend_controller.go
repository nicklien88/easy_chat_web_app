package controllers

import (
	"gin-project/config"
	"gin-project/middleware"
	"gin-project/models"
	"gin-project/utils"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SendFriendRequestInput 發送好友請求輸入
type SendFriendRequestInput struct {
	FriendUsername string `json:"friend_username" binding:"required"`
}

// SendFriendRequest 發送好友請求
func SendFriendRequest(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var input SendFriendRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "請求資料格式錯誤")
		return
	}

	// 查找目標使用者
	var friend models.User
	if err := config.DB.Where("username = ?", input.FriendUsername).First(&friend).Error; err != nil {
		utils.NotFound(c, "找不到該使用者")
		return
	}

	// 不能加自己為好友
	if friend.ID == userID {
		utils.BadRequest(c, "不能加自己為好友")
		return
	}

	// 檢查是否已經是好友或已有請求
	var existingFriendship models.Friendship
	err := config.DB.Where(
		"(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
		userID, friend.ID, friend.ID, userID,
	).First(&existingFriendship).Error

	if err == nil {
		// 已存在記錄
		if existingFriendship.Status == models.FriendshipStatusAccepted {
			utils.BadRequest(c, "已經是好友了")
			return
		}
		utils.BadRequest(c, "好友請求已存在")
		return
	}

	// 建立好友請求
	friendship := models.Friendship{
		UserID:   userID,
		FriendID: friend.ID,
		Status:   models.FriendshipStatusPending,
	}

	if err := config.DB.Create(&friendship).Error; err != nil {
		utils.InternalError(c, "發送好友請求失敗")
		return
	}

	utils.SuccessWithData(c, gin.H{
		"message": "好友請求已發送",
		"friend":  friend.ToResponse(),
	})
}

// GetFriendRequests 取得收到的好友請求
func GetFriendRequests(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var friendships []models.Friendship
	if err := config.DB.
		Where("friend_id = ? AND status = ?", userID, models.FriendshipStatusPending).
		Preload("User").
		Find(&friendships).Error; err != nil {
		utils.InternalError(c, "取得好友請求失敗")
		return
	}

	// 轉換為響應格式
	var requests []gin.H
	for _, friendship := range friendships {
		requests = append(requests, gin.H{
			"id":         friendship.ID,
			"user":       friendship.User.ToResponse(),
			"created_at": friendship.CreatedAt,
		})
	}

	utils.SuccessWithData(c, requests)
}

// GetSentFriendRequests 取得發送的好友請求
func GetSentFriendRequests(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var friendships []models.Friendship
	if err := config.DB.
		Where("user_id = ? AND status = ?", userID, models.FriendshipStatusPending).
		Preload("Friend").
		Find(&friendships).Error; err != nil {
		utils.InternalError(c, "取得好友請求失敗")
		return
	}

	// 轉換為響應格式
	var requests []gin.H
	for _, friendship := range friendships {
		requests = append(requests, gin.H{
			"id":         friendship.ID,
			"friend":     friendship.Friend.ToResponse(),
			"created_at": friendship.CreatedAt,
		})
	}

	utils.SuccessWithData(c, requests)
}

// AcceptFriendRequest 接受好友請求
func AcceptFriendRequest(c *gin.Context) {
	userID := middleware.GetUserID(c)
	requestID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "無效的請求 ID")
		return
	}

	var friendship models.Friendship
	if err := config.DB.First(&friendship, requestID).Error; err != nil {
		utils.NotFound(c, "找不到該好友請求")
		return
	}

	// 確認是接收者
	if friendship.FriendID != userID {
		utils.Forbidden(c, "無權限操作此請求")
		return
	}

	// 確認狀態為 pending
	if friendship.Status != models.FriendshipStatusPending {
		utils.BadRequest(c, "此請求已經處理過了")
		return
	}

	// 更新狀態為 accepted
	friendship.Status = models.FriendshipStatusAccepted
	if err := config.DB.Save(&friendship).Error; err != nil {
		utils.InternalError(c, "接受好友請求失敗")
		return
	}

	// 載入關聯資料
	config.DB.Preload("User").First(&friendship, requestID)

	utils.SuccessWithData(c, gin.H{
		"message": "已接受好友請求",
		"friend":  friendship.User.ToResponse(),
	})
}

// RejectFriendRequest 拒絕好友請求
func RejectFriendRequest(c *gin.Context) {
	userID := middleware.GetUserID(c)
	requestID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "無效的請求 ID")
		return
	}

	var friendship models.Friendship
	if err := config.DB.First(&friendship, requestID).Error; err != nil {
		utils.NotFound(c, "找不到該好友請求")
		return
	}

	// 確認是接收者
	if friendship.FriendID != userID {
		utils.Forbidden(c, "無權限操作此請求")
		return
	}

	// 確認狀態為 pending
	if friendship.Status != models.FriendshipStatusPending {
		utils.BadRequest(c, "此請求已經處理過了")
		return
	}

	// 刪除請求
	if err := config.DB.Delete(&friendship).Error; err != nil {
		utils.InternalError(c, "拒絕好友請求失敗")
		return
	}

	utils.Success(c, "已拒絕好友請求")
}

// GetFriends 取得好友列表
func GetFriends(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var friendships []models.Friendship
	// 查找所有已接受的好友關係（雙向）
	if err := config.DB.
		Where("(user_id = ? OR friend_id = ?) AND status = ?",
			userID, userID, models.FriendshipStatusAccepted).
		Preload("User").
		Preload("Friend").
		Find(&friendships).Error; err != nil {
		utils.InternalError(c, "取得好友列表失敗")
		return
	}

	// 整理好友列表
	friendsMap := make(map[uint]models.UserResponse)
	for _, friendship := range friendships {
		if friendship.UserID == userID {
			// 我是發起者，對方是 Friend
			friendsMap[friendship.FriendID] = friendship.Friend.ToResponse()
		} else {
			// 對方是發起者，我是 Friend
			friendsMap[friendship.UserID] = friendship.User.ToResponse()
		}
	}

	// 轉換為陣列
	var friends []models.UserResponse
	for _, friend := range friendsMap {
		friends = append(friends, friend)
	}

	utils.SuccessWithData(c, friends)
}

// RemoveFriend 刪除好友
func RemoveFriend(c *gin.Context) {
	userID := middleware.GetUserID(c)
	friendID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "無效的好友 ID")
		return
	}

	// 查找好友關係
	var friendship models.Friendship
	if err := config.DB.Where(
		"((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status = ?",
		userID, friendID, friendID, userID, models.FriendshipStatusAccepted,
	).First(&friendship).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.NotFound(c, "不是好友關係")
			return
		}
		utils.InternalError(c, "查詢好友關係失敗")
		return
	}

	// 刪除好友關係
	if err := config.DB.Delete(&friendship).Error; err != nil {
		utils.InternalError(c, "刪除好友失敗")
		return
	}

	utils.Success(c, "已刪除好友")
}
