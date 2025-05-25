import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import { UserNav } from "@/components/auth/user-nav";
import { Button } from "@/components/ui/button";
import { Stethoscope } from "lucide-react";

export async function Header() {
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Stethoscope className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">HealthCare</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {userProfile?.role === "patient" && (
              <>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Dashboard
                </Link>
                <Link
                  href="/doctors"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Tìm bác sĩ
                </Link>
                <Link
                  href="/appointments"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Lịch hẹn
                </Link>
                <Link
                  href="/medical-records"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Hồ sơ Y tế
                </Link>
              </>
            )}
            {userProfile?.role === "doctor" && (
              <>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Dashboard
                </Link>
                <Link
                  href="/appointments"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Lịch hẹn
                </Link>
                <Link
                  href="/patients"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Bệnh nhân
                </Link>
                <Link
                  href="/schedule"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Lịch làm việc
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link
              href="/"
              className="mr-6 flex items-center space-x-2 md:hidden"
            >
              <Stethoscope className="h-6 w-6" />
              <span className="font-bold">HealthCare</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-2">
            {userProfile ? (
              <UserNav user={userProfile} />
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Đăng ký</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
