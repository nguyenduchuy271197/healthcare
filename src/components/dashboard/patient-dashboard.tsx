"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Search, FileText, CreditCard, Bell } from "lucide-react";
import { UpcomingAppointmentsWidget } from "@/components/dashboard/upcoming-appointments-widget";
import { PaymentSummaryWidget } from "@/components/dashboard/payment-summary-widget";

export function PatientDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for widgets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
      {/* Quick Actions - Reduced to 4 most important */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Link href="/doctors" className="group">
          <Card className="hover:shadow-sm transition-all border-0 bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200">
            <CardContent className="px-4 py-8 text-center">
              <Search className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-900">Tìm bác sĩ</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/appointments" className="group">
          <Card className="hover:shadow-sm transition-all border-0 bg-gradient-to-br from-green-50 to-green-100 group-hover:from-green-100 group-hover:to-green-200">
            <CardContent className="px-4 py-8 text-center">
              <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-900">Lịch hẹn</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/medical-records" className="group">
          <Card className="hover:shadow-sm transition-all border-0 bg-gradient-to-br from-purple-50 to-purple-100 group-hover:from-purple-100 group-hover:to-purple-200">
            <CardContent className="px-4 py-8 text-center">
              <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-900">Hồ sơ Y tế</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/payments" className="group">
          <Card className="hover:shadow-sm transition-all border-0 bg-gradient-to-br from-orange-50 to-orange-100 group-hover:from-orange-100 group-hover:to-orange-200">
            <CardContent className="px-4 py-8 text-center">
              <CreditCard className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-900">Thanh toán</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content - 2 columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <UpcomingAppointmentsWidget limit={5} />

        {/* Payment Summary */}
        <PaymentSummaryWidget />
      </div>
    </div>
  );
}
