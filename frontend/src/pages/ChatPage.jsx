import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMessages, sendMessage as sendChatMessage, markAsRead, uploadFile } from "../api/chat";
import { STATIC_BASE_URL } from "../api/client";
import wsClient from "../api/websocket";

export default function ChatPage() {
    const location = useLocation();
    const { friendName } = location.state || {};
    const { friendId } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mediaModal, setMediaModal] = useState({ show: false, type: null, url: null });
    const [friendAvatar, setFriendAvatar] = useState("");
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
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
            console.log('收到 WebSocket 訊息:', msg);
            
            // 將 data 欄位的內容合併到訊息物件中
            const fullMessage = {
                ...msg,
                ...(msg.data || {}),
            };
            
            // 處理當前聊天對象的訊息（對方發給我的，或我發給對方的）
            const isSenderMatch = fullMessage.sender_id == friendId;
            const isReceiverMatch = fullMessage.receiver_id == friendId;
            
            if (isSenderMatch || isReceiverMatch) {
                // 檢查訊息是否已存在（避免重複）
                setMessages(prev => {
                    const exists = prev.some(m => 
                        m.id === fullMessage.id || 
                        (m.sender_id === fullMessage.sender_id && 
                         m.receiver_id === fullMessage.receiver_id && 
                         m.content === fullMessage.content &&
                         Math.abs(new Date(m.created_at) - new Date(fullMessage.created_at)) < 1000)
                    );
                    if (exists) return prev;
                    return [...prev, fullMessage];
                });
                scrollToBottom();
                // 標記為已讀（只有收到對方的訊息時）
                if (isSenderMatch && fullMessage.message_id) {
                    markAsRead(fullMessage.message_id).then(() => {
                        // 標記成功後，透過 WebSocket 通知發送者
                        if (wsClient.isConnected()) {
                            wsClient.send('read', {
                                message_id: fullMessage.message_id,
                                receiver_id: fullMessage.sender_id,
                            });
                        }
                    }).catch(console.error);
                }
            }
        };

        // 監聽已讀通知
        const handleReadReceipt = (msg) => {
            console.log('收到已讀通知:', msg);
            // 更新本地訊息的已讀狀態
            if (msg.message_id) {
                setMessages(prev => prev.map(m => 
                    m.id === msg.message_id ? { ...m, is_read: true } : m
                ));
            }
        };

        wsClient.on('message', handleNewMessage);
        wsClient.on('read', handleReadReceipt);

        return () => {
            wsClient.off('message', handleNewMessage);
            wsClient.off('read', handleReadReceipt);
        };
    }, [friendId, user.id]);

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
                
                // 從第一條訊息中取得好友頭像
                if (messages.length > 0) {
                    const firstFriendMsg = messages.find(m => m.sender_id == friendId);
                    if (firstFriendMsg && firstFriendMsg.sender) {
                        const avatarUrl = firstFriendMsg.sender.avatar_url;
                        if (avatarUrl) {
                            setFriendAvatar(avatarUrl.startsWith('http') ? avatarUrl : `${STATIC_BASE_URL}${avatarUrl}`);
                        }
                    }
                }
                
                console.log("response.data:", response.data);
                
                // 標記未讀訊息為已讀
                const unreadMessages = messages.filter(
                    msg => !msg.is_read && msg.receiver_id === user.id
                );
                for (const msg of unreadMessages) {
                    await markAsRead(msg.id).then(() => {
                        // 標記成功後，透過 WebSocket 通知發送者
                        if (wsClient.isConnected()) {
                            wsClient.send('read', {
                                message_id: msg.id,
                                receiver_id: msg.sender_id,
                            });
                        }
                    }).catch(console.error);
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
        // 使用 setTimeout 確保 DOM 已更新（特別是圖片/影片載入）
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e, fileData = null) => {
        e?.preventDefault();
        if ((!message.trim() && !fileData) || sending) return;

        setSending(true);
        try {
            const messageContent = fileData ? (fileData.file_name || '檔案') : message.trim();
            const messageType = fileData?.file_type || 'text';
            
            // 透過 REST API 發送（這會儲存到資料庫）
            const response = await sendChatMessage(
                parseInt(friendId), 
                messageContent,
                messageType,
                fileData
            );
            
            // 添加到本地訊息列表
            if (response.data) {
                setMessages(prev => [...prev, response.data]);
                
                // 透過 WebSocket 通知對方（發送完整的訊息資料）
                if (wsClient.isConnected()) {
                    wsClient.send('message', {
                        sender_id: response.data.sender_id,
                        receiver_id: parseInt(friendId),
                        content: response.data.content,
                        message_id: response.data.id,
                        data: {
                            id: response.data.id,
                            message_type: response.data.message_type,
                            file_url: response.data.file_url,
                            file_name: response.data.file_name,
                            file_size: response.data.file_size,
                            created_at: response.data.created_at,
                            is_read: false,
                        },
                    });
                }
            }
            
            setMessage("");
            scrollToBottom();
        } catch (error) {
            alert(error.message || "發送訊息失敗");
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 檢查檔案大小 (50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert('檔案大小不能超過 50MB');
            return;
        }

        setUploading(true);
        try {
            const response = await uploadFile(file);
            if (response.data) {
                // 上傳成功後發送訊息
                await handleSendMessage(null, response.data);
            }
        } catch (error) {
            alert(error.message || '檔案上傳失敗');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    };

    const getMediaUrl = (fileUrl) => {
        return `${STATIC_BASE_URL}${fileUrl}`;
    };

    const openMediaModal = (type, url) => {
        setMediaModal({ show: true, type, url });
    };

    const closeMediaModal = () => {
        setMediaModal({ show: false, type: null, url: null });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">載入中...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-blue-100 to-indigo-100">
            {/* Header */}
            <header className="bg-blue-600 text-white px-6 py-4 flex items-center gap-4 shadow">
                <button
                    onClick={() => navigate("/home")}
                    className="hover:opacity-80 transition text-2xl"
                >
                    ←
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold">{friendName || `好友 #${friendId}`}</h1>
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">尚無訊息</div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender_id === user.id;
                        return (
                            <div
                                key={msg.id || msg.timestamp}
                                className={`flex gap-2 ${isMe ? 'items-end justify-end' : 'items-start justify-start'}`}
                            >
                                {/* 對方的大頭照 */}
                                {!isMe && (
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                                        {friendAvatar ? (
                                            <img 
                                                src={friendAvatar} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl">
                                                👤
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* 自己的訊息：時間和已讀在左邊 */}
                                {isMe && (
                                    <div className="text-xs md:text-sm text-gray-500 mb-1 whitespace-nowrap">
                                        {formatTime(msg.created_at || msg.timestamp)}
                                        {msg.is_read && ' ✓✓'}
                                    </div>
                                )}
                                
                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-lg text-base md:text-2xl ${
                                        isMe
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-800'
                                    }`}
                                >
                                    {/* 顯示不同類型的訊息 */}
                                    {msg.message_type === 'image' && msg.file_url && (
                                        <div>
                                            <img 
                                                src={getMediaUrl(msg.file_url)}
                                                alt={msg.file_name || '圖片'}
                                                className="max-w-full max-h-48 rounded cursor-pointer hover:opacity-90 transition"
                                                onClick={() => openMediaModal('image', getMediaUrl(msg.file_url))}
                                                onLoad={scrollToBottom}
                                            />
                                        </div>
                                    )}
                                    {msg.message_type === 'video' && msg.file_url && (
                                        <div 
                                            className="relative cursor-pointer group"
                                            onClick={() => openMediaModal('video', getMediaUrl(msg.file_url))}
                                        >
                                            <video 
                                                className="max-w-full max-h-48 rounded"
                                                preload="metadata"
                                                onLoadedMetadata={scrollToBottom}
                                            >
                                                <source src={`${getMediaUrl(msg.file_url)}#t=0.1`} />
                                            </video>
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded group-hover:bg-opacity-50 transition">
                                                <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-blue-600 border-b-8 border-b-transparent ml-1"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {msg.message_type === 'file' && msg.file_url && (
                                        <a 
                                            href={getMediaUrl(msg.file_url)}
                                            download={msg.file_name}
                                            className={`flex items-center gap-2 ${isMe ? 'text-white hover:text-blue-100' : 'text-blue-600 hover:text-blue-800'}`}
                                        >
                                            📎 {msg.file_name}
                                            {msg.file_size && (
                                                <span className="text-xs">
                                                    ({(msg.file_size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            )}
                                        </a>
                                    )}
                                    {(!msg.message_type || msg.message_type === 'text') && msg.content && (
                                        <div>{msg.content}</div>
                                    )}
                                </div>
                                
                                {/* 對方的訊息：時間在右邊 */}
                                {!isMe && (
                                    <div className="text-xs md:text-sm text-gray-500 mb-1 whitespace-nowrap">
                                        {formatTime(msg.created_at || msg.timestamp)}
                                    </div>
                                )}
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
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
                        disabled={uploading || sending}
                        title="上傳圖片或影片"
                    >
                        {uploading ? "上傳中..." : "📎"}
                    </button>
                    <input
                        type="text"
                        placeholder="輸入訊息..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                        disabled={sending || uploading}
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                        disabled={sending || uploading || !message.trim()}
                    >
                        {sending ? "發送中..." : "發送"}
                    </button>
                </form>
            </footer>

            {/* Media Modal */}
            {mediaModal.show && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                    onClick={closeMediaModal}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full mx-4">
                        <button
                            onClick={closeMediaModal}
                            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full w-10 h-10 flex items-center justify-center text-2xl z-10"
                        >
                            ×
                        </button>
                        {mediaModal.type === 'image' && (
                            <img 
                                src={mediaModal.url}
                                alt="預覽"
                                className="max-w-full max-h-[90vh] mx-auto rounded"
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                        {mediaModal.type === 'video' && (
                            <video 
                                controls
                                autoPlay
                                className="max-w-full max-h-[90vh] mx-auto rounded"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <source src={mediaModal.url} />
                                您的瀏覽器不支援影片播放
                            </video>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}