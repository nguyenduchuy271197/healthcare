// Authentication actions
export { registerUser } from "./auth/register";
export { loginUser } from "./auth/login";
export { logoutUser } from "./auth/logout";
export { changePassword } from "./auth/change-password";
export { forgotPassword } from "./auth/forgot-password";
export { resetPassword } from "./auth/reset-password";

// User management actions
export { updateUserProfile } from "./users/update-profile";
export { getUserProfile } from "./users/get-profile";
export { uploadAvatar } from "./users/upload-avatar";

// Patient actions
export { createPatientProfile } from "./patients/create-profile";
export { updatePatientProfile } from "./patients/update-profile";
export { getPatientProfile } from "./patients/get-profile";

// Doctor actions
export { searchDoctors } from "./doctors/search";
export { getDoctorDetails } from "./doctors/get-details";
export { getDoctorReviews } from "./doctors/get-reviews";
export { createDoctorProfile } from "./doctors/create-profile";
export { updateDoctorProfile } from "./doctors/update-profile";
export { getDoctorProfile } from "./doctors/get-profile";
export { uploadDoctorDocuments } from "./doctors/upload-documents";

// Appointment actions
export { getAvailableSlots } from "./appointments/get-available-slots";
export { createAppointment } from "./appointments/create-appointment";
export { getPatientAppointments } from "./appointments/get-patient-appointments";
export { getDoctorAppointments } from "./appointments/get-doctor-appointments";
export { getDoctorAppointmentsDetailed } from "./appointments/get-doctor-appointments-detailed";
export { cancelAppointment } from "./appointments/cancel-appointment";
export { updateAppointment } from "./appointments/update-appointment";
export { updateAppointmentStatus } from "./appointments/update-status";
export { rescheduleAppointment } from "./appointments/reschedule-appointment";

// Schedule actions
export { createDoctorSchedule } from "./schedules/create-schedule";
export { getDoctorSchedules } from "./schedules/get-doctor-schedules";
export { updateDoctorSchedule } from "./schedules/update-schedule";
export { deleteDoctorSchedule } from "./schedules/delete-schedule";

// Notification actions
export { getUserNotifications } from "./notifications/get-notifications";
export { markNotificationAsRead, markAllNotificationsAsRead } from "./notifications/mark-as-read";
export { sendAppointmentReminder } from "./notifications/send-appointment-reminder";

// Review actions
export { createReview } from "./reviews/create-review";
export { getPatientReviews } from "./reviews/get-patient-reviews";

// Payment actions
export { createPayment } from "./payments/create-payment";
export { processPayment } from "./payments/process-payment";
export { getPaymentHistory } from "./payments/get-payment-history";
export { getPaymentDetails } from "./payments/get-payment-details";
export { refundPayment } from "./payments/refund-payment";

// Medical record actions
export { getPatientMedicalRecords } from "./medical-records/get-patient-records";
export { createMedicalRecord } from "./medical-records/create-record";
export { getMedicalRecordDetails } from "./medical-records/get-record-details";

// Prescription actions
export { createPrescription } from "./prescriptions/create-prescription";
export { getPatientPrescriptions } from "./prescriptions/get-patient-prescriptions";
export { updatePrescriptionStatus } from "./prescriptions/update-prescription-status";

// Advanced appointment actions
export { scheduleFollowup } from "./appointments/schedule-followup";

// Extended review actions
export { updateReview } from "./reviews/update-review";
export { deleteReview } from "./reviews/delete-review";

// File management actions
export { uploadFile } from "./files/upload-file";

// Search actions
export { globalSearch } from "./search/global-search";

// Patient information actions
export { getPatientInfo } from "./patients/get-patient-info";
export { getRegularPatients } from "./patients/get-regular-patients";

// Extended appointment actions
export { confirmAppointment } from "./appointments/confirm-appointment";
export { rejectAppointment } from "./appointments/reject-appointment";
export { completeAppointment } from "./appointments/complete-appointment";

// Extended medical record actions
export { updateMedicalRecord } from "./medical-records/update-record";

// Extended prescription actions
export { updatePrescription } from "./prescriptions/update-prescription";

// Invoice actions
export { generateInvoice } from "./invoices/generate-invoice";

// Extended notification actions
export { createNotification } from "./notifications/create-notification";

// Extended file management actions
export { deleteFile } from "./files/delete-file";
export { getFileUrl } from "./files/get-file-url";

// Report actions
export { getRevenueReport } from "./reports/get-revenue-report";

// Extended search actions
export { autocompleteSearch } from "./search/autocomplete";

// Patient history actions
export { getPatientMedicalHistory } from "./patients/get-patient-history";
export { getPatientAppointmentHistory } from "./patients/get-patient-appointments";

// Advanced prescription actions
export { addPrescriptionItem } from "./prescriptions/add-prescription-item";
export { 
  createPrescriptionWithItems, 
  addPrescriptionItemWithPrice 
} from "./prescriptions/create-prescription-with-items";

// Follow-up appointment actions
export { createFollowupAppointment } from "./appointments/create-followup-appointment";

// Advanced notification actions
export { sendPatientNotification } from "./notifications/send-patient-notification";

// Advanced reporting actions
export { getPatientStatistics } from "./reports/get-patient-statistics";
export { exportPatientList } from "./reports/export-patient-list";

// Document management actions
export { downloadDocument } from "./documents/download-document";
export { uploadMedicalDocument } from "./documents/upload-medical-document"; 