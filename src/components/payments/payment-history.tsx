"use client";

import { useEffect, useState, useCallback } from "react";
import { getPaymentHistory } from "@/actions/payments/get-payment-history";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Payment, PaymentStatus } from "@/types/custom.types";
import { useToast } from "@/hooks/use-toast";

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

interface PaymentHistoryProps {
  patientId?: string;
}

function getStatusColor(status: PaymentStatus) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "refunded":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
}

function getStatusText(status: PaymentStatus) {
  switch (status) {
    case "completed":
      return "Hoàn thành";
    case "pending":
      return "Chờ xử lý";
    case "failed":
      return "Thất bại";
    case "refunded":
      return "Đã hoàn tiền";
    default:
      return "Không xác định";
  }
}

function getPaymentMethodText(method: string) {
  switch (method) {
    case "credit_card":
      return "Thẻ tín dụng";
    case "bank_transfer":
      return "Chuyển khoản ngân hàng";
    case "wallet":
      return "Ví điện tử";
    case "cash":
      return "Tiền mặt";
    default:
      return method;
  }
}

export function PaymentHistory({ patientId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentWithAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPaymentHistory(patientId);

      if (result.success && result.data) {
        setPayments(result.data);
        setTotal(result.total || 0);
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể tải lịch sử thanh toán",
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
  }, [patientId, toast]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Không tìm thấy lịch sử thanh toán.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Tổng {total} thanh toán</p>
        <Button variant="outline" size="sm" onClick={loadPayments}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">Thanh toán #{payment.id}</h3>
                    <Badge
                      className={getStatusColor(payment.status || "pending")}
                    >
                      {getStatusText(payment.status || "pending")}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">Bác sĩ:</span>{" "}
                      {payment.appointments.doctors.user_profiles.full_name}
                    </p>
                    <p>
                      <span className="font-medium">Lịch hẹn:</span>{" "}
                      {formatDate(payment.appointments.appointment_date)} lúc{" "}
                      {formatTime(payment.appointments.appointment_time)}
                    </p>
                    <p>
                      <span className="font-medium">Phương thức:</span>{" "}
                      {getPaymentMethodText(payment.payment_method)}
                    </p>
                    <p>
                      <span className="font-medium">Ngày:</span>{" "}
                      {formatDate(payment.created_at || "")}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-3">
                  <div className="text-2xl font-bold">
                    {formatCurrency(payment.amount)}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/payments/${payment.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Xem
                      </Link>
                    </Button>

                    {payment.invoice_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={payment.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Hóa đơn
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
