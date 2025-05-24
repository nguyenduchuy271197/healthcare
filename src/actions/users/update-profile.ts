"use server";

import { createClient } from "@/lib/supabase/server";
import { ProfileUpdateDto } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface UpdateUserProfileResult {
  success: boolean;
  error?: string;
}

export async function updateUserProfile(profileData: ProfileUpdateDto): Promise<UpdateUserProfileResult> {
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

    // Update user profile
    const { error } = await supabase
      .from("user_profiles")
      .update(profileData)
      .eq("id", user.id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating profile",
    };
  }
} 