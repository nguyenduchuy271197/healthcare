"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@/types/custom.types";

interface FollowupData {
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  durationMinutes?: number;
}

interface ScheduleFollowupResult {
  success: boolean;
  error?: string;
  appointmentId?: number;
}

export async function scheduleFollowup(
  medicalRecordId: number,
  followupData: FollowupData
): Promise<ScheduleFollowupResult> {
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

    // Get medical record details
    const { data: medicalRecord, error: recordError } = await supabase
      .from("medical_records")
      .select("doctor_id, patient_id, follow_up_required")
      .eq("id", medicalRecordId)
      .single();

    if (recordError) {
      return {
        success: false,
        error: "Medical record not found",
      };
    }

    if (medicalRecord.doctor_id !== user.id) {
      return {
        success: false,
        error: "You can only schedule follow-ups for your own medical records",
      };
    }

    if (!medicalRecord.follow_up_required) {
      return {
        success: false,
        error: "Follow-up is not required for this medical record",
      };
    }

    // Get doctor's consultation fee
    const { data: doctor, error: doctorError } = await supabase
      .from("doctors")
      .select("consultation_fee")
      .eq("id", user.id)
      .single();

    if (doctorError) {
      return {
        success: false,
        error: "Doctor information not found",
      };
    }

    // Check if slot is available
    const { data: existingAppointments, error: checkError } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", user.id)
      .eq("appointment_date", followupData.appointmentDate)
      .eq("appointment_time", followupData.appointmentTime)
      .in("status", ["pending", "confirmed"]);

    if (checkError) {
      return {
        success: false,
        error: checkError.message,
      };
    }

    if (existingAppointments && existingAppointments.length > 0) {
      return {
        success: false,
        error: "This appointment slot is not available",
      };
    }

    // Create follow-up appointment
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: medicalRecord.patient_id,
        doctor_id: user.id,
        appointment_date: followupData.appointmentDate,
        appointment_time: followupData.appointmentTime,
        reason: "Follow-up appointment",
        notes: followupData.notes,
        duration_minutes: followupData.durationMinutes || 30,
        consultation_fee: doctor.consultation_fee || 100,
        status: "confirmed",
      })
      .select("id")
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Update medical record to mark follow-up as scheduled
    await supabase
      .from("medical_records")
      .update({
        follow_up_date: followupData.appointmentDate,
      })
      .eq("id", medicalRecordId);

    // Create notification for patient
    await supabase
      .from("notifications")
      .insert({
        user_id: medicalRecord.patient_id,
        type: "appointment_confirmed" as NotificationType,
        title: "Follow-up Appointment Scheduled",
        message: `Your follow-up appointment has been scheduled for ${followupData.appointmentDate} at ${followupData.appointmentTime}`,
        data: {
          appointment_id: appointment.id,
          medical_record_id: medicalRecordId,
        },
      });

    revalidatePath("/appointments");
    revalidatePath("/medical-records");

    return {
      success: true,
      appointmentId: appointment.id,
    };
  } catch (error) {
    console.error("Schedule follow-up error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while scheduling follow-up",
    };
  }
} 