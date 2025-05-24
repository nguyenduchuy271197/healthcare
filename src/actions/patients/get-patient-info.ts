"use server";

import { createClient } from "@/lib/supabase/server";
import { Patient } from "@/types/custom.types";

interface GetPatientInfoResult {
  success: boolean;
  error?: string;
  data?: Patient & {
    user_profiles: {
      full_name: string;
      email?: string | null;
      phone?: string | null;
      date_of_birth?: string | null;
      gender?: string | null;
      avatar_url?: string | null;
      address?: string | null;
    };
    appointments_count: number;
    last_appointment?: {
      appointment_date: string;
      appointment_time: string;
      status: string | null;
    };
  };
}

export async function getPatientInfo(patientId: string): Promise<GetPatientInfoResult> {
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

    // Check if current user is a doctor who has treated this patient
    const { data: appointments, error: appointmentError } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", user.id)
      .eq("patient_id", patientId);

    if (appointmentError || !appointments || appointments.length === 0) {
      return {
        success: false,
        error: "You don't have permission to view this patient's information",
      };
    }

    // Get patient information with profile
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select(`
        *,
        user_profiles (
          full_name,
          phone,
          date_of_birth,
          gender,
          avatar_url,
          address
        )
      `)
      .eq("id", patientId)
      .single();

    if (patientError) {
      return {
        success: false,
        error: "Patient not found",
      };
    }

    // Get appointment count
    const { count: appointmentsCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .eq("doctor_id", user.id);

    // Get last appointment
    const { data: lastAppointment } = await supabase
      .from("appointments")
      .select("appointment_date, appointment_time, status")
      .eq("patient_id", patientId)
      .eq("doctor_id", user.id)
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: false })
      .limit(1)
      .single();

    return {
      success: true,
      data: {
        ...patient,
        appointments_count: appointmentsCount || 0,
        last_appointment: lastAppointment || undefined,
      },
    };
  } catch (error) {
    console.error("Get patient info error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching patient information",
    };
  }
} 