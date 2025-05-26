"use client";

import { useEffect, useCallback } from "react";
import { sendAppointmentReminder } from "@/actions/notifications/send-appointment-reminder";
import { useToast } from "@/hooks/use-toast";

interface UseAppointmentRemindersOptions {
  enabled?: boolean;
  checkInterval?: number; // in milliseconds
}

interface AppointmentForReminder {
  id: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reminder_sent: boolean;
}

export function useAppointmentReminders(
  appointments: AppointmentForReminder[] = [],
  options: UseAppointmentRemindersOptions = {}
) {
  const { enabled = true, checkInterval = 60000 } = options; // Default: check every minute
  const { toast } = useToast();

  const checkAndSendReminders = useCallback(async () => {
    if (!enabled || appointments.length === 0) return;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const twoHoursFromNow = new Date(now);
    twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);

    for (const appointment of appointments) {
      // Skip if reminder already sent or appointment is not confirmed
      if (appointment.reminder_sent || appointment.status !== "confirmed") {
        continue;
      }

      const appointmentDateTime = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`);
      
      // Check if appointment is tomorrow (24-hour reminder)
      const isTomorrow = 
        appointmentDateTime.toDateString() === tomorrow.toDateString();
      
      // Check if appointment is in 2 hours (2-hour reminder)
      const isInTwoHours = 
        appointmentDateTime.getTime() - now.getTime() <= 2 * 60 * 60 * 1000 && // Within 2 hours
        appointmentDateTime.getTime() - now.getTime() > 1.5 * 60 * 60 * 1000; // But more than 1.5 hours

      if (isTomorrow || isInTwoHours) {
        try {
          const result = await sendAppointmentReminder(appointment.id);
          
          if (result.success) {
            const reminderType = isTomorrow ? "24-hour" : "2-hour";
            console.log(`${reminderType} reminder sent for appointment ${appointment.id}`);
            
            // Optionally show toast for successful reminders
            if (process.env.NODE_ENV === "development") {
              toast({
                title: "Reminder Sent",
                description: `${reminderType} reminder sent for appointment ${appointment.id}`,
              });
            }
          } else {
            console.error(`Failed to send reminder for appointment ${appointment.id}:`, result.error);
          }
        } catch (error) {
          console.error(`Error sending reminder for appointment ${appointment.id}:`, error);
        }
      }
    }
  }, [appointments, enabled, toast]);

  useEffect(() => {
    if (!enabled) return;

    // Run initial check
    checkAndSendReminders();

    // Set up interval for periodic checks
    const interval = setInterval(checkAndSendReminders, checkInterval);

    return () => clearInterval(interval);
  }, [checkAndSendReminders, checkInterval, enabled]);

  return {
    checkAndSendReminders,
  };
}

// Hook specifically for patient dashboard to show upcoming appointments with reminder status
export function useUpcomingAppointmentReminders() {
  const getUpcomingAppointments = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const twoHoursFromNow = new Date(now);
    twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);

    return {
      needsTomorrowReminder: (appointment: AppointmentForReminder) => {
        if (appointment.reminder_sent || appointment.status !== "confirmed") return false;
        
        const appointmentDateTime = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`);
        return appointmentDateTime.toDateString() === tomorrow.toDateString();
      },
      
      needsTwoHourReminder: (appointment: AppointmentForReminder) => {
        if (appointment.reminder_sent || appointment.status !== "confirmed") return false;
        
        const appointmentDateTime = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`);
        const timeDiff = appointmentDateTime.getTime() - now.getTime();
        
        return timeDiff <= 2 * 60 * 60 * 1000 && timeDiff > 1.5 * 60 * 60 * 1000;
      },
      
      isUpcoming: (appointment: AppointmentForReminder) => {
        const appointmentDateTime = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`);
        return appointmentDateTime > now;
      },
      
      timeUntilAppointment: (appointment: AppointmentForReminder) => {
        const appointmentDateTime = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`);
        const timeDiff = appointmentDateTime.getTime() - now.getTime();
        
        if (timeDiff <= 0) return "Past";
        
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours < 24) {
          return `${hours}h ${minutes}m`;
        } else {
          const days = Math.floor(hours / 24);
          return `${days} day${days > 1 ? 's' : ''}`;
        }
      }
    };
  }, []);

  return getUpcomingAppointments();
} 