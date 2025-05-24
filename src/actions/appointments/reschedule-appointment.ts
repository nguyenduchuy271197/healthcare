"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@/types/custom.types";

interface RescheduleAppointmentData {
  newDate: string;
  newTime: string;
  reason?: string;
}

interface RescheduleAppointmentResult {
  success: boolean;
  error?: string;
}

export async function rescheduleAppointment(
  appointmentId: number,
  rescheduleData: RescheduleAppointmentData
): Promise<RescheduleAppointmentResult> {
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

    // Check if user has permission to reschedule
    if (appointment.patient_id !== user.id && appointment.doctor_id !== user.id) {
      return {
        success: false,
        error: "You don't have permission to reschedule this appointment",
      };
    }

    // Check if appointment can be rescheduled
    if (appointment.status === "completed" || appointment.status === "cancelled") {
      return {
        success: false,
        error: "Cannot reschedule completed or cancelled appointments",
      };
    }

    // Check if new slot is available
    const { data: conflictingAppointments, error: conflictError } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", appointment.doctor_id)
      .eq("appointment_date", rescheduleData.newDate)
      .eq("appointment_time", rescheduleData.newTime)
      .in("status", ["pending", "confirmed"])
      .neq("id", appointmentId);

    if (conflictError) {
      return {
        success: false,
        error: conflictError.message,
      };
    }

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      return {
        success: false,
        error: "The requested time slot is not available",
      };
    }

    // Validate new date is in the future
    const newDateTime = new Date(`${rescheduleData.newDate} ${rescheduleData.newTime}`);
    const now = new Date();

    if (newDateTime <= now) {
      return {
        success: false,
        error: "Cannot reschedule to a past date/time",
      };
    }

    // Update appointment
    const { error } = await supabase
      .from("appointments")
      .update({
        appointment_date: rescheduleData.newDate,
        appointment_time: rescheduleData.newTime,
        status: "confirmed",
        reminder_sent: false, // Reset reminder flag
      })
      .eq("id", appointmentId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Create notifications for both parties
    const notifications = [
      {
        user_id: appointment.patient_id,
        type: "appointment_confirmed" as NotificationType,
        title: "Appointment Rescheduled",
        message: `Your appointment has been rescheduled to ${rescheduleData.newDate} at ${rescheduleData.newTime}`,
        data: {
          appointment_id: appointmentId,
          old_date: appointment.appointment_date,
          old_time: appointment.appointment_time,
          new_date: rescheduleData.newDate,
          new_time: rescheduleData.newTime,
          reason: rescheduleData.reason,
        },
      },
      {
        user_id: appointment.doctor_id,
        type: "appointment_confirmed" as NotificationType,
        title: "Appointment Rescheduled",
        message: `An appointment has been rescheduled to ${rescheduleData.newDate} at ${rescheduleData.newTime}`,
        data: {
          appointment_id: appointmentId,
          old_date: appointment.appointment_date,
          old_time: appointment.appointment_time,
          new_date: rescheduleData.newDate,
          new_time: rescheduleData.newTime,
          reason: rescheduleData.reason,
        },
      },
    ];

    await supabase
      .from("notifications")
      .insert(notifications);

    revalidatePath("/appointments");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Reschedule appointment error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while rescheduling appointment",
    };
  }
} 