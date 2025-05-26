import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import { PatientReviewsList } from "@/components/reviews/patient-reviews-list";
import { DoctorReviewsList } from "@/components/reviews/doctor-reviews-list";

export const metadata: Metadata = {
  title: "Đánh giá",
  description: "Quản lý đánh giá",
};

export default async function ReviewsPage() {
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
        <DoctorReviewsList />
      ) : (
        <PatientReviewsList />
      )}
    </div>
  );
}
