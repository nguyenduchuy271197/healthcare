import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DoctorAppointmentList } from "@/components/appointments/doctor-appointment-list";

export default async function ManageAppointmentsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "doctor") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý lịch hẹn</h1>
        <p className="text-muted-foreground">
          Xem và quản lý các lịch hẹn của bệnh nhân
        </p>
      </div>

      <DoctorAppointmentList doctorId={user.id} />
    </div>
  );
}
