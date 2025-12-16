import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import SignupModal from "../components/SignupModal";
import wsClient from "../api/websocket";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showSignup, setShowSignup] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await login(username, password);
            if (response.data) {
                setUser(response.data.user);
                // 連接 WebSocket
                const token = localStorage.getItem('token');
                wsClient.connect(token);
                navigate("/home");
            }
        } catch (error) {
            setError(error.message || "登入失敗，請檢查帳號密碼");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Easy Chat</h2>
                
                <form onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    <input
                        type="text"
                        placeholder="使用者名稱"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border p-2 rounded mb-4"
                        required
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="密碼"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border p-2 rounded mb-4"
                        required
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2 disabled:bg-gray-400"
                        disabled={loading}
                    >
                        {loading ? "登入中..." : "登入"}
                    </button>
                </form>
                
                <button
                    onClick={() => setShowSignup(true)}
                    className="w-full text-blue-500 hover:underline"
                    disabled={loading}
                >
                    還沒有帳號？立即註冊
                </button>
                {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
            </div>
        </div>
    );
}
