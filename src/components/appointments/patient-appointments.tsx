"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { Appointment } from "@/types/custom.types";
import { getPatientAppointments } from "@/actions";
import { AppointmentRescheduleForm } from "./appointment-reschedule-form";
import { AppointmentDetailsDialog } from "./appointment-details-dialog";
import { AppointmentEditDialog } from "./appointment-edit-dialog";
import { AppointmentCancelDialog } from "./appointment-cancel-dialog";
import { AppointmentCard } from "./appointment-card";
import { AppointmentLoading } from "./appointment-loading";
import { AppointmentWithDoctor } from "./types";
import { useRouter } from "next/navigation";

export function PatientAppointments() {
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithDoctor | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const { toast } = useToast();
  const router = useRouter();

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPatientAppointments();
      if (result.success && result.data) {
        setAppointments(result.data);
      } else {
        toast({
          title: "Lỗi tải dữ liệu",
          description: result.error || "Không thể tải danh sách lịch hẹn.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi tải dữ liệu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  function handleViewDetails(appointment: AppointmentWithDoctor) {
    setSelectedAppointment(appointment);
    setShowDetailsDialog(true);
  }

  function handleEditAppointment(appointment: AppointmentWithDoctor) {
    setSelectedAppointment(appointment);
    setShowEditDialog(true);
  }

  function handleCancelAppointment(appointment: AppointmentWithDoctor) {
    setSelectedAppointment(appointment);
    setShowCancelDialog(true);
  }

  function handleRescheduleAppointment(appointment: AppointmentWithDoctor) {
    setSelectedAppointment(appointment);
    setShowRescheduleDialog(true);
  }

  function handleDialogSuccess() {
    loadAppointments();
  }

  function filterAppointmentsByStatus(status: string) {
    if (status === "all") return appointments;
    if (status === "upcoming")
      return appointments.filter(
        (apt) => apt.status === "pending" || apt.status === "confirmed"
      );
    return appointments.filter((apt) => apt.status === status);
  }

  function getStatusCounts() {
    return {
      all: appointments.length,
      upcoming: appointments.filter(
        (apt) => apt.status === "pending" || apt.status === "confirmed"
      ).length,
      confirmed: appointments.filter((apt) => apt.status === "confirmed")
        .length,
      completed: appointments.filter((apt) => apt.status === "completed")
        .length,
      cancelled: appointments.filter((apt) => apt.status === "cancelled")
        .length,
    };
  }

  function EmptyState() {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 text-base font-medium">
            {statusFilter === "all" ? "Chưa có lịch hẹn" : "Không có lịch hẹn"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {statusFilter === "all"
              ? "Bạn chưa có lịch hẹn nào. Hãy tìm bác sĩ và đặt lịch khám."
              : `Bạn không có lịch hẹn nào với trạng thái này.`}
          </p>
          {statusFilter === "all" && (
            <Button
              className="mt-3"
              size="sm"
              onClick={() => router.push("/doctors")}
            >
              Tìm bác sĩ
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <AppointmentLoading />;
  }

  const filteredAppointments = filterAppointmentsByStatus(statusFilter);
  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-4">
      {/* Header with Filter */}
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center justify-between w-full">
                  <span>Tất cả</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {statusCounts.all}
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="upcoming">
                <div className="flex items-center justify-between w-full">
                  <span>Sắp tới</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {statusCounts.upcoming}
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="confirmed">
                <div className="flex items-center justify-between w-full">
                  <span>Đã xác nhận</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {statusCounts.confirmed}
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center justify-between w-full">
                  <span>Hoàn thành</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {statusCounts.completed}
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="cancelled">
                <div className="flex items-center justify-between w-full">
                  <span>Đã hủy</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {statusCounts.cancelled}
                  </Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onViewDetails={handleViewDetails}
              onEdit={handleEditAppointment}
              onCancel={handleCancelAppointment}
              onReschedule={handleRescheduleAppointment}
            />
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
      />

      {/* Edit Dialog */}
      <AppointmentEditDialog
        appointment={selectedAppointment}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSuccess={handleDialogSuccess}
      />

      {/* Cancel Dialog */}
      <AppointmentCancelDialog
        appointment={selectedAppointment}
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onSuccess={handleDialogSuccess}
      />

      {/* Reschedule Dialog */}
      {selectedAppointment && (
        <AppointmentRescheduleForm
          appointment={
            selectedAppointment as Appointment & {
              doctors: {
                user_profiles: {
                  full_name: string;
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
          }
          isOpen={showRescheduleDialog}
          onClose={() => setShowRescheduleDialog(false)}
          onSuccess={handleDialogSuccess}
        />
      )}
    </div>
  );
}
