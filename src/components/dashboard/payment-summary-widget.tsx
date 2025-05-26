"use client";

import { useEffect, useState, useCallback } from "react";
import { getPaymentHistory } from "@/actions/payments/get-payment-history";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Payment, PaymentStatus } from "@/types/custom.types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type PaymentWithAppointment = Payment & {
  appointments: {
    appointment_date: string;
    appointment_time: string;
    doctors: {
      user_profiles: {
        full_name: string;
      };
    };
  };
};

export function PaymentSummaryWidget() {
  const [payments, setPayments] = useState<PaymentWithAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPaid: 0,
    pendingAmount: 0,
    completedCount: 0,
    pendingCount: 0,
  });
  const { toast } = useToast();

  const loadPaymentSummary = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPaymentHistory(undefined, { limit: 5 });

      if (result.success && result.data) {
        setPayments(result.data);

        // Calculate stats
        const totalPaid = result.data
          .filter((p) => p.status === "completed")
          .reduce((sum, p) => sum + p.amount, 0);

        const pendingAmount = result.data
          .filter((p) => p.status === "pending")
          .reduce((sum, p) => sum + p.amount, 0);

        const completedCount = result.data.filter(
          (p) => p.status === "completed"
        ).length;
        const pendingCount = result.data.filter(
          (p) => p.status === "pending"
        ).length;

        setStats({
          totalPaid,
          pendingAmount,
          completedCount,
          pendingCount,
        });
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể tải tóm tắt thanh toán",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPaymentSummary();
  }, [loadPaymentSummary]);

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tóm tắt thanh toán</CardTitle>
          <CardDescription>Tổng quan thanh toán của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tóm tắt thanh toán</CardTitle>
          <CardDescription>Tổng quan thanh toán của bạn</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/payments">Xem tất cả</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Tổng đã thanh toán</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(stats.totalPaid)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completedCount} thanh toán hoàn thành
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Chờ thanh toán</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-lg font-semibold text-yellow-600">
                {formatCurrency(stats.pendingAmount)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingCount} thanh toán chờ xử lý
            </p>
          </div>
        </div>

        {/* Recent Payments */}
        {payments.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Thanh toán gần đây</h4>
            <div className="space-y-3">
              {payments.slice(0, 3).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Dr.{" "}
                        {payment.appointments.doctors.user_profiles.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Payment #{payment.id}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(payment.amount)}
                    </p>
                    <Badge
                      className={`text-xs ${getStatusColor(
                        payment.status || "pending"
                      )}`}
                    >
                      {payment.status || "pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {payments.length === 0 && (
          <div className="text-center py-6">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có thanh toán nào</p>
            <p className="text-sm text-muted-foreground">
              Thanh toán sẽ hiển thị ở đây sau khi đặt lịch hẹn
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
