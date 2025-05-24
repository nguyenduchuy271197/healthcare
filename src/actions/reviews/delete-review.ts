"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface DeleteReviewResult {
  success: boolean;
  error?: string;
}

export async function deleteReview(reviewId: number): Promise<DeleteReviewResult> {
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
        error: "You can only delete your own reviews",
      };
    }

    // Delete the review
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Recalculate doctor's average rating
    const { data: remainingReviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("doctor_id", review.doctor_id);

    if (!reviewsError) {
      let averageRating = 0;
      let totalReviews = 0;

      if (remainingReviews && remainingReviews.length > 0) {
        totalReviews = remainingReviews.length;
        averageRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
        averageRating = Math.round(averageRating * 100) / 100;
      }

      await supabase
        .from("doctors")
        .update({ 
          average_rating: averageRating,
          total_reviews: totalReviews,
        })
        .eq("id", review.doctor_id);
    }

    revalidatePath("/reviews");
    revalidatePath("/appointments");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete review error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while deleting review",
    };
  }
} 