"use server";

import { createClient } from "@/lib/supabase/server";
import { Appointment } from "@/types/custom.types";

interface GetPatientAppointmentHistoryResult {
  success: boolean;
  error?: string;
  data?: (Appointment & {
    doctors: {
      user_profiles: {
        full_name: string;
      };
      specialization?: string | null;
      clinic_address?: string | null;
    };
    medical_records?: {
      id: number;
      diagnosis: string;
      created_at: string | null;
    }[];
    payments?: {
      id: number;
      amount: number;
      status: string | null;
      payment_method: string;
    }[];
  })[];
  total?: number;
}

export async function getPatientAppointmentHistory(
  patientId: string,
  doctorId: string
): Promise<GetPatientAppointmentHistoryResult> {
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

    // Check if current user is the doctor or the patient
    if (user.id !== doctorId && user.id !== patientId) {
      return {
        success: false,
        error: "You don't have permission to view this appointment history",
      };
    }

    // Get appointment history between specific patient and doctor
    const { data: appointments, error, count } = await supabase
      .from("appointments")
      .select(`
        *,
        doctors (
          user_profiles (
            full_name
          ),
          specialization,
          clinic_address
        ),
        medical_records (
          id,
          diagnosis,
          created_at
        ),
        payments (
          id,
          amount,
          status,
          payment_method
        )
      `, { count: "exact" })
      .eq("patient_id", patientId)
      .eq("doctor_id", doctorId)
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: appointments || [],
      total: count || 0,
    };
  } catch (error) {
    console.error("Get patient appointment history error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching appointment history",
    };
  }
} 