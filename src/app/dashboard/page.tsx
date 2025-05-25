import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import { PatientDashboard } from "@/components/dashboard/patient-dashboard";
import { DoctorDashboard } from "@/components/dashboard/doctor-dashboard";

export default async function DashboardPage() {
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

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Chào mừng, {userProfile.full_name}!
        </h1>
        <p className="text-muted-foreground">
          {userProfile.role === "patient"
            ? "Quản lý lịch hẹn và theo dõi sức khỏe của bạn"
            : "Quản lý bệnh nhân và lịch làm việc của bạn"}
        </p>
      </div>

      {userProfile.role === "patient" ? (
        <PatientDashboard />
      ) : (
        <DoctorDashboard />
      )}
    </div>
  );
}
