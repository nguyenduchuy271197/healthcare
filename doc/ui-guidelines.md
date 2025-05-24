# UI Guidelines - Ứng dụng Đặt lịch Khám bệnh

## Design System Overview

Thiết kế tập trung vào sự tin cậy, chuyên nghiệp và dễ sử dụng trong môi trường y tế. Giao diện cần thể hiện tính bảo mật cao và khả năng tiếp cận tốt cho mọi đối tượng người dùng.

## Color Palette

### Primary Colors

```css
/* Medical Blue - Màu chủ đạo thể hiện sự tin cậy và chuyên nghiệp */
--primary: 220 91% 54%        /* #1E88E5 */
--primary-foreground: 0 0% 98%  /* #FAFAFA */

/* Healthcare Green - Màu phụ cho trạng thái tích cực */
--secondary: 142 76% 36%      /* #16A085 */
--secondary-foreground: 0 0% 98%  /* #FAFAFA */
```

### Neutral Colors

```css
/* Background Colors */
--background: 0 0% 100%       /* #FFFFFF */
--card: 0 0% 100%            /* #FFFFFF */
--popover: 0 0% 100%         /* #FFFFFF */

/* Text Colors */
--foreground: 222 84% 5%      /* #0F172A */
--muted: 210 40% 96%         /* #F1F5F9 */
--muted-foreground: 215 16% 47%  /* #64748B */

/* Border Colors */
--border: 214 32% 91%        /* #E2E8F0 */
--input: 214 32% 91%         /* #E2E8F0 */
```

### Status Colors

```css
/* Success - Xác nhận, hoàn thành */
--success: 142 76% 36%       /* #16A085 */
--success-foreground: 0 0% 98%  /* #FAFAFA */

/* Warning - Chờ xác nhận, nhắc nhở */
--warning: 43 96% 56%        /* #F59E0B */
--warning-foreground: 43 96% 9%   /* #1C1917 */

/* Destructive - Hủy, từ chối, lỗi */
--destructive: 0 84% 60%     /* #EF4444 */
--destructive-foreground: 0 0% 98%  /* #FAFAFA */

/* Info - Thông tin, ghi chú */
--info: 199 89% 48%          /* #0EA5E9 */
--info-foreground: 0 0% 98%     /* #FAFAFA */
```

## Design Patterns

### 1. Layout Patterns

#### Main Navigation

- **Sidebar Navigation** cho desktop với collapse functionality
- **Bottom Tab Navigation** cho mobile
- Sử dụng `NavigationMenu` component từ shadcn/ui
- Icons: Lucide React icons với consistent sizing (20px)

#### Content Layout

```jsx
// Desktop Layout Structure
<div className="flex h-screen bg-background">
  <Sidebar /> {/* w-64, collapsible */}
  <main className="flex-1 overflow-hidden">
    <Header /> {/* h-16 */}
    <ScrollArea className="h-[calc(100vh-4rem)] p-6">
      <Content />
    </ScrollArea>
  </main>
</div>
```

#### Card-based Information Display

- Sử dụng `Card` component cho tất cả thông tin blocks
- Shadow: `shadow-sm` cho cards thường, `shadow-md` cho elevated cards
- Padding: `p-6` cho card content, `p-4` cho compact cards

### 2. Component Patterns

#### Form Controls

```jsx
// Consistent form structure
<Form>
  <FormField>
    <FormLabel className="text-sm font-medium" />
    <FormControl>
      <Input className="h-10" /> {/* Consistent height */}
    </FormControl>
    <FormDescription className="text-xs text-muted-foreground" />
    <FormMessage className="text-xs" />
  </FormField>
</Form>
```

#### Data Display

- **Tables**: Sử dụng `Table` component với zebra striping
- **Lists**: `Card` containers với `Avatar` cho user profiles
- **Status Indicators**: `Badge` components với appropriate colors

#### Interactive Elements

```jsx
// Primary Actions
<Button className="h-10 px-6">Đặt lịch khám</Button>

// Secondary Actions
<Button variant="outline" className="h-10 px-4">Hủy bỏ</Button>

// Destructive Actions
<Button variant="destructive" className="h-10 px-4">Xóa</Button>
```

### 3. Typography Scale

```css
/* Headings */
.h1 {
  @apply text-4xl font-bold tracking-tight;
}
.h2 {
  @apply text-3xl font-semibold tracking-tight;
}
.h3 {
  @apply text-2xl font-semibold tracking-tight;
}
.h4 {
  @apply text-xl font-semibold tracking-tight;
}

/* Body Text */
.body-large {
  @apply text-lg leading-7;
}
.body {
  @apply text-base leading-6;
}
.body-small {
  @apply text-sm leading-5;
}
.caption {
  @apply text-xs leading-4 text-muted-foreground;
}
```

### 4. Spacing System

- Base unit: `4px` (Tailwind's spacing-1)
- Component internal padding: `16px` (p-4) hoặc `24px` (p-6)
- Section margins: `32px` (my-8) hoặc `48px` (my-12)
- Page margins: `24px` (p-6) desktop, `16px` (p-4) mobile

### 5. Responsive Breakpoints

```css
/* Mobile First Approach */
sm: 640px   /* Tablet */
md: 768px   /* Small laptop */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### 6. Animation & Transitions

```css
/* Standard transitions */
.transition-standard {
  @apply transition-all duration-200 ease-in-out;
}

/* Hover effects */
.hover-lift {
  @apply hover:shadow-md transition-shadow duration-200;
}

/* Loading states */
.loading-pulse {
  @apply animate-pulse;
}
```

### 7. Accessibility Guidelines

- **Color Contrast**: Minimum WCAG AA compliance (4.5:1 ratio)
- **Focus States**: Visible focus rings cho tất cả interactive elements
- **Screen Reader**: Proper ARIA labels và semantic HTML
- **Keyboard Navigation**: Tab order logic và keyboard shortcuts

### 8. Component Usage Guidelines

#### Buttons

- Primary: Chỉ một button primary per section
- Height: Consistent `h-10` (40px)
- Loading states: Sử dụng `Loader2` icon từ Lucide

#### Forms

- Field spacing: `space-y-4`
- Label positioning: Top-aligned
- Error states: Red text với icon indicator
- Required fields: Asterisk (\*) sau label

#### Data Tables

- Sticky headers cho long tables
- Row hover effects
- Pagination ở bottom-right
- Actions column ở right-most

#### Modals & Dialogs

- Max width: `max-w-md` cho simple dialogs, `max-w-2xl` cho complex forms
- Backdrop: Semi-transparent overlay
- Close button: Top-right corner

### 9. Icon System

- Primary icon library: **Lucide React**
- Size consistency: 16px (small), 20px (default), 24px (large)
- Medical icons: Sử dụng consistent iconography cho medical concepts
  - Stethoscope: Bác sĩ/khám bệnh
  - Calendar: Lịch hẹn
  - User: Bệnh nhân
  - Heart: Sức khỏe
  - FileText: Hồ sơ y tế
