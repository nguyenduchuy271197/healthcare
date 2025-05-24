"use server";

import { createClient } from "@/lib/supabase/server";
import { PatientInsertDto } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface CreatePatientProfileResult {
  success: boolean;
  error?: string;
}

export async function createPatientProfile(patientData: Omit<PatientInsertDto, "id">): Promise<CreatePatientProfileResult> {
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

    // Create patient profile
    const { error } = await supabase
      .from("patients")
      .upsert({
        id: user.id,
        ...patientData,
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
    console.error("Create patient profile error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating patient profile",
    };
  }
} 