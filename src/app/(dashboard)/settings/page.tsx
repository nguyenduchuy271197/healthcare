import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profileResult = await getUserProfile();

  if (!profileResult.success || !profileResult.data) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cài đặt</h1>
        <p className="text-muted-foreground">
          Quản lý cài đặt tài khoản và bảo mật
        </p>
      </div>

      <SettingsForm user={profileResult.data} />
    </div>
  );
}
