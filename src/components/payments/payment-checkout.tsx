"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPayment } from "@/actions/payments/create-payment";
import { processPayment } from "@/actions/payments/process-payment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Building,
  Wallet,
  Banknote,
  Lock,
  CheckCircle,
} from "lucide-react";
import { PaymentMethod } from "@/types/custom.types";
import { useToast } from "@/hooks/use-toast";

interface PaymentCheckoutProps {
  appointmentId: number;
}

const paymentMethods = [
  {
    id: "credit_card" as PaymentMethod,
    name: "Credit Card",
    description: "Pay with your credit or debit card",
    icon: CreditCard,
  },
  {
    id: "bank_transfer" as PaymentMethod,
    name: "Bank Transfer",
    description: "Transfer directly from your bank account",
    icon: Building,
  },
  {
    id: "wallet" as PaymentMethod,
    name: "Digital Wallet",
    description: "Pay with MoMo, ZaloPay, or other e-wallets",
    icon: Wallet,
  },
  {
    id: "cash" as PaymentMethod,
    name: "Cash",
    description: "Pay in cash at the clinic",
    icon: Banknote,
  },
];

export function PaymentCheckout({ appointmentId }: PaymentCheckoutProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("credit_card");
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const router = useRouter();
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      setProcessing(true);

      // Create payment record
      const createResult = await createPayment({
        appointmentId,
        paymentMethod: selectedMethod,
      });

      if (!createResult.success) {
        toast({
          title: "Error",
          description: createResult.error || "Failed to create payment",
          variant: "destructive",
        });
        return;
      }

      // For cash payments, redirect immediately
      if (selectedMethod === "cash") {
        toast({
          title: "Success",
          description: "Payment method set to cash. Please pay at the clinic.",
        });
        router.push(`/payments/${createResult.paymentId}`);
        return;
      }

      // Process payment for other methods
      if (createResult.paymentId) {
        const processResult = await processPayment(createResult.paymentId, {
          transactionId:
            selectedMethod === "credit_card"
              ? `card_${Date.now()}`
              : `${selectedMethod}_${Date.now()}`,
          notes:
            selectedMethod === "credit_card"
              ? `Card ending in ${cardDetails.number.slice(-4)}`
              : `Payment via ${selectedMethod}`,
        });

        if (processResult.success) {
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully",
          });
          router.push(`/payments/${createResult.paymentId}`);
        } else {
          toast({
            title: "Payment Failed",
            description: processResult.error || "Payment processing failed",
            variant: "destructive",
          });
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Choose how you want to pay</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedMethod}
            onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
          >
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className="flex items-center space-x-3 border rounded-lg p-4"
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label
                      htmlFor={method.id}
                      className="font-medium cursor-pointer"
                    >
                      {method.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </RadioGroup>

          {/* Credit Card Form */}
          {selectedMethod === "credit_card" && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Card Details</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(e) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        number: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) =>
                        setCardDetails((prev) => ({
                          ...prev,
                          expiry: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails((prev) => ({
                          ...prev,
                          cvv: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? (
              "Processing..."
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Payment
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
