"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, User, Stethoscope } from "lucide-react";
import { Profile } from "@/types/custom.types";
import { updateUserProfile } from "@/actions";

interface ProfileFormProps {
  user: Profile;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    phone: user.phone || "",
    address: user.address || "",
    date_of_birth: user.date_of_birth || "",
    gender: user.gender || "",
    email_notifications: user.email_notifications ?? true,
    sms_notifications: user.sms_notifications ?? false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleInputChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await updateUserProfile(formData);

      if (result.success) {
        setMessage("Cập nhật thông tin thành công!");
        router.refresh();
      } else {
        setError(result.error || "Có lỗi xảy ra khi cập nhật thông tin");
      }
    } catch (error) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url || ""} alt={user.full_name} />
              <AvatarFallback className="text-lg">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{user.full_name}</h2>
              <div className="flex items-center space-x-2 text-muted-foreground">
                {user.role === "doctor" ? (
                  <Stethoscope className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="capitalize">
                  {user.role === "doctor" ? "Bác sĩ" : "Bệnh nhân"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Thành viên từ{" "}
                {new Date(user.created_at || "").toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Thay đổi ảnh đại diện
          </Button>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>
            Cập nhật thông tin cá nhân và thông tin liên hệ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Họ và tên</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    handleInputChange("full_name", e.target.value)
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Ngày sinh</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    handleInputChange("date_of_birth", e.target.value)
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cập nhật thông tin
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt thông báo</CardTitle>
          <CardDescription>
            Quản lý cách bạn nhận thông báo từ hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Thông báo email</Label>
              <p className="text-sm text-muted-foreground">
                Nhận thông báo qua email về lịch hẹn và cập nhật
              </p>
            </div>
            <Switch
              checked={formData.email_notifications}
              onCheckedChange={(checked) =>
                handleInputChange("email_notifications", checked)
              }
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Thông báo SMS</Label>
              <p className="text-sm text-muted-foreground">
                Nhận thông báo qua SMS về lịch hẹn quan trọng
              </p>
            </div>
            <Switch
              checked={formData.sms_notifications}
              onCheckedChange={(checked) =>
                handleInputChange("sms_notifications", checked)
              }
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
