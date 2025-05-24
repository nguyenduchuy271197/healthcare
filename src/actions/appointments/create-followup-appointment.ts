"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface FollowupAppointmentData {
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  notes?: string;
  durationMinutes?: number;
}

interface CreateFollowupAppointmentResult {
  success: boolean;
  error?: string;
  appointmentId?: number;
}

export async function createFollowupAppointment(
  originalAppointmentId: number,
  followupData: FollowupAppointmentData
): Promise<CreateFollowupAppointmentResult> {
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

    // Get original appointment details
    const { data: originalAppointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("doctor_id, patient_id, status, consultation_fee")
      .eq("id", originalAppointmentId)
      .single();

    if (appointmentError) {
      return {
        success: false,
        error: "Original appointment not found",
      };
    }

    // Check if user is the doctor for this appointment
    if (originalAppointment.doctor_id !== user.id) {
      return {
        success: false,
        error: "You can only create follow-ups for your own appointments",
      };
    }

    // Check if original appointment is completed
    if (originalAppointment.status !== "completed") {
      return {
        success: false,
        error: "Follow-up can only be created for completed appointments",
      };
    }

    // Validate follow-up date is in the future
    const followupDateTime = new Date(`${followupData.appointmentDate} ${followupData.appointmentTime}`);
    const now = new Date();

    if (followupDateTime <= now) {
      return {
        success: false,
        error: "Follow-up appointment must be in the future",
      };
    }

    // Check if slot is available
    const { data: conflictingAppointments, error: conflictError } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", user.id)
      .eq("appointment_date", followupData.appointmentDate)
      .eq("appointment_time", followupData.appointmentTime)
      .in("status", ["pending", "confirmed"]);

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

    // Create follow-up appointment
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: originalAppointment.patient_id,
        doctor_id: user.id,
        appointment_date: followupData.appointmentDate,
        appointment_time: followupData.appointmentTime,
        reason: followupData.reason || "Follow-up appointment",
        notes: followupData.notes,
        duration_minutes: followupData.durationMinutes || 30,
        consultation_fee: originalAppointment.consultation_fee,
        status: "confirmed",
        is_followup: true,
        original_appointment_id: originalAppointmentId,
      })
      .select("id")
      .single();

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
        user_id: originalAppointment.patient_id,
        type: "appointment_confirmed",
        title: "Follow-up Appointment Scheduled",
        message: `Your follow-up appointment has been scheduled for ${followupData.appointmentDate} at ${followupData.appointmentTime}`,
        data: {
          appointment_id: appointment.id,
          original_appointment_id: originalAppointmentId,
          appointment_date: followupData.appointmentDate,
          appointment_time: followupData.appointmentTime,
        },
      });

    revalidatePath("/appointments");

    return {
      success: true,
      appointmentId: appointment.id,
    };
  } catch (error) {
    console.error("Create follow-up appointment error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating follow-up appointment",
    };
  }
} 