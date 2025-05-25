import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import { EnhancedAppointmentManagement } from "@/components/appointments/enhanced-appointment-management";
import { PatientAppointments } from "@/components/appointments/patient-appointments";

export default async function AppointmentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile to check role
  const profileResult = await getUserProfile();
  if (!profileResult.success || !profileResult.data) {
    redirect("/auth/login");
  }

  const userRole = profileResult.data.role;

  return (
    <div className="container mx-auto py-6">
      {userRole === "doctor" ? (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Quản lý lịch hẹn</h1>
            <p className="text-muted-foreground">
              Xem, xác nhận và quản lý các lịch hẹn của bệnh nhân
            </p>
          </div>
          <EnhancedAppointmentManagement />
        </>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Lịch hẹn của tôi</h1>
            <p className="text-muted-foreground">
              Quản lý các lịch hẹn khám bệnh của bạn
            </p>
          </div>
          <PatientAppointments />
        </>
      )}
    </div>
  );
}
