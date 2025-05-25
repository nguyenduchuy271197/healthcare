import { Appointment } from "@/types/custom.types";

export type AppointmentWithDoctor = Appointment & {
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
}; 