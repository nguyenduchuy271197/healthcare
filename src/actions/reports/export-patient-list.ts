"use server";

import { createClient } from "@/lib/supabase/server";

interface PatientFilters {
  ageRange?: {
    min?: number;
    max?: number;
  };
  gender?: string;
  condition?: string;
  lastVisitFrom?: string;
  lastVisitTo?: string;
}

interface ExportPatientListResult {
  success: boolean;
  error?: string;
  downloadUrl?: string;
  fileName?: string;
}

export async function exportPatientList(
  doctorId?: string,
  format: "excel" | "pdf" = "excel",
  filters: PatientFilters = {}
): Promise<ExportPatientListResult> {
  try {
    const supabase = createClient();

    let targetDoctorId = doctorId;

    // If no doctorId provided, get current user
    if (!targetDoctorId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      targetDoctorId = user.id;
    }

    // Get patients for this doctor with filters
    let query = supabase
      .from("appointments")
      .select(`
        patient_id,
        appointment_date,
        status,
        patients (
          id,
          created_at,
          emergency_contact_name,
          emergency_contact_phone,
          user_profiles (
            full_name,
            phone,
            date_of_birth,
            gender,
            address
          )
        ),
        medical_records (
          diagnosis,
          created_at
        )
      `)
      .eq("doctor_id", targetDoctorId)
      .in("status", ["completed", "confirmed"]);

    // Apply date filters
    if (filters.lastVisitFrom) {
      query = query.gte("appointment_date", filters.lastVisitFrom);
    }
    if (filters.lastVisitTo) {
      query = query.lte("appointment_date", filters.lastVisitTo);
    }

    const { data: appointments, error: appointmentsError } = await query;

    if (appointmentsError) {
      return {
        success: false,
        error: appointmentsError.message,
      };
    }

    if (!appointments || appointments.length === 0) {
      return {
        success: false,
        error: "No patients found with the specified criteria",
      };
    }

    // Process and filter unique patients
    const patientMap = new Map();

    appointments.forEach(appointment => {
      const patient = appointment.patients as {
        id: string;
        created_at: string;
        emergency_contact_name?: string;
        emergency_contact_phone?: string;
        user_profiles: {
          full_name: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
          address?: string;
        };
      };

      if (!patientMap.has(patient.id)) {
        const patientAge = patient.user_profiles.date_of_birth 
          ? new Date().getFullYear() - new Date(patient.user_profiles.date_of_birth).getFullYear()
          : null;

        // Apply age filter
        if (filters.ageRange) {
          if (filters.ageRange.min && patientAge && patientAge < filters.ageRange.min) return;
          if (filters.ageRange.max && patientAge && patientAge > filters.ageRange.max) return;
        }

        // Apply gender filter
        if (filters.gender && patient.user_profiles.gender !== filters.gender) return;

        patientMap.set(patient.id, {
          id: patient.id,
          full_name: patient.user_profiles.full_name,
          email: "N/A", // Email not available in user_profiles
          phone: patient.user_profiles.phone || "N/A",
          date_of_birth: patient.user_profiles.date_of_birth || "N/A",
          age: patientAge || "N/A",
          gender: patient.user_profiles.gender || "N/A",
          address: patient.user_profiles.address || "N/A",
          emergency_contact: patient.emergency_contact_name 
            ? `${patient.emergency_contact_name} (${patient.emergency_contact_phone || 'No phone'})`
            : "N/A",
          first_appointment: appointment.appointment_date,
          last_appointment: appointment.appointment_date,
          total_appointments: 1,
          conditions: [],
        });
      } else {
        const existingPatient = patientMap.get(patient.id);
        existingPatient.total_appointments++;
        
        // Update last appointment date
        if (appointment.appointment_date > existingPatient.last_appointment) {
          existingPatient.last_appointment = appointment.appointment_date;
        }
        
        // Update first appointment date
        if (appointment.appointment_date < existingPatient.first_appointment) {
          existingPatient.first_appointment = appointment.appointment_date;
        }
      }

      // Add medical conditions
      if (appointment.medical_records && Array.isArray(appointment.medical_records)) {
        const patientData = patientMap.get(patient.id);
        appointment.medical_records.forEach((record: { diagnosis?: string }) => {
          if (record.diagnosis && !patientData.conditions.includes(record.diagnosis)) {
            patientData.conditions.push(record.diagnosis);
          }
        });
      }
    });

    let filteredPatients = Array.from(patientMap.values());

    // Apply condition filter
    if (filters.condition) {
      filteredPatients = filteredPatients.filter(patient => 
        patient.conditions.some((condition: string) => 
          condition.toLowerCase().includes(filters.condition!.toLowerCase())
        )
      );
    }

    if (filteredPatients.length === 0) {
      return {
        success: false,
        error: "No patients found matching the specified filters",
      };
    }

    // Generate file content based on format
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `patient-list-${timestamp}.${format}`;

    if (format === "excel") {
      // For Excel export, we'd typically use a library like xlsx
      // For now, we'll create CSV data that can be opened in Excel
      const csvHeaders = [
        "Patient ID",
        "Full Name", 
        "Email",
        "Phone",
        "Date of Birth",
        "Age", 
        "Gender",
        "Address",
        "Emergency Contact",
        "First Appointment",
        "Last Appointment", 
        "Total Appointments",
        "Medical Conditions"
      ].join(",");

      const csvRows = filteredPatients.map(patient => [
        patient.id,
        `"${patient.full_name}"`,
        patient.email,
        patient.phone,
        patient.date_of_birth,
        patient.age,
        patient.gender,
        `"${patient.address}"`,
        `"${patient.emergency_contact}"`,
        patient.first_appointment,
        patient.last_appointment,
        patient.total_appointments,
        `"${patient.conditions.join('; ')}"`,
      ].join(","));

      const csvContent = [csvHeaders, ...csvRows].join("\n");

      // Upload CSV to storage
      const filePath = `exports/${targetDoctorId}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, csvContent, {
          contentType: "text/csv",
        });

      if (uploadError) {
        return {
          success: false,
          error: uploadError.message,
        };
      }

      // Get signed URL for download
      const { data: urlData, error: urlError } = await supabase.storage
        .from("documents")
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (urlError) {
        return {
          success: false,
          error: urlError.message,
        };
      }

      return {
        success: true,
        downloadUrl: urlData.signedUrl,
        fileName,
      };
    } else {
      // PDF format would require a PDF generation library
      // For now, return success with a placeholder
      return {
        success: false,
        error: "PDF export is not yet implemented. Please use Excel format.",
      };
    }
  } catch (error) {
    console.error("Export patient list error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while exporting patient list",
    };
  }
} 