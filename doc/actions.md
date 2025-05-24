Dựa vào PRD và schema database, tôi sẽ liệt kê tất cả các server actions cần thiết cho hệ thống đặt lịch khám bệnh:

## **1. Authentication & User Management Actions**

### **Auth Actions (FR01, FR02, FR05, FR06, FR07)**

```typescript
// auth/register.ts
async function registerUser(
  email: string,
  password: string,
  role: "patient" | "doctor",
  fullName: string
);

// auth/login.ts
async function loginUser(email: string, password: string);

// auth/logout.ts
async function logoutUser();

// auth/change-password.ts
async function changePassword(currentPassword: string, newPassword: string);

// auth/forgot-password.ts
async function forgotPassword(email: string);

// auth/reset-password.ts
async function resetPassword(token: string, newPassword: string);
```

### **Profile Management (FR03, FR04)**

```typescript
// users/update-profile.ts
async function updateUserProfile(profileData: UserProfileUpdate);

// users/get-profile.ts
async function getUserProfile(userId: string);

// users/upload-avatar.ts
async function uploadAvatar(file: File);
```

## **2. Patient Actions**

### **Patient Profile Management (FR09)**

```typescript
// patients/create-profile.ts
async function createPatientProfile(patientData: PatientProfile);

// patients/update-profile.ts
async function updatePatientProfile(patientData: PatientProfileUpdate);

// patients/get-profile.ts
async function getPatientProfile(patientId: string);
```

### **Doctor Search & Discovery (FR10, FR11)**

```typescript
// doctors/search.ts
async function searchDoctors(filters: DoctorSearchFilters);

// doctors/get-details.ts
async function getDoctorDetails(doctorId: string);

// doctors/get-reviews.ts
async function getDoctorReviews(doctorId: string, pagination: PaginationParams);
```

### **Appointment Booking (FR12, FR13, FR14, FR15)**

```typescript
// appointments/get-available-slots.ts
async function getAvailableSlots(doctorId: string, date: string);

// appointments/create-appointment.ts
async function createAppointment(appointmentData: CreateAppointmentData);

// appointments/get-patient-appointments.ts
async function getPatientAppointments(
  patientId: string,
  status?: AppointmentStatus
);

// appointments/update-appointment.ts
async function updateAppointment(
  appointmentId: number,
  updateData: AppointmentUpdate
);

// appointments/cancel-appointment.ts
async function cancelAppointment(appointmentId: number, reason: string);
```

### **Payment Actions (FR17, FR18)**

```typescript
// payments/create-payment.ts
async function createPayment(
  appointmentId: number,
  paymentMethod: PaymentMethod
);

// payments/process-payment.ts
async function processPayment(paymentId: number, paymentData: PaymentData);

// payments/get-payment-history.ts
async function getPaymentHistory(
  patientId: string,
  pagination: PaginationParams
);

// payments/get-payment-details.ts
async function getPaymentDetails(paymentId: number);
```

### **Reviews & Ratings (FR19)**

```typescript
// reviews/create-review.ts
async function createReview(appointmentId: number, reviewData: ReviewData);

// reviews/update-review.ts
async function updateReview(reviewId: number, reviewData: ReviewUpdate);

// reviews/delete-review.ts
async function deleteReview(reviewId: number);
```

### **Medical Records Access (FR20, FR21, FR22)**

```typescript
// medical-records/get-patient-records.ts
async function getPatientMedicalRecords(
  patientId: string,
  pagination: PaginationParams
);

// medical-records/get-record-details.ts
async function getMedicalRecordDetails(recordId: number);

// prescriptions/get-patient-prescriptions.ts
async function getPatientPrescriptions(
  patientId: string,
  status?: PrescriptionStatus
);

// documents/download-document.ts
async function downloadDocument(documentId: string, documentType: DocumentType);

// appointments/schedule-followup.ts
async function scheduleFollowup(
  medicalRecordId: number,
  followupData: FollowupData
);
```

## **3. Doctor Actions**

### **Doctor Profile Management (FR24, FR25)**

```typescript
// doctors/create-profile.ts
async function createDoctorProfile(doctorData: DoctorProfile);

// doctors/update-profile.ts
async function updateDoctorProfile(doctorData: DoctorProfileUpdate);

// doctors/upload-documents.ts
async function uploadDoctorDocuments(files: File[]);

// schedules/create-schedule.ts
async function createDoctorSchedule(scheduleData: DoctorScheduleData);

// schedules/update-schedule.ts
async function updateDoctorSchedule(
  scheduleId: number,
  scheduleData: ScheduleUpdate
);

// schedules/delete-schedule.ts
async function deleteDoctorSchedule(scheduleId: number);
```

### **Appointment Management (FR26, FR27)**

```typescript
// appointments/get-doctor-appointments.ts
async function getDoctorAppointments(
  doctorId: string,
  date?: string,
  status?: AppointmentStatus
);

// appointments/confirm-appointment.ts
async function confirmAppointment(appointmentId: number);

// appointments/reject-appointment.ts
async function rejectAppointment(appointmentId: number, reason: string);

// appointments/complete-appointment.ts
async function completeAppointment(appointmentId: number);
```

### **Patient Information Access (FR28)**

```typescript
// patients/get-patient-info.ts
async function getPatientInfo(patientId: string);

// patients/get-patient-history.ts
async function getPatientMedicalHistory(patientId: string);

// patients/get-patient-appointments.ts
async function getPatientAppointmentHistory(
  patientId: string,
  doctorId: string
);
```

### **Medical Documentation (FR29, FR30, FR31)**

```typescript
// medical-records/create-record.ts
async function createMedicalRecord(recordData: MedicalRecordData);

// medical-records/update-record.ts
async function updateMedicalRecord(
  recordId: number,
  recordData: MedicalRecordUpdate
);

// prescriptions/create-prescription.ts
async function createPrescription(prescriptionData: PrescriptionData);

// prescriptions/add-prescription-item.ts
async function addPrescriptionItem(
  prescriptionId: number,
  itemData: PrescriptionItemData
);

// prescriptions/update-prescription.ts
async function updatePrescription(
  prescriptionId: number,
  updateData: PrescriptionUpdate
);

// invoices/generate-invoice.ts
async function generateInvoice(appointmentId: number);

// documents/upload-medical-document.ts
async function uploadMedicalDocument(file: File, recordId: number);
```

### **Follow-up & Patient Management (FR32, FR34, FR35)**

```typescript
// appointments/create-followup-appointment.ts
async function createFollowupAppointment(
  originalAppointmentId: number,
  followupData: FollowupAppointmentData
);

// patients/get-regular-patients.ts
async function getRegularPatients(
  doctorId: string,
  pagination: PaginationParams
);

// notifications/send-patient-notification.ts
async function sendPatientNotification(
  patientId: string,
  notificationData: NotificationData
);
```

### **Reports & Analytics (FR33, FR36)**

```typescript
// reports/get-revenue-report.ts
async function getRevenueReport(doctorId: string, dateRange: DateRange);

// reports/get-patient-statistics.ts
async function getPatientStatistics(doctorId: string, dateRange: DateRange);

// reports/export-patient-list.ts
async function exportPatientList(
  doctorId: string,
  format: "excel" | "pdf",
  filters: PatientFilters
);
```

## **4. Common System Actions**

### **Notifications (FR08, FR16)**

```typescript
// notifications/get-notifications.ts
async function getUserNotifications(
  userId: string,
  pagination: PaginationParams
);

// notifications/mark-notification-read.ts
async function markNotificationAsRead(notificationId: number);

// notifications/create-notification.ts
async function createNotification(notificationData: NotificationData);

// notifications/send-appointment-reminder.ts
async function sendAppointmentReminder(appointmentId: number);
```

### **File Management**

```typescript
// files/upload-file.ts
async function uploadFile(file: File, bucket: string, path: string);

// files/delete-file.ts
async function deleteFile(filePath: string, bucket: string);

// files/get-file-url.ts
async function getFileUrl(filePath: string, bucket: string);
```

### **Search & Filtering**

```typescript
// search/global-search.ts
async function globalSearch(query: string, filters: SearchFilters);

// search/autocomplete.ts
async function autocompleteSearch(query: string, type: SearchType);
```

## **Tổng cộng: ~70 Server Actions**

Các server actions này đáp ứng đầy đủ các functional requirements trong PRD và tương thích với database schema đã thiết kế.
