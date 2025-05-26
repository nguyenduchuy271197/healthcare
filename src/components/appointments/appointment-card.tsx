"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Edit,
  X,
  Eye,
  DollarSign,
  RotateCcw,
} from "lucide-react";
import { AppointmentStatus } from "@/types/custom.types";
import { AppointmentWithDoctor } from "./types";
import { ReviewButton } from "@/components/reviews/review-button";

interface AppointmentCardProps {
  appointment: AppointmentWithDoctor;
  onViewDetails: (appointment: AppointmentWithDoctor) => void;
  onEdit: (appointment: AppointmentWithDoctor) => void;
  onCancel: (appointment: AppointmentWithDoctor) => void;
  onReschedule: (appointment: AppointmentWithDoctor) => void;
}

export function AppointmentCard({
  appointment,
  onViewDetails,
  onEdit,
  onCancel,
  onReschedule,
}: AppointmentCardProps) {
  function getStatusBadge(status: AppointmentStatus) {
    const variants = {
      pending: { variant: "secondary" as const, label: "Chờ xác nhận" },
      confirmed: { variant: "default" as const, label: "Đã xác nhận" },
      completed: { variant: "outline" as const, label: "Hoàn thành" },
      cancelled: { variant: "destructive" as const, label: "Đã hủy" },
      rejected: { variant: "destructive" as const, label: "Bị từ chối" },
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTime(timeString: string) {
    return timeString.slice(0, 5); // HH:MM format
  }

  function canEditOrCancel(appointment: AppointmentWithDoctor) {
    return (
      appointment.status === "pending" || appointment.status === "confirmed"
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Doctor Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={appointment.doctors.user_profiles.avatar_url || ""}
                  alt={appointment.doctors.user_profiles.full_name}
                />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {appointment.doctors.user_profiles.full_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {appointment.doctors.specialization || "Bác sĩ đa khoa"}
                </p>
              </div>
            </div>
            {getStatusBadge(appointment.status || "pending")}
          </div>

          {/* Appointment Details */}
          <div className="grid gap-2 md:grid-cols-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(appointment.appointment_date)}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatTime(appointment.appointment_time)}</span>
            </div>
            {appointment.doctors.clinic_address && (
              <div className="flex items-center space-x-2 text-sm md:col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">
                  {appointment.doctors.clinic_address}
                </span>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              <strong>Lý do khám:</strong> {appointment.reason}
            </p>
            {appointment.notes && (
              <p className="text-sm mt-1">
                <strong>Ghi chú:</strong> {appointment.notes}
              </p>
            )}
          </div>

          {/* Fee */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>
                {appointment.consultation_fee?.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(appointment)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Xem chi tiết
            </Button>

            {canEditOrCancel(appointment) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(appointment)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReschedule(appointment)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Thay đổi lịch
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onCancel(appointment)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
              </>
            )}

            {/* Review Button */}
            <ReviewButton
              appointmentId={appointment.id}
              doctorName={appointment.doctors.user_profiles.full_name}
              appointmentStatus={appointment.status || "pending"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
