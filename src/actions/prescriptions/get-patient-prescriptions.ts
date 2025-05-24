"use server";

import { createClient } from "@/lib/supabase/server";
import { Prescription, PrescriptionStatus } from "@/types/custom.types";

interface GetPatientPrescriptionsResult {
  success: boolean;
  error?: string;
  data?: (Prescription & {
    doctors: {
      user_profiles: {
        full_name: string;
      };
      specialization?: string | null;
    };
    medical_records: {
      diagnosis: string;
      created_at: string | null;
    };
  })[];
}

export async function getPatientPrescriptions(
  patientId?: string,
  status?: PrescriptionStatus
): Promise<GetPatientPrescriptionsResult> {
  try {
    const supabase = createClient();

    let targetPatientId = patientId;

    // If no patientId provided, get current user
    if (!targetPatientId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      targetPatientId = user.id;
    }

    let query = supabase
      .from("prescriptions")
      .select(`
        *,
        doctors (
          user_profiles (
            full_name
          ),
          specialization
        ),
        medical_records (
          diagnosis,
          created_at
        )
      `)
      .eq("patient_id", targetPatientId);

    if (status) {
      query = query.eq("status", status);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Get patient prescriptions error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching patient prescriptions",
    };
  }
} 