"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface RejectAppointmentResult {
  success: boolean;
  error?: string;
}

export async function rejectAppointment(
  appointmentId: number,
  reason: string
): Promise<RejectAppointmentResult> {
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

    if (!reason || reason.trim().length === 0) {
      return {
        success: false,
        error: "Rejection reason is required",
      };
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("doctor_id, patient_id, status, appointment_date, appointment_time")
      .eq("id", appointmentId)
      .single();

    if (appointmentError) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }

    // Check if user is the doctor for this appointment
    if (appointment.doctor_id !== user.id) {
      return {
        success: false,
        error: "You can only reject your own appointments",
      };
    }

    // Check if appointment is in pending status
    if (appointment.status !== "pending") {
      return {
        success: false,
        error: "Only pending appointments can be rejected",
      };
    }

    // Update appointment status to rejected
    const { error } = await supabase
      .from("appointments")
      .update({
        status: "rejected",
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

    // Create notification for patient
    await supabase
      .from("notifications")
      .insert({
        user_id: appointment.patient_id,
        type: "appointment_cancelled",
        title: "Appointment Rejected",
        message: `Your appointment on ${appointment.appointment_date} at ${appointment.appointment_time} has been rejected. Reason: ${reason}`,
        data: {
          appointment_id: appointmentId,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          rejection_reason: reason,
        },
      });

    revalidatePath("/appointments");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Reject appointment error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while rejecting appointment",
    };
  }
} 