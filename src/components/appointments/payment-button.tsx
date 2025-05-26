"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AppointmentStatus, PaymentStatus } from "@/types/custom.types";

interface PaymentButtonProps {
  appointmentId: number;
  appointmentStatus: AppointmentStatus;
  consultationFee: number;
  paymentStatus?: PaymentStatus | null;
  paymentId?: number | null;
  className?: string;
}

export function PaymentButton({
  appointmentId,
  appointmentStatus,
  consultationFee,
  paymentStatus,
  paymentId,
  className,
}: PaymentButtonProps) {
  const [loading] = useState(false);
  const router = useRouter();

  const handlePaymentClick = () => {
    if (paymentId && paymentStatus) {
      // If payment exists, go to payment details
      router.push(`/payments/${paymentId}`);
    } else {
      // If no payment, go to checkout
      router.push(`/payments/checkout/${appointmentId}`);
    }
  };

  // Don't show payment button for cancelled or rejected appointments
  if (appointmentStatus === "cancelled" || appointmentStatus === "rejected") {
    return null;
  }

  // Show different states based on payment status
  if (paymentStatus === "completed") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePaymentClick}
          disabled={loading}
        >
          View Receipt
        </Button>
      </div>
    );
  }

  if (paymentStatus === "pending") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePaymentClick}
          disabled={loading}
        >
          View Payment
        </Button>
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/payments/checkout/${appointmentId}`)}
          disabled={loading}
        >
          Retry Payment
        </Button>
      </div>
    );
  }

  if (paymentStatus === "refunded") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          Refunded
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePaymentClick}
          disabled={loading}
        >
          View Details
        </Button>
      </div>
    );
  }

  // No payment exists yet
  if (appointmentStatus === "confirmed") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="text-right">
          <p className="text-sm font-medium">
            {formatCurrency(consultationFee)}
          </p>
          <p className="text-xs text-muted-foreground">Payment required</p>
        </div>
        <Button
          onClick={() => router.push(`/payments/checkout/${appointmentId}`)}
          disabled={loading}
          size="sm"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Pay Now
        </Button>
      </div>
    );
  }

  // For pending appointments, show payment will be required after confirmation
  if (appointmentStatus === "pending") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="text-right">
          <p className="text-sm font-medium">
            {formatCurrency(consultationFee)}
          </p>
          <p className="text-xs text-muted-foreground">
            Payment after confirmation
          </p>
        </div>
        <Button variant="outline" size="sm" disabled>
          <CreditCard className="h-4 w-4 mr-2" />
          Pay Later
        </Button>
      </div>
    );
  }

  return null;
}
