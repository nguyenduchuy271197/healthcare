"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Award,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Edit,
} from "lucide-react";
import { getDoctorProfile } from "@/actions";
import { Doctor } from "@/types/custom.types";

interface DoctorProfileSummaryProps {
  className?: string;
}

export function DoctorProfileSummary({ className }: DoctorProfileSummaryProps) {
  const [doctorProfile, setDoctorProfile] = useState<
    | (Doctor & {
        user_profiles: {
          full_name: string;
          avatar_url?: string | null;
          phone?: string | null;
        };
      })
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const result = await getDoctorProfile();
        if (result.success && result.data) {
          setDoctorProfile(result.data);
        }
      } catch (error) {
        console.error("Error loading doctor profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="space-y-3 text-center">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse mx-auto" />
            <div className="h-4 bg-muted rounded animate-pulse w-32 mx-auto" />
            <div className="h-3 bg-muted rounded animate-pulse w-24 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!doctorProfile) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Hồ sơ chưa hoàn thiện
          </CardTitle>
          <CardDescription>
            Vui lòng hoàn thiện hồ sơ chuyên môn để bệnh nhân có thể tìm thấy
            bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/profile">
            <Button className="w-full">
              <Edit className="mr-2 h-4 w-4" />
              Tạo hồ sơ chuyên môn
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const isProfileComplete = Boolean(
    doctorProfile.license_number &&
      doctorProfile.specialization &&
      doctorProfile.qualification &&
      doctorProfile.consultation_fee
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Hồ sơ chuyên môn
          {isProfileComplete ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Hoàn thiện
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Chưa đầy đủ
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Thông tin chuyên môn hiển thị cho bệnh nhân
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Doctor Info */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={doctorProfile.user_profiles.avatar_url || ""}
              alt={doctorProfile.user_profiles.full_name}
            />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">
              {doctorProfile.user_profiles.full_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {doctorProfile.specialization || "Chưa cập nhật chuyên khoa"}
            </p>
          </div>
        </div>

        {/* Key Info */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Kinh nghiệm:
            </span>
            <span className="font-medium">
              {doctorProfile.experience_years || 0} năm
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Phí khám:
            </span>
            <span className="font-medium">
              {doctorProfile.consultation_fee?.toLocaleString("vi-VN") ||
                "Chưa cập nhật"}{" "}
              VNĐ
            </span>
          </div>

          {doctorProfile.license_number && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Giấy phép:</span>
              <span className="font-medium text-xs">
                {doctorProfile.license_number}
              </span>
            </div>
          )}

          {doctorProfile.clinic_address && (
            <div className="text-sm">
              <span className="text-muted-foreground flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4" />
                Địa chỉ:
              </span>
              <p className="text-xs text-muted-foreground">
                {doctorProfile.clinic_address}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link href="/profile">
          <Button variant="outline" className="w-full">
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa hồ sơ
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
