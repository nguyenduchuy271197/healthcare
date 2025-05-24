"use server";

import { createClient } from "@/lib/supabase/server";
import { Patient } from "@/types/custom.types";

interface GetPatientProfileResult {
  success: boolean;
  error?: string;
  data?: Patient & {
    user_profiles: {
      full_name: string;
      email?: string | null;
      phone?: string | null;
      date_of_birth?: string | null;
      gender?: string | null;
      avatar_url?: string | null;
    };
  };
}

export async function getPatientProfile(patientId?: string): Promise<GetPatientProfileResult> {
  try {
    const supabase = createClient();

    let targetPatientId = patientId;

    // If no patientId provided, get current user
    if (!targetPatientId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      targetPatientId = user.id;
    }

    // Get patient profile with user profile data
    const { data, error } = await supabase
      .from("patients")
      .select(`
        *,
        user_profiles (
          full_name,
          phone,
          date_of_birth,
          gender,
          avatar_url
        )
      `)
      .eq("id", targetPatientId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Get patient profile error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching patient profile",
    };
  }
} 