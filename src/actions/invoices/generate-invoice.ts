"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@/types/custom.types";

interface GenerateInvoiceResult {
  success: boolean;
  error?: string;
  invoiceId?: number;
  invoiceUrl?: string;
}

export async function generateInvoice(appointmentId: number): Promise<GenerateInvoiceResult> {
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

    // Get appointment details with related data
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(`
        doctor_id,
        patient_id,
        status,
        consultation_fee,
        appointment_date,
        appointment_time,
        duration_minutes,
        doctors (
          user_profiles (
            full_name
          ),
          clinic_address,
          license_number
        ),
        patients (
          user_profiles (
            full_name,
            phone,
            address
          )
        )
      `)
      .eq("id", appointmentId)
      .single();

    if (appointmentError) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }

    // Check if user is the doctor for this appointment
    if (appointment.doctor_id !== user.id) {
      return {
        success: false,
        error: "You can only generate invoices for your own appointments",
      };
    }

    // Check if appointment is completed
    if (appointment.status !== "completed") {
      return {
        success: false,
        error: "Invoice can only be generated for completed appointments",
      };
    }

    // Check if payment/invoice already exists
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, invoice_url")
      .eq("appointment_id", appointmentId)
      .single();

    if (existingPayment && existingPayment.invoice_url) {
      return {
        success: false,
        error: "Invoice already exists for this appointment",
      };
    }



    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${appointmentId}`;

    // Calculate amounts
    const subtotal = appointment.consultation_fee || 0;
    const taxRate = 0.1; // 10% tax
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    // Generate invoice URL (could be a PDF generation service or storage path)
    const invoiceUrl = `invoices/${appointment.doctor_id}/invoice-${invoiceNumber}.pdf`;

    // Create or update payment record with invoice information
    let paymentId: number;
    
    if (existingPayment) {
      // Update existing payment with invoice URL
      const { data: updatedPayment, error } = await supabase
        .from("payments")
        .update({
          invoice_url: invoiceUrl,
        })
        .eq("id", existingPayment.id)
        .select("id")
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }
      
      paymentId = updatedPayment.id;
    } else {
      // Create new payment record
      const { data: payment, error } = await supabase
        .from("payments")
        .insert({
          appointment_id: appointmentId,
          doctor_id: appointment.doctor_id,
          patient_id: appointment.patient_id,
          amount: totalAmount,
          payment_method: "credit_card",
          status: "pending",
          invoice_url: invoiceUrl,
        })
        .select("id")
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }
      
      paymentId = payment.id;
    }

    // Create notification for patient (don't fail if this fails)
    try {
      await supabase
        .from("notifications")
        .insert({
          user_id: appointment.patient_id,
          type: "payment_success" as NotificationType,
          title: "Invoice Generated",
          message: `Invoice ${invoiceNumber} has been generated for your appointment.`,
          data: {
            payment_id: paymentId,
            invoice_number: invoiceNumber,
            total_amount: totalAmount,
          },
        });
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError);
      // Continue without failing the invoice generation
    }

    revalidatePath("/payments");
    revalidatePath("/appointments");

    return {
      success: true,
      invoiceId: paymentId,
      invoiceUrl: invoiceUrl,
    };
  } catch (error) {
    console.error("Generate invoice error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while generating invoice",
    };
  }
} 