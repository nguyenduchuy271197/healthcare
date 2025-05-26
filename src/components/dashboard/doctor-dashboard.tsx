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
import { Calendar, Clock, Users, DollarSign } from "lucide-react";
import { Appointment } from "@/types/custom.types";
import { getDoctorAppointments } from "@/actions";
import { DoctorScheduleSummary } from "@/components/doctors/doctor-schedule-summary";
import { DoctorReviewsWidget } from "@/components/dashboard/doctor-reviews-widget";

export function DoctorDashboard() {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const result = await getDoctorAppointments();
        if (result.success && result.data) {
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

  const pendingCount = todayAppointments.filter(
    (apt) => apt.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng quan hôm nay</CardTitle>
          <CardDescription>Thống kê lịch hẹn và hoạt động</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayAppointments.length}</p>
                <p className="text-sm text-muted-foreground">
                  Lịch hẹn hôm nay
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Chờ xác nhận</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Bệnh nhân</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0đ</p>
                <p className="text-sm text-muted-foreground">Doanh thu</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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
              <Link href="/appointments/manage">
                <Button variant="outline" className="w-full">
                  Xem tất cả lịch hẹn
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
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

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Schedule Summary */}
        <DoctorScheduleSummary />
        
        {/* Reviews Widget */}
        <DoctorReviewsWidget />
      </div>
    </div>
  );
}
