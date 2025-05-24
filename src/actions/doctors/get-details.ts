"use server";

import { createClient } from "@/lib/supabase/server";
import { Doctor } from "@/types/custom.types";

interface GetDoctorDetailsResult {
  success: boolean;
  error?: string;
  data?: Doctor & {
    user_profiles: {
      full_name: string;
      avatar_url?: string | null;
      phone?: string | null;
    };
    doctor_schedules: {
      id: number;
      day_of_week: number;
      start_time: string;
      end_time: string;
      slot_duration_minutes: number | null;
      is_active: boolean | null;
    }[];
  };
}

export async function getDoctorDetails(doctorId: string): Promise<GetDoctorDetailsResult> {
  try {
    const supabase = createClient();

    // Get doctor details with profile and schedules
    const { data, error } = await supabase
      .from("doctors")
      .select(`
        *,
        user_profiles (
          full_name,
          avatar_url,
          phone
        ),
        doctor_schedules (
          id,
          day_of_week,
          start_time,
          end_time,
          slot_duration_minutes,
          is_active
        )
      `)
      .eq("id", doctorId)
      .single();

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
    console.error("Get doctor details error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching doctor details",
    };
  }
} 