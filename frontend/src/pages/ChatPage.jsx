import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ChatPage() {
    const { friendId } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`/api/chat/${friendId}/messages`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}`}
                })
                setMessages(res.data);  
            } catch (error) {
                alert("取得訊息失敗: " + error.response?.data?.message);
            }
        }
        fetchMessages();
    }, [friendId]);

    const sendMessage = async () => {
        if (message) {
            try {
                await axios.post("/api/chat/send", {
                    to: friendId,
                    text: message
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}`}
                })
                setMessages([...messages, { sender: "Me", text: message}]);
                setMessage("");
            } catch (error) {
                alert("發送訊息失敗: " + error.response?.data?.message);
            }
        }
    };

    return (
        <div>
            <h2>與 { friendId } 聊天</h2>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}><b>{msg.sender}:</b> {msg.text}</p>
                ))}
            </div>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={sendMessage}>送出</button>
        </div>
    );
}