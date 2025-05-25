import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PatientMedicalRecords } from "@/components/medical-records/patient-medical-records";

export default async function MedicalRecordsPage() {
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

  if (!profile || profile.role !== "patient") {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Hồ sơ Y tế</h1>
          <p className="text-muted-foreground">
            Xem lịch sử khám bệnh và đơn thuốc của bạn
          </p>
        </div>

        <PatientMedicalRecords patientId={user.id} />
      </div>
    </div>
  );
}
