import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Stethoscope } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Stethoscope className="h-6 w-6" />
            <span className="font-bold text-lg">HealthCare</span>
          </Link>

          {/* Auth Buttons */}
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      <Toaster />
    </div>
  );
}
