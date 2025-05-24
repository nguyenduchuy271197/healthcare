"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface UploadDoctorDocumentsResult {
  success: boolean;
  error?: string;
  uploadedFiles?: string[];
}

export async function uploadDoctorDocuments(
  formData: FormData
): Promise<UploadDoctorDocumentsResult> {
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

    // Check if user is a doctor
    const { error: doctorError } = await supabase
      .from("doctors")
      .select("id")
      .eq("id", user.id)
      .single();

    if (doctorError) {
      return {
        success: false,
        error: "User must be a doctor to upload documents",
      };
    }

    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return {
        success: false,
        error: "No files provided",
      };
    }

    const uploadedFiles: string[] = [];
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

    for (const file of files) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `File ${file.name} has invalid type. Only PDF and image files are allowed.`,
        };
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        return {
          success: false,
          error: `File ${file.name} is too large. Maximum size is 10MB.`,
        };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `doctor-documents/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("medical-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // Clean up already uploaded files
        for (const uploadedFile of uploadedFiles) {
          await supabase.storage
            .from("medical-documents")
            .remove([uploadedFile]);
        }

        return {
          success: false,
          error: `Failed to upload ${file.name}: ${uploadError.message}`,
        };
      }

      uploadedFiles.push(filePath);
    }

    // Get public URLs for uploaded files
    const documentUrls = uploadedFiles.map(filePath => {
      const { data: { publicUrl } } = supabase.storage
        .from("medical-documents")
        .getPublicUrl(filePath);
      return publicUrl;
    });

    // Update doctor profile with document URLs (you may want to store this in a separate documents table)
    // For now, we'll add them to an array field or handle them separately
    
    // Create notification for admin to review documents
    await supabase
      .from("notifications")
      .insert({
        user_id: user.id, // In practice, this should go to admin users
        type: "new_prescription", // Using available type
        title: "Documents Uploaded for Verification",
        message: "New doctor verification documents have been uploaded and are pending review.",
        data: {
          doctor_id: user.id,
          document_count: uploadedFiles.length,
          document_urls: documentUrls,
        },
      });

    revalidatePath("/profile");
    revalidatePath("/documents");

    return {
      success: true,
      uploadedFiles: documentUrls,
    };
  } catch (error) {
    console.error("Upload doctor documents error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while uploading documents",
    };
  }
} 