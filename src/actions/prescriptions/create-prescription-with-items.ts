"use server";

import { createClient } from "@/lib/supabase/server";
import { PrescriptionInsertDto, NotificationType } from "@/types/custom.types";
import { revalidatePath } from "next/cache";



interface CreatePrescriptionWithItemsData {
  medicalRecordId: number;
  patientId: string;
  doctorId: string;
  instructions?: string;
  totalAmount: number;
  validUntil?: string;
}

interface CreatePrescriptionWithItemsResult {
  success: boolean;
  error?: string;
  data?: {
    id: number;
  };
}

export async function createPrescriptionWithItems(
  data: CreatePrescriptionWithItemsData
): Promise<CreatePrescriptionWithItemsResult> {
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

    if (user.id !== data.doctorId) {
      return {
        success: false,
        error: "You can only create prescriptions for yourself",
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

    // Create prescription
    const prescriptionData: PrescriptionInsertDto = {
      medical_record_id: data.medicalRecordId,
      patient_id: data.patientId,
      doctor_id: data.doctorId,
      instructions: data.instructions,
      total_amount: data.totalAmount,
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

    // Create notification for patient
    await supabase
      .from("notifications")
      .insert({
        user_id: data.patientId,
        type: "new_prescription" as NotificationType,
        title: "New Prescription Available",
        message: "Your doctor has issued a new prescription for you.",
        data: {
          prescription_id: prescription.id,
          medical_record_id: data.medicalRecordId,
        },
      });

    revalidatePath("/prescriptions");
    revalidatePath("/medical-records");

    return {
      success: true,
      data: {
        id: prescription.id,
      },
    };
  } catch (error) {
    console.error("Create prescription with items error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating prescription",
    };
  }
}

interface AddPrescriptionItemWithPriceData {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  unitPrice: number;
  instructions?: string;
}

interface AddPrescriptionItemWithPriceResult {
  success: boolean;
  error?: string;
}

export async function addPrescriptionItemWithPrice(
  prescriptionId: number,
  itemData: AddPrescriptionItemWithPriceData
): Promise<AddPrescriptionItemWithPriceResult> {
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

    // Add new prescription item
    const { error } = await supabase
      .from("prescription_items")
      .insert({
        prescription_id: prescriptionId,
        medication_name: itemData.medicationName,
        dosage: itemData.dosage,
        frequency: itemData.frequency,
        duration: itemData.duration,
        quantity: itemData.quantity,
        unit_price: itemData.unitPrice,
        instructions: itemData.instructions,
      });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/prescriptions");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Add prescription item with price error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while adding prescription item",
    };
  }
} 