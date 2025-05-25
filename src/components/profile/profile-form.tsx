"use client";

import { useState, useRef } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, User, Stethoscope } from "lucide-react";
import { Profile } from "@/types/custom.types";
import { updateUserProfile } from "@/actions";
import { createClient } from "@/lib/supabase/client";

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

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

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi tệp",
        description: "Vui lòng chọn một tệp hình ảnh hợp lệ.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Tệp quá lớn",
        description: "Kích thước tệp không được vượt quá 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      const supabase = createClient();

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName; // Just the filename, not including bucket path

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const result = await updateUserProfile({
        avatar_url: publicUrl,
      });

      if (result.success) {
        setAvatarUrl(publicUrl);
        toast({
          title: "Cập nhật thành công",
          description: "Ảnh đại diện đã được cập nhật.",
        });
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Lỗi tải ảnh",
        description: "Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare form data with proper null handling for date
      const submitData = {
        ...formData,
        // Convert empty date string to null for PostgreSQL
        date_of_birth:
          formData.date_of_birth.trim() === "" ? null : formData.date_of_birth,
        // Convert empty strings to null for optional fields
        phone: formData.phone.trim() === "" ? null : formData.phone,
        address: formData.address.trim() === "" ? null : formData.address,
        gender: formData.gender === "" ? null : formData.gender,
      };

      const result = await updateUserProfile(submitData);

      if (result.success) {
        toast({
          title: "Cập nhật thành công",
          description: "Thông tin cá nhân đã được cập nhật.",
        });
        router.refresh();
      } else {
        toast({
          title: "Cập nhật thất bại",
          description: result.error || "Có lỗi xảy ra khi cập nhật thông tin.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      });
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
              <AvatarImage src={avatarUrl} alt={user.full_name} />
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
          >
            {isUploadingImage ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isUploadingImage ? "Đang tải lên..." : "Thay đổi ảnh đại diện"}
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
