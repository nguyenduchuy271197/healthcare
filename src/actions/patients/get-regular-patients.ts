"use server";

import { createClient } from "@/lib/supabase/server";
import { Patient } from "@/types/custom.types";

interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface GetRegularPatientsResult {
  success: boolean;
  error?: string;
  data?: (Patient & {
    user_profiles: {
      full_name: string;
      phone?: string | null;
      avatar_url?: string | null;
    };
    total_appointments: number;
    last_appointment_date?: string;
    last_appointment_status?: string;
  })[];
  total?: number;
}

export async function getRegularPatients(
  doctorId?: string,
  pagination: PaginationParams = {}
): Promise<GetRegularPatientsResult> {
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

    const limit = pagination.limit || 20;
    const offset = pagination.offset || 0;

    // Get patients who have had multiple appointments with this doctor
    const { data: patientAppointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        patient_id,
        appointment_date,
        status,
        patients (
          *,
          user_profiles (
            full_name,
            phone,
            avatar_url
          )
        )
      `)
      .eq("doctor_id", targetDoctorId)
      .in("status", ["completed", "confirmed"])
      .order("appointment_date", { ascending: false });

    if (appointmentsError) {
      return {
        success: false,
        error: appointmentsError.message,
      };
    }

    // Group by patient and count appointments
    const patientMap = new Map();
    
    patientAppointments?.forEach(appointment => {
      const patientId = appointment.patient_id;
      
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          ...appointment.patients,
          total_appointments: 0,
          last_appointment_date: null,
          last_appointment_status: null,
        });
      }
      
      const patient = patientMap.get(patientId);
      patient.total_appointments++;
      
      // Update last appointment info if this is more recent
      if (!patient.last_appointment_date || appointment.appointment_date > patient.last_appointment_date) {
        patient.last_appointment_date = appointment.appointment_date;
        patient.last_appointment_status = appointment.status;
      }
    });

    // Filter regular patients (those with more than 1 appointment)
    const regularPatients = Array.from(patientMap.values())
      .filter(patient => patient.total_appointments > 1)
      .sort((a, b) => b.total_appointments - a.total_appointments) // Sort by appointment count
      .slice(offset, offset + limit);

    const total = Array.from(patientMap.values()).filter(patient => patient.total_appointments > 1).length;

    return {
      success: true,
      data: regularPatients,
      total,
    };
  } catch (error) {
    console.error("Get regular patients error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching regular patients",
    };
  }
} 