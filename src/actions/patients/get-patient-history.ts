"use server";

import { createClient } from "@/lib/supabase/server";

interface GetPatientHistoryResult {
  success: boolean;
  error?: string;
  data?: {
    patient_info: {
      id: string;
      user_profiles: {
        full_name: string;
        date_of_birth?: string | null;
        gender?: string | null;
        phone?: string | null;
      };
      emergency_contact_name?: string | null;
      emergency_contact_phone?: string | null;
      insurance_number?: string | null;
      insurance_provider?: string | null;
    };
    medical_records: {
      id: number;
      diagnosis: string;
      symptoms?: string | null;
      treatment_plan?: string | null;
      notes?: string | null;
      created_at: string | null;
      doctors: {
        user_profiles: {
          full_name: string;
        };
        specialization?: string | null;
      };
    }[];
    prescriptions: {
      id: number;
      status: string | null;
      created_at: string | null;
      doctors: {
        user_profiles: {
          full_name: string;
        };
      };
      prescription_items: {
        medication_name: string;
        dosage: string;
        frequency: string;
        duration: string;
        quantity: number;
      }[];
    }[];
    appointments: {
      id: number;
      appointment_date: string;
      appointment_time: string;
      status: string | null;
      reason: string;
      doctors: {
        user_profiles: {
          full_name: string;
        };
        specialization?: string | null;
      };
    }[];
  };
}

export async function getPatientMedicalHistory(patientId: string): Promise<GetPatientHistoryResult> {
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
    const { data: doctorAppointments, error: appointmentError } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", user.id)
      .eq("patient_id", patientId);

    if (appointmentError || !doctorAppointments || doctorAppointments.length === 0) {
      return {
        success: false,
        error: "You don't have permission to view this patient's history",
      };
    }

    // Get patient basic info
    const { data: patientInfo, error: patientError } = await supabase
      .from("patients")
      .select(`
        id,
        emergency_contact_name,
        emergency_contact_phone,
        insurance_number,
        insurance_provider,
        user_profiles (
          full_name,
          date_of_birth,
          gender,
          phone
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

    // Get medical records
    const { data: medicalRecords } = await supabase
      .from("medical_records")
      .select(`
        id,
        diagnosis,
        symptoms,
        treatment_plan,
        notes,
        created_at,
        doctors (
          user_profiles (
            full_name
          ),
          specialization
        )
      `)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    // Get prescriptions
    const { data: prescriptions } = await supabase
      .from("prescriptions")
      .select(`
        id,
        status,
        created_at,
        doctors (
          user_profiles (
            full_name
          )
        ),
        prescription_items (
          medication_name,
          dosage,
          frequency,
          duration,
          quantity
        )
      `)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    // Get appointment history
    const { data: appointments } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        reason,
        doctors (
          user_profiles (
            full_name
          ),
          specialization
        )
      `)
      .eq("patient_id", patientId)
      .order("appointment_date", { ascending: false });

    return {
      success: true,
      data: {
        patient_info: patientInfo,
        medical_records: medicalRecords || [],
        prescriptions: prescriptions || [],
        appointments: appointments || [],
      },
    };
  } catch (error) {
    console.error("Get patient medical history error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching patient history",
    };
  }
} 