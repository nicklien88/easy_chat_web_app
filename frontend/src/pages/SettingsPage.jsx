import axios from "axios";


export default function SettingsPage() {
    const [displayName, setDisplayName] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {
        const formData = new FormData();
        if (displayName) {
            formData.append("displayName", displayName);
        }
        if (avatar) {
            formData.append("avatar", avatar);
        }
        if (password) {
            formData.append("password", password);
        }

        try {
            await axios.put("/api/settings", formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
        } catch (error) {
            alert("修改失敗: " + error.response?.data?.message || error.message);
        }
    }


    return (
        <div>
            <h2>設定</h2>
            <input type="text" placeholder="修改顯示名稱" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
            <input type="password" placeholder="新密碼" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <button onClick={handleSubmit}>更新設定</button>
        </div>
    );
}
