"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface UploadMedicalDocumentResult {
  success: boolean;
  error?: string;
  documentUrl?: string;
}

export async function uploadMedicalDocument(
  file: File,
  recordId: number
): Promise<UploadMedicalDocumentResult> {
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

    // Validate file
    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File size must be less than 10MB",
      };
    }

    // Check file type (allow PDF, images, and documents)
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload PDF, image, or document files only",
      };
    }

    // Get medical record and verify ownership
    const { data: medicalRecord, error: recordError } = await supabase
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

    // Only the doctor who created the record can upload documents
    if (medicalRecord.doctor_id !== user.id) {
      return {
        success: false,
        error: "You can only upload documents to your own medical records",
      };
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `medical-record-${recordId}-${Date.now()}.${fileExtension}`;
    const filePath = `medical-documents/${user.id}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message,
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    // Update medical record with document URL
    const { error: updateError } = await supabase
      .from("medical_records")
      .update({
        file_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recordId);

    if (updateError) {
      // If updating record fails, delete the uploaded file
      await supabase.storage
        .from("documents")
        .remove([filePath]);

      return {
        success: false,
        error: updateError.message,
      };
    }

    // Create notification for patient
    await supabase
      .from("notifications")
      .insert({
        user_id: medicalRecord.patient_id,
        type: "new_prescription",
        title: "Medical Document Added",
        message: "A new document has been added to your medical record.",
        data: {
          medical_record_id: recordId,
          document_url: publicUrl,
          document_name: file.name,
        },
      });

    revalidatePath("/medical-records");

    return {
      success: true,
      documentUrl: publicUrl,
    };
  } catch (error) {
    console.error("Upload medical document error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while uploading document",
    };
  }
} 