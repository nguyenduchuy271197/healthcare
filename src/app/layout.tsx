import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthCare - Đặt lịch khám bệnh",
  description: "Hệ thống đặt lịch khám bệnh trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
