"use server";

import { createClient } from "@/lib/supabase/server";
import { Notification } from "@/types/custom.types";

interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface GetUserNotificationsResult {
  success: boolean;
  error?: string;
  data?: Notification[];
  total?: number;
  unreadCount?: number;
}

export async function getUserNotifications(
  userId?: string,
  pagination: PaginationParams = {}
): Promise<GetUserNotificationsResult> {
  try {
    const supabase = createClient();

    let targetUserId = userId;

    // If no userId provided, get current user
    if (!targetUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      targetUserId = user.id;
    }

    const limit = pagination.limit || 20;
    const offset = pagination.offset || 0;

    // Get notifications
    const { data, error, count } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Get unread count
    const { count: unreadCount, error: unreadError } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", targetUserId)
      .eq("is_read", false);

    if (unreadError) {
      console.error("Error getting unread count:", unreadError);
    }

    return {
      success: true,
      data,
      total: count || 0,
      unreadCount: unreadCount || 0,
    };
  } catch (error) {
    console.error("Get notifications error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching notifications",
    };
  }
} 