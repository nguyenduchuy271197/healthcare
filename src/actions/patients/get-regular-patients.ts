"use server";

import { createClient } from "@/lib/supabase/server";

interface RegularPatient {
  id: string;
  user_profiles: {
    full_name: string;
    phone?: string | null;
    date_of_birth?: string | null;
    avatar_url?: string | null;
  };
  totalAppointments: number;
  lastAppointmentDate: string;
  totalSpent: number;
  averageRating?: number;
  chronicConditions?: string[];
  allergies?: string[];
  lastDiagnosis?: string;
  nextFollowUpDate?: string;
}

interface RegularPatientsResult {
  success: boolean;
  error?: string;
  data?: RegularPatient[];
}

interface AppointmentWithDetails {
  patient_id: string;
  appointment_date: string;
  consultation_fee?: number | null;
  status: string | null;
  patients: {
    id: string;
    chronic_conditions?: string[] | null;
    allergies?: string[] | null;
    user_profiles: {
      full_name: string;
      phone?: string | null;
      date_of_birth?: string | null;
      avatar_url?: string | null;
    };
  };
  payments?: Array<{
    amount: number;
    status: string | null;
  }> | null;
  medical_records?: Array<{
    diagnosis: string;
    follow_up_date?: string | null;
    created_at: string | null;
  }> | null;
  reviews?: Array<{
    rating: number;
  }> | null;
}

interface PatientData {
  patient: AppointmentWithDetails["patients"];
  appointments: AppointmentWithDetails[];
  totalSpent: number;
  ratings: number[];
  lastDiagnosis?: string;
  nextFollowUpDate?: string;
}

export async function getRegularPatients(
  minAppointments: number = 3
): Promise<RegularPatientsResult> {
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

    // Verify user is a doctor
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || userProfile?.role !== "doctor") {
      return {
        success: false,
        error: "Access denied. Only doctors can view patient lists.",
      };
    }

    // Get patients with multiple appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        patient_id,
        appointment_date,
        consultation_fee,
        status,
        patients (
          id,
          chronic_conditions,
          allergies,
          user_profiles (
            full_name,
            phone,
            date_of_birth,
            avatar_url
          )
        ),
        payments (
          amount,
          status
        ),
        medical_records (
          diagnosis,
          follow_up_date,
          created_at
        ),
        reviews (
          rating
        )
      `)
      .eq("doctor_id", user.id)
      .eq("status", "completed")
      .order("appointment_date", { ascending: false });

    if (appointmentsError) {
      return {
        success: false,
        error: appointmentsError.message,
      };
    }

    if (!appointments || appointments.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Group appointments by patient
    const patientMap = new Map<string, PatientData>();

    appointments.forEach((appointment) => {
      const patientId = appointment.patient_id;
      
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          patient: appointment.patients,
          appointments: [],
          totalSpent: 0,
          ratings: [],
          lastDiagnosis: undefined,
          nextFollowUpDate: undefined,
        });
      }

      const patientData = patientMap.get(patientId)!;
      patientData.appointments.push(appointment as AppointmentWithDetails);

      // Calculate total spent from completed payments
      if (appointment.payments && Array.isArray(appointment.payments)) {
        appointment.payments.forEach((payment) => {
          if (payment.status === "completed") {
            patientData.totalSpent += payment.amount;
          }
        });
      }

      // Collect ratings
      if (appointment.reviews && Array.isArray(appointment.reviews)) {
        appointment.reviews.forEach((review) => {
          if (review.rating) {
            patientData.ratings.push(review.rating);
          }
        });
      }

      // Get latest diagnosis and follow-up date
      if (appointment.medical_records && Array.isArray(appointment.medical_records)) {
        appointment.medical_records.forEach((record) => {
          if (record.diagnosis && !patientData.lastDiagnosis) {
            patientData.lastDiagnosis = record.diagnosis;
          }
          if (record.follow_up_date && 
              (!patientData.nextFollowUpDate || 
               new Date(record.follow_up_date) > new Date(patientData.nextFollowUpDate))) {
            patientData.nextFollowUpDate = record.follow_up_date;
          }
        });
      }
    });

    // Filter patients with minimum appointments and format data
    const regularPatients: RegularPatient[] = Array.from(patientMap.entries())
      .filter(([, data]) => data.appointments.length >= minAppointments)
      .map(([patientId, data]) => {
        const averageRating = data.ratings.length > 0
          ? data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length
          : undefined;

        const lastAppointmentDate = data.appointments
          .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0]
          .appointment_date;

        return {
          id: patientId,
          user_profiles: data.patient.user_profiles,
          totalAppointments: data.appointments.length,
          lastAppointmentDate,
          totalSpent: data.totalSpent,
          averageRating: averageRating ? Math.round(averageRating * 10) / 10 : undefined,
          chronicConditions: data.patient.chronic_conditions || [],
          allergies: data.patient.allergies || [],
          lastDiagnosis: data.lastDiagnosis,
          nextFollowUpDate: data.nextFollowUpDate,
        };
      })
      .sort((a, b) => b.totalAppointments - a.totalAppointments); // Sort by most appointments

    return {
      success: true,
      data: regularPatients,
    };
  } catch (error) {
    console.error("Get regular patients error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching regular patients",
    };
  }
} 