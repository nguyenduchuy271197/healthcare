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
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile = null;
  if (user) {
    const profileResult = await getUserProfile();
    if (profileResult.success) {
      userProfile = profileResult.data;
    }
  }

  return (
    <html lang="vi">
      <body className={`antialiased`}>
        <div className="flex h-screen">
          {/* Sidebar */}
          {userProfile && (
            <aside className="hidden md:flex flex-col border-r bg-background">
              <Sidebar userProfile={userProfile} />
            </aside>
          )}

          {/* Container cho Header và Main */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <Header />

            {/* Main content */}
            <main className="flex-1 overflow-auto">
              <div className="h-full p-6">{children}</div>
            </main>
          </div>
        </div>

        <Toaster />
      </body>
    </html>
  );
}
