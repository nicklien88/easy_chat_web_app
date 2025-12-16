package utils

import (
	"regexp"
)

// IsEmailValid 驗證電子郵件格式
func IsEmailValid(email string) bool {
	// 簡單的 email 格式驗證
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// IsUsernameValid 驗證使用者名稱格式
func IsUsernameValid(username string) bool {
	// 使用者名稱：3-50 個字元，只能包含字母、數字、底線
	if len(username) < 3 || len(username) > 50 {
		return false
	}
	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	return usernameRegex.MatchString(username)
}
