"use server";

import { createClient } from "@/lib/supabase/server";

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordResult {
  success: boolean;
  error?: string;
}

export async function changePassword(data: ChangePasswordData): Promise<ChangePasswordResult> {
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

    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: data.currentPassword,
    });

    if (verifyError) {
      return {
        success: false,
        error: "Current password is incorrect",
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

    return {
      success: true,
    };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while changing password",
    };
  }
} 