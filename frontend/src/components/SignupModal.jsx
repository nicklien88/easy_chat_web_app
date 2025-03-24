import { useState } from "react";
import axios from "axios";

export default function SignupModal({ onClose }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = async () => {
        try {
            await axios.post("/api/register", { username, email, password });
            alert("註冊成功!請登入");
            onClose();
        } catch (error) {
            alert("註冊失敗: " + error.response?.data?.message || "請檢查輸入資料");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div
                className="bg-white p-6 rounded-lg shadow-md w-full max-w-md animate-slide-down pointer-events-auto"
            >
                <h2 className="text-xl font-semibold mb-4 text-center">註冊新帳號</h2>
                <input
                    type="text"
                    placeholder="使用者名稱"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full mb-3 px-4 py-2 border border-gray-300 rounded"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-3 px-4 py-2 border border-gray-300 rounded"
                />
                <input
                    type="password"
                    placeholder="密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
                />
                <div className="flex justify-between">
                    <button
                        onClick={handleSignup}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full mr-2"
                    >
                        提交
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded w-full ml-2"
                    >
                        取消
                    </button>
                </div>
            </div>
        </div>
    );
}
