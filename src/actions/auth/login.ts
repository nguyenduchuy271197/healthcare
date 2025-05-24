"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface LoginUserData {
  email: string;
  password: string;
}

interface LoginUserResult {
  success: boolean;
  error?: string;
}

export async function loginUser(data: LoginUserData): Promise<LoginUserResult> {
  try {
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Login failed",
      };
    }

    revalidatePath("/", "layout");
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during login",
    };
  }
} 