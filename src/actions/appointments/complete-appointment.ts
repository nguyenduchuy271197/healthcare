"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface CompleteAppointmentResult {
  success: boolean;
  error?: string;
}

export async function completeAppointment(appointmentId: number): Promise<CompleteAppointmentResult> {
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
        error: "You can only complete your own appointments",
      };
    }

    // Check if appointment is in confirmed status
    if (appointment.status !== "confirmed") {
      return {
        success: false,
        error: "Only confirmed appointments can be completed",
      };
    }

    // Update appointment status to completed
    const { error } = await supabase
      .from("appointments")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
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
        type: "appointment_confirmed",
        title: "Appointment Completed",
        message: `Your appointment on ${appointment.appointment_date} at ${appointment.appointment_time} has been completed. You can now leave a review.`,
        data: {
          appointment_id: appointmentId,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          can_review: true,
        },
      });

    revalidatePath("/appointments");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Complete appointment error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while completing appointment",
    };
  }
} 