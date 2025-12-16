package models

import (
	"time"

	"gorm.io/gorm"
)

// User 使用者模型
type User struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Username    string         `gorm:"unique;not null;size:50" json:"username"`
	Email       string         `gorm:"unique;not null;size:100" json:"email"`
	Password    string         `gorm:"not null;size:255" json:"-"` // 不回傳到前端
	DisplayName string         `gorm:"size:50" json:"display_name,omitempty"`
	AvatarURL   string         `gorm:"size:255" json:"avatar_url,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName 指定表名
func (User) TableName() string {
	return "users"
}

// UserResponse 使用者響應結構（不含敏感資訊）
type UserResponse struct {
	ID          uint      `json:"id"`
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	DisplayName string    `json:"display_name,omitempty"`
	AvatarURL   string    `json:"avatar_url,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

// ToResponse 轉換為響應格式
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:          u.ID,
		Username:    u.Username,
		Email:       u.Email,
		DisplayName: u.DisplayName,
		AvatarURL:   u.AvatarURL,
		CreatedAt:   u.CreatedAt,
	}
}
