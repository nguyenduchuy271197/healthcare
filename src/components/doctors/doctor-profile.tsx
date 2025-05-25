"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Star,
  Clock,
  DollarSign,
  User,
  Phone,
  Award,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { Doctor } from "@/types/custom.types";

interface DoctorProfileProps {
  doctor: Doctor & {
    user_profiles: {
      full_name: string;
      avatar_url?: string | null;
      phone?: string | null;
    };
    doctor_schedules: {
      id: number;
      day_of_week: number;
      start_time: string;
      end_time: string;
      slot_duration_minutes: number | null;
      is_active: boolean | null;
    }[];
  };
}

const DAYS_OF_WEEK = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];

export function DoctorProfile({ doctor }: DoctorProfileProps) {
  function getRatingStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  }

  function formatTime(time: string) {
    return time.slice(0, 5); // HH:MM format
  }

  const activeSchedules = doctor.doctor_schedules
    .filter((schedule) => schedule.is_active)
    .sort((a, b) => a.day_of_week - b.day_of_week);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Main Profile Info */}
      <div className="md:col-span-2 space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={doctor.user_profiles.avatar_url || ""}
                  alt={doctor.user_profiles.full_name}
                />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-2xl">
                    {doctor.user_profiles.full_name}
                  </CardTitle>
                  {doctor.verified_at && (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Đã xác minh
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-lg">
                  {doctor.specialization || "Bác sĩ đa khoa"}
                </CardDescription>
                {doctor.qualification && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {doctor.qualification}
                  </p>
                )}

                {/* Rating */}
                <div className="flex items-center space-x-2 mt-3">
                  <div className="flex items-center space-x-1">
                    {getRatingStars(doctor.average_rating || 0)}
                  </div>
                  <span className="text-sm font-medium">
                    {doctor.average_rating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({doctor.total_reviews || 0} đánh giá)
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Kinh nghiệm:</strong> {doctor.experience_years || 0}{" "}
                  năm
                </span>
              </div>

              {doctor.license_number && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Số giấy phép:</strong> {doctor.license_number}
                  </span>
                </div>
              )}

              {doctor.user_profiles.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Điện thoại:</strong> {doctor.user_profiles.phone}
                  </span>
                </div>
              )}

              {doctor.clinic_address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Địa chỉ:</strong> {doctor.clinic_address}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Biography */}
        {doctor.bio && (
          <Card>
            <CardHeader>
              <CardTitle>Giới thiệu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {doctor.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Working Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Lịch làm việc
            </CardTitle>
            <CardDescription>Khung giờ làm việc trong tuần</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSchedules.length > 0 ? (
              <div className="space-y-3">
                {activeSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-20 text-sm font-medium">
                        {DAYS_OF_WEEK[schedule.day_of_week]}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatTime(schedule.start_time)} -{" "}
                          {formatTime(schedule.end_time)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {schedule.slot_duration_minutes || 30} phút/ca
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có lịch làm việc được thiết lập
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Consultation Fee */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Phí khám bệnh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {doctor.consultation_fee?.toLocaleString("vi-VN")} VNĐ
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Phí khám cho mỗi lần hẹn
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Availability Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Badge
                variant={doctor.is_available ? "default" : "secondary"}
                className="text-sm px-4 py-2"
              >
                {doctor.is_available ? "Có thể đặt lịch" : "Không khả dụng"}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {doctor.is_available
                  ? "Bác sĩ đang nhận lịch hẹn mới"
                  : "Bác sĩ tạm thời không nhận lịch hẹn"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Kinh nghiệm</span>
              <span className="text-sm font-medium">
                {doctor.experience_years || 0} năm
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Đánh giá</span>
              <span className="text-sm font-medium">
                {doctor.average_rating?.toFixed(1) || "0.0"}/5.0
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Số đánh giá</span>
              <span className="text-sm font-medium">
                {doctor.total_reviews || 0}
              </span>
            </div>
            {doctor.verified_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Xác minh</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
