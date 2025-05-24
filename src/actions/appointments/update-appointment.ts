"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface AppointmentUpdate {
  reason?: string;
  notes?: string;
  durationMinutes?: number;
  specialInstructions?: string;
}

interface UpdateAppointmentResult {
  success: boolean;
  error?: string;
}

export async function updateAppointment(
  appointmentId: number,
  updateData: AppointmentUpdate
): Promise<UpdateAppointmentResult> {
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

    // Get appointment details and verify ownership
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

    // Check if user has permission to update this appointment
    // Allow both doctor and patient to update appointment details
    if (appointment.doctor_id !== user.id && appointment.patient_id !== user.id) {
      return {
        success: false,
        error: "You don't have permission to update this appointment",
      };
    }

    // Don't allow updates to completed or cancelled appointments
    if (appointment.status === "completed" || appointment.status === "cancelled") {
      return {
        success: false,
        error: "Cannot update completed or cancelled appointments",
      };
    }

    // Prepare update data - only include fields that are provided
    const updateFields: Record<string, string | number> = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.reason !== undefined) {
      updateFields.reason = updateData.reason;
    }

    if (updateData.notes !== undefined) {
      updateFields.notes = updateData.notes;
    }

    if (updateData.durationMinutes !== undefined) {
      // Validate duration
      if (updateData.durationMinutes < 15 || updateData.durationMinutes > 180) {
        return {
          success: false,
          error: "Duration must be between 15 and 180 minutes",
        };
      }
      updateFields.duration_minutes = updateData.durationMinutes;
    }

    if (updateData.specialInstructions !== undefined) {
      updateFields.special_instructions = updateData.specialInstructions;
    }

    // If no fields to update
    if (Object.keys(updateFields).length <= 1) { // Only updated_at
      return {
        success: false,
        error: "No valid fields provided for update",
      };
    }

    // Update appointment
    const { error } = await supabase
      .from("appointments")
      .update(updateFields)
      .eq("id", appointmentId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Create notification for the other party
    const notificationUserId = user.id === appointment.doctor_id 
      ? appointment.patient_id 
      : appointment.doctor_id;

    const userRole = user.id === appointment.doctor_id ? "doctor" : "patient";
    
    await supabase
      .from("notifications")
      .insert({
        user_id: notificationUserId,
        type: "appointment_confirmed",
        title: "Appointment Updated",
        message: `Your appointment on ${appointment.appointment_date} at ${appointment.appointment_time} has been updated by the ${userRole}.`,
        data: {
          appointment_id: appointmentId,
          updated_by: userRole,
          updated_fields: Object.keys(updateData),
        },
      });

    revalidatePath("/appointments");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update appointment error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating appointment",
    };
  }
} 