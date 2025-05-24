"use server";

import { createClient } from "@/lib/supabase/server";

type DocumentType = "medical_record" | "prescription" | "invoice";

interface DownloadDocumentResult {
  success: boolean;
  error?: string;
  downloadUrl?: string;
  fileName?: string;
}

export async function downloadDocument(
  documentId: number,
  documentType: DocumentType
): Promise<DownloadDocumentResult> {
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

    let documentPath: string | null = null;
    let fileName: string | null = null;
    let hasAccess = false;

    switch (documentType) {
      case "medical_record":
        // Check if user has access to this medical record
        const { data: medicalRecord, error: recordError } = await supabase
          .from("medical_records")
          .select("patient_id, doctor_id, attachments")
          .eq("id", documentId)
          .single();

        if (recordError) {
          return {
            success: false,
            error: "Medical record not found",
          };
        }

        // Allow access if user is the patient or the doctor
        hasAccess = user.id === medicalRecord.patient_id || user.id === medicalRecord.doctor_id;
        // Use first attachment if available
        documentPath = medicalRecord.attachments && medicalRecord.attachments.length > 0 
          ? medicalRecord.attachments[0] 
          : null;
        fileName = `medical-record-${documentId}.pdf`;
        break;

      case "prescription":
        // Check if user has access to this prescription
        const { data: prescription, error: prescriptionError } = await supabase
          .from("prescriptions")
          .select("patient_id, doctor_id")
          .eq("id", documentId)
          .single();

        if (prescriptionError) {
          return {
            success: false,
            error: "Prescription not found",
          };
        }

        hasAccess = user.id === prescription.patient_id || user.id === prescription.doctor_id;
        // Generate prescription document path (assuming it's stored in a specific format)
        documentPath = `prescriptions/${prescription.doctor_id}/prescription-${documentId}.pdf`;
        fileName = `prescription-${documentId}.pdf`;
        break;

      case "invoice":
        // Check if user has access to this payment/invoice
        const { data: payment, error: paymentError } = await supabase
          .from("payments")
          .select("patient_id, doctor_id, invoice_url")
          .eq("id", documentId)
          .single();

        if (paymentError) {
          return {
            success: false,
            error: "Invoice not found",
          };
        }

        hasAccess = user.id === payment.patient_id || user.id === payment.doctor_id;
        documentPath = payment.invoice_url;
        fileName = `invoice-${documentId}.pdf`;
        break;



      default:
        return {
          success: false,
          error: "Invalid document type",
        };
    }

    if (!hasAccess) {
      return {
        success: false,
        error: "You don't have permission to download this document",
      };
    }

    if (!documentPath) {
      return {
        success: false,
        error: "Document file not found",
      };
    }

    // Extract bucket and file path from the URL
    // Assuming documentPath is a storage URL like: documents/user_id/filename.pdf
    const bucket = "documents";
    const filePath = documentPath.replace(/.*\/documents\//, "");

    // Generate signed URL for download
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      downloadUrl: data.signedUrl,
      fileName,
    };
  } catch (error) {
    console.error("Download document error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while downloading document",
    };
  }
} 