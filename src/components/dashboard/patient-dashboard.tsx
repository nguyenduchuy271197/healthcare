"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Search,
  FileText,
  CreditCard,
  Bell,
  Pill,
} from "lucide-react";
import { Patient } from "@/types/custom.types";
import { getPatientProfile } from "@/actions";
import { UpcomingAppointmentsWidget } from "@/components/dashboard/upcoming-appointments-widget";
import { PaymentSummaryWidget } from "@/components/dashboard/payment-summary-widget";
import { AppointmentReminders } from "@/components/notifications/appointment-reminders";

export function PatientDashboard() {
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-0 bg-gray-50">
              <CardContent className="p-4">
                <div className="animate-pulse text-center">
                  <div className="h-6 w-6 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
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
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Link href="/doctors" className="group">
          <Card className="hover:shadow-sm transition-all border-0 bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200">
            <CardContent className="p-4 text-center">
              <Search className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-900">Tìm bác sĩ</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/appointments" className="group">
          <Card className="hover:shadow-sm transition-all border-0 bg-gradient-to-br from-green-50 to-green-100 group-hover:from-green-100 group-hover:to-green-200">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-900">Lịch hẹn</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/medical-records" className="group">
          <Card className="hover:shadow-sm transition-all border-0 bg-gradient-to-br from-purple-50 to-purple-100 group-hover:from-purple-100 group-hover:to-purple-200">
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-900">Hồ sơ Y tế</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/prescriptions" className="group">
          <Card className="hover:shadow-sm transition-all border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 group-hover:from-indigo-100 group-hover:to-indigo-200">
            <CardContent className="p-4 text-center">
              <Pill className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-indigo-900">Đơn thuốc</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/payments" className="group">
          <Card className="hover:shadow-sm transition-all border-0 bg-gradient-to-br from-orange-50 to-orange-100 group-hover:from-orange-100 group-hover:to-orange-200">
            <CardContent className="p-4 text-center">
              <CreditCard className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-900">Thanh toán</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/notifications" className="group">
          <Card className="hover:shadow-sm transition-all border-0 bg-gradient-to-br from-teal-50 to-teal-100 group-hover:from-teal-100 group-hover:to-teal-200">
            <CardContent className="p-4 text-center">
              <Bell className="h-6 w-6 text-teal-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-teal-900">Thông báo</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments with Reminders */}
        <UpcomingAppointmentsWidget limit={5} />

        {/* Payment Summary */}
        <PaymentSummaryWidget />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Health Summary */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Sức khỏe
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {patientInfo ? (
              <div className="space-y-2">
                {patientInfo.blood_type && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nhóm máu</span>
                    <span className="font-medium">
                      {patientInfo.blood_type}
                    </span>
                  </div>
                )}

                {patientInfo.allergies && patientInfo.allergies.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">
                      Dị ứng
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {patientInfo.allergies
                        .slice(0, 2)
                        .map((allergy, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs px-2 py-0"
                          >
                            {allergy}
                          </Badge>
                        ))}
                      {patientInfo.allergies.length > 2 && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-0"
                        >
                          +{patientInfo.allergies.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 h-8"
                  asChild
                >
                  <Link href="/medical-records">Xem chi tiết</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Chưa có thông tin
                </p>
                <Button variant="ghost" size="sm" className="h-8" asChild>
                  <Link href="/medical-records">Tạo hồ sơ</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Thông báo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-48 overflow-y-auto">
              <AppointmentReminders />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
