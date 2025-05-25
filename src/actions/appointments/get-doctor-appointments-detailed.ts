"use server";

import { createClient } from "@/lib/supabase/server";
import { AppointmentStatus, AppointmentWithPatient } from "@/types/custom.types";

interface GetDoctorAppointmentsDetailedResult {
  success: boolean;
  error?: string;
  data?: AppointmentWithPatient[];
}

export async function getDoctorAppointmentsDetailed(
  doctorId?: string,
  status?: AppointmentStatus,
  date?: string
): Promise<GetDoctorAppointmentsDetailedResult> {
  try {
    const supabase = createClient();

    let targetDoctorId = doctorId;

    // If no doctorId provided, get current user
    if (!targetDoctorId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      targetDoctorId = user.id;
    }

    let query = supabase
      .from("appointments")
      .select(`
        *,
        patients (
          user_profiles (
            full_name,
            avatar_url,
            phone,
            date_of_birth
          )
        ),
        doctors (
          user_profiles (
            full_name
          ),
          clinic_address,
          license_number,
          specialization
        ),
        medical_records (
          id,
          diagnosis,
          symptoms,
          treatment_plan,
          notes,
          created_at,
          prescriptions (
            id,
            status,
            total_amount,
            instructions,
            valid_until,
            dispensed_at,
            created_at,
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
          )
        ),
        payments (
          id,
          amount,
          status,
          invoice_url,
          created_at
        )
      `)
      .eq("doctor_id", targetDoctorId);

    if (status) {
      query = query.eq("status", status);
    }

    if (date) {
      query = query.eq("appointment_date", date);
    }

    query = query.order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as unknown as AppointmentWithPatient[],
    };
  } catch (error) {
    console.error("Get doctor appointments detailed error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching detailed appointments",
    };
  }
} 