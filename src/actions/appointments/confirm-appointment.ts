"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ConfirmAppointmentResult {
  success: boolean;
  error?: string;
}

export async function confirmAppointment(appointmentId: number): Promise<ConfirmAppointmentResult> {
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
        error: "You can only confirm your own appointments",
      };
    }

    // Check if appointment is in pending status
    if (appointment.status !== "pending") {
      return {
        success: false,
        error: "Only pending appointments can be confirmed",
      };
    }

    // Update appointment status to confirmed
    const { error } = await supabase
      .from("appointments")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
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
        title: "Appointment Confirmed",
        message: `Your appointment on ${appointment.appointment_date} at ${appointment.appointment_time} has been confirmed by the doctor.`,
        data: {
          appointment_id: appointmentId,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
        },
      });

    revalidatePath("/appointments");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Confirm appointment error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while confirming appointment",
    };
  }
} 