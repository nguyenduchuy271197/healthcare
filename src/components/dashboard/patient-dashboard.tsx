"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Search,
  FileText,
  CreditCard,
  Star,
} from "lucide-react";
import { Profile, Appointment } from "@/types/custom.types";
import { getPatientAppointments } from "@/actions";

interface PatientDashboardProps {
  user: Profile;
}

export function PatientDashboard({ user }: PatientDashboardProps) {
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  console.log(user);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const result = await getPatientAppointments();
        if (result.success && result.data) {
          // Filter upcoming appointments
          const upcoming = result.data
            .filter(
              (apt) => apt.status === "confirmed" || apt.status === "pending"
            )
            .slice(0, 3);
          setUpcomingAppointments(upcoming);
        }
      } catch (error) {
        console.error("Error loading appointments:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAppointments();
  }, []);

  function getStatusBadge(status: string) {
    const variants = {
      pending: "secondary",
      confirmed: "default",
      completed: "outline",
      cancelled: "destructive",
      rejected: "destructive",
    } as const;

    const labels = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      rejected: "Bị từ chối",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tìm bác sĩ</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/doctors">
              <Button className="w-full">Tìm kiếm</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lịch hẹn</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/appointments">
              <Button variant="outline" className="w-full">
                Xem tất cả
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hồ sơ y tế</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/medical-records">
              <Button variant="outline" className="w-full">
                Xem hồ sơ
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thanh toán</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/payments">
              <Button variant="outline" className="w-full">
                Lịch sử
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch hẹn sắp tới</CardTitle>
          <CardDescription>
            Các cuộc hẹn khám bệnh trong thời gian tới
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">
                        {new Date(appointment.appointment_date).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(
                          appointment.appointment_date
                        ).toLocaleDateString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{appointment.appointment_time}</span>
                        <span>•</span>
                        <span>{appointment.reason}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(appointment.status || "pending")}
                  </div>
                </div>
              ))}
              <Link href="/appointments">
                <Button variant="outline" className="w-full">
                  Xem tất cả lịch hẹn
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">Chưa có lịch hẹn</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Bắt đầu bằng việc tìm kiếm bác sĩ và đặt lịch hẹn
              </p>
              <div className="mt-6">
                <Link href="/doctors">
                  <Button>Tìm bác sĩ</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin sức khỏe</CardTitle>
            <CardDescription>Tóm tắt thông tin y tế cá nhân</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Nhóm máu:</span>
                <span className="text-sm font-medium">Chưa cập nhật</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dị ứng:</span>
                <span className="text-sm font-medium">Chưa có</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Bệnh mãn tính:
                </span>
                <span className="text-sm font-medium">Không</span>
              </div>
            </div>
            <Link href="/profile">
              <Button variant="outline" className="w-full mt-4">
                Cập nhật thông tin
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đánh giá gần đây</CardTitle>
            <CardDescription>Đánh giá bác sĩ sau các lần khám</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Star className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">Chưa có đánh giá</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Đánh giá bác sĩ sau khi hoàn thành khám bệnh
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
