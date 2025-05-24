"use server";

import { createClient } from "@/lib/supabase/server";
import { AppointmentInsertDto } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface CreateAppointmentData {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  notes?: string;
  durationMinutes?: number;
}

interface CreateAppointmentResult {
  success: boolean;
  error?: string;
  appointmentId?: number;
}

export async function createAppointment(data: CreateAppointmentData): Promise<CreateAppointmentResult> {
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

    // Get doctor's consultation fee
    const { data: doctor, error: doctorError } = await supabase
      .from("doctors")
      .select("consultation_fee, is_available")
      .eq("id", data.doctorId)
      .single();

    if (doctorError) {
      return {
        success: false,
        error: "Doctor not found",
      };
    }

    if (!doctor.is_available) {
      return {
        success: false,
        error: "Doctor is not available for appointments",
      };
    }

    // Check if slot is still available
    const { data: existingAppointments, error: checkError } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", data.doctorId)
      .eq("appointment_date", data.appointmentDate)
      .eq("appointment_time", data.appointmentTime)
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
        error: "This appointment slot is no longer available",
      };
    }

    // Create appointment
    const appointmentData: AppointmentInsertDto = {
      patient_id: user.id,
      doctor_id: data.doctorId,
      appointment_date: data.appointmentDate,
      appointment_time: data.appointmentTime,
      reason: data.reason,
      notes: data.notes,
      duration_minutes: data.durationMinutes || 30,
      consultation_fee: doctor.consultation_fee || 100,
      status: "pending",
    };

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert(appointmentData)
      .select("id")
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Create notification for doctor
    await supabase
      .from("notifications")
      .insert({
        user_id: data.doctorId,
        type: "appointment_confirmed",
        title: "New Appointment Request",
        message: `You have a new appointment request for ${data.appointmentDate} at ${data.appointmentTime}`,
        data: {
          appointment_id: appointment.id,
          patient_id: user.id,
        },
      });

    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return {
      success: true,
      appointmentId: appointment.id,
    };
  } catch (error) {
    console.error("Create appointment error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating appointment",
    };
  }
} 