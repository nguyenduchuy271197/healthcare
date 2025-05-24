"use server";

import { createClient } from "@/lib/supabase/server";

interface UploadFileResult {
  success: boolean;
  error?: string;
  filePath?: string;
  publicUrl?: string;
}

export async function uploadFile(
  formData: FormData,
  bucket: string,
  path: string
): Promise<UploadFileResult> {
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

    const file = formData.get("file") as File;

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Validate file size (10MB max for medical documents, 5MB for images)
    const maxSize = bucket === "medical-documents" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
      };
    }

    // Validate file type based on bucket
    if (bucket === "medical-documents") {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: "Only PDF and image files are allowed for medical documents",
        };
      }
    } else if (bucket === "profile-images") {
      if (!file.type.startsWith("image/")) {
        return {
          success: false,
          error: "Only image files are allowed",
        };
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
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
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      filePath,
      publicUrl,
    };
  } catch (error) {
    console.error("Upload file error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while uploading file",
    };
  }
}