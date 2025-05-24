"use server";

import { createClient } from "@/lib/supabase/server";
import { DoctorSchedule } from "@/types/custom.types";

interface GetDoctorSchedulesResult {
  success: boolean;
  error?: string;
  data?: DoctorSchedule[];
}

export async function getDoctorSchedules(doctorId?: string): Promise<GetDoctorSchedulesResult> {
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

    // Get doctor schedules
    const { data, error } = await supabase
      .from("doctor_schedules")
      .select("*")
      .eq("doctor_id", targetDoctorId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

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
    console.error("Get doctor schedules error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching doctor schedules",
    };
  }
} 