import { useState } from "react";
import axios from "axios";


export default function SignupModal({ onClose }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = async () => {
        try {
            await axios.post("/api/register", {username, email, password});
            alert("註冊成功!請登入");
            onClose();
        } catch (error) {
            alert("註冊失敗: " + error.response?.data?.message || "請檢查輸入資料");
        }
    };

    return (
        <div className="modal">
            <h2>註冊新帳號</h2>
            <input type="text" placeholder="使用者名稱" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="密碼" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleSignup}>提交</button>
            <button onClick={onClose}>取消</button>
        </div>
    );
}