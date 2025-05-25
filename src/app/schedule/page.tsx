import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import { DoctorScheduleManagement } from "@/components/doctors/doctor-schedule-management";

export default async function SchedulePage() {
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

  const userProfile = profileResult.data;

  // Only doctors can access this page
  if (userProfile.role !== "doctor") {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản lý lịch làm việc</h1>
        <p className="text-muted-foreground">
          Thiết lập khung giờ làm việc và thời gian cho mỗi ca khám
        </p>
      </div>

      <DoctorScheduleManagement />
    </div>
  );
}
