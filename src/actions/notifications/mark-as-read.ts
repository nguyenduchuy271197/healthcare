"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface MarkNotificationAsReadResult {
  success: boolean;
  error?: string;
}

export async function markNotificationAsRead(notificationId: number): Promise<MarkNotificationAsReadResult> {
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

    // Update notification
    const { error } = await supabase
      .from("notifications")
      .update({ 
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/notifications");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while marking notification as read",
    };
  }
}

export async function markAllNotificationsAsRead(): Promise<MarkNotificationAsReadResult> {
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

    // Update all unread notifications
    const { error } = await supabase
      .from("notifications")
      .update({ 
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/notifications");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while marking all notifications as read",
    };
  }
}