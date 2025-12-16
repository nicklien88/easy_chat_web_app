package utils

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword 將密碼進行雜湊加密
func HashPassword(password string) (string, error) {
	if password == "" {
		return "", errors.New("密碼不能為空")
	}

	// 使用 bcrypt 進行加密，cost 為 10
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hashedBytes), nil
}

// CheckPassword 驗證密碼是否正確
func CheckPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// IsPasswordValid 檢查密碼是否符合規則
func IsPasswordValid(password string) bool {
	// 密碼至少 6 個字元
	return len(password) >= 6
}
