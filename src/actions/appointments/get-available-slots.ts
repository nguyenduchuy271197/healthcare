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
    const targetDate = new Date(date + 'T00:00:00');
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
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];
    const isToday = date === today;

    for (const schedule of schedules) {
      // Parse time strings (format: HH:MM:SS)
      const [startHour, startMinute] = schedule.start_time.split(':').map(Number);
      const [endHour, endMinute] = schedule.end_time.split(':').map(Number);
      
      const slotDuration = schedule.slot_duration_minutes || 30;

      // Create start and end times for the schedule
      let currentHour = startHour;
      let currentMinute = startMinute;

      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Check if this slot is already booked
        const isBooked = appointments?.some(apt => {
          const aptTime = apt.appointment_time.slice(0, 5); // Get HH:MM from HH:MM:SS
          return aptTime === timeString;
        });

        // Check if slot is in the past (only for today)
        let isPast = false;
        if (isToday) {
          const slotDateTime = new Date();
          slotDateTime.setHours(currentHour, currentMinute, 0, 0);
          isPast = slotDateTime <= now;
        }

        availableSlots.push({
          time: timeString,
          available: !isBooked && !isPast,
        });

        // Move to next slot
        currentMinute += slotDuration;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
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