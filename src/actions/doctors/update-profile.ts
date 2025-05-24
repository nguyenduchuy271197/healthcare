"use server";

import { createClient } from "@/lib/supabase/server";
import { DoctorUpdateDto } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface UpdateDoctorProfileResult {
  success: boolean;
  error?: string;
}

export async function updateDoctorProfile(doctorData: DoctorUpdateDto): Promise<UpdateDoctorProfileResult> {
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

    // Check if user is a doctor
    const {  error: doctorError } = await supabase
      .from("doctors")
      .select("id")
      .eq("id", user.id)
      .single();

    if (doctorError) {
      return {
        success: false,
        error: "User must be a doctor to update doctor profile",
      };
    }

    // Update doctor profile
    const { error } = await supabase
      .from("doctors")
      .update(doctorData)
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
    console.error("Update doctor profile error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating doctor profile",
    };
  }
} 