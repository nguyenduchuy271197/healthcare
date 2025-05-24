"use server";

import { createClient } from "@/lib/supabase/server";
import { PaymentInsertDto, PaymentMethod } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface CreatePaymentData {
  appointmentId: number;
  paymentMethod: PaymentMethod;
  amount?: number;
}

interface CreatePaymentResult {
  success: boolean;
  error?: string;
  paymentId?: number;
  paymentUrl?: string;
}

export async function createPayment(data: CreatePaymentData): Promise<CreatePaymentResult> {
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

    // Get appointment details and verify ownership
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("patient_id, doctor_id, consultation_fee, status")
      .eq("id", data.appointmentId)
      .single();

    if (appointmentError) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }

    if (appointment.patient_id !== user.id) {
      return {
        success: false,
        error: "You can only create payments for your own appointments",
      };
    }

    if (appointment.status !== "confirmed") {
      return {
        success: false,
        error: "Payment can only be made for confirmed appointments",
      };
    }

    // Check if payment already exists
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("appointment_id", data.appointmentId)
      .single();

    if (existingPayment) {
      return {
        success: false,
        error: "Payment already exists for this appointment",
      };
    }

    const amount = data.amount || appointment.consultation_fee || 100;

    // Create payment record
    const paymentData: PaymentInsertDto = {
      appointment_id: data.appointmentId,
      patient_id: user.id,
      doctor_id: appointment.doctor_id,
      amount,
      payment_method: data.paymentMethod,
      status: "pending",
    };

    const { data: payment, error } = await supabase
      .from("payments")
      .insert(paymentData)
      .select("id")
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Generate payment URL based on method
    let paymentUrl: string | undefined;
    
    switch (data.paymentMethod) {
      case "credit_card":
        paymentUrl = `/payments/credit-card/${payment.id}`;
        break;
      case "bank_transfer":
        paymentUrl = `/payments/bank-transfer/${payment.id}`;
        break;
      case "wallet":
        paymentUrl = `/payments/wallet/${payment.id}`;
        break;
      case "cash":
        // Cash payments are processed in person
        await supabase
          .from("payments")
          .update({ status: "completed", paid_at: new Date().toISOString() })
          .eq("id", payment.id);
        break;
    }

    revalidatePath("/payments");
    revalidatePath("/appointments");

    return {
      success: true,
      paymentId: payment.id,
      paymentUrl,
    };
  } catch (error) {
    console.error("Create payment error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating payment",
    };
  }
} 