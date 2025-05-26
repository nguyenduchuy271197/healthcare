import { Suspense } from "react";
import { PaymentDetails } from "@/components/payments/payment-details";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaymentDetailsPageProps {
  params: {
    paymentId: string;
  };
}

function PaymentDetailsLoading() {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-5 w-[150px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentDetailsPage({
  params,
}: PaymentDetailsPageProps) {
  const paymentId = parseInt(params.paymentId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/payments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
        <p className="text-muted-foreground">
          View detailed information about this payment
        </p>
      </div>

      <Suspense fallback={<PaymentDetailsLoading />}>
        <PaymentDetails paymentId={paymentId} />
      </Suspense>
    </div>
  );
}
