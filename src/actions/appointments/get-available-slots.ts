"use server";

import { createClient } from "@/lib/supabase/server";

interface AvailableSlot {
  time: string;
  available: boolean;
}

interface GetAvailableSlotsResult {
  success: boolean;
  error?: string;
  data?: AvailableSlot[];
}

export async function getAvailableSlots(
  doctorId: string,
  date: string
): Promise<GetAvailableSlotsResult> {
  try {
    const supabase = createClient();

    // Parse the date to get day of week (0 = Sunday, 6 = Saturday)
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Get doctor's schedule for the requested day
    const { data: schedules, error: scheduleError } = await supabase
      .from("doctor_schedules")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true);

    if (scheduleError) {
      return {
        success: false,
        error: scheduleError.message,
      };
    }

    if (!schedules || schedules.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Get existing appointments for the date
    const { data: appointments, error: appointmentError } = await supabase
      .from("appointments")
      .select("appointment_time, duration_minutes")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", date)
      .in("status", ["pending", "confirmed"]);

    if (appointmentError) {
      return {
        success: false,
        error: appointmentError.message,
      };
    }

    // Generate all possible slots
    const availableSlots: AvailableSlot[] = [];

    for (const schedule of schedules) {
      const startTime = new Date(`${date} ${schedule.start_time}`);
      const endTime = new Date(`${date} ${schedule.end_time}`);
      const slotDuration = schedule.slot_duration_minutes || 30;

      let currentTime = new Date(startTime);

      while (currentTime < endTime) {
        const timeString = currentTime.toTimeString().slice(0, 5); // HH:MM format
        
        // Check if this slot is already booked
        const isBooked = appointments?.some(apt => {
          const aptTime = new Date(`${date} ${apt.appointment_time}`);
          const aptEndTime = new Date(aptTime.getTime() + (apt.duration_minutes || 30) * 60000);
          const slotEndTime = new Date(currentTime.getTime() + slotDuration * 60000);
          
          return (
            (currentTime >= aptTime && currentTime < aptEndTime) ||
            (slotEndTime > aptTime && slotEndTime <= aptEndTime) ||
            (currentTime <= aptTime && slotEndTime >= aptEndTime)
          );
        });

        // Check if slot is in the past
        const now = new Date();
        const isPast = currentTime <= now;

        availableSlots.push({
          time: timeString,
          available: !isBooked && !isPast,
        });

        // Move to next slot
        currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
      }
    }

    return {
      success: true,
      data: availableSlots,
    };
  } catch (error) {
    console.error("Get available slots error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching available slots",
    };
  }
}