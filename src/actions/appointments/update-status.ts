"use server";

import { createClient } from "@/lib/supabase/server";
import { AppointmentStatus, NotificationType } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface UpdateAppointmentStatusResult {
  success: boolean;
  error?: string;
}

export async function updateAppointmentStatus(
  appointmentId: number,
  status: AppointmentStatus,
  notes?: string
): Promise<UpdateAppointmentStatusResult> {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("patient_id, doctor_id, status, appointment_date, appointment_time")
      .eq("id", appointmentId)
      .single();

    if (appointmentError) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }

    // Check if user has permission to update status
    if (appointment.doctor_id !== user.id) {
      return {
        success: false,
        error: "Only the doctor can update appointment status",
      };
    }

    // Validate status transition
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      pending: ["confirmed", "cancelled", "rejected"],
      confirmed: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
      rejected: [],
    };

    const currentStatus = appointment.status || "pending";
    if (!validTransitions[currentStatus]?.includes(status)) {
      return {
        success: false,
        error: `Cannot change status from ${currentStatus} to ${status}`,
      };
    }

    // Update appointment status
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", appointmentId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Create notification for patient
    const notificationMessages: Record<AppointmentStatus, string> = {
      pending: "",
      confirmed: `Your appointment on ${appointment.appointment_date} at ${appointment.appointment_time} has been confirmed.`,
      completed: `Your appointment on ${appointment.appointment_date} at ${appointment.appointment_time} has been completed.`,
      cancelled: `Your appointment on ${appointment.appointment_date} at ${appointment.appointment_time} has been cancelled by the doctor.`,
      rejected: `Your appointment on ${appointment.appointment_date} at ${appointment.appointment_time} has been rejected by the doctor.`,
    };

    if (notificationMessages[status]) {
      // Map appointment status to notification type
      const notificationTypeMap: Record<AppointmentStatus, NotificationType | null> = {
        pending: null,
        confirmed: "appointment_confirmed",
        completed: "appointment_confirmed",
        cancelled: "appointment_cancelled",
        rejected: "appointment_cancelled",
      };

      const notificationType = notificationTypeMap[status];
      if (notificationType) {
        await supabase
          .from("notifications")
          .insert({
            user_id: appointment.patient_id,
            type: notificationType,
            title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: notificationMessages[status],
            data: {
              appointment_id: appointmentId,
              status,
            },
          });
      }
    }

    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update appointment status error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating appointment status",
    };
  }
}