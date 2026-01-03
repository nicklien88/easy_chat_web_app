import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMessages, sendMessage as sendChatMessage, markAsRead } from "../api/chat";
import wsClient from "../api/websocket";

export default function ChatPage() {
    const location = useLocation();
    const { friendName } = location.state || {};
    const { friendId } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // 驗證 friendId
    useEffect(() => {
        if (!friendId || isNaN(friendId)) {
            alert("無效的好友 ID");
            navigate("/home");
            return;
        }
    }, [friendId, navigate]);

    useEffect(() => {
        if (!friendId || isNaN(friendId)) return;
        fetchMessages();
        
        // 監聽 WebSocket 訊息
        const handleNewMessage = (msg) => {
            // 只處理當前聊天對象的訊息
            if (msg.sender_id == friendId) {
                setMessages(prev => [...prev, msg]);
                scrollToBottom();
                // 標記為已讀
                if (msg.message_id) {
                    markAsRead(msg.message_id).catch(console.error);
                }
            }
        };

        wsClient.on('message', handleNewMessage);

        return () => {
            wsClient.off('message', handleNewMessage);
        };
    }, [friendId]);

    const fetchMessages = async () => {
        if (!friendId || isNaN(friendId)) {
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            const response = await getMessages(parseInt(friendId));
            if (response.data) {
                const messages = response.data.messages || [];
                setMessages(messages);
                console.log("response.data:", response.data);
                
                // 標記未讀訊息為已讀
                const unreadMessages = messages.filter(
                    msg => !msg.is_read && msg.receiver_id === user.id
                );
                for (const msg of unreadMessages) {
                    await markAsRead(msg.id).catch(console.error);
                }
            }
        } catch (error) {
            console.error("取得訊息失敗:", error);
            alert(error.message || "取得訊息失敗");
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || sending) return;

        setSending(true);
        try {
            // 透過 REST API 發送
            const response = await sendChatMessage(parseInt(friendId), message.trim());
            
            // 也透過 WebSocket 發送以實現即時通訊
            wsClient.sendMessage(parseInt(friendId), message.trim());
            
            // 添加到本地訊息列表
            if (response.data) {
                setMessages(prev => [...prev, response.data]);
            }
            
            setMessage("");
            scrollToBottom();
        } catch (error) {
            alert(error.message || "發送訊息失敗");
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">載入中...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-blue-600 text-white px-6 py-4 flex items-center gap-4 shadow">
                <button
                    onClick={() => navigate("/home")}
                    className="hover:opacity-80 transition text-2xl"
                >
                    ←
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold">
                        {friendName}
                    </h1>
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        還沒有訊息，開始聊天吧！
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender_id === user.id;
                        return (
                            <div
                                key={msg.id || msg.timestamp}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                        isMe
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-800'
                                    }`}
                                >
                                    <div>{msg.content}</div>
                                    <div
                                        className={`text-xs mt-1 ${
                                            isMe ? 'text-blue-100' : 'text-gray-500'
                                        }`}
                                    >
                                        {formatTime(msg.created_at || msg.timestamp)}
                                        {isMe && msg.is_read && ' ✓✓'}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input */}
            <footer className="bg-white border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="輸入訊息..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                        disabled={sending || !message.trim()}
                    >
                        {sending ? "發送中..." : "發送"}
                    </button>
                </form>
            </footer>
        </div>
    );
}