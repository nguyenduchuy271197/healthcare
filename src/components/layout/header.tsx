import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import { UserNav } from "@/components/auth/user-nav";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Button } from "@/components/ui/button";

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
      <div className="flex h-14 items-center px-6">
        <div className="flex items-center space-x-4">
          {userProfile && <MobileSidebar userProfile={userProfile} />}
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
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
