package models

import (
	"time"

	"gorm.io/gorm"
)

// Friendship 好友關係模型
type Friendship struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"not null;uniqueIndex:idx_user_friend" json:"user_id"`
	FriendID  uint           `gorm:"not null;uniqueIndex:idx_user_friend" json:"friend_id"`
	Status    string         `gorm:"type:enum('pending','accepted','blocked');default:'pending';index" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// 關聯
	User   User `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Friend User `gorm:"foreignKey:FriendID" json:"friend,omitempty"`
}

// TableName 指定表名
func (Friendship) TableName() string {
	return "friendships"
}

// 好友關係狀態常數
const (
	FriendshipStatusPending  = "pending"
	FriendshipStatusAccepted = "accepted"
	FriendshipStatusBlocked  = "blocked"
)

// FriendshipResponse 好友關係響應結構
type FriendshipResponse struct {
	ID        uint         `json:"id"`
	UserID    uint         `json:"user_id"`
	FriendID  uint         `json:"friend_id"`
	Status    string       `json:"status"`
	CreatedAt time.Time    `json:"created_at"`
	Friend    UserResponse `json:"friend,omitempty"`
}

// ToResponse 轉換為響應格式
func (f *Friendship) ToResponse() FriendshipResponse {
	return FriendshipResponse{
		ID:        f.ID,
		UserID:    f.UserID,
		FriendID:  f.FriendID,
		Status:    f.Status,
		CreatedAt: f.CreatedAt,
		Friend:    f.Friend.ToResponse(),
	}
}
