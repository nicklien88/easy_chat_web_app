import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getFriends, sendFriendRequest, getFriendRequests, acceptFriendRequest, rejectFriendRequest } from "../api/friend";
import { getRecentChats, getUnreadCount } from "../api/chat";

export default function HomePage() {
  const [friends, setFriends] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [friendsData, chatsData, requestsData, unreadData] = await Promise.all([
        getFriends(),
        getRecentChats(),
        getFriendRequests(),
        getUnreadCount(),
      ]);
      
      console.log("Friends 資料:", friendsData.data);
      console.log("Recent Chats 資料:", chatsData.data);
      setFriends(friendsData.data || []);
      setRecentChats(chatsData.data || []);
      setFriendRequests(requestsData.data || []);
      setUnreadCount(unreadData.data?.total || 0);
    } catch (error) {
      console.error("載入資料失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!newFriendUsername.trim()) return;
    
    try {
      await sendFriendRequest(newFriendUsername);
      alert("好友請求已發送");
      setNewFriendUsername("");
      setShowAddFriend(false);
    } catch (error) {
      alert(error.message || "發送好友請求失敗");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      fetchData(); // 重新載入資料
    } catch (error) {
      alert(error.message || "接受好友請求失敗");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectFriendRequest(requestId);
      fetchData(); // 重新載入資料
    } catch (error) {
      alert(error.message || "拒絕好友請求失敗");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">Easy Chat</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">👋 {user?.display_name || user?.username}</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
          <button
            className="hover:opacity-80 transition"
            onClick={() => navigate("/settings")}
          >
            ⚙️
          </button>
          <button
            className="hover:opacity-80 transition"
            onClick={logout}
          >
            🚪 登出
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 好友請求 */}
          {friendRequests.length > 0 && (
            <section className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                📬 好友請求 ({friendRequests.length})
              </h2>
              <ul className="space-y-2">
                {friendRequests.map((request) => (
                  <li key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span>{request.user?.username || request.user_id}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        接受
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        拒絕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 最近聊天 */}
          {recentChats.length > 0 && (
            <section className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                💬 最近聊天
              </h2>
              <ul className="divide-y divide-gray-200">
                {recentChats.map((chat) => (
                  <li
                    key={chat.friend.id}
                    className="py-3 px-4 hover:bg-gray-50 cursor-pointer rounded-md transition"
                    onClick={() => navigate(`/chat/${chat.friend.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{chat.friend.display_name}</div>
                        <div className="text-sm text-gray-600 truncate">{chat.last_message}</div>
                      </div>
                      {chat.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 好友列表 */}
          <section className="bg-white rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                👥 好友列表 ({friends.length})
              </h2>
              <button
                onClick={() => setShowAddFriend(!showAddFriend)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                ➕ 新增好友
              </button>
            </div>

            {showAddFriend && (
              <div className="mb-4 p-4 bg-gray-50 rounded-md">
                <input
                  type="text"
                  placeholder="輸入好友使用者名稱"
                  value={newFriendUsername}
                  onChange={(e) => setNewFriendUsername(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddFriend}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    發送請求
                  </button>
                  <button
                    onClick={() => {
                      setShowAddFriend(false);
                      setNewFriendUsername("");
                    }}
                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {friends.length === 0 ? (
              <p className="text-gray-500 text-center py-4">還沒有好友，快去新增吧！</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {friends.map((friend) => (
                  <li
                    key={friend.id}
                    className="py-3 px-4 hover:bg-gray-50 cursor-pointer rounded-md transition"
                    onClick={() => navigate(`/chat/${friend.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{friend?.display_name || friend?.username}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(friend.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}