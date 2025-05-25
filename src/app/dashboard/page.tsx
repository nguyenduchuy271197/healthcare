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
          Chào mừng, {userProfile.full_name}
        </h1>
        <p className="text-muted-foreground">
          {userProfile.role === "doctor"
            ? "Quản lý lịch hẹn và bệnh nhân của bạn"
            : "Quản lý lịch khám và sức khỏe của bạn"}
        </p>
      </div>

      {userProfile.role === "patient" ? (
        <PatientDashboard user={userProfile} />
      ) : (
        <DoctorDashboard user={userProfile} />
      )}
    </div>
  );
}
