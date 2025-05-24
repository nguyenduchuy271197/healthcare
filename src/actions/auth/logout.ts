"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface LogoutUserResult {
  success: boolean;
  error?: string;
}

export async function logoutUser(): Promise<LogoutUserResult> {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/", "layout");
    redirect("/auth/login");
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during logout",
    };
  }
} 