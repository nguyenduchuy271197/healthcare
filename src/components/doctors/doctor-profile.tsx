"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardContent className="p-6">
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
                <h2 className="text-2xl font-bold">
                  {doctor.user_profiles.full_name}
                </h2>
                {doctor.verified_at && (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Đã xác minh
                  </Badge>
                )}
                <Badge
                  variant={doctor.is_available ? "default" : "secondary"}
                  className="text-xs"
                >
                  {doctor.is_available ? "Khả dụng" : "Bận"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                {doctor.specialization || "Bác sĩ đa khoa"}
              </p>
              {doctor.qualification && (
                <p className="text-sm text-muted-foreground mt-1">
                  {doctor.qualification}
                </p>
              )}

              {/* Rating and Stats */}
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center space-x-1">
                  {getRatingStars(doctor.average_rating || 0)}
                  <span className="text-sm font-medium ml-1">
                    {doctor.average_rating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({doctor.total_reviews || 0} đánh giá)
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {doctor.experience_years || 0} năm kinh nghiệm
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {doctor.consultation_fee?.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid gap-4 md:grid-cols-2 mt-4 pt-4 border-t">
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

            {doctor.license_number && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Số giấy phép:</strong> {doctor.license_number}
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
  );
}
