"use server";

import { createClient } from "@/lib/supabase/server";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface PatientStatistics {
  totalPatients: number;
  newPatients: number;
  returningPatients: number;
  avgAppointmentsPerPatient: number;
  patientsByAge: {
    ageGroup: string;
    count: number;
  }[];
  patientsByGender: {
    gender: string;
    count: number;
  }[];
  topConditions: {
    condition: string;
    count: number;
  }[];
  appointmentCompletionRate: number;
  cancelledAppointmentRate: number;
}

interface GetPatientStatisticsResult {
  success: boolean;
  error?: string;
  data?: PatientStatistics;
}

export async function getPatientStatistics(
  doctorId?: string,
  dateRange?: DateRange
): Promise<GetPatientStatisticsResult> {
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

    // Set default date range if not provided (last 12 months)
    const endDate = dateRange?.endDate || new Date().toISOString().split('T')[0];
    const startDate = dateRange?.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get all appointments for the doctor in date range
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        patient_id,
        status,
        appointment_date,
        patients (
          id,
          created_at,
          user_profiles (
            date_of_birth,
            gender
          )
        )
      `)
      .eq("doctor_id", targetDoctorId)
      .gte("appointment_date", startDate)
      .lte("appointment_date", endDate);

    if (appointmentsError) {
      return {
        success: false,
        error: appointmentsError.message,
      };
    }

    if (!appointments || appointments.length === 0) {
      return {
        success: true,
        data: {
          totalPatients: 0,
          newPatients: 0,
          returningPatients: 0,
          avgAppointmentsPerPatient: 0,
          patientsByAge: [],
          patientsByGender: [],
          topConditions: [],
          appointmentCompletionRate: 0,
          cancelledAppointmentRate: 0,
        },
      };
    }

    // Get medical records for diagnosis data
    const { data: medicalRecords } = await supabase
      .from("medical_records")
      .select("diagnosis")
      .eq("doctor_id", targetDoctorId)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    // Process patient data
    const uniquePatients = new Map();
    let completedAppointments = 0;
    let cancelledAppointments = 0;
    const ageGroups = { "0-18": 0, "19-35": 0, "36-50": 0, "51-65": 0, "65+": 0 };
    const genderCounts = { male: 0, female: 0, other: 0, unknown: 0 };

    appointments.forEach(appointment => {
      const patient = appointment.patients as {
        id: string;
        created_at: string;
        user_profiles: {
          date_of_birth?: string;
          gender?: string;
        };
      };

      // Track unique patients
      if (!uniquePatients.has(patient.id)) {
        uniquePatients.set(patient.id, {
          id: patient.id,
          created_at: patient.created_at,
          date_of_birth: patient.user_profiles.date_of_birth,
          gender: patient.user_profiles.gender,
          appointmentCount: 0,
        });
      }
      
      const patientData = uniquePatients.get(patient.id);
      patientData.appointmentCount++;

      // Count appointment statuses
      if (appointment.status === "completed") {
        completedAppointments++;
      } else if (appointment.status === "cancelled") {
        cancelledAppointments++;
      }

      // Process age groups
      if (patient.user_profiles.date_of_birth) {
        const age = new Date().getFullYear() - new Date(patient.user_profiles.date_of_birth).getFullYear();
        if (age <= 18) ageGroups["0-18"]++;
        else if (age <= 35) ageGroups["19-35"]++;
        else if (age <= 50) ageGroups["36-50"]++;
        else if (age <= 65) ageGroups["51-65"]++;
        else ageGroups["65+"]++;
      }

      // Process gender
      const gender = patient.user_profiles.gender?.toLowerCase() || "unknown";
      if (gender in genderCounts) {
        genderCounts[gender as keyof typeof genderCounts]++;
      } else {
        genderCounts.unknown++;
      }
    });

    const totalPatients = uniquePatients.size;
    const totalAppointments = appointments.length;

    // Calculate new vs returning patients
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    let newPatients = 0;
    let returningPatients = 0;

    uniquePatients.forEach(patient => {
      if (patient.created_at >= oneYearAgo) {
        newPatients++;
      } else {
        returningPatients++;
      }
    });

    // Process top conditions
    const conditionCounts = new Map<string, number>();
    medicalRecords?.forEach(record => {
      if (record.diagnosis) {
        const current = conditionCounts.get(record.diagnosis) || 0;
        conditionCounts.set(record.diagnosis, current + 1);
      }
    });

    const topConditions = Array.from(conditionCounts.entries())
      .map(([condition, count]) => ({ condition, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate rates
    const appointmentCompletionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
    const cancelledAppointmentRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;
    const avgAppointmentsPerPatient = totalPatients > 0 ? totalAppointments / totalPatients : 0;

    const patientsByAge = Object.entries(ageGroups)
      .map(([ageGroup, count]) => ({ ageGroup, count }))
      .filter(item => item.count > 0);

    const patientsByGender = Object.entries(genderCounts)
      .map(([gender, count]) => ({ gender, count }))
      .filter(item => item.count > 0);

    return {
      success: true,
      data: {
        totalPatients,
        newPatients,
        returningPatients,
        avgAppointmentsPerPatient: Math.round(avgAppointmentsPerPatient * 100) / 100,
        patientsByAge,
        patientsByGender,
        topConditions,
        appointmentCompletionRate: Math.round(appointmentCompletionRate * 100) / 100,
        cancelledAppointmentRate: Math.round(cancelledAppointmentRate * 100) / 100,
      },
    };
  } catch (error) {
    console.error("Get patient statistics error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while generating patient statistics",
    };
  }
} 