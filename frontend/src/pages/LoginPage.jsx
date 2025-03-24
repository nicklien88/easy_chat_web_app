import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SignupModal from "../components/SignupModal";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showSignup, setShowSignup] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post("/api/login", { email, password });
            localStorage.setItem("token", res.data.token); // 儲存token
            navigate("/home");
        } catch (error) {
            alert("登入失敗: " + (error.response?.data?.message || "請檢查帳號密碼"));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">登入</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-2 rounded mb-4"
                />
                <input
                    type="password"
                    placeholder="密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-2 rounded mb-4"
                />
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2"
                >
                    登入
                </button>
                <button
                    onClick={() => setShowSignup(true)}
                    className="w-full text-blue-500 hover:underline"
                >
                    註冊
                </button>
                {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
            </div>
        </div>
    );
}
