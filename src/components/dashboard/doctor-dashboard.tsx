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
  Users,
  FileText,
  DollarSign,
  Settings,
} from "lucide-react";
import { Profile, Appointment } from "@/types/custom.types";
import { getDoctorAppointments } from "@/actions";

interface DoctorDashboardProps {
  user: Profile;
}

export function DoctorDashboard({ user }: DoctorDashboardProps) {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  console.log(user);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const result = await getDoctorAppointments();
        if (result.success && result.data) {
          // Filter today's appointments
          const today = new Date().toISOString().split("T")[0];
          const todayApts = result.data.filter(
            (apt) => apt.appointment_date === today
          );
          setTodayAppointments(todayApts);
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
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">Lịch hẹn trong ngày</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xác nhận</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                todayAppointments.filter((apt) => apt.status === "pending")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Cần xử lý</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bệnh nhân</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Tổng số bệnh nhân</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0đ</div>
            <p className="text-xs text-muted-foreground">Tháng này</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lịch làm việc</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/schedule">
              <Button className="w-full">Cài đặt</Button>
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
                Quản lý
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bệnh nhân</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/patients">
              <Button variant="outline" className="w-full">
                Danh sách
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Báo cáo</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/reports">
              <Button variant="outline" className="w-full">
                Xem báo cáo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch hẹn hôm nay</CardTitle>
          <CardDescription>
            Danh sách bệnh nhân đặt lịch khám trong ngày
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
          ) : todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        {appointment.appointment_time.slice(0, 5)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        Bệnh nhân #{appointment.patient_id.slice(0, 8)}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{appointment.reason}</span>
                        <span>•</span>
                        <span>{appointment.duration_minutes || 30} phút</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(appointment.status || "pending")}
                    {appointment.status === "pending" && (
                      <Button size="sm" variant="outline">
                        Xác nhận
                      </Button>
                    )}
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
              <h3 className="mt-2 text-sm font-medium">
                Không có lịch hẹn hôm nay
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Hôm nay bạn không có lịch hẹn nào được đặt
              </p>
              <div className="mt-6">
                <Link href="/schedule">
                  <Button>Cài đặt lịch làm việc</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các hoạt động mới nhất trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">Chưa có hoạt động</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Các hoạt động sẽ hiển thị ở đây
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê nhanh</CardTitle>
            <CardDescription>Tổng quan về hiệu suất làm việc</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Đánh giá trung bình:
                </span>
                <span className="text-sm font-medium">Chưa có</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Tổng đánh giá:
                </span>
                <span className="text-sm font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Lịch hẹn hoàn thành:
                </span>
                <span className="text-sm font-medium">0</span>
              </div>
            </div>
            <Link href="/profile">
              <Button variant="outline" className="w-full mt-4">
                Cập nhật hồ sơ
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
