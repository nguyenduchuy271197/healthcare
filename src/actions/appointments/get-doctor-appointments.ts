"use server";

import { createClient } from "@/lib/supabase/server";
import { Appointment, AppointmentStatus } from "@/types/custom.types";

interface GetDoctorAppointmentsResult {
  success: boolean;
  error?: string;
  data?: (Appointment & {
    patients: {
      user_profiles: {
        full_name: string;
        avatar_url?: string | null;
        phone?: string | null;
      };
    };
  })[];
}

export async function getDoctorAppointments(
  doctorId?: string,
  status?: AppointmentStatus,
  date?: string
): Promise<GetDoctorAppointmentsResult> {
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
            phone
          )
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
      data,
    };
  } catch (error) {
    console.error("Get doctor appointments error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching doctor appointments",
    };
  }
}