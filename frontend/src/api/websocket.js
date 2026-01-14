import { WS_BASE_URL } from './client';

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(token) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket 已連接');
      return;
    }

    const wsUrl = `${WS_BASE_URL}?token=${token}`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket 連接成功');
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('收到訊息:', message);
          
          // 根據訊息類型觸發不同事件
          switch (message.type) {
            case 'message':
              this.emit('message', message);
              break;
            case 'online':
              this.emit('online', message);
              break;
            case 'offline':
              this.emit('offline', message);
              break;
            case 'typing':
              this.emit('typing', message);
              break;
            case 'read':
              this.emit('read', message);
              break;
            case 'friend_request':
              this.emit('friend_request', message);
              break;
            case 'friend_accepted':
              this.emit('friend_accepted', message);
              break;
            case 'friend_rejected':
              this.emit('friend_rejected', message);
              break;
            default:
              this.emit('unknown', message);
          }
        } catch (error) {
          console.error('解析訊息失敗:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket 錯誤:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket 連接關閉');
        this.emit('disconnected');
        
        // 嘗試重連
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`${this.reconnectDelay}ms 後嘗試重連 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.connect(token), this.reconnectDelay);
          this.reconnectDelay *= 2; // 指數退避
        }
      };
    } catch (error) {
      console.error('建立 WebSocket 連接失敗:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
  }

  send(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type,
        ...data,
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket 未連接');
    }
  }

  // 發送訊息
  sendMessage(receiverId, content, messageType = 'text') {
    this.send('message', {
      receiver_id: receiverId,
      content,
      message_type: messageType,
    });
  }

  // 發送正在輸入通知
  sendTyping(receiverId) {
    this.send('typing', {
      receiver_id: receiverId,
    });
  }

  // 發送已讀通知
  sendRead(messageId) {
    this.send('read', {
      message_id: messageId,
    });
  }

  // 事件監聽
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // 移除監聽
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  // 觸發事件
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// 單例模式
const wsClient = new WebSocketClient();

export default wsClient;
