# 🏥 Healthcare Appointment - Ứng Dụng Đặt Lịch Khám Bệnh

Ứng dụng đặt lịch khám bệnh kết nối bệnh nhân và bác sĩ, xây dựng với Next.js 14, TypeScript và Supabase.

## ✨ Tính năng

- 🔐 **Authentication**: Đăng ký/đăng nhập, phân quyền Patient/Doctor/Admin
- 🏥 **Appointment Management**: Đặt lịch, quản lý lịch hẹn và thời gian làm việc
- 📋 **Medical Records**: Quản lý hồ sơ bệnh án, đơn thuốc điện tử
- 💳 **Payment Integration**: Thanh toán trực tuyến, quản lý hóa đơn
- 📱 **Notifications**: Nhắc nhở tự động qua email/SMS
- 📊 **Dashboard**: Doctor analytics, Patient appointment tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase, PostgreSQL
- **State Management**: TanStack Query, React Hook Form
- **Validation**: Zod
- **Payment**: Stripe/VNPay integration

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/nguyenduchuy271197/healthcare
cd healthcare-appointment
pnpm install
```

### 2. Environment Setup

Tạo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

```bash
npx supabase db reset
```

### 4. Run Development

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── actions/          # Server actions
├── app/             # Next.js App Router
│   ├── (auth)/      # Auth pages
│   ├── (patient)/   # Patient dashboard
│   ├── (doctor)/    # Doctor dashboard
│   ├── (admin)/     # Admin panel
│   └── (public)/    # Public doctor listings
├── components/      # UI components
├── hooks/           # Custom hooks
├── lib/             # Utilities & config
└── types/           # TypeScript types
```

## 🔧 Scripts

```bash
pnpm dev      # Development server
pnpm build    # Build production
pnpm lint     # Run linter
```

## 👥 User Roles

### 👨‍⚕️ Patient

- Tìm kiếm và đặt lịch khám với bác sĩ
- Quản lý hồ sơ y tế và lịch sử khám bệnh
- Thanh toán trực tuyến và xem hóa đơn
- Nhận thông báo nhắc nhở tự động

### 🩺 Doctor

- Quản lý lịch làm việc và appointments
- Xem hồ sơ bệnh nhân và ghi chú khám bệnh
- Kê đơn thuốc điện tử và tạo hóa đơn
- Xem thống kê thu nhập và báo cáo

### 👨‍💻 Admin

- Quản lý users và doctor verifications
- Quản lý specialties và hospital listings
- Xem system analytics và reports

## 🚀 Deployment

Deploy dễ dàng với [Vercel](https://vercel.com):

1. Connect repository
2. Set environment variables
3. Deploy
