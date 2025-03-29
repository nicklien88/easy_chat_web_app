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
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setFriends(res.data);
      } catch (error) {
        alert("取得好友列表失敗: " + (error.response?.data?.message || error.message));
      }
    };
    fetchFriends();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold tracking-wide">Easy Chat</h1>
        <button
          className="hover:opacity-80 transition"
          onClick={() => navigate("/settings")}
        >
          ⚙️ 設定
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <section className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow max-w-xl mx-auto">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                👥 好友列表
            </h2>
            <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
                {(Array.isArray(friends) ? friends : []).map((friend) => (
                    <li
                    key={friend.id}
                    className="py-3 px-4 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer rounded-md transition"
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