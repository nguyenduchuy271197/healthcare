"use server";

import { createClient } from "@/lib/supabase/server";

interface GetFileUrlResult {
  success: boolean;
  error?: string;
  publicUrl?: string;
  signedUrl?: string;
}

export async function getFileUrl(
  filePath: string,
  bucket: string,
  signed: boolean = false,
  expiresIn: number = 3600
): Promise<GetFileUrlResult> {
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

    if (!filePath || !bucket) {
      return {
        success: false,
        error: "File path and bucket are required",
      };
    }

    if (signed) {
      // Generate signed URL for private files
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        signedUrl: data.signedUrl,
      };
    } else {
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        success: true,
        publicUrl,
      };
    }
  } catch (error) {
    console.error("Get file URL error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while getting file URL",
    };
  }
} 