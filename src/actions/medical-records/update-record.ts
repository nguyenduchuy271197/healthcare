"use server";

import { createClient } from "@/lib/supabase/server";
import { MedicalRecordUpdateDto } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface UpdateMedicalRecordData {
  diagnosis?: string;
  symptoms?: string;
  treatment?: string;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

interface UpdateMedicalRecordResult {
  success: boolean;
  error?: string;
}

export async function updateMedicalRecord(
  recordId: number,
  updateData: UpdateMedicalRecordData
): Promise<UpdateMedicalRecordResult> {
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

    // Get medical record details and verify ownership
    const { data: record, error: recordError } = await supabase
      .from("medical_records")
      .select("doctor_id, patient_id")
      .eq("id", recordId)
      .single();

    if (recordError) {
      return {
        success: false,
        error: "Medical record not found",
      };
    }

    if (record.doctor_id !== user.id) {
      return {
        success: false,
        error: "You can only update your own medical records",
      };
    }

    // Prepare update data
    const recordUpdate: MedicalRecordUpdateDto = {};
    
    if (updateData.diagnosis !== undefined) recordUpdate.diagnosis = updateData.diagnosis;
    if (updateData.symptoms !== undefined) recordUpdate.symptoms = updateData.symptoms;
    if (updateData.treatment !== undefined) recordUpdate.treatment_plan = updateData.treatment;
    if (updateData.notes !== undefined) recordUpdate.notes = updateData.notes;
    if (updateData.followUpRequired !== undefined) recordUpdate.follow_up_required = updateData.followUpRequired;
    if (updateData.followUpDate !== undefined) recordUpdate.follow_up_date = updateData.followUpDate;

    recordUpdate.updated_at = new Date().toISOString();

    // Update medical record
    const { error } = await supabase
      .from("medical_records")
      .update(recordUpdate)
      .eq("id", recordId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Create notification for patient if there are significant updates
    if (updateData.diagnosis || updateData.treatment) {
      await supabase
        .from("notifications")
        .insert({
          user_id: record.patient_id,
          type: "new_prescription",
          title: "Medical Record Updated",
          message: "Your medical record has been updated by your doctor.",
          data: {
            record_id: recordId,
            updated_fields: Object.keys(updateData),
          },
        });
    }

    revalidatePath("/medical-records");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update medical record error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating medical record",
    };
  }
} 