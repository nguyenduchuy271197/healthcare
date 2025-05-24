"use server";

import { createClient } from "@/lib/supabase/server";
import { Doctor } from "@/types/custom.types";

interface GetDoctorProfileResult {
  success: boolean;
  error?: string;
  data?: Doctor & {
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

export async function getDoctorProfile(doctorId?: string): Promise<GetDoctorProfileResult> {
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

    // Get doctor profile with user profile data
    const { data, error } = await supabase
      .from("doctors")
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
      .eq("id", targetDoctorId)
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
    console.error("Get doctor profile error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching doctor profile",
    };
  }
} 