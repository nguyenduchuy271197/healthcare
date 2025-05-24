"use server";

import { createClient } from "@/lib/supabase/server";
import { DoctorScheduleInsertDto } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface CreateDoctorScheduleResult {
  success: boolean;
  error?: string;
  scheduleId?: number;
}

export async function createDoctorSchedule(scheduleData: Omit<DoctorScheduleInsertDto, "doctor_id">): Promise<CreateDoctorScheduleResult> {
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

    // Check if user is a doctor
    const {  error: doctorError } = await supabase
      .from("doctors")
      .select("id")
      .eq("id", user.id)
      .single();

    if (doctorError) {
      return {
        success: false,
        error: "User must be a doctor to create schedule",
      };
    }

    // Validate schedule data
    if (scheduleData.start_time >= scheduleData.end_time) {
      return {
        success: false,
        error: "End time must be after start time",
      };
    }

    if (scheduleData.day_of_week < 0 || scheduleData.day_of_week > 6) {
      return {
        success: false,
        error: "Day of week must be between 0 (Sunday) and 6 (Saturday)",
      };
    }

    // Create schedule
    const { data, error } = await supabase
      .from("doctor_schedules")
      .insert({
        doctor_id: user.id,
        ...scheduleData,
      })
      .select("id")
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/schedule");
    revalidatePath("/dashboard");

    return {
      success: true,
      scheduleId: data.id,
    };
  } catch (error) {
    console.error("Create doctor schedule error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating schedule",
    };
  }
} 