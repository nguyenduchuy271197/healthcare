# Information Architecture - Ứng dụng Đặt lịch Khám bệnh

## Sitemap Overview

```
Ứng dụng Đặt lịch Khám bệnh
├── Authentication (Xác thực)
├── Patient Portal (Cổng Bệnh nhân)
├── Doctor Portal (Cổng Bác sĩ)
└── Shared Features (Tính năng chung)
```

## Detailed Information Architecture

### 1. Authentication Flow

**Functional Requirements Mapping: FR01, FR02, FR05, FR06, FR07**

```
Authentication/
├── Sign Up (Đăng ký)
│   ├── Choose Role (Chọn vai trò)
│   │   ├── Patient Registration → FR01
│   │   └── Doctor Registration → FR01
│   └── Account Verification → FR02
├── Sign In (Đăng nhập) → FR02
│   ├── Two-Factor Authentication → FR02
│   └── Remember Device
├── Password Management
│   ├── Change Password → FR06
│   └── Forgot Password → FR07
└── Sign Out → FR05
```

### 2. Patient Portal Architecture

**Primary User Journey: Tìm kiếm → Đặt lịch → Quản lý → Thanh toán**

```
Patient Dashboard/
├── Overview (Tổng quan)
│   ├── Upcoming Appointments → FR14
│   ├── Recent Medical Records → FR20
│   ├── Notifications → FR08, FR16
│   └── Quick Actions
├── Profile Management (Quản lý hồ sơ)
│   ├── Personal Information → FR03
│   ├── Medical Profile → FR09
│   ├── Contact Information → FR03
│   └── Privacy Settings → FR23
├── Find Healthcare (Tìm kiếm y tế)
│   ├── Search Doctors → FR10
│   │   ├── By Specialty
│   │   ├── By Location
│   │   ├── By Rating
│   │   └── By Availability
│   ├── Doctor Profiles → FR11
│   │   ├── Professional Info
│   │   ├── Patient Reviews → FR19
│   │   ├── Consultation Fees
│   │   └── Available Time Slots → FR12
│   └── Clinic Information
├── Appointments (Lịch hẹn)
│   ├── Book Appointment → FR13
│   │   ├── Select Doctor
│   │   ├── Choose Time Slot → FR12
│   │   ├── Reason for Visit
│   │   └── Confirmation
│   ├── My Appointments → FR14
│   │   ├── Upcoming
│   │   ├── Past
│   │   ├── Cancelled
│   │   └── Pending Confirmation
│   ├── Manage Appointments → FR15
│   │   ├── Reschedule
│   │   ├── Cancel
│   │   └── Add Notes
│   └── Follow-up Appointments → FR22
├── Medical Records (Hồ sơ y tế)
│   ├── Health History → FR20
│   ├── Prescriptions → FR20
│   ├── Test Results → FR20
│   ├── Download Documents → FR21
│   └── Share Records → FR23
├── Payments (Thanh toán)
│   ├── Make Payment → FR17
│   ├── Payment History → FR18
│   ├── Invoices → FR21
│   └── Payment Methods
├── Reviews & Feedback
│   ├── Rate Doctors → FR19
│   ├── Write Reviews → FR19
│   └── My Reviews
└── Settings
    ├── Notifications → FR08, FR16
    ├── Privacy
    └── Account Security → FR06
```

### 3. Doctor Portal Architecture

**Primary User Journey: Quản lý lịch → Xem bệnh nhân → Khám bệnh → Ghi chú**

```
Doctor Dashboard/
├── Overview (Tổng quan)
│   ├── Today's Schedule → FR26
│   ├── Pending Appointments → FR27
│   ├── Revenue Summary → FR33
│   └── Notifications → FR08, FR35
├── Profile Management (Quản lý hồ sơ)
│   ├── Professional Profile → FR24
│   │   ├── Qualifications
│   │   ├── Specializations
│   │   ├── Experience
│   │   └── Consultation Fees
│   ├── Personal Information → FR03
│   └── Account Settings → FR06
├── Schedule Management (Quản lý lịch trình)
│   ├── Work Schedule → FR25
│   │   ├── Working Hours
│   │   ├── Available Days
│   │   ├── Break Times
│   │   └── Holiday Calendar
│   ├── Appointment Calendar → FR26
│   │   ├── Daily View
│   │   ├── Weekly View
│   │   └── Monthly View
│   └── Time Slot Configuration → FR25
├── Appointments (Lịch hẹn)
│   ├── Pending Requests → FR27
│   │   ├── Accept Appointment
│   │   ├── Decline Appointment
│   │   └── Reschedule Request
│   ├── Confirmed Appointments → FR26
│   ├── Appointment History → FR26
│   └── Emergency Slots
├── Patient Management (Quản lý bệnh nhân)
│   ├── Patient List → FR34
│   ├── Patient Profiles → FR28
│   │   ├── Medical History
│   │   ├── Previous Consultations
│   │   ├── Contact Information
│   │   └── Insurance Details
│   ├── Regular Patients → FR34
│   └── Search Patients
├── Consultation (Khám bệnh)
│   ├── Current Patient → FR28
│   ├── Medical Notes → FR29
│   │   ├── Symptoms
│   │   ├── Diagnosis
│   │   ├── Treatment Plan
│   │   └── Follow-up Notes
│   ├── Prescriptions → FR30
│   │   ├── Electronic Prescription
│   │   ├── Drug Database
│   │   └── Dosage Instructions
│   ├── Generate Invoice → FR31
│   └── Schedule Follow-up → FR32
├── Communications (Giao tiếp)
│   ├── Send Notifications → FR35
│   ├── Patient Messages
│   └── Appointment Reminders → FR16
├── Reports & Analytics (Báo cáo & Phân tích)
│   ├── Revenue Reports → FR33
│   │   ├── Daily Revenue
│   │   ├── Monthly Revenue
│   │   └── Annual Revenue
│   ├── Patient Reports → FR36
│   ├── Appointment Statistics
│   └── Export Data → FR36
└── Settings
    ├── Notification Preferences → FR08
    ├── Calendar Sync
    └── Privacy Settings
```

## 4. Shared Navigation Structure

### Main Navigation (Sidebar/Bottom Tab)

```
Common Navigation Elements:
├── Dashboard (Trang chủ)
├── Appointments (Lịch hẹn)
├── Messages (Tin nhắn) → FR08
├── Profile (Hồ sơ) → FR03
└── Settings (Cài đặt)

Role-specific Elements:
Patient:
├── Find Doctors (Tìm bác sĩ) → FR10
├── Medical Records (Hồ sơ y tế) → FR20
└── Payments (Thanh toán) → FR17

Doctor:
├── My Schedule (Lịch trình) → FR25, FR26
├── Patients (Bệnh nhân) → FR28, FR34
└── Reports (Báo cáo) → FR33, FR36
```

## 5. Content Hierarchy & Prioritization

### Information Priority Levels

#### High Priority (Always Visible)

- Current appointment status
- Urgent notifications
- Primary action buttons
- Critical patient information

#### Medium Priority (Secondary View)

- Historical data
- Detailed profiles
- Settings and preferences
- Reports and analytics

#### Low Priority (On-demand)

- Help documentation
- Terms and conditions
- Advanced settings
- Export functions

## 6. User Flow Mappings

### Critical User Flows

#### Patient Booking Flow

```
FR10 → FR11 → FR12 → FR13 → FR17 → FR16
(Search) → (Doctor Info) → (Available Slots) → (Book) → (Pay) → (Reminder)
```

#### Doctor Consultation Flow

```
FR26 → FR27 → FR28 → FR29 → FR30 → FR31
(View Schedule) → (Confirm) → (Patient Info) → (Notes) → (Prescription) → (Invoice)
```

#### Patient Medical Record Flow

```
FR09 → FR20 → FR21 → FR23
(Create Profile) → (View Records) → (Download) → (Share)
```

## 7. Search & Filter Architecture

### Search Functionality

- **Global Search**: Available in header
- **Scoped Search**: Within specific sections
- **Filter Combinations**: Multiple criteria support
- **Search History**: Recent searches for quick access

### Filter Categories

```
Doctor Search Filters → FR10:
├── Specialty
├── Location/Distance
├── Rating (>4 stars, >3 stars)
├── Price Range
├── Availability (Today, This Week)
└── Insurance Accepted

Appointment Filters → FR14, FR26:
├── Date Range
├── Status (Confirmed, Pending, Cancelled)
├── Doctor/Patient
└── Appointment Type
```

## 8. Notification System Architecture

### Notification Types → FR08, FR16, FR35

```
Notifications/
├── System Notifications
│   ├── Account Security
│   ├── System Maintenance
│   └── Policy Updates
├── Appointment Notifications
│   ├── Booking Confirmation
│   ├── Reminder (24h, 2h before)
│   ├── Cancellation/Rescheduling
│   └── Doctor Confirmations
├── Medical Notifications
│   ├── Test Results Available
│   ├── Prescription Ready
│   └── Follow-up Reminders
└── Communication
    ├── Messages from Doctor/Patient
    ├── Review Requests
    └── Payment Confirmations
```

## 9. Mobile-First Considerations

### Navigation Adaptation

- Collapsible sidebar → Bottom tabs
- Reduced menu depth (max 3 levels)
- Swipe gestures for common actions
- Quick action floating buttons

### Content Adaptation

- Card-based layout for mobile
- Simplified forms with step-by-step flow
- Touch-friendly button sizes (44px minimum)
- Optimized image sizes and loading

This Information Architecture ensures all Functional Requirements are properly organized and accessible through intuitive navigation paths while maintaining consistency across both patient and doctor user experiences.
