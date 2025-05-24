"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@/types/custom.types";

interface RefundPaymentData {
  reason: string;
  refundAmount?: number;
}

interface RefundPaymentResult {
  success: boolean;
  error?: string;
}

export async function refundPayment(
  paymentId: number,
  refundData: RefundPaymentData
): Promise<RefundPaymentResult> {
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
      .select("patient_id, doctor_id, status, amount, appointment_id")
      .eq("id", paymentId)
      .single();

    if (paymentError) {
      return {
        success: false,
        error: "Payment not found",
      };
    }

    // Check if user has permission to refund this payment
    // Only the doctor or patient can request refund
    if (payment.patient_id !== user.id && payment.doctor_id !== user.id) {
      return {
        success: false,
        error: "You don't have permission to refund this payment",
      };
    }

    if (payment.status !== "completed") {
      return {
        success: false,
        error: "Only completed payments can be refunded",
      };
    }

    const refundAmount = refundData.refundAmount || payment.amount;

    if (refundAmount > payment.amount) {
      return {
        success: false,
        error: "Refund amount cannot exceed original payment amount",
      };
    }

    // Process refund
    const { error } = await supabase
      .from("payments")
      .update({
        status: "refunded",
        refund_reason: refundData.reason,
        refunded_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Create notifications for both patient and doctor
    const notifications = [
      {
        user_id: payment.patient_id,
        type: "payment_success" as NotificationType,
        title: "Payment Refunded",
        message: `Your payment of $${refundAmount} has been refunded. Reason: ${refundData.reason}`,
        data: JSON.parse(JSON.stringify({
          payment_id: paymentId,
          refund_amount: refundAmount,
          reason: refundData.reason,
        })),
      },
      {
        user_id: payment.doctor_id,
        type: "payment_success" as NotificationType,
        title: "Payment Refunded",
        message: `Payment of $${refundAmount} has been refunded to patient. Reason: ${refundData.reason}`,
        data: JSON.parse(JSON.stringify({
          payment_id: paymentId,
          refund_amount: refundAmount,
          reason: refundData.reason,
        })),
      },
    ];

    await supabase
      .from("notifications")
      .insert(notifications);

    revalidatePath("/payments");
    revalidatePath("/appointments");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Refund payment error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while processing refund",
    };
  }
} 