import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";

export const metadata: Metadata = {
  title: "HealthCare - Đặt lịch khám bệnh",
  description: "Hệ thống đặt lịch khám bệnh trực tuyến",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`antialiased`}>
        {children}

        <Toaster />
      </body>
    </html>
  );
}
