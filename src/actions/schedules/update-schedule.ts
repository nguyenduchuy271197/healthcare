"use server";

import { createClient } from "@/lib/supabase/server";
import { DoctorScheduleUpdateDto } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface UpdateDoctorScheduleResult {
  success: boolean;
  error?: string;
}

export async function updateDoctorSchedule(
  scheduleId: number,
  scheduleData: DoctorScheduleUpdateDto
): Promise<UpdateDoctorScheduleResult> {
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

    // Check if schedule belongs to current user
    const { data: schedule, error: scheduleError } = await supabase
      .from("doctor_schedules")
      .select("doctor_id")
      .eq("id", scheduleId)
      .single();

    if (scheduleError) {
      return {
        success: false,
        error: "Schedule not found",
      };
    }

    if (schedule.doctor_id !== user.id) {
      return {
        success: false,
        error: "You can only update your own schedules",
      };
    }

    // Validate schedule data if provided
    if (scheduleData.start_time && scheduleData.end_time) {
      if (scheduleData.start_time >= scheduleData.end_time) {
        return {
          success: false,
          error: "End time must be after start time",
        };
      }
    }

    if (scheduleData.day_of_week !== undefined) {
      if (scheduleData.day_of_week < 0 || scheduleData.day_of_week > 6) {
        return {
          success: false,
          error: "Day of week must be between 0 (Sunday) and 6 (Saturday)",
        };
      }
    }

    // Update schedule
    const { error } = await supabase
      .from("doctor_schedules")
      .update(scheduleData)
      .eq("id", scheduleId);

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
    };
  } catch (error) {
    console.error("Update doctor schedule error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating schedule",
    };
  }
} 