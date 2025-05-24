"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface PaymentData {
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  notes?: string;
}

interface ProcessPaymentResult {
  success: boolean;
  error?: string;
}

export async function processPayment(
  paymentId: number,
  paymentData: PaymentData
): Promise<ProcessPaymentResult> {
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
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("patient_id, status, appointment_id, amount")
      .eq("id", paymentId)
      .single();

    if (paymentError) {
      return {
        success: false,
        error: "Payment not found",
      };
    }

    if (payment.patient_id !== user.id) {
      return {
        success: false,
        error: "You can only process your own payments",
      };
    }

    if (payment.status !== "pending") {
      return {
        success: false,
        error: "Payment has already been processed",
      };
    }

    // Process payment
    const { error } = await supabase
      .from("payments")
      .update({
        status: "completed",
        transaction_id: paymentData.transactionId,
        gateway_response: paymentData.gatewayResponse,
        notes: paymentData.notes,
        paid_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Create notification for successful payment
    await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        type: "payment_success",
        title: "Payment Successful",
        message: `Your payment of $${payment.amount} has been processed successfully.`,
        data: {
          payment_id: paymentId,
          appointment_id: payment.appointment_id,
          amount: payment.amount,
        },
      });

    revalidatePath("/payments");
    revalidatePath("/appointments");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Process payment error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while processing payment",
    };
  }
} 