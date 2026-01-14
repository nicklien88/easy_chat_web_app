import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getProfile, updateProfile, updatePassword } from "../api/user";
import { STATIC_BASE_URL } from "../api/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { CameraIcon } from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState(null); // local file
  const [preview, setPreview] = useState(""); // preview URL
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      if (response.data) {
        setDisplayName(response.data.display_name || "");
        // 如果有頭像 URL，加上靜態資源基礎路徑
        const avatarUrl = response.data.avatar_url;
        if (avatarUrl) {
          setPreview(avatarUrl.startsWith('http') ? avatarUrl : `${STATIC_BASE_URL}${avatarUrl}`);
        }
      }
    } catch (error) {
      console.error("載入個人資料失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (avatar) {
      const objectUrl = URL.createObjectURL(avatar);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [avatar]);

  const handleSubmit = async () => {
    try {
      // 更新個人資料
      if (displayName || avatar) {
        const formData = new FormData();
        if (displayName) formData.append("display_name", displayName);
        if (avatar) formData.append("avatar", avatar);

        await updateProfile(formData);
      }

      // 更新密碼（如果有填寫）
      if (oldPassword && newPassword) {
        await updatePassword(oldPassword, newPassword);
      }

      alert("設定已更新");
      setOldPassword("");
      setNewPassword("");
      setAvatar(null);
      loadProfile(); // 重新載入資料
    } catch (error) {
      alert("修改失敗: " + (error.message || error));
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4 flex items-center gap-4 shadow">
        <button
          onClick={() => navigate("/home")}
          className="hover:opacity-80 transition text-2xl"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">設定</h1>
      </header>

      <div className="max-w-xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Avatar preview */}
          <div className="relative w-32 h-32 group">
            <label className="cursor-pointer">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
                className="hidden"
              />
              <Avatar className="w-32 h-32 border">
                <AvatarImage src={preview} alt="Avatar" />
                <AvatarFallback className="text-lg bg-gray-200 text-gray-600">
                  <span>👤</span>
                </AvatarFallback>
              </Avatar>

              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-full">
                <CameraIcon className="text-white w-6 h-6" />
              </div>
            </label>
          </div>

          {/* Display name input */}
          <div>
            <Label htmlFor="displayName">顯示名稱</Label>
            <Input
              id="displayName"
              placeholder="顯示名稱"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="oldPassword">舊密碼</Label>
            <Input
              id="oldPassword"
              type="password"
              placeholder="請輸入舊密碼"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="newPassword">新密碼</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="請輸入新密碼"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        {/* Submit */}
        <Button className="mt-4 w-full" onClick={handleSubmit}>
          更新設定
        </Button>
      </div>
    </div>
  );
}