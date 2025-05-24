"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface SendAppointmentReminderResult {
  success: boolean;
  error?: string;
}

export async function sendAppointmentReminder(appointmentId: number): Promise<SendAppointmentReminderResult> {
  try {
    const supabase = createClient();

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(`
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        status,
        reminder_sent,
        doctors (
          user_profiles (
            full_name
          ),
          clinic_address
        )
      `)
      .eq("id", appointmentId)
      .single();

    if (appointmentError) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }

    if (appointment.status !== "confirmed") {
      return {
        success: false,
        error: "Can only send reminders for confirmed appointments",
      };
    }

    if (appointment.reminder_sent) {
      return {
        success: false,
        error: "Reminder already sent for this appointment",
      };
    }

    // Check if appointment is in the future
    const appointmentDateTime = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`);
    const now = new Date();
    
    if (appointmentDateTime <= now) {
      return {
        success: false,
        error: "Cannot send reminder for past appointments",
      };
    }

    const doctor = appointment.doctors as {
      user_profiles: { full_name: string };
      clinic_address?: string;
    };

    // Create notification for patient
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: appointment.patient_id,
        type: "appointment_reminder",
        title: "Appointment Reminder",
        message: `Don't forget your appointment with Dr. ${doctor.user_profiles.full_name} tomorrow at ${appointment.appointment_time}`,
        data: {
          appointment_id: appointmentId,
          doctor_name: doctor.user_profiles.full_name,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          clinic_address: doctor.clinic_address,
        },
      });

    if (notificationError) {
      return {
        success: false,
        error: notificationError.message,
      };
    }

    // Mark reminder as sent
    await supabase
      .from("appointments")
      .update({ reminder_sent: true })
      .eq("id", appointmentId);

    revalidatePath("/appointments");
    revalidatePath("/notifications");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Send appointment reminder error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while sending reminder",
    };
  }
} 