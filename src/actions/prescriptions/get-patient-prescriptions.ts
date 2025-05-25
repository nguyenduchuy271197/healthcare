"use server";

import { createClient } from "@/lib/supabase/server";
import { PrescriptionStatus, PrescriptionWithDoctorAndItems } from "@/types/custom.types";

interface GetPatientPrescriptionsResult {
  success: boolean;
  error?: string;
  data?: PrescriptionWithDoctorAndItems[];
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
        ),
        prescription_items (
          id,
          medication_name,
          dosage,
          frequency,
          duration,
          quantity,
          unit_price,
          instructions
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
      data: data as PrescriptionWithDoctorAndItems[],
    };
  } catch (error) {
    console.error("Get patient prescriptions error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching patient prescriptions",
    };
  }
} 