import { useState } from "react";
import { register } from "../api/auth";

export default function SignupModal({ onClose }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await register(username, email, password);
            alert("註冊成功！請登入");
            onClose();
        } catch (error) {
            setError(error.message || "註冊失敗，請檢查輸入資料");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-center">註冊新帳號</h2>
                
                <form onSubmit={handleSignup}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    <input
                        type="text"
                        placeholder="使用者名稱 (3-50 字元)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full mb-3 px-4 py-2 border border-gray-300 rounded"
                        required
                        disabled={loading}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mb-3 px-4 py-2 border border-gray-300 rounded"
                        required
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="密碼 (至少 6 個字元)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
                        required
                        minLength={6}
                        disabled={loading}
                    />
                    <div className="flex justify-between gap-2">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? "註冊中..." : "提交"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded w-full"
                            disabled={loading}
                        >
                            取消
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
