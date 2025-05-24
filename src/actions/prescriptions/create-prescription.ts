"use server";

import { createClient } from "@/lib/supabase/server";
import { PrescriptionInsertDto, NotificationType } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface CreatePrescriptionData {
  medicalRecordId: number;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  generalInstructions?: string;
  validUntil?: string;
}

interface CreatePrescriptionResult {
  success: boolean;
  error?: string;
  prescriptionId?: number;
}

export async function createPrescription(data: CreatePrescriptionData): Promise<CreatePrescriptionResult> {
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

    // Get medical record details and verify doctor
    const { data: medicalRecord, error: recordError } = await supabase
      .from("medical_records")
      .select("doctor_id, patient_id")
      .eq("id", data.medicalRecordId)
      .single();

    if (recordError) {
      return {
        success: false,
        error: "Medical record not found",
      };
    }

    if (medicalRecord.doctor_id !== user.id) {
      return {
        success: false,
        error: "You can only create prescriptions for your own medical records",
      };
    }

    // Check if prescription already exists
    const { data: existingPrescription } = await supabase
      .from("prescriptions")
      .select("id")
      .eq("medical_record_id", data.medicalRecordId)
      .single();

    if (existingPrescription) {
      return {
        success: false,
        error: "Prescription already exists for this medical record",
      };
    }

    // Create prescription
    const prescriptionData: PrescriptionInsertDto = {
      medical_record_id: data.medicalRecordId,
      patient_id: medicalRecord.patient_id,
      doctor_id: user.id,
      instructions: data.generalInstructions,
      valid_until: data.validUntil,
      status: "active",
    };

    const { data: prescription, error } = await supabase
      .from("prescriptions")
      .insert(prescriptionData)
      .select("id")
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Create prescription items
    if (data.medications && data.medications.length > 0) {
      const prescriptionItems = data.medications.map(med => ({
        prescription_id: prescription.id,
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
        // If creating items fails, delete the prescription
        await supabase.from("prescriptions").delete().eq("id", prescription.id);
        return {
          success: false,
          error: itemsError.message,
        };
      }
    }

    // Create notification for patient
    await supabase
      .from("notifications")
      .insert({
        user_id: medicalRecord.patient_id,
        type: "new_prescription" as NotificationType,
        title: "New Prescription Available",
        message: "Your doctor has issued a new prescription for you.",
        data: JSON.parse(JSON.stringify({
          prescription_id: prescription.id,
          medical_record_id: data.medicalRecordId,
        })),
      });

    revalidatePath("/prescriptions");
    revalidatePath("/medical-records");

    return {
      success: true,
      prescriptionId: prescription.id,
    };
  } catch (error) {
    console.error("Create prescription error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating prescription",
    };
  }
} 