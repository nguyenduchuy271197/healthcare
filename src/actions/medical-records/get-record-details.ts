"use server";

import { createClient } from "@/lib/supabase/server";
import { MedicalRecord } from "@/types/custom.types";

interface GetMedicalRecordDetailsResult {
  success: boolean;
  error?: string;
  data?: MedicalRecord & {
    doctors: {
      user_profiles: {
        full_name: string;
      };
      specialization?: string | null;
      license_number?: string | null;
    };
    appointments: {
      appointment_date: string;
      appointment_time: string;
      reason: string;
    };
    prescriptions?: {
      id: number;
      status: string | null;
      created_at: string | null;
      prescription_items: {
        medication_name: string;
        dosage: string;
        frequency: string;
        duration: string;
        quantity: number;
      }[];
    }[];
  };
}

export async function getMedicalRecordDetails(recordId: number): Promise<GetMedicalRecordDetailsResult> {
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

    // Get medical record with related data
    const { data: record, error } = await supabase
      .from("medical_records")
      .select(`
        *,
        doctors (
          user_profiles (
            full_name
          ),
          specialization,
          license_number
        ),
        appointments (
          appointment_date,
          appointment_time,
          reason
        ),
        prescriptions (
          id,
          status,
          created_at,
          prescription_items (
            medication_name,
            dosage,
            frequency,
            duration,
            quantity
          )
        )
      `)
      .eq("id", recordId)
      .single();

    if (error) {
      return {
        success: false,
        error: "Medical record not found",
      };
    }

    // Check if user has permission to view this record
    const isPatient = record.patient_id === user.id;
    const isDoctor = record.doctor_id === user.id;

    if (!isPatient && !isDoctor) {
      // Check if current user is a doctor who has treated this patient
      const { data: appointments } = await supabase
        .from("appointments")
        .select("id")
        .eq("doctor_id", user.id)
        .eq("patient_id", record.patient_id);

      if (!appointments || appointments.length === 0) {
        return {
          success: false,
          error: "You don't have permission to view this medical record",
        };
      }
    }

    return {
      success: true,
      data: record,
    };
  } catch (error) {
    console.error("Get medical record details error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching medical record details",
    };
  }
} 