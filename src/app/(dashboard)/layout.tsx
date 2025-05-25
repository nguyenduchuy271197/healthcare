import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  let userProfile = null;
  const profileResult = await getUserProfile();
  if (profileResult.success) {
    userProfile = profileResult.data;
  }

  if (!userProfile) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col border-r bg-background">
        <Sidebar userProfile={userProfile} />
      </aside>

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
  );
}
