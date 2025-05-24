"use server";

import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface RegisterUserData {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  phone?: string;
}

interface RegisterUserResult {
  success: boolean;
  error?: string;
  userId?: string;
}

export async function registerUser(data: RegisterUserData): Promise<RegisterUserResult> {
  try {
    const supabase = createClient();

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role,
          phone: data.phone,
        },
      },
    });

    if (authError) {
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "User creation failed",
      };
    }

    // Update user profile if needed (the trigger should handle basic creation)
    if (data.role === "doctor") {
      // Delete from patients table and create doctor record
      const { error: deletePatientError } = await supabase
        .from("patients")
        .delete()
        .eq("id", authData.user.id);

      if (deletePatientError) {
        console.error("Error removing patient record:", deletePatientError);
      }

      // Update user profile role
      const { error: updateProfileError } = await supabase
        .from("user_profiles")
        .update({ role: "doctor" })
        .eq("id", authData.user.id);

      if (updateProfileError) {
        console.error("Error updating profile role:", updateProfileError);
      }

      // Create doctor profile
      const { error: doctorError } = await supabase
        .from("doctors")
        .insert({
          id: authData.user.id,
        });

      if (doctorError) {
        console.error("Error creating doctor profile:", doctorError);
      }
    }

    revalidatePath("/", "layout");
    
    return {
      success: true,
      userId: authData.user.id,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during registration",
    };
  }
} 