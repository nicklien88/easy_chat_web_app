import { useState, useEffect } from "react";
import axios from "axios";
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
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState(null); // local file
  const [preview, setPreview] = useState(""); // preview URL
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (avatar) {
      const objectUrl = URL.createObjectURL(avatar);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [avatar]);

  const handleSubmit = async () => {
    const formData = new FormData();
    if (displayName) formData.append("displayName", displayName);
    if (avatar) formData.append("avatar", avatar);
    if (password) formData.append("password", password);

    try {
      await axios.put("/api/settings", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("設定已更新");
    } catch (error) {
      alert("修改失敗: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">設定</h2>

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
      <div>
        <Label htmlFor="password">新密碼</Label>
        <Input
          id="password"
          type="password"
          placeholder="新密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Submit */}
      <Button className="mt-4" onClick={handleSubmit}>
        更新設定
      </Button>
    </div>
  );
}