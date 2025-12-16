package controllers

import (
	"gin-project/config"
	"gin-project/middleware"
	"gin-project/models"
	"gin-project/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// SendMessageInput 發送訊息輸入
type SendMessageInput struct {
	ReceiverID  uint   `json:"receiver_id" binding:"required"`
	Content     string `json:"content" binding:"required"`
	MessageType string `json:"message_type"`
}

// SendMessage 發送訊息
func SendMessage(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var input SendMessageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "請求資料格式錯誤")
		return
	}

	// 設定預設訊息類型
	if input.MessageType == "" {
		input.MessageType = "text"
	}

	// 驗證訊息類型
	if input.MessageType != "text" && input.MessageType != "image" && input.MessageType != "file" {
		utils.BadRequest(c, "無效的訊息類型")
		return
	}

	// 驗證接收者存在
	var receiver models.User
	if err := config.DB.First(&receiver, input.ReceiverID).Error; err != nil {
		utils.NotFound(c, "接收者不存在")
		return
	}

	// 不能發訊息給自己
	if receiver.ID == userID {
		utils.BadRequest(c, "不能發訊息給自己")
		return
	}

	// 檢查是否為好友
	var friendship models.Friendship
	if err := config.DB.Where(
		"((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status = ?",
		userID, receiver.ID, receiver.ID, userID, models.FriendshipStatusAccepted,
	).First(&friendship).Error; err != nil {
		utils.Forbidden(c, "只能發訊息給好友")
		return
	}

	// 建立訊息
	message := models.Message{
		SenderID:    userID,
		ReceiverID:  input.ReceiverID,
		Content:     input.Content,
		MessageType: input.MessageType,
		IsRead:      false,
	}

	if err := config.DB.Create(&message).Error; err != nil {
		utils.InternalError(c, "發送訊息失敗")
		return
	}

	// 載入發送者資訊
	config.DB.Preload("Sender").First(&message, message.ID)

	utils.SuccessWithData(c, message.ToResponse())
}

// GetMessages 取得與特定使用者的聊天記錄
func GetMessages(c *gin.Context) {
	userID := middleware.GetUserID(c)
	friendID, err := strconv.ParseUint(c.Param("friendId"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "無效的好友 ID")
		return
	}

	// 檢查是否為好友
	var friendship models.Friendship
	if err := config.DB.Where(
		"((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status = ?",
		userID, friendID, friendID, userID, models.FriendshipStatusAccepted,
	).First(&friendship).Error; err != nil {
		utils.Forbidden(c, "只能查看好友的聊天記錄")
		return
	}

	// 取得分頁參數
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "50"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 50
	}

	offset := (page - 1) * pageSize

	// 查詢雙向訊息
	var messages []models.Message
	if err := config.DB.
		Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			userID, friendID, friendID, userID).
		Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Preload("Sender").
		Find(&messages).Error; err != nil {
		utils.InternalError(c, "取得訊息失敗")
		return
	}

	// 反轉順序（最舊的在前）
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	// 轉換為響應格式
	var messagesResponse []models.MessageResponse
	for _, message := range messages {
		messagesResponse = append(messagesResponse, message.ToResponse())
	}

	// 標記收到的訊息為已讀
	go func() {
		config.DB.Model(&models.Message{}).
			Where("sender_id = ? AND receiver_id = ? AND is_read = ?", friendID, userID, false).
			Update("is_read", true)
	}()

	utils.SuccessWithData(c, gin.H{
		"messages":  messagesResponse,
		"page":      page,
		"page_size": pageSize,
	})
}

// MarkAsRead 標記訊息為已讀
func MarkAsRead(c *gin.Context) {
	userID := middleware.GetUserID(c)
	messageID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "無效的訊息 ID")
		return
	}

	var message models.Message
	if err := config.DB.First(&message, messageID).Error; err != nil {
		utils.NotFound(c, "訊息不存在")
		return
	}

	// 只有接收者可以標記為已讀
	if message.ReceiverID != userID {
		utils.Forbidden(c, "無權限操作此訊息")
		return
	}

	// 更新已讀狀態
	message.IsRead = true
	if err := config.DB.Save(&message).Error; err != nil {
		utils.InternalError(c, "更新失敗")
		return
	}

	utils.Success(c, "已標記為已讀")
}

// GetUnreadCount 取得未讀訊息數量
func GetUnreadCount(c *gin.Context) {
	userID := middleware.GetUserID(c)

	// 總未讀數
	var totalUnread int64
	config.DB.Model(&models.Message{}).
		Where("receiver_id = ? AND is_read = ?", userID, false).
		Count(&totalUnread)

	// 每個好友的未讀數
	type UnreadCount struct {
		SenderID uint  `json:"sender_id"`
		Count    int64 `json:"count"`
	}

	var unreadCounts []UnreadCount
	config.DB.Model(&models.Message{}).
		Select("sender_id, COUNT(*) as count").
		Where("receiver_id = ? AND is_read = ?", userID, false).
		Group("sender_id").
		Scan(&unreadCounts)

	// 取得發送者資訊
	var unreadDetails []gin.H
	for _, uc := range unreadCounts {
		var sender models.User
		if err := config.DB.First(&sender, uc.SenderID).Error; err == nil {
			unreadDetails = append(unreadDetails, gin.H{
				"sender": sender.ToResponse(),
				"count":  uc.Count,
			})
		}
	}

	utils.SuccessWithData(c, gin.H{
		"total":   totalUnread,
		"details": unreadDetails,
	})
}

// GetRecentChats 取得最近聊天列表
func GetRecentChats(c *gin.Context) {
	userID := middleware.GetUserID(c)

	// 子查詢：找出與每個使用者的最後一條訊息
	type RecentChat struct {
		FriendID        uint      `json:"friend_id"`
		LastMessage     string    `json:"last_message"`
		LastMessageAt   time.Time `json:"last_message_at"`
		UnreadCount     int64     `json:"unread_count"`
		LastMessageType string    `json:"last_message_type"`
	}

	var recentChats []RecentChat

	// 使用原生 SQL 查詢最近聊天
	config.DB.Raw(`
		SELECT 
			CASE 
				WHEN sender_id = ? THEN receiver_id 
				ELSE sender_id 
			END as friend_id,
			content as last_message,
			message_type as last_message_type,
			created_at as last_message_at,
			(SELECT COUNT(*) FROM messages m2 
			 WHERE m2.sender_id = friend_id AND m2.receiver_id = ? AND m2.is_read = false) as unread_count
		FROM messages m1
		WHERE (sender_id = ? OR receiver_id = ?)
		AND created_at = (
			SELECT MAX(created_at) 
			FROM messages m3 
			WHERE (m3.sender_id = m1.sender_id AND m3.receiver_id = m1.receiver_id)
			   OR (m3.sender_id = m1.receiver_id AND m3.receiver_id = m1.sender_id)
		)
		ORDER BY last_message_at DESC
		LIMIT 20
	`, userID, userID, userID, userID).Scan(&recentChats)

	// 載入好友資訊
	var chatsWithUser []gin.H
	for _, chat := range recentChats {
		var friend models.User
		if err := config.DB.First(&friend, chat.FriendID).Error; err == nil {
			chatsWithUser = append(chatsWithUser, gin.H{
				"friend":            friend.ToResponse(),
				"last_message":      chat.LastMessage,
				"last_message_type": chat.LastMessageType,
				"last_message_at":   chat.LastMessageAt,
				"unread_count":      chat.UnreadCount,
			})
		}
	}

	utils.SuccessWithData(c, chatsWithUser)
}
