import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";


export default function HomePage() {
    const [friends, setFriends] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await axios.get("/api/friends", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}`}
                });
                setFriends(res.data);
            } catch (error) {
                alert("取得好友列表失敗: " + error.response?.data?.message);
            }
        };
        fetchFriends();
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-teal-500 text-white px-6 py-4 flex justify-between items-center shadow-md">
                <h1 className="text-xl font-semibold">Easy Chat</h1>
                <button
                    className="text-white text-lg hover:opacity-80"
                    onClick={() => navigate("/settings")}
                >
                    ⚙️ 設定
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                <section className="bg-white rounded-xl p-6 shadow max-w-xl mx-auto">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">👥 好友列表</h2>
                    <ul className="divide-y divide-gray-200">
                        {friends.map((friend) => (
                            <li
                                key={friend.id}
                                className="py-3 px-4 hover:bg-gray-50 cursor-pointer"
                                onClick={() => navigate(`/chat/${friend.id}`)}
                            >
                                {friend.username}
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
}