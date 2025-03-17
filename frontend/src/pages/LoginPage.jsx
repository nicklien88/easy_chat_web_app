import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SignupModal from "../components/SignupModal";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showSignup, setShowSignup] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post("/api/login", {email, password});
            localStorage.setItem("token", res.data.token); //儲存token
            navigate("/home");
        } catch (error) {
            alert("登入失敗: " + error.response?.data?.message || "請檢查帳號密碼");
        }
    };

    return (
        <div className="login-container">
            <h2>登入</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="密碼" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>登入</button>
            <button onClick={() => setShowSignup(true)}>註冊</button>
            {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
        </div>
    );
}
