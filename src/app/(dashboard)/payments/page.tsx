import { Suspense } from "react";
import { PaymentHistory } from "@/components/payments/payment-history";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function PaymentHistoryLoading() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
              <Skeleton className="h-6 w-[80px]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Lịch sử thanh toán
        </h1>
        <p className="text-muted-foreground">
          Xem lịch sử thanh toán và chi tiết giao dịch của bạn
        </p>
      </div>

      <Suspense fallback={<PaymentHistoryLoading />}>
        <PaymentHistory />
      </Suspense>
    </div>
  );
}
