import { Database } from "./database.types";

export type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Row<"user_profiles">;
export type ProfileInsertDto = InsertDto<"user_profiles">;
export type ProfileUpdateDto = UpdateDto<"user_profiles">;

export type Patient = Row<"patients">;
export type PatientInsertDto = InsertDto<"patients">;
export type PatientUpdateDto = UpdateDto<"patients">;

export type Doctor = Row<"doctors">;
export type DoctorInsertDto = InsertDto<"doctors">;
export type DoctorUpdateDto = UpdateDto<"doctors">;

export type Appointment = Row<"appointments">;
export type AppointmentInsertDto = InsertDto<"appointments">;
export type AppointmentUpdateDto = UpdateDto<"appointments">;

export type MedicalRecord = Row<"medical_records">;
export type MedicalRecordInsertDto = InsertDto<"medical_records">;
export type MedicalRecordUpdateDto = UpdateDto<"medical_records">;

export type Prescription = Row<"prescriptions">;
export type PrescriptionInsertDto = InsertDto<"prescriptions">;
export type PrescriptionUpdateDto = UpdateDto<"prescriptions">;

export type PrescriptionItem = Row<"prescription_items">;
export type PrescriptionItemInsertDto = InsertDto<"prescription_items">;
export type PrescriptionItemUpdateDto = UpdateDto<"prescription_items">;

export type Payment = Row<"payments">;
export type PaymentInsertDto = InsertDto<"payments">;
export type PaymentUpdateDto = UpdateDto<"payments">;

export type Review = Row<"reviews">;
export type ReviewInsertDto = InsertDto<"reviews">;
export type ReviewUpdateDto = UpdateDto<"reviews">;

export type Notification = Row<"notifications">;
export type NotificationInsertDto = InsertDto<"notifications">;
export type NotificationUpdateDto = UpdateDto<"notifications">;

export type DoctorSchedule = Row<"doctor_schedules">;
export type DoctorScheduleInsertDto = InsertDto<"doctor_schedules">;
export type DoctorScheduleUpdateDto = UpdateDto<"doctor_schedules">;


export type UserRole = Database["public"]["Enums"]["user_role"];
export type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type PrescriptionStatus = Database["public"]["Enums"]["prescription_status"];

// Extended types for components
export type MedicalRecordWithDetails = MedicalRecord & {
  appointments: {
    appointment_date: string;
    appointment_time: string;
    reason: string;
  };
  doctors: {
    user_profiles: {
      full_name: string;
      specialization?: string;
    };
  };
  prescriptions?: Array<Prescription & {
    prescription_items: Array<PrescriptionItem>;
  }>;
};

export type PrescriptionWithItems = Prescription & {
  prescription_items: Array<PrescriptionItem>;
};

export type AppointmentWithPatient = Appointment & {
  patients: {
    user_profiles: {
      full_name: string;
      phone?: string;
    };
  };
  medical_records?: Array<MedicalRecord & {
    patients: {
      user_profiles: {
        full_name: string;
      };
    };
  }>;
};

export type MedicalRecordForPrescription = MedicalRecord & {
  patients: {
    user_profiles: {
      full_name: string;
    };
  };
};
