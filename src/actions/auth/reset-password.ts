"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ResetPasswordData {
  token: string;
  newPassword: string;
}

interface ResetPasswordResult {
  success: boolean;
  error?: string;
}

export async function resetPassword(data: ResetPasswordData): Promise<ResetPasswordResult> {
  try {
    const supabase = createClient();

    // Verify and use the reset token
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: data.token,
      type: "recovery",
    });

    if (verifyError) {
      return {
        success: false,
        error: "Invalid or expired reset token",
      };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      };
    }

    revalidatePath("/", "layout");
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while resetting password",
    };
  }
} 