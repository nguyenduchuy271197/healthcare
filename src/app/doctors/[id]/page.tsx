import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile, getDoctorDetails, getDoctorReviews } from "@/actions";
import { DoctorProfile } from "@/components/doctors/doctor-profile";
import { DoctorSchedule } from "@/components/doctors/doctor-schedule";
import { DoctorReviews } from "@/components/doctors/doctor-reviews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DoctorPageProps {
  params: {
    id: string;
  };
}

export default async function DoctorPage({ params }: DoctorPageProps) {
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

  // Get doctor details
  const doctorResult = await getDoctorDetails(params.id);

  if (!doctorResult.success || !doctorResult.data) {
    notFound();
  }

  // Get doctor reviews
  const reviewsResult = await getDoctorReviews(params.id, { limit: 5 });

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {doctorResult.data.user_profiles.full_name}
        </h1>
        <p className="text-muted-foreground">
          {doctorResult.data.specialization || "Bác sĩ đa khoa"}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Thông tin bác sĩ</TabsTrigger>
          <TabsTrigger value="schedule">Đặt lịch khám</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <DoctorProfile doctor={doctorResult.data} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <DoctorSchedule doctor={doctorResult.data} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <DoctorReviews
            doctorId={params.id}
            initialReviews={
              reviewsResult.success ? reviewsResult.data || [] : []
            }
            initialTotal={reviewsResult.success ? reviewsResult.total || 0 : 0}
            averageRating={
              reviewsResult.success ? reviewsResult.averageRating || 0 : 0
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
