"use server";

import { createClient } from "@/lib/supabase/server";
import { DoctorInsertDto } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface CreateDoctorProfileResult {
  success: boolean;
  error?: string;
}

export async function createDoctorProfile(doctorData: Omit<DoctorInsertDto, "id">): Promise<CreateDoctorProfileResult> {
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

    // Check if user profile has doctor role
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || userProfile.role !== "doctor") {
      return {
        success: false,
        error: "User must have doctor role to create doctor profile",
      };
    }

    // Create doctor profile
    const { error } = await supabase
      .from("doctors")
      .upsert({
        id: user.id,
        ...doctorData,
      });

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
    console.error("Create doctor profile error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating doctor profile",
    };
  }
} 