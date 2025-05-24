"use server";

import { createClient } from "@/lib/supabase/server";
import { PrescriptionUpdateDto, NotificationType } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface UpdatePrescriptionData {
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  generalInstructions?: string;
  validUntil?: string;
}

interface UpdatePrescriptionResult {
  success: boolean;
  error?: string;
}

export async function updatePrescription(
  prescriptionId: number,
  updateData: UpdatePrescriptionData
): Promise<UpdatePrescriptionResult> {
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

    // Get prescription details and verify ownership
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

    if (prescription.doctor_id !== user.id) {
      return {
        success: false,
        error: "You can only update your own prescriptions",
      };
    }

    if (prescription.status === "completed") {
      return {
        success: false,
        error: "Cannot update completed prescriptions",
      };
    }

    // Prepare update data
    const prescriptionUpdate: PrescriptionUpdateDto = {};
    
    if (updateData.generalInstructions !== undefined) prescriptionUpdate.instructions = updateData.generalInstructions;
    if (updateData.validUntil !== undefined) prescriptionUpdate.valid_until = updateData.validUntil;

    prescriptionUpdate.updated_at = new Date().toISOString();

    // Update prescription
    const { error } = await supabase
      .from("prescriptions")
      .update(prescriptionUpdate)
      .eq("id", prescriptionId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Update medications if provided
    if (updateData.medications !== undefined) {
      // First, delete existing prescription items
      await supabase
        .from("prescription_items")
        .delete()
        .eq("prescription_id", prescriptionId);

      // Then insert new items
      if (updateData.medications.length > 0) {
        const prescriptionItems = updateData.medications.map(med => ({
          prescription_id: prescriptionId,
          medication_name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          quantity: 1, // Default quantity
          instructions: med.instructions,
        }));

        const { error: itemsError } = await supabase
          .from("prescription_items")
          .insert(prescriptionItems);

        if (itemsError) {
          return {
            success: false,
            error: itemsError.message,
          };
        }
      }
    }

    // Create notification for patient
    await supabase
      .from("notifications")
      .insert({
        user_id: prescription.patient_id,
        type: "new_prescription" as NotificationType,
        title: "Prescription Updated",
        message: "Your prescription has been updated by your doctor.",
        data: JSON.parse(JSON.stringify({
          prescription_id: prescriptionId,
          updated_fields: Object.keys(updateData),
        })),
      });

    revalidatePath("/prescriptions");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update prescription error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating prescription",
    };
  }
} 