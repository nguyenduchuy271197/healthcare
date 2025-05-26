import { Suspense } from "react";
import { PaymentCheckout } from "@/components/payments/payment-checkout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaymentCheckoutPageProps {
  params: {
    appointmentId: string;
  };
}

function PaymentCheckoutLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-[200px]" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-[150px]" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCheckoutPage({
  params,
}: PaymentCheckoutPageProps) {
  const appointmentId = parseInt(params.appointmentId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/appointments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Checkout</h1>
        <p className="text-muted-foreground">
          Complete your payment for the appointment
        </p>
      </div>

      <Suspense fallback={<PaymentCheckoutLoading />}>
        <PaymentCheckout appointmentId={appointmentId} />
      </Suspense>
    </div>
  );
}
