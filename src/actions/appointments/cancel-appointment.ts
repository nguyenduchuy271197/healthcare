"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface CancelAppointmentResult {
  success: boolean;
  error?: string;
}

export async function cancelAppointment(
  appointmentId: number,
  reason: string
): Promise<CancelAppointmentResult> {
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

    // Check if user has permission to cancel
    if (appointment.patient_id !== user.id && appointment.doctor_id !== user.id) {
      return {
        success: false,
        error: "You don't have permission to cancel this appointment",
      };
    }

    // Check if appointment can be cancelled
    if (appointment.status === "cancelled" || appointment.status === "completed") {
      return {
        success: false,
        error: "This appointment cannot be cancelled",
      };
    }

    // Cancel appointment
    const { error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", appointmentId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Create notification for the other party
    const notificationUserId = appointment.patient_id === user.id 
      ? appointment.doctor_id 
      : appointment.patient_id;

    await supabase
      .from("notifications")
      .insert({
        user_id: notificationUserId,
        type: "appointment_cancelled",
        title: "Appointment Cancelled",
        message: `Your appointment on ${appointment.appointment_date} at ${appointment.appointment_time} has been cancelled.`,
        data: {
          appointment_id: appointmentId,
          cancellation_reason: reason,
        },
      });

    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while cancelling appointment",
    };
  }
} 