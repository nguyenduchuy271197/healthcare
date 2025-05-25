import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PatientPrescriptionsList } from "@/components/prescriptions/patient-prescriptions-list";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default async function PrescriptionsPage() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  // Check if user is a patient
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "patient") {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Đơn thuốc của tôi</h1>
        <p className="text-muted-foreground">
          Xem và quản lý các đơn thuốc đã được kê bởi bác sĩ
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Đang tải danh sách đơn thuốc...</span>
              </div>
            </CardContent>
          </Card>
        }
      >
        <PatientPrescriptionsList patientId={user.id} />
      </Suspense>
    </div>
  );
}
