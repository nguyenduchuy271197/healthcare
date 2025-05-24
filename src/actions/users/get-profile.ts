"use server";

import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/custom.types";

interface GetUserProfileResult {
  success: boolean;
  error?: string;
  data?: Profile;
}

export async function getUserProfile(userId?: string): Promise<GetUserProfileResult> {
  try {
    const supabase = createClient();

    let targetUserId = userId;

    // If no userId provided, get current user
    if (!targetUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      targetUserId = user.id;
    }

    // Get user profile
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", targetUserId)
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
    console.error("Get profile error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching profile",
    };
  }
} 