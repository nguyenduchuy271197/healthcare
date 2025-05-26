"use server";

import { createClient } from "@/lib/supabase/server";
import { Review } from "@/types/custom.types";

interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface GetPatientReviewsResult {
  success: boolean;
  error?: string;
  data?: (Review & {
    doctors: {
      user_profiles: {
        full_name: string;
        avatar_url?: string | null;
      };
      specialization?: string | null;
    };
    appointments: {
      appointment_date: string;
      appointment_time: string;
      reason: string;
    };
  })[];
  total?: number;
}

export async function getPatientReviews(
  patientId?: string,
  pagination: PaginationParams = {}
): Promise<GetPatientReviewsResult> {
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

    // Use current user ID if patientId not provided
    const targetPatientId = patientId || user.id;

    // Check if user has permission to view these reviews
    if (user.id !== targetPatientId) {
      // Check if user is a doctor who has treated this patient
      const { data: appointments, error: appointmentError } = await supabase
        .from("appointments")
        .select("id")
        .eq("doctor_id", user.id)
        .eq("patient_id", targetPatientId)
        .eq("status", "completed");

      if (appointmentError || !appointments || appointments.length === 0) {
        return {
          success: false,
          error: "You don't have permission to view these reviews",
        };
      }
    }

    const limit = pagination.limit || 10;
    const offset = pagination.offset || 0;

    // Get reviews with doctor and appointment information
    const { data, error, count } = await supabase
      .from("reviews")
      .select(`
        *,
        doctors (
          user_profiles (
            full_name,
            avatar_url
          ),
          specialization
        ),
        appointments (
          appointment_date,
          appointment_time,
          reason
        )
      `, { count: "exact" })
      .eq("patient_id", targetPatientId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
      total: count || 0,
    };
  } catch (error) {
    console.error("Get patient reviews error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching patient reviews",
    };
  }
} 