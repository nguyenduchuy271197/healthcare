"use server";

import { createClient } from "@/lib/supabase/server";
import { ReviewUpdateDto } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface UpdateReviewData {
  rating?: number;
  comment?: string;
  isAnonymous?: boolean;
}

interface UpdateReviewResult {
  success: boolean;
  error?: string;
}

export async function updateReview(
  reviewId: number,
  updateData: UpdateReviewData
): Promise<UpdateReviewResult> {
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

    // Get review details
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("patient_id, doctor_id")
      .eq("id", reviewId)
      .single();

    if (reviewError) {
      return {
        success: false,
        error: "Review not found",
      };
    }

    // Check if user owns this review
    if (review.patient_id !== user.id) {
      return {
        success: false,
        error: "You can only update your own reviews",
      };
    }

    // Validate rating if provided
    if (updateData.rating !== undefined && (updateData.rating < 1 || updateData.rating > 5)) {
      return {
        success: false,
        error: "Rating must be between 1 and 5",
      };
    }

    // Update review
    const reviewUpdate: ReviewUpdateDto = {};
    
    if (updateData.rating !== undefined) reviewUpdate.rating = updateData.rating;
    if (updateData.comment !== undefined) reviewUpdate.comment = updateData.comment;
    if (updateData.isAnonymous !== undefined) reviewUpdate.is_anonymous = updateData.isAnonymous;

    const { error } = await supabase
      .from("reviews")
      .update(reviewUpdate)
      .eq("id", reviewId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Update doctor's average rating if rating changed
    if (updateData.rating !== undefined) {
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("rating")
        .eq("doctor_id", review.doctor_id);

      if (!reviewsError && reviews) {
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        
        await supabase
          .from("doctors")
          .update({ average_rating: Math.round(averageRating * 100) / 100 })
          .eq("id", review.doctor_id);
      }
    }

    revalidatePath("/reviews");
    revalidatePath("/appointments");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update review error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating review",
    };
  }
} 