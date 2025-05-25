import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import { DoctorDashboard } from "@/components/dashboard/doctor-dashboard";
import { PatientDashboard } from "@/components/dashboard/patient-dashboard";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profileResult = await getUserProfile();
  if (!profileResult.success || !profileResult.data) {
    return null;
  }

  const userProfile = profileResult.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Chào mừng trở lại, {userProfile.full_name}
        </p>
      </div>

      {userProfile.role === "doctor" ? (
        <DoctorDashboard />
      ) : (
        <PatientDashboard />
      )}
    </div>
  );
}
