"use server";

import { createClient } from "@/lib/supabase/server";
import { Appointment, AppointmentStatus } from "@/types/custom.types";

interface GetPatientAppointmentsResult {
  success: boolean;
  error?: string;
  data?: (Appointment & {
    doctors: {
      user_profiles: {
        full_name: string;
        avatar_url?: string | null;
        phone?: string | null;
      };
      specialization?: string | null;
      clinic_address?: string | null;
      consultation_fee?: number | null;
      doctor_schedules: {
        id: number;
        day_of_week: number;
        start_time: string;
        end_time: string;
        slot_duration_minutes: number | null;
        is_active: boolean | null;
      }[];
    };
  })[];
}

export async function getPatientAppointments(
  patientId?: string,
  status?: AppointmentStatus
): Promise<GetPatientAppointmentsResult> {
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
      .from("appointments")
      .select(`
        *,
        doctors (
          user_profiles (
            full_name,
            avatar_url,
            phone
          ),
          specialization,
          clinic_address,
          consultation_fee,
          doctor_schedules (
            id,
            day_of_week,
            start_time,
            end_time,
            slot_duration_minutes,
            is_active
          )
        )
      `)
      .eq("patient_id", targetPatientId);

    if (status) {
      query = query.eq("status", status);
    }

    query = query.order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: false });

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
    console.error("Get patient appointments error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching patient appointments",
    };
  }
}