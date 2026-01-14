package models

import (
	"time"

	"gorm.io/gorm"
)

// Message 訊息模型
type Message struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	SenderID    uint           `gorm:"not null;index:idx_sender_receiver" json:"sender_id"`
	ReceiverID  uint           `gorm:"not null;index:idx_sender_receiver" json:"receiver_id"`
	Content     string         `gorm:"type:text;not null" json:"content"`
	MessageType string         `gorm:"type:enum('text','image','video','file');default:'text'" json:"message_type"`
	FileURL     string         `gorm:"type:varchar(500)" json:"file_url,omitempty"`
	FileName    string         `gorm:"type:varchar(255)" json:"file_name,omitempty"`
	FileSize    int64          `gorm:"type:bigint" json:"file_size,omitempty"`
	IsRead      bool           `gorm:"default:false;index" json:"is_read"`
	CreatedAt   time.Time      `gorm:"index" json:"created_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 關聯
	Sender   User `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
	Receiver User `gorm:"foreignKey:ReceiverID" json:"receiver,omitempty"`
}

// TableName 指定表名
func (Message) TableName() string {
	return "messages"
}

// MessageResponse 訊息響應結構
type MessageResponse struct {
	ID          uint         `json:"id"`
	SenderID    uint         `json:"sender_id"`
	ReceiverID  uint         `json:"receiver_id"`
	Content     string       `json:"content"`
	MessageType string       `json:"message_type"`
	FileURL     string       `json:"file_url,omitempty"`
	FileName    string       `json:"file_name,omitempty"`
	FileSize    int64        `json:"file_size,omitempty"`
	IsRead      bool         `json:"is_read"`
	CreatedAt   time.Time    `json:"created_at"`
	Sender      UserResponse `json:"sender,omitempty"`
}

// ToResponse 轉換為響應格式
func (m *Message) ToResponse() MessageResponse {
	return MessageResponse{
		ID:          m.ID,
		SenderID:    m.SenderID,
		ReceiverID:  m.ReceiverID,
		Content:     m.Content,
		MessageType: m.MessageType,
		FileURL:     m.FileURL,
		FileName:    m.FileName,
		FileSize:    m.FileSize,
		IsRead:      m.IsRead,
		CreatedAt:   m.CreatedAt,
		Sender:      m.Sender.ToResponse(),
	}
}
