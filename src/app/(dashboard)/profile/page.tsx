import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import { ProfileForm } from "@/components/profile/profile-form";
import { DoctorProfileForm } from "@/components/doctors/doctor-profile-form";
import { DoctorScheduleManagement } from "@/components/doctors/doctor-schedule-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Stethoscope, Calendar } from "lucide-react";

export default async function ProfilePage() {
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
        <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin cá nhân và hồ sơ chuyên môn
        </p>
      </div>

      {userProfile.role === "doctor" ? (
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger
              value="professional"
              className="flex items-center gap-2"
            >
              <Stethoscope className="h-4 w-4" />
              Hồ sơ chuyên môn
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Lịch làm việc
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <ProfileForm user={userProfile} />
          </TabsContent>

          <TabsContent value="professional">
            <DoctorProfileForm />
          </TabsContent>

          <TabsContent value="schedule">
            <DoctorScheduleManagement />
          </TabsContent>
        </Tabs>
      ) : (
        <ProfileForm user={userProfile} />
      )}
    </div>
  );
}
