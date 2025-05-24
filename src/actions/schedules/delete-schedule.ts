"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface DeleteDoctorScheduleResult {
  success: boolean;
  error?: string;
}

export async function deleteDoctorSchedule(scheduleId: number): Promise<DeleteDoctorScheduleResult> {
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
        error: "You can only delete your own schedules",
      };
    }

    // Check for future appointments using this schedule
    const { data: futureAppointments, error: appointmentError } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", user.id)
      .gte("appointment_date", new Date().toISOString().split('T')[0])
      .in("status", ["pending", "confirmed"]);

    if (appointmentError) {
      console.error("Error checking future appointments:", appointmentError);
    }

    if (futureAppointments && futureAppointments.length > 0) {
      return {
        success: false,
        error: "Cannot delete schedule with future appointments. Please cancel or reschedule appointments first.",
      };
    }

    // Delete schedule
    const { error } = await supabase
      .from("doctor_schedules")
      .delete()
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
    console.error("Delete doctor schedule error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while deleting schedule",
    };
  }
} 