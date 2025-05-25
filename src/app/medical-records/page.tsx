import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile, getPatientProfile } from "@/actions";
import { MedicalRecordsForm } from "@/components/medical-records/medical-records-form";
import { MedicalRecordsList } from "@/components/medical-records/medical-records-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function MedicalRecordsPage() {
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

  const patientResult = await getPatientProfile();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Hồ sơ Y tế</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin y tế cá nhân và xem lịch sử khám bệnh
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Thông tin y tế</TabsTrigger>
          <TabsTrigger value="history">Lịch sử khám bệnh</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <MedicalRecordsForm
            user={profileResult.data}
            patientData={
              patientResult.success && patientResult.data
                ? patientResult.data
                : null
            }
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <MedicalRecordsList patientId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
