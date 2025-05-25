"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Appointment } from "@/types/custom.types";
import { getPatientAppointments } from "@/actions";
import { AppointmentRescheduleForm } from "./appointment-reschedule-form";
import { AppointmentDetailsDialog } from "./appointment-details-dialog";
import { AppointmentEditDialog } from "./appointment-edit-dialog";
import { AppointmentCancelDialog } from "./appointment-cancel-dialog";
import { AppointmentFilters } from "./appointment-filters";
import { AppointmentLoading } from "./appointment-loading";
import { AppointmentWithDoctor } from "./types";

export function PatientAppointments() {
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithDoctor | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);

  const { toast } = useToast();

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

  if (isLoading) {
    return <AppointmentLoading />;
  }

  return (
    <div className="space-y-6">
      <AppointmentFilters
        appointments={appointments}
        onViewDetails={handleViewDetails}
        onEdit={handleEditAppointment}
        onCancel={handleCancelAppointment}
        onReschedule={handleRescheduleAppointment}
      />

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
