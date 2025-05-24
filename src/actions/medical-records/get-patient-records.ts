"use server";

import { createClient } from "@/lib/supabase/server";
import { MedicalRecord } from "@/types/custom.types";

interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface GetPatientMedicalRecordsResult {
  success: boolean;
  error?: string;
  data?: (MedicalRecord & {
    doctors: {
      user_profiles: {
        full_name: string;
      };
      specialization?: string | null;
    };
    appointments: {
      appointment_date: string;
      appointment_time: string;
    };
  })[];
  total?: number;
}

export async function getPatientMedicalRecords(
  patientId: string,
  pagination: PaginationParams = {}
): Promise<GetPatientMedicalRecordsResult> {
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

    // Check if user has permission to view these records
    if (user.id !== patientId) {
      // Check if user is a doctor who has treated this patient
      const { data: appointments, error: appointmentError } = await supabase
        .from("appointments")
        .select("id")
        .eq("doctor_id", user.id)
        .eq("patient_id", patientId)
        .eq("status", "completed");

      if (appointmentError || !appointments || appointments.length === 0) {
        return {
          success: false,
          error: "You don't have permission to view these medical records",
        };
      }
    }

    const limit = pagination.limit || 20;
    const offset = pagination.offset || 0;

    // Get medical records
    const { data, error, count } = await supabase
      .from("medical_records")
      .select(`
        *,
        doctors (
          user_profiles (
            full_name
          ),
          specialization
        ),
        appointments (
          appointment_date,
          appointment_time
        )
      `, { count: "exact" })
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
      total: count || 0,
    };
  } catch (error) {
    console.error("Get patient medical records error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching medical records",
    };
  }
} 