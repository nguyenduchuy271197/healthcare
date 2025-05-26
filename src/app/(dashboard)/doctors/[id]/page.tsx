import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile, getDoctorDetails, getDoctorReviews } from "@/actions";
import { DoctorProfile } from "@/components/doctors/doctor-profile";
import { DoctorSchedule } from "@/components/doctors/doctor-schedule";
import { DoctorReviews } from "@/components/doctors/doctor-reviews";

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
    <div className="container mx-auto py-6 space-y-6">
      {/* Doctor Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {doctorResult.data.user_profiles.full_name}
        </h1>
        <p className="text-muted-foreground">
          {doctorResult.data.specialization || "Bác sĩ đa khoa"}
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Doctor Info & Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor Profile */}
          <DoctorProfile doctor={doctorResult.data} />

          {/* Doctor Reviews */}
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
        </div>

        {/* Right Column - Booking */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <DoctorSchedule doctor={doctorResult.data} />
          </div>
        </div>
      </div>
    </div>
  );
}
