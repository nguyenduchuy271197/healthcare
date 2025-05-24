"use server";

import { createClient } from "@/lib/supabase/server";
import { Review } from "@/types/custom.types";

interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface GetDoctorReviewsResult {
  success: boolean;
  error?: string;
  data?: (Review & {
    patients: {
      user_profiles: {
        full_name: string;
        avatar_url?: string | null;
      };
    };
  })[];
  total?: number;
  averageRating?: number;
}

export async function getDoctorReviews(
  doctorId: string,
  pagination: PaginationParams = {}
): Promise<GetDoctorReviewsResult> {
  try {
    const supabase = createClient();

    const limit = pagination.limit || 10;
    const offset = pagination.offset || 0;

    // Get reviews with patient information
    const { data, error, count } = await supabase
      .from("reviews")
      .select(`
        *,
        patients (
          user_profiles (
            full_name,
            avatar_url
          )
        )
      `, { count: "exact" })
      .eq("doctor_id", doctorId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Calculate average rating
    const averageRating = data.length > 0 
      ? data.reduce((sum, review) => sum + review.rating, 0) / data.length
      : 0;

    return {
      success: true,
      data,
      total: count || 0,
      averageRating: Math.round(averageRating * 100) / 100,
    };
  } catch (error) {
    console.error("Get doctor reviews error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching doctor reviews",
    };
  }
} 