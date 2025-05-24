"use server";

import { createClient } from "@/lib/supabase/server";

interface DeleteFileResult {
  success: boolean;
  error?: string;
}

export async function deleteFile(
  filePath: string,
  bucket: string
): Promise<DeleteFileResult> {
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

    // Validate that user owns the file (files should be prefixed with user ID)
    if (!filePath.startsWith(user.id)) {
      return {
        success: false,
        error: "You can only delete your own files",
      };
    }

    // Delete file from storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete file error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while deleting file",
    };
  }
} 