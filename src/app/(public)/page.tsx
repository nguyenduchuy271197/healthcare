import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users, FileText, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Hệ thống đặt lịch khám bệnh
          <span className="text-primary"> trực tuyến</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Đặt lịch khám bệnh dễ dàng, quản lý hồ sơ y tế và kết nối với các bác
          sĩ chuyên nghiệp
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register">
            <Button size="lg" className="w-full sm:w-auto">
              Đăng ký ngay
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Đăng nhập
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Card>
          <CardHeader>
            <Calendar className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Đặt lịch dễ dàng</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Đặt lịch khám bệnh trực tuyến 24/7 với các bác sĩ chuyên khoa
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Bác sĩ chuyên nghiệp</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Đội ngũ bác sĩ giàu kinh nghiệm và được chứng nhận
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Hồ sơ y tế</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Quản lý hồ sơ y tế điện tử an toàn và tiện lợi
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Bảo mật cao</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Thông tin cá nhân được bảo vệ với công nghệ mã hóa tiên tiến
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-muted rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-4">
          Bắt đầu chăm sóc sức khỏe của bạn ngay hôm nay
        </h2>
        <p className="text-muted-foreground mb-6">
          Tham gia cùng hàng nghìn người dùng đã tin tưởng hệ thống của chúng
          tôi
        </p>
        <Link href="/auth/register">
          <Button size="lg">Đăng ký miễn phí</Button>
        </Link>
      </div>
    </div>
  );
}
