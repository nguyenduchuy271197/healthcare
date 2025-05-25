import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Stethoscope,
  Users,
  Calendar,
  Shield,
  Star,
  ArrowRight,
} from "lucide-react";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to dashboard if user is logged in
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Đặt lịch khám bệnh
              <span className="text-blue-600"> dễ dàng</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Kết nối bệnh nhân và bác sĩ một cách nhanh chóng, tiện lợi. Quản
              lý lịch khám, hồ sơ y tế và thanh toán trực tuyến.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Đăng ký ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hệ thống quản lý y tế toàn diện với các tính năng hiện đại
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Đặt lịch dễ dàng</CardTitle>
                <CardDescription>
                  Tìm kiếm bác sĩ theo chuyên khoa và đặt lịch hẹn chỉ với vài
                  cú click
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Quản lý bệnh nhân</CardTitle>
                <CardDescription>
                  Bác sĩ có thể quản lý lịch hẹn, hồ sơ bệnh nhân và kê đơn
                  thuốc điện tử
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Bảo mật cao</CardTitle>
                <CardDescription>
                  Thông tin y tế được bảo vệ với các tiêu chuẩn bảo mật cao nhất
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Stethoscope className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Hồ sơ y tế điện tử</CardTitle>
                <CardDescription>
                  Lưu trữ và quản lý hồ sơ y tế, kết quả xét nghiệm một cách có
                  hệ thống
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Đánh giá & Phản hồi</CardTitle>
                <CardDescription>
                  Hệ thống đánh giá giúp bệnh nhân chọn được bác sĩ phù hợp nhất
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <ArrowRight className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Thanh toán trực tuyến</CardTitle>
                <CardDescription>
                  Thanh toán phí khám bệnh một cách nhanh chóng và an toàn
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Tham gia cùng hàng nghìn người dùng đã tin tưởng sử dụng dịch vụ
              của chúng tôi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register?role=patient">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Đăng ký làm bệnh nhân
                </Button>
              </Link>
              <Link href="/auth/register?role=doctor">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600"
                >
                  Đăng ký làm bác sĩ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Stethoscope className="h-6 w-6" />
                <span className="font-bold text-lg">HealthCare</span>
              </div>
              <p className="text-gray-400">
                Hệ thống đặt lịch khám bệnh trực tuyến hiện đại và tiện lợi.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Dành cho bệnh nhân</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Tìm bác sĩ</li>
                <li>Đặt lịch khám</li>
                <li>Hồ sơ y tế</li>
                <li>Thanh toán</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Dành cho bác sĩ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Quản lý lịch hẹn</li>
                <li>Hồ sơ bệnh nhân</li>
                <li>Kê đơn thuốc</li>
                <li>Báo cáo</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Liên hệ</li>
                <li>FAQ</li>
                <li>Chính sách bảo mật</li>
                <li>Điều khoản sử dụng</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HealthCare. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
