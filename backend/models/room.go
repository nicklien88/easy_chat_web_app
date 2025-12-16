package models

import (
	"time"

	"gorm.io/gorm"
)

// ChatRoom 聊天室模型
type ChatRoom struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null;size:100" json:"name"`
	CreatedBy uint           `gorm:"not null" json:"created_by"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// 關聯
	Creator User         `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
	Members []RoomMember `gorm:"foreignKey:RoomID" json:"members,omitempty"`
}

// TableName 指定表名
func (ChatRoom) TableName() string {
	return "chat_rooms"
}

// RoomMember 聊天室成員模型
type RoomMember struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	RoomID   uint      `gorm:"not null;uniqueIndex:idx_room_user" json:"room_id"`
	UserID   uint      `gorm:"not null;uniqueIndex:idx_room_user" json:"user_id"`
	JoinedAt time.Time `json:"joined_at"`

	// 關聯
	Room ChatRoom `gorm:"foreignKey:RoomID" json:"room,omitempty"`
	User User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName 指定表名
func (RoomMember) TableName() string {
	return "room_members"
}
