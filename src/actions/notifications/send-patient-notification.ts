"use server";

import { createClient } from "@/lib/supabase/server";
import { NotificationInsertDto, NotificationType } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

interface SendPatientNotificationResult {
  success: boolean;
  error?: string;
  notificationId?: number;
}

export async function sendPatientNotification(
  patientId: string,
  notificationData: NotificationData
): Promise<SendPatientNotificationResult> {
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

    // Verify current user is a doctor
    const { data: doctor, error: doctorError } = await supabase
      .from("doctors")
      .select(`
        id,
        user_profiles (
          full_name
        )
      `)
      .eq("id", user.id)
      .single();

    if (doctorError) {
      return {
        success: false,
        error: "Only doctors can send patient notifications",
      };
    }

    // Check if doctor has treated this patient
    const { data: appointments, error: appointmentError } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", user.id)
      .eq("patient_id", patientId);

    if (appointmentError || !appointments || appointments.length === 0) {
      return {
        success: false,
        error: "You can only send notifications to patients you have treated",
      };
    }

    // Validate notification data
    if (!notificationData.title || !notificationData.message) {
      return {
        success: false,
        error: "Title and message are required",
      };
    }

    // Check if target patient exists
    const {  error: patientError } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .single();

    if (patientError) {
      return {
        success: false,
        error: "Patient not found",
      };
    }

    // Create notification
    const notification: NotificationInsertDto = {
      user_id: patientId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: JSON.parse(JSON.stringify({
        ...notificationData.data,
        sent_by_doctor: user.id,
        sent_by_doctor_name: (doctor as { user_profiles?: { full_name?: string } }).user_profiles?.full_name || "Doctor",
      })),
      is_read: false,
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select("id")
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/notifications");

    return {
      success: true,
      notificationId: data.id,
    };
  } catch (error) {
    console.error("Send patient notification error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while sending notification",
    };
  }
} 