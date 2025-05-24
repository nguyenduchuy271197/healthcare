"use server";

import { createClient } from "@/lib/supabase/server";
import { NotificationInsertDto, NotificationType } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

interface CreateNotificationResult {
  success: boolean;
  error?: string;
  notificationId?: number;
}

export async function createNotification(
  notificationData: NotificationData
): Promise<CreateNotificationResult> {
  try {
    const supabase = createClient();

    // Get current user (admin or system user)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Validate notification data
    if (!notificationData.title || !notificationData.message) {
      return {
        success: false,
        error: "Title and message are required",
      };
    }

    // Check if target user exists
    const {  error: targetUserError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", notificationData.userId)
      .single();

    if (targetUserError) {
      return {
        success: false,
        error: "Target user not found",
      };
    }

    // Create notification
    const notification: NotificationInsertDto = {
      user_id: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data ? JSON.parse(JSON.stringify(notificationData.data)) : null,
      is_read: false,
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select("id")
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/notifications");

    return {
      success: true,
      notificationId: data.id,
    };
  } catch (error) {
    console.error("Create notification error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating notification",
    };
  }
} 