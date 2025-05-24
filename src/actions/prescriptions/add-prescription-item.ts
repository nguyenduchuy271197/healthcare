"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@/types/custom.types";

interface PrescriptionItemData {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface AddPrescriptionItemResult {
  success: boolean;
  error?: string;
}

export async function addPrescriptionItem(
  prescriptionId: number,
  itemData: PrescriptionItemData
): Promise<AddPrescriptionItemResult> {
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
        error: "You can only add items to your own prescriptions",
      };
    }

    if (prescription.status === "completed") {
      return {
        success: false,
        error: "Cannot add items to completed prescriptions",
      };
    }

    // Validate medication data
    if (!itemData.name || !itemData.dosage || !itemData.frequency || !itemData.duration) {
      return {
        success: false,
        error: "Name, dosage, frequency, and duration are required",
      };
    }

    // Check if medication already exists in prescription_items
    const { data: existingItem } = await supabase
      .from("prescription_items")
      .select("id")
      .eq("prescription_id", prescriptionId)
      .ilike("medication_name", itemData.name)
      .single();

    if (existingItem) {
      return {
        success: false,
        error: "Medication already exists in this prescription",
      };
    }

    // Add new prescription item
    const { error } = await supabase
      .from("prescription_items")
      .insert({
        prescription_id: prescriptionId,
        medication_name: itemData.name,
        dosage: itemData.dosage,
        frequency: itemData.frequency,
        duration: itemData.duration,
        quantity: 1, // Default quantity
        instructions: itemData.instructions,
      });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Create notification for patient
    await supabase
      .from("notifications")
      .insert({
        user_id: prescription.patient_id,
        type: "new_prescription" as NotificationType,
        title: "Prescription Updated",
        message: `A new medication "${itemData.name}" has been added to your prescription.`,
        data: JSON.parse(JSON.stringify({
          prescription_id: prescriptionId,
          medication_name: itemData.name,
        })),
      });

    revalidatePath("/prescriptions");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Add prescription item error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while adding prescription item",
    };
  }
} 