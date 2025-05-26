"use client";

import { useEffect, useState, useCallback } from "react";
import { getPaymentDetails } from "@/actions/payments/get-payment-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  RefreshCw,
  CreditCard,
  Building,
  Wallet,
  Banknote,
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Payment, PaymentStatus } from "@/types/custom.types";
import { useToast } from "@/hooks/use-toast";

type PaymentWithDetails = Payment & {
  appointments: {
    appointment_date: string;
    appointment_time: string;
    reason: string;
    duration_minutes?: number | null;
    doctors: {
      user_profiles: {
        full_name: string;
        phone?: string | null;
      };
      specialization?: string | null;
      clinic_address?: string | null;
    };
  };
};

interface PaymentDetailsProps {
  paymentId: number;
}

function getStatusColor(status: PaymentStatus) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getPaymentMethodIcon(method: string) {
  switch (method) {
    case "credit_card":
      return <CreditCard className="h-4 w-4" />;
    case "bank_transfer":
      return <Building className="h-4 w-4" />;
    case "wallet":
      return <Wallet className="h-4 w-4" />;
    case "cash":
      return <Banknote className="h-4 w-4" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
}

function getPaymentMethodText(method: string) {
  switch (method) {
    case "credit_card":
      return "Credit Card";
    case "bank_transfer":
      return "Bank Transfer";
    case "wallet":
      return "Digital Wallet";
    case "cash":
      return "Cash";
    default:
      return method;
  }
}

export function PaymentDetails({ paymentId }: PaymentDetailsProps) {
  const [payment, setPayment] = useState<PaymentWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPaymentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPaymentDetails(paymentId);

      if (result.success && result.data) {
        setPayment(result.data as PaymentWithDetails);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load payment details",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [paymentId, toast]);

  useEffect(() => {
    loadPaymentDetails();
  }, [loadPaymentDetails]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payment) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Payment not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Payment #{payment.id}</h2>
          <Badge className={getStatusColor(payment.status || "pending")}>
            {payment.status || "pending"}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={loadPaymentDetails}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Amount
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <Badge className={getStatusColor(payment.status || "pending")}>
                  {payment.status || "pending"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Payment Method
                </p>
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(payment.payment_method)}
                  <span>{getPaymentMethodText(payment.payment_method)}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Transaction ID
                </p>
                <p className="font-mono text-sm">
                  {payment.transaction_id || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created
                </p>
                <p>{formatDateTime(payment.created_at || "")}</p>
              </div>
              {payment.paid_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Paid At
                  </p>
                  <p>{formatDateTime(payment.paid_at)}</p>
                </div>
              )}
            </div>

            {payment.payment_gateway && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Payment Gateway
                </p>
                <p>{payment.payment_gateway}</p>
              </div>
            )}

            {payment.refunded_at && (
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Refunded At
                  </p>
                  <p>{formatDateTime(payment.refunded_at)}</p>
                </div>
                {payment.refund_reason && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Refund Reason
                    </p>
                    <p>{payment.refund_reason}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Doctor
              </p>
              <p className="font-semibold">
                Dr. {payment.appointments.doctors.user_profiles.full_name}
              </p>
              {payment.appointments.doctors.specialization && (
                <p className="text-sm text-muted-foreground">
                  {payment.appointments.doctors.specialization}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Date & Time
              </p>
              <p>
                {formatDate(payment.appointments.appointment_date)} at{" "}
                {payment.appointments.appointment_time}
              </p>
              {payment.appointments.duration_minutes && (
                <p className="text-sm text-muted-foreground">
                  Duration: {payment.appointments.duration_minutes} minutes
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Reason
              </p>
              <p>{payment.appointments.reason}</p>
            </div>

            {payment.appointments.doctors.clinic_address && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Clinic Address
                </p>
                <p>{payment.appointments.doctors.clinic_address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {payment.invoice_url && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Invoice</h3>
                <p className="text-sm text-muted-foreground">
                  Download your payment invoice
                </p>
              </div>
              <Button asChild>
                <a
                  href={payment.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
