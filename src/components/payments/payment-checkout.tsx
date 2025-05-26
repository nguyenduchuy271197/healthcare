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
    name: "Thẻ tín dụng",
    description: "Thanh toán bằng thẻ tín dụng hoặc thẻ ghi nợ",
    icon: CreditCard,
  },
  {
    id: "bank_transfer" as PaymentMethod,
    name: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản trực tiếp từ tài khoản ngân hàng",
    icon: Building,
  },
  {
    id: "wallet" as PaymentMethod,
    name: "Ví điện tử",
    description: "Thanh toán bằng MoMo, ZaloPay hoặc ví điện tử khác",
    icon: Wallet,
  },
  {
    id: "cash" as PaymentMethod,
    name: "Tiền mặt",
    description: "Thanh toán bằng tiền mặt tại phòng khám",
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
          title: "Lỗi",
          description: createResult.error || "Không thể tạo thanh toán",
          variant: "destructive",
        });
        return;
      }

      // For cash payments, redirect immediately
      if (selectedMethod === "cash") {
        toast({
          title: "Thành công",
          description:
            "Phương thức thanh toán đã được đặt là tiền mặt. Vui lòng thanh toán tại phòng khám.",
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
            title: "Thanh toán thành công",
            description: "Thanh toán của bạn đã được xử lý thành công",
          });
          router.push(`/payments/${createResult.paymentId}`);
        } else {
          toast({
            title: "Thanh toán thất bại",
            description: processResult.error || "Xử lý thanh toán thất bại",
            variant: "destructive",
          });
        }
      }
    } catch {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
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
          <CardTitle>Phương thức thanh toán</CardTitle>
          <CardDescription>Chọn cách bạn muốn thanh toán</CardDescription>
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
              <h4 className="font-medium">Thông tin thẻ</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="cardName">Tên chủ thẻ</Label>
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
                  <Label htmlFor="cardNumber">Số thẻ</Label>
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
                    <Label htmlFor="expiry">Ngày hết hạn</Label>
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
            <span>Thông tin thanh toán của bạn được bảo mật và mã hóa</span>
          </div>

          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? (
              "Đang xử lý..."
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Hoàn tất thanh toán
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
