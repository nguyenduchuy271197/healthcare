"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "lucide-react";
import { AppointmentStatus } from "@/types/custom.types";
import { AppointmentWithDoctor } from "./types";

interface AppointmentDetailsDialogProps {
  appointment: AppointmentWithDoctor | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentDetailsDialog({
  appointment,
  isOpen,
  onClose,
}: AppointmentDetailsDialogProps) {
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

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
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
              <h3 className="font-semibold">
                {appointment.doctors.user_profiles.full_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {appointment.doctors.specialization || "Bác sĩ đa khoa"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ngày:</span>
              <span className="text-sm">
                {formatDate(appointment.appointment_date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Giờ:</span>
              <span className="text-sm">
                {formatTime(appointment.appointment_time)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Trạng thái:</span>
              {getStatusBadge(appointment.status || "pending")}
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phí khám:</span>
              <span className="text-sm">
                {appointment.consultation_fee?.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
            {appointment.doctors.user_profiles.phone && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Điện thoại:
                </span>
                <span className="text-sm">
                  {appointment.doctors.user_profiles.phone}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Lý do khám:</Label>
            <p className="text-sm bg-muted p-2 rounded">{appointment.reason}</p>
          </div>

          {appointment.notes && (
            <div className="space-y-2">
              <Label>Ghi chú:</Label>
              <p className="text-sm bg-muted p-2 rounded">
                {appointment.notes}
              </p>
            </div>
          )}

          {appointment.doctors.clinic_address && (
            <div className="space-y-2">
              <Label>Địa chỉ phòng khám:</Label>
              <p className="text-sm bg-muted p-2 rounded">
                {appointment.doctors.clinic_address}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
