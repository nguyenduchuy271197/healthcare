"use server";

import { createClient } from "@/lib/supabase/server";
import { PrescriptionStatus } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface UpdatePrescriptionStatusResult {
  success: boolean;
  error?: string;
}

export async function updatePrescriptionStatus(
  prescriptionId: number,
  status: PrescriptionStatus
): Promise<UpdatePrescriptionStatusResult> {
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

    // Get prescription details
    const { data: prescription, error: prescriptionError } = await supabase
      .from("prescriptions")
      .select("doctor_id, patient_id, status")
      .eq("id", prescriptionId)
      .single();

    if (prescriptionError) {
      return {
        success: false,
        error: "Prescription not found",
      };
    }

    // Check if user has permission to update this prescription
    if (prescription.doctor_id !== user.id) {
      return {
        success: false,
        error: "You can only update your own prescriptions",
      };
    }

    // Validate status transition
    if (prescription.status === "completed" && status !== "completed") {
      return {
        success: false,
        error: "Cannot change status of completed prescription",
      };
    }

    // Update prescription status
    const updateData: { status: PrescriptionStatus; dispensed_at?: string } = { status };
    
    if (status === "completed") {
      updateData.dispensed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("prescriptions")
      .update(updateData)
      .eq("id", prescriptionId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Create notification for patient if status changed to completed
    if (status === "completed") {
      await supabase
        .from("notifications")
        .insert({
          user_id: prescription.patient_id,
          type: "new_prescription",
          title: "Prescription Completed",
          message: "Your prescription has been dispensed and is ready for pickup.",
          data: {
            prescription_id: prescriptionId,
          },
        });
    }

    revalidatePath("/prescriptions");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update prescription status error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating prescription status",
    };
  }
} 