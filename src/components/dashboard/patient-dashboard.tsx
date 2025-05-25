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
import { Calendar, Clock, Search, FileText, CreditCard } from "lucide-react";
import { Appointment, Patient } from "@/types/custom.types";
import { getPatientAppointments, getPatientProfile } from "@/actions";

type AppointmentWithDoctor = Appointment & {
  doctors: {
    user_profiles: {
      full_name: string;
      avatar_url?: string | null;
    };
    specialization?: string | null;
    clinic_address?: string | null;
  };
};

export function PatientDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    AppointmentWithDoctor[]
  >([]);
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Load upcoming appointments
        const appointmentsResult = await getPatientAppointments();

        if (appointmentsResult.success && appointmentsResult.data) {
          // Filter for confirmed appointments and limit to 3
          const upcoming = appointmentsResult.data
            .filter((apt) => apt.status === "confirmed")
            .slice(0, 3);
          setUpcomingAppointments(upcoming);
        }

        // Load patient profile info
        const patientResult = await getPatientProfile();
        if (patientResult.success && patientResult.data) {
          setPatientInfo(patientResult.data);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function formatTime(timeString: string) {
    return timeString.slice(0, 5); // HH:MM format
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/doctors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Search className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tìm bác sĩ
                  </p>
                  <p className="text-2xl font-bold">Đặt lịch</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/appointments">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Lịch hẹn
                  </p>
                  <p className="text-2xl font-bold">
                    {upcomingAppointments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/medical-records">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Hồ sơ Y tế
                  </p>
                  <p className="text-2xl font-bold">Xem</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/payments">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Thanh toán
                  </p>
                  <p className="text-2xl font-bold">Lịch sử</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Lịch hẹn sắp tới
            </CardTitle>
            <CardDescription>Các cuộc hẹn đã được xác nhận</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Không có lịch hẹn nào sắp tới
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {appointment.doctors.user_profiles.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctors.specialization || "Bác sĩ đa khoa"}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">
                          {formatDate(appointment.appointment_date)}
                        </span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span className="text-xs">
                          {formatTime(appointment.appointment_time)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">{appointment.status}</Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/appointments">Xem tất cả</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tóm tắt sức khỏe
            </CardTitle>
            <CardDescription>Thông tin y tế cơ bản</CardDescription>
          </CardHeader>
          <CardContent>
            {patientInfo ? (
              <div className="space-y-3">
                {patientInfo.blood_type && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Nhóm máu:
                    </span>
                    <span className="text-sm font-medium">
                      {patientInfo.blood_type}
                    </span>
                  </div>
                )}

                {patientInfo.allergies && patientInfo.allergies.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Dị ứng:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {patientInfo.allergies
                        .slice(0, 3)
                        .map((allergy, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {allergy}
                          </Badge>
                        ))}
                      {patientInfo.allergies.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{patientInfo.allergies.length - 3} khác
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {patientInfo.chronic_conditions &&
                  patientInfo.chronic_conditions.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Bệnh mãn tính:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patientInfo.chronic_conditions
                          .slice(0, 2)
                          .map((condition, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {condition}
                            </Badge>
                          ))}
                        {patientInfo.chronic_conditions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{patientInfo.chronic_conditions.length - 2} khác
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/medical-records">Xem chi tiết</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Chưa có thông tin y tế
                </p>
                <Button variant="outline" asChild>
                  <Link href="/medical-records">Tạo hồ sơ y tế</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
