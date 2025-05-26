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
  Stethoscope,
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
      pending: {
        variant: "secondary" as const,
        label: "Chờ xác nhận",
        className: "bg-amber-100 text-amber-800 border-amber-200",
      },
      confirmed: {
        variant: "default" as const,
        label: "Đã xác nhận",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      completed: {
        variant: "outline" as const,
        label: "Hoàn thành",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      cancelled: {
        variant: "destructive" as const,
        label: "Đã hủy",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      rejected: {
        variant: "destructive" as const,
        label: "Bị từ chối",
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge
        variant={config.variant}
        className={`${config.className} font-medium px-3 py-1`}
      >
        {config.label}
      </Badge>
    );
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

  function getStatusColor(status: AppointmentStatus) {
    const colors = {
      pending: "border-l-amber-400",
      confirmed: "border-l-blue-400",
      completed: "border-l-green-400",
      cancelled: "border-l-red-400",
      rejected: "border-l-red-400",
    };
    return colors[status] || colors.pending;
  }

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-300 border-l-4 ${getStatusColor(
        appointment.status || "pending"
      )} bg-gradient-to-r from-white to-gray-50/30`}
    >
      <CardContent className="p-6">
        <div className="space-y-5">
          {/* Doctor Info Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-14 w-14 ring-2 ring-white shadow-md">
                  <AvatarImage
                    src={appointment.doctors.user_profiles.avatar_url || ""}
                    alt={appointment.doctors.user_profiles.full_name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <User className="h-7 w-7" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                  <Stethoscope className="h-3 w-3 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-xl text-gray-900">
                  {appointment.doctors.user_profiles.full_name}
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  {appointment.doctors.specialization || "Bác sĩ đa khoa"}
                </p>
              </div>
            </div>
            {getStatusBadge(appointment.status || "pending")}
          </div>

          {/* Appointment Details Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 rounded-full p-2">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                    Ngày khám
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(appointment.appointment_date)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-500 rounded-full p-2">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                    Giờ khám
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatTime(appointment.appointment_time)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500 rounded-full p-2">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                    Phí khám
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {appointment.consultation_fee?.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
              </div>
            </div>

            {appointment.doctors.clinic_address && (
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-500 rounded-full p-2">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                      Địa chỉ
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {appointment.doctors.clinic_address}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reason Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold text-gray-700">Lý do khám:</span>{" "}
                <span className="text-gray-900">{appointment.reason}</span>
              </p>
              {appointment.notes && (
                <p className="text-sm">
                  <span className="font-semibold text-gray-700">Ghi chú:</span>{" "}
                  <span className="text-gray-900">{appointment.notes}</span>
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(appointment)}
                className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
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
                    className="hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReschedule(appointment)}
                    className="hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Thay đổi lịch
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCancel(appointment)}
                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Hủy
                  </Button>
                </>
              )}
            </div>

            {/* Review Button */}
            <div className="ml-auto">
              <ReviewButton
                appointmentId={appointment.id}
                doctorName={appointment.doctors.user_profiles.full_name}
                appointmentStatus={appointment.status || "pending"}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
