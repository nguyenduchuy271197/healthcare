"use server";

import { createClient } from "@/lib/supabase/server";
import { PatientUpdateDto } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface UpdatePatientProfileResult {
  success: boolean;
  error?: string;
}

export async function updatePatientProfile(patientData: PatientUpdateDto): Promise<UpdatePatientProfileResult> {
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

    // Update patient profile
    const { error } = await supabase
      .from("patients")
      .update(patientData)
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
    console.error("Update patient profile error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating patient profile",
    };
  }
} 