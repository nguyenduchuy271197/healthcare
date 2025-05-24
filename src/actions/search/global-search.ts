"use server";

import { createClient } from "@/lib/supabase/server";
import { AppointmentStatus } from "@/types/custom.types";

interface SearchFilters {
  type?: "doctors" | "appointments" | "medical_records" | "all";
  dateFrom?: string;
  dateTo?: string;
  specialization?: string;
  status?: string;
}

interface SearchResult {
  id: string | number;
  type: "doctor" | "appointment" | "medical_record";
  title: string;
  description: string;
  date?: string;
  metadata?: Record<string, unknown>;
}

interface GlobalSearchResult {
  success: boolean;
  error?: string;
  data?: SearchResult[];
  total?: number;
}

export async function globalSearch(
  query: string,
  filters: SearchFilters = {}
): Promise<GlobalSearchResult> {
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

    if (!query || query.trim().length < 2) {
      return {
        success: false,
        error: "Search query must be at least 2 characters long",
      };
    }

    const results: SearchResult[] = [];
    const searchQuery = `%${query.toLowerCase()}%`;

    // Search doctors
    if (!filters.type || filters.type === "doctors" || filters.type === "all") {
      let doctorQuery = supabase
        .from("doctors")
        .select(`
          id,
          specialization,
          bio,
          clinic_address,
          user_profiles (
            full_name
          )
        `);

      if (filters.specialization) {
        doctorQuery = doctorQuery.ilike("specialization", `%${filters.specialization}%`);
      }

      doctorQuery = doctorQuery.or(`
        specialization.ilike.${searchQuery},
        bio.ilike.${searchQuery},
        clinic_address.ilike.${searchQuery},
        user_profiles.full_name.ilike.${searchQuery}
      `);

      const { data: doctors } = await doctorQuery.limit(10);

      if (doctors) {
        doctors.forEach(doctor => {
          results.push({
            id: doctor.id,
            type: "doctor",
            title: (doctor.user_profiles as { full_name: string }).full_name,
            description: `${doctor.specialization || "General"} - ${doctor.clinic_address || "No address"}`,
            metadata: {
              specialization: doctor.specialization,
              bio: doctor.bio,
            },
          });
        });
      }
    }

    // Search appointments (patient's own appointments)
    if (!filters.type || filters.type === "appointments" || filters.type === "all") {
      let appointmentQuery = supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          reason,
          status,
          doctors (
            user_profiles (
              full_name
            ),
            specialization
          )
        `)
        .eq("patient_id", user.id);

      if (filters.dateFrom) {
        appointmentQuery = appointmentQuery.gte("appointment_date", filters.dateFrom);
      }

      if (filters.dateTo) {
        appointmentQuery = appointmentQuery.lte("appointment_date", filters.dateTo);
      }

      if (filters.status) {
        appointmentQuery = appointmentQuery.eq("status", filters.status as AppointmentStatus);
      }

      appointmentQuery = appointmentQuery.ilike("reason", searchQuery);

      const { data: appointments } = await appointmentQuery.limit(10);

      if (appointments) {
        appointments.forEach(appointment => {
          const doctor = appointment.doctors as {
            user_profiles: { full_name: string };
            specialization?: string;
          };
          
          results.push({
            id: appointment.id,
            type: "appointment",
            title: `Appointment with Dr. ${doctor.user_profiles.full_name}`,
            description: appointment.reason,
            date: appointment.appointment_date,
            metadata: {
              time: appointment.appointment_time,
              status: appointment.status,
              specialization: doctor.specialization,
            },
          });
        });
      }
    }

    // Search medical records (patient's own records)
    if (!filters.type || filters.type === "medical_records" || filters.type === "all") {
      let recordQuery = supabase
        .from("medical_records")
        .select(`
          id,
          diagnosis,
          symptoms,
          treatment_plan,
          created_at,
          doctors (
            user_profiles (
              full_name
            )
          )
        `)
        .eq("patient_id", user.id);

      if (filters.dateFrom) {
        recordQuery = recordQuery.gte("created_at", filters.dateFrom);
      }

      if (filters.dateTo) {
        recordQuery = recordQuery.lte("created_at", filters.dateTo);
      }

      recordQuery = recordQuery.or(`
        diagnosis.ilike.${searchQuery},
        symptoms.ilike.${searchQuery},
        treatment_plan.ilike.${searchQuery}
      `);

      const { data: records } = await recordQuery.limit(10);

      if (records) {
        records.forEach(record => {
          const doctor = record.doctors as {
            user_profiles: { full_name: string };
          };
          
          results.push({
            id: record.id,
            type: "medical_record",
            title: `Medical Record - ${record.diagnosis}`,
            description: record.symptoms || "No symptoms recorded",
            date: record.created_at || undefined,
            metadata: {
              doctor: doctor.user_profiles.full_name,
              treatment: record.treatment_plan,
            },
          });
        });
      }
    }

    // Sort results by relevance (can be improved with better scoring)
    results.sort((a, b) => {
      const aRelevance = a.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 1;
      const bRelevance = b.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 1;
      return bRelevance - aRelevance;
    });

    return {
      success: true,
      data: results,
      total: results.length,
    };
  } catch (error) {
    console.error("Global search error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during search",
    };
  }
} 