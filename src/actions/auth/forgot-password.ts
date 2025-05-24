"use server";

import { createClient } from "@/lib/supabase/server";

interface ForgotPasswordData {
  email: string;
}

interface ForgotPasswordResult {
  success: boolean;
  error?: string;
}

export async function forgotPassword(data: ForgotPasswordData): Promise<ForgotPasswordResult> {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while sending reset email",
    };
  }
} 