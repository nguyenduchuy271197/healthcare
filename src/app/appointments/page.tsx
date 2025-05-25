import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import { PatientAppointments } from "@/components/appointments/patient-appointments";

export default async function AppointmentsPage() {
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

  // Only patients can access this page
  if (profileResult.data.role !== "patient") {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Lịch hẹn của tôi</h1>
        <p className="text-muted-foreground">
          Quản lý các lịch hẹn khám bệnh của bạn
        </p>
      </div>

      <PatientAppointments />
    </div>
  );
}
