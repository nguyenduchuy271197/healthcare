"use server";

import { createClient } from "@/lib/supabase/server";
import { Payment } from "@/types/custom.types";

interface GetPaymentDetailsResult {
  success: boolean;
  error?: string;
  data?: Payment & {
    appointments: {
      appointment_date: string;
      appointment_time: string;
      reason: string;
      duration_minutes?: number | null;
      doctors: {
        user_profiles: {
          full_name: string;
          phone?: string | null;
        };
        specialization?: string | null;
        clinic_address?: string | null;
      };
    };
  };
}

export async function getPaymentDetails(paymentId: number): Promise<GetPaymentDetailsResult> {
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

    // Get payment details
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        appointments (
          appointment_date,
          appointment_time,
          reason,
          duration_minutes,
          doctors (
            user_profiles (
              full_name,
              phone
            ),
            specialization,
            clinic_address
          )
        )
      `)
      .eq("id", paymentId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Check if user has permission to view this payment
    if (data.patient_id !== user.id) {
      return {
        success: false,
        error: "You don't have permission to view this payment",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Get payment details error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching payment details",
    };
  }
} 