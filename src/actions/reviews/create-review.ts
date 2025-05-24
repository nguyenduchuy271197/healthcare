"use server";

import { createClient } from "@/lib/supabase/server";
import { ReviewInsertDto } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface CreateReviewData {
  appointmentId: number;
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
}

interface CreateReviewResult {
  success: boolean;
  error?: string;
  reviewId?: number;
}

export async function createReview(data: CreateReviewData): Promise<CreateReviewResult> {
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

    // Get appointment details to verify patient and doctor
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("patient_id, doctor_id, status")
      .eq("id", data.appointmentId)
      .single();

    if (appointmentError) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }

    // Check if user is the patient of this appointment
    if (appointment.patient_id !== user.id) {
      return {
        success: false,
        error: "You can only review appointments you attended",
      };
    }

    // Check if appointment is completed
    if (appointment.status !== "completed") {
      return {
        success: false,
        error: "You can only review completed appointments",
      };
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("appointment_id", data.appointmentId)
      .single();

    if (existingReview) {
      return {
        success: false,
        error: "You have already reviewed this appointment",
      };
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return {
        success: false,
        error: "Rating must be between 1 and 5",
      };
    }

    // Create review
    const reviewData: ReviewInsertDto = {
      appointment_id: data.appointmentId,
      patient_id: user.id,
      doctor_id: appointment.doctor_id,
      rating: data.rating,
      comment: data.comment,
      is_anonymous: data.isAnonymous || false,
    };

    const { data: review, error } = await supabase
      .from("reviews")
      .insert(reviewData)
      .select("id")
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Update doctor's average rating
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("doctor_id", appointment.doctor_id);

    if (!reviewsError && reviews) {
      const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      await supabase
        .from("doctors")
        .update({ average_rating: Math.round(averageRating * 100) / 100 })
        .eq("id", appointment.doctor_id);
    }

    // Create notification for doctor
    await supabase
      .from("notifications")
      .insert({
        user_id: appointment.doctor_id,
        type: "new_prescription",
        title: "New Review Received",
        message: `You received a ${data.rating}-star review from a patient.`,
        data: {
          review_id: review.id,
          rating: data.rating,
        },
      });

    revalidatePath("/appointments");
    revalidatePath("/reviews");
    revalidatePath("/dashboard");

    return {
      success: true,
      reviewId: review.id,
    };
  } catch (error) {
    console.error("Create review error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating review",
    };
  }
} 