import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions";
import { DoctorSearch } from "@/components/doctors/doctor-search";

export default async function DoctorsPage() {
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
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tìm kiếm Bác sĩ</h1>
        <p className="text-muted-foreground">
          Tìm kiếm bác sĩ theo chuyên khoa, địa điểm và đánh giá
        </p>
      </div>

      <DoctorSearch />
    </div>
  );
}
