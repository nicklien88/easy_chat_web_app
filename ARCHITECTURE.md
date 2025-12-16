# Easy Chat 架構圖

## 系統架構

```
┌─────────────────────────────────────────────────────────────┐
│                         使用者                                │
└─────────────┬───────────────────────────────┬────────────────┘
              │                               │
              ▼                               ▼
    ┌──────────────────┐           ┌──────────────────┐
    │   Web Browser    │           │  Mobile Browser  │
    │    (React)       │           │     (React)      │
    └────────┬─────────┘           └────────┬─────────┘
             │                              │
             └──────────────┬───────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   CORS Middleware       │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │   Gin Web Framework     │
              │   (Go Backend)          │
              └────────────┬────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│   Public    │  │    Auth      │  │  WebSocket   │
│   Routes    │  │  Middleware  │  │    Hub       │
└─────┬───────┘  └──────┬───────┘  └──────┬───────┘
      │                 │                 │
      │                 │                 │
      ▼                 ▼                 ▼
┌─────────────────────────────────────────────────┐
│              Controllers Layer                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   Auth   │  │   User   │  │   Chat   │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│               Models Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   User   │  │ Message  │  │Friendship│      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                  GORM ORM                        │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              MySQL Database                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  users   │  │ messages │  │friendships│     │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
```

## 資料流程

### 1. 使用者註冊流程
```
User Input → Register Controller → Validate Input
                    ↓
            Hash Password (bcrypt)
                    ↓
            Create User in DB
                    ↓
            Generate JWT Token
                    ↓
            Return Token + User Info
```

### 2. 使用者登入流程
```
User Input → Login Controller → Find User by Email
                    ↓
            Verify Password (bcrypt)
                    ↓
            Generate JWT Token
                    ↓
            Return Token + User Info
```

### 3. 認證請求流程
```
Request → Auth Middleware → Extract Token
                ↓
         Validate Token (JWT)
                ↓
         Set User Context
                ↓
         Continue to Controller
```

### 4. API 請求流程（已認證）
```
Request → CORS Middleware
            ↓
      Auth Middleware
            ↓
      Route Handler
            ↓
      Controller Logic
            ↓
      Model/Database
            ↓
      Response Format
            ↓
      Return JSON
```

## 目錄結構對應

```
backend/
│
├── main.go                    # 應用程式入口點
│   └── 初始化配置、資料庫、路由
│
├── config/                    # 配置層
│   └── config.go             # 環境變數、資料庫連接
│
├── middleware/                # 中介軟體層
│   ├── auth_middleware.go    # JWT 認證
│   ├── cors_middleware.go    # CORS 處理
│   └── error_middleware.go   # 錯誤處理
│
├── routes/                    # 路由層
│   └── routes.go             # API 路由定義
│
├── controllers/               # 控制器層
│   ├── auth_controller.go    # 註冊/登入
│   ├── user_controller.go    # 使用者管理
│   └── chat_controller.go    # 聊天功能（待實作）
│
├── models/                    # 模型層
│   ├── user.go               # 使用者模型
│   ├── message.go            # 訊息模型
│   ├── friendship.go         # 好友關係模型
│   └── room.go               # 聊天室模型
│
└── utils/                     # 工具層
    ├── jwt.go                # JWT 工具
    ├── password.go           # 密碼加密
    ├── response.go           # 響應格式
    └── validator.go          # 輸入驗證
```

## 資料庫 ER 圖

```
┌─────────────────┐
│      users      │
├─────────────────┤
│ id (PK)         │
│ username        │◄─────┐
│ email           │      │
│ password_hash   │      │
│ display_name    │      │
│ avatar_url      │      │
│ created_at      │      │
│ updated_at      │      │
└────────┬────────┘      │
         │               │
         │               │
         ├───────────────┼─────────────────┐
         │               │                 │
         ▼               ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   messages      │ │  friendships    │ │  chat_rooms     │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ id (PK)         │ │ id (PK)         │ │ id (PK)         │
│ sender_id (FK)  │ │ user_id (FK)    │ │ name            │
│ receiver_id(FK) │ │ friend_id (FK)  │ │ created_by (FK) │
│ content         │ │ status          │ │ created_at      │
│ message_type    │ │ created_at      │ └─────────────────┘
│ is_read         │ │ updated_at      │         │
│ created_at      │ └─────────────────┘         │
└─────────────────┘                              │
                                                 ▼
                                        ┌─────────────────┐
                                        │  room_members   │
                                        ├─────────────────┤
                                        │ id (PK)         │
                                        │ room_id (FK)    │
                                        │ user_id (FK)    │
                                        │ joined_at       │
                                        └─────────────────┘
```

## JWT Token 結構

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": 1,
    "username": "alice",
    "email": "alice@example.com",
    "exp": 1734278400,
    "iat": 1734192000,
    "iss": "easy-chat"
  },
  "signature": "..."
}
```

## API 響應格式

### 成功響應
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 實際資料
  }
}
```

### 錯誤響應
```json
{
  "code": 400,
  "message": "錯誤訊息"
}
```

## 安全機制

```
┌─────────────────────────────────────┐
│         請求進入                     │
└────────────┬────────────────────────┘
             │
             ▼
    ┌─────────────────┐
    │  CORS 檢查      │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  JWT 驗證       │
    │  (需要認證的路由)│
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  輸入驗證       │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  業務邏輯       │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  GORM (防注入)  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  資料庫         │
    └─────────────────┘
```

## 待實作功能架構（第二階段）

```
WebSocket Hub
    │
    ├─► Client Manager
    │   ├─► Online Users
    │   ├─► User Connections
    │   └─► Connection Pool
    │
    ├─► Message Broker
    │   ├─► Private Message
    │   ├─► Group Message
    │   └─► Broadcast
    │
    └─► Event Handler
        ├─► User Join
        ├─► User Leave
        └─► Typing Status
```

---

**注意**: 這些架構圖展示了當前實作的系統設計。隨著專案發展，架構可能會有所調整。
