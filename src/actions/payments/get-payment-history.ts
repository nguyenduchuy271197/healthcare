"use server";

import { createClient } from "@/lib/supabase/server";
import { Payment } from "@/types/custom.types";

interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface GetPaymentHistoryResult {
  success: boolean;
  error?: string;
  data?: (Payment & {
    appointments: {
      appointment_date: string;
      appointment_time: string;
      doctors: {
        user_profiles: {
          full_name: string;
        };
      };
    };
  })[];
  total?: number;
}

export async function getPaymentHistory(
  patientId?: string,
  pagination: PaginationParams = {}
): Promise<GetPaymentHistoryResult> {
  try {
    const supabase = createClient();

    let targetPatientId = patientId;

    // If no patientId provided, get current user
    if (!targetPatientId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      targetPatientId = user.id;
    }

    const limit = pagination.limit || 20;
    const offset = pagination.offset || 0;

    // Get payment history
    const { data, error, count } = await supabase
      .from("payments")
      .select(`
        *,
        appointments (
          appointment_date,
          appointment_time,
          doctors (
            user_profiles (
              full_name
            )
          )
        )
      `, { count: "exact" })
      .eq("patient_id", targetPatientId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
      total: count || 0,
    };
  } catch (error) {
    console.error("Get payment history error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching payment history",
    };
  }
} 