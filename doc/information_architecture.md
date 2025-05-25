# Information Architecture - Ứng dụng Đặt lịch Khám bệnh

## Tổng quan Hệ thống

### Đối tượng người dùng

- **Bệnh nhân**: Người cần đặt lịch khám bệnh
- **Bác sĩ**: Người cung cấp dịch vụ khám bệnh
- **Khách**: Người chưa đăng ký tài khoản (chỉ xem thông tin công khai)

### Mục tiêu chính

- Kết nối bệnh nhân và bác sĩ
- Quản lý lịch hẹn khám bệnh
- Lưu trữ và quản lý hồ sơ y tế
- Thanh toán trực tuyến
- Theo dõi lịch sử khám bệnh

## Cấu trúc Navigation

### 1. Navigation cho Khách (Chưa đăng nhập)

```
📱 Trang chủ
├── 🔍 Tìm kiếm bác sĩ
├── 👨‍⚕️ Danh sách bác sĩ
├── 📋 Thông tin dịch vụ
├── 📞 Liên hệ
├── 🔑 Đăng nhập
└── ✍️ Đăng ký
    ├── Đăng ký bệnh nhân
    └── Đăng ký bác sĩ
```

### 2. Navigation cho Bệnh nhân

```
📱 Dashboard Bệnh nhân
├── 🏠 Trang chủ
│   ├── Lịch hẹn sắp tới
│   ├── Thông báo
│   └── Shortcut actions
├── 🔍 Tìm kiếm & Đặt lịch
│   ├── Tìm kiếm bác sĩ
│   ├── Lọc theo chuyên khoa
│   ├── Xem thông tin bác sĩ
│   ├── Xem lịch trống
│   └── Đặt lịch hẹn
├── 📅 Quản lý Lịch hẹn
│   ├── Lịch hẹn sắp tới
│   ├── Lịch sử lịch hẹn
│   ├── Sửa/Hủy lịch hẹn
│   └── Đặt lịch tái khám
├── 🏥 Hồ sơ Y tế
│   ├── Thông tin cá nhân
│   ├── Tiền sử bệnh
│   ├── Kết quả khám
│   ├── Đơn thuốc
│   └── Tải xuống documents
├── 💰 Thanh toán
│   ├── Thanh toán lịch hẹn
│   ├── Lịch sử thanh toán
│   ├── Hóa đơn
│   └── Phương thức thanh toán
├── ⭐ Đánh giá
│   ├── Đánh giá bác sĩ
│   └── Lịch sử đánh giá
├── 🔔 Thông báo
│   ├── Nhắc nhở lịch hẹn
│   ├── Cập nhật từ bác sĩ
│   └── Thông báo hệ thống
└── ⚙️ Cài đặt
    ├── Thông tin tài khoản
    ├── Đổi mật khẩu
    ├── Cài đặt thông báo
    └── Bảo mật
```

### 3. Navigation cho Bác sĩ

```
📱 Dashboard Bác sĩ
├── 🏠 Trang chủ
│   ├── Lịch hẹn hôm nay
│   ├── Thống kê nhanh
│   ├── Thông báo
│   └── Quick actions
├── 📅 Quản lý Lịch hẹn
│   ├── Lịch làm việc
│   ├── Lịch hẹn đã đặt
│   ├── Xác nhận/Từ chối
│   ├── Hoàn thành lịch hẹn
│   └── Lên lịch tái khám
├── 👥 Quản lý Bệnh nhân
│   ├── Danh sách bệnh nhân
│   ├── Bệnh nhân thường xuyên
│   ├── Hồ sơ bệnh nhân
│   ├── Lịch sử khám
│   └── Gửi thông báo
├── 📝 Ghi chú Khám bệnh
│   ├── Tạo hồ sơ khám
│   ├── Chẩn đoán
│   ├── Kê đơn thuốc
│   ├── Yêu cầu xét nghiệm
│   └── Hóa đơn khám
├── ⏰ Cài đặt Lịch làm việc
│   ├── Khung giờ làm việc
│   ├── Ngày nghỉ
│   ├── Thời gian khám/ca
│   └── Giá khám
├── 📊 Báo cáo & Thống kê
│   ├── Doanh thu
│   ├── Số lượng bệnh nhân
│   ├── Đánh giá từ bệnh nhân
│   └── Xuất báo cáo
├── 🔔 Thông báo
│   ├── Lịch hẹn mới
│   ├── Hủy/Thay đổi lịch
│   └── Thông báo hệ thống
└── ⚙️ Cài đặt
    ├── Hồ sơ bác sĩ
    ├── Chuyên môn & bằng cấp
    ├── Đổi mật khẩu
    └── Cài đặt thông báo
```

## Sitemap Tổng thể

```
🌐 Healthcare Booking App
│
├── 🏠 Public Pages
│   ├── Landing Page
│   ├── About Us
│   ├── Services
│   ├── Find Doctors (Public)
│   ├── Contact
│   ├── FAQ
│   ├── Privacy Policy
│   └── Terms of Service
│
├── 🔐 Authentication
│   ├── Login
│   ├── Register
│   ├── Forgot Password
│   ├── Reset Password
│   └── Email Verification
│
├── 👤 Patient Portal
│   ├── Dashboard
│   ├── Profile Management
│   ├── Medical Records
│   ├── Find & Book Doctors
│   ├── Appointments
│   ├── Payments & Billing
│   ├── Reviews & Ratings
│   ├── Notifications
│   └── Settings
│
├── 👨‍⚕️ Doctor Portal
│   ├── Dashboard
│   ├── Profile Management
│   ├── Schedule Management
│   ├── Appointment Management
│   ├── Patient Management
│   ├── Medical Documentation
│   ├── Reports & Analytics
│   ├── Notifications
│   └── Settings
│
└── ⚙️ Admin Panel (Future)
    ├── User Management
    ├── System Settings
    ├── Reports
    └── Content Management
```

## User Flows Chính

### 1. Patient Journey

#### A. Đăng ký và Tạo hồ sơ

```
Start → Đăng ký tài khoản → Xác thực email → Tạo hồ sơ bệnh nhân →
Nhập thông tin y tế → Hoàn thành onboarding → Dashboard
```

#### B. Đặt lịch khám bệnh

```
Dashboard → Tìm kiếm bác sĩ → Lọc kết quả → Xem thông tin bác sĩ →
Xem lịch trống → Chọn thời gian → Nhập lý do khám → Xác nhận đặt lịch →
Thanh toán → Nhận xác nhận
```

#### C. Khám bệnh và Follow-up

```
Nhận nhắc nhở → Đến khám → Bác sĩ ghi chú → Nhận đơn thuốc →
Thanh toán (nếu cần) → Đánh giá bác sĩ → Đặt lịch tái khám (nếu cần)
```

### 2. Doctor Journey

#### A. Đăng ký và Thiết lập hồ sơ

```
Start → Đăng ký tài khoản → Xác thực email → Tạo hồ sơ bác sĩ →
Upload bằng cấp → Thiết lập lịch làm việc → Cài đặt giá khám →
Hoàn thành onboarding → Dashboard
```

#### B. Quản lý lịch hẹn

```
Dashboard → Xem lịch hẹn mới → Xác nhận/Từ chối → Chuẩn bị khám →
Khám bệnh nhân → Ghi chú kết quả → Kê đơn thuốc → Tạo hóa đơn →
Lên lịch tái khám (nếu cần)
```

### 3. Shared Flows

#### A. Authentication Flow

```
Landing Page → Login/Register → Role Selection → Profile Setup →
Email Verification → Dashboard
```

#### B. Notification Flow

```
System Event → Create Notification → Send via Channel (App/Email/SMS) →
User Receives → Mark as Read → Action (if required)
```

## Content Organization

### 1. Phân loại Content theo Role

#### Patient Content

- **Cá nhân**: Hồ sơ, lịch sử y tế, lịch hẹn
- **Khám phá**: Danh sách bác sĩ, chuyên khoa, đánh giá
- **Giao dịch**: Thanh toán, hóa đơn, bảo hiểm
- **Tương tác**: Đánh giá, nhắn tin, chia sẻ

#### Doctor Content

- **Chuyên môn**: Hồ sơ bác sĩ, bằng cấp, kinh nghiệm
- **Quản lý**: Lịch làm việc, bệnh nhân, lịch hẹn
- **Y tế**: Hồ sơ bệnh nhân, đơn thuốc, chẩn đoán
- **Kinh doanh**: Doanh thu, thống kê, báo cáo

### 2. Phân cấp Thông tin

#### Level 1: Primary Navigation

- Dashboard, Search, Appointments, Profile, Settings

#### Level 2: Secondary Navigation

- Sub-sections within each primary area

#### Level 3: Content Pages

- Individual records, forms, detail views

#### Level 4: Modal/Overlay Content

- Quick actions, confirmations, previews

## Features Mapping

### Core Features (MVP)

| Feature             | Patient | Doctor | Priority |
| ------------------- | ------- | ------ | -------- |
| Authentication      | ✅      | ✅     | Cao      |
| Profile Management  | ✅      | ✅     | Cao      |
| Search Doctors      | ✅      | ❌     | Cao      |
| Book Appointments   | ✅      | ❌     | Cao      |
| Manage Appointments | ✅      | ✅     | Cao      |
| Medical Records     | ✅      | ✅     | Cao      |
| Payments            | ✅      | ❌     | Cao      |
| Schedule Management | ❌      | ✅     | Cao      |
| Notifications       | ✅      | ✅     | Cao      |

### Enhanced Features (Phase 2)

| Feature              | Patient | Doctor | Priority   |
| -------------------- | ------- | ------ | ---------- |
| Reviews & Ratings    | ✅      | ❌     | Trung bình |
| Follow-up Scheduling | ✅      | ✅     | Trung bình |
| Revenue Reports      | ❌      | ✅     | Trung bình |
| Document Export      | ✅      | ✅     | Trung bình |
| Advanced Search      | ✅      | ✅     | Thấp       |
| Medical Sharing      | ✅      | ✅     | Thấp       |

## Technical Architecture Considerations

### 1. Responsive Design

- **Mobile First**: Tối ưu cho smartphone
- **Tablet**: Adaptive layout cho iPad
- **Desktop**: Full-featured web experience

### 2. Progressive Web App (PWA)

- **Offline Capability**: Xem lịch hẹn offline
- **Push Notifications**: Nhắc nhở real-time
- **App-like Experience**: Native feel

### 3. Performance

- **Lazy Loading**: Content theo demand
- **Caching Strategy**: Static và dynamic content
- **Image Optimization**: WebP, responsive images
- **Code Splitting**: Route-based splitting

### 4. Accessibility

- **WCAG 2.1 AA**: Compliance standards
- **Screen Reader**: Proper ARIA labels
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: Meet accessibility ratios

### 5. Security & Privacy

- **Role-based Access**: Strict permissions
- **Data Encryption**: In transit và at rest
- **HIPAA Compliance**: Medical data protection
- **Audit Logs**: User activity tracking

## Metrics & Analytics

### User Engagement

- **DAU/MAU**: Daily/Monthly active users
- **Session Duration**: Time spent in app
- **Feature Usage**: Most/least used features
- **User Retention**: Return rate by cohorts

### Business Metrics

- **Appointment Conversion**: Search to booking rate
- **Completion Rate**: Successful appointments
- **Revenue Tracking**: Doctor earnings
- **Customer Satisfaction**: Review ratings

### Technical Metrics

- **Page Load Time**: Performance monitoring
- **Error Rates**: System reliability
- **API Response Time**: Backend performance
- **Uptime**: System availability

## Content Strategy

### 1. Content Types

- **Instructional**: How-to guides, FAQs
- **Informational**: Doctor profiles, service details
- **Transactional**: Booking forms, payments
- **Relational**: Reviews, ratings, recommendations

### 2. Content Governance

- **Medical Content**: Doctor-verified information
- **Legal Content**: Terms, privacy policies
- **Marketing Content**: SEO-optimized descriptions
- **User-Generated**: Reviews, ratings (moderated)

### 3. Localization

- **Language Support**: Tiếng Việt primary
- **Cultural Adaptation**: Vietnamese healthcare context
- **Regional Content**: Local healthcare providers
- **Time/Date Formats**: Vietnamese standards

## Future Enhancements

### Phase 2 Features

- **Telemedicine**: Video consultations
- **AI Chatbot**: Initial symptom assessment
- **Wearable Integration**: Health data sync
- **Insurance Integration**: Direct billing

### Phase 3 Features

- **Multi-clinic Support**: Chain management
- **Advanced Analytics**: Predictive insights
- **IoT Integration**: Medical device data
- **Blockchain**: Secure medical records

---

_Tài liệu này sẽ được cập nhật theo sự phát triển của dự án và feedback từ người dùng._
