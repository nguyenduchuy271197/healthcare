"use server";

import { createClient } from "@/lib/supabase/server";
import { MedicalRecordInsertDto, NotificationType } from "@/types/custom.types";
import { revalidatePath } from "next/cache";

interface CreateMedicalRecordData {
  appointmentId: number;
  diagnosis: string;
  symptoms: string;
  treatmentPlan: string;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

interface CreateMedicalRecordResult {
  success: boolean;
  error?: string;
  recordId?: number;
}

export async function createMedicalRecord(data: CreateMedicalRecordData): Promise<CreateMedicalRecordResult> {
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

    // Get appointment details and verify doctor
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("doctor_id, patient_id, status")
      .eq("id", data.appointmentId)
      .single();

    if (appointmentError) {
      return {
        success: false,
        error: "Appointment not found",
      };
    }

    if (appointment.doctor_id !== user.id) {
      return {
        success: false,
        error: "You can only create medical records for your own appointments",
      };
    }

    if (appointment.status !== "completed") {
      return {
        success: false,
        error: "Medical records can only be created for completed appointments",
      };
    }

    // Check if medical record already exists
    const { data: existingRecord } = await supabase
      .from("medical_records")
      .select("id")
      .eq("appointment_id", data.appointmentId)
      .single();

    if (existingRecord) {
      return {
        success: false,
        error: "Medical record already exists for this appointment",
      };
    }

    // Create medical record
    const recordData: MedicalRecordInsertDto = {
      appointment_id: data.appointmentId,
      patient_id: appointment.patient_id,
      doctor_id: user.id,
      diagnosis: data.diagnosis,
      symptoms: data.symptoms,
      treatment_plan: data.treatmentPlan,
      notes: data.notes,
      follow_up_required: data.followUpRequired || false,
      follow_up_date: data.followUpDate,
    };

    const { data: record, error } = await supabase
      .from("medical_records")
      .insert(recordData)
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
        user_id: appointment.patient_id,
        type: "new_prescription" as NotificationType,
        title: "Medical Record Created",
        message: "Your doctor has created a medical record for your recent appointment.",
        data: {
          record_id: record.id,
          appointment_id: data.appointmentId,
        },
      });

    // Create follow-up notification if required
    if (data.followUpRequired && data.followUpDate) {
      await supabase
        .from("notifications")
        .insert({
          user_id: appointment.patient_id,
          type: "follow_up_required" as NotificationType,
          title: "Follow-up Required",
          message: `You have a follow-up appointment scheduled for ${data.followUpDate}`,
          data: {
            record_id: record.id,
            follow_up_date: data.followUpDate,
          },
        });
    }

    revalidatePath("/medical-records");
    revalidatePath("/appointments");

    return {
      success: true,
      recordId: record.id,
    };
  } catch (error) {
    console.error("Create medical record error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating medical record",
    };
  }
} 