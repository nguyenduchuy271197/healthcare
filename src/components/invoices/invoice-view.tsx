"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  User,
  MapPin,
  Phone,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AppointmentForInvoice } from "@/types/custom.types";

interface InvoiceViewProps {
  appointment: AppointmentForInvoice;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceView({
  appointment,
  isOpen,
  onClose,
}: InvoiceViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const payment = appointment.payments?.[0];
  const invoiceNumber = `INV-${appointment.id}-${format(
    new Date(),
    "yyyyMMdd"
  )}`;
  const invoiceDate = format(new Date(), "dd/MM/yyyy", { locale: vi });

  // Calculate amounts
  const subtotal = appointment.consultation_fee || 0;
  const taxRate = 0.1; // 10% VAT
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPDF() {
    setIsGenerating(true);
    try {
      // In a real implementation, this would call a PDF generation service
      // For now, we'll simulate the download
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Tải xuống thành công",
        description: "Hóa đơn đã được tải xuống.",
      });
    } catch {
      toast({
        title: "Lỗi tải xuống",
        description: "Không thể tải xuống hóa đơn. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="print:hidden flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Hóa đơn khám bệnh
          </DialogTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              In hóa đơn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Tải PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 print:overflow-visible pr-2">
          {/* Invoice Header */}
          <div className="text-center border-b pb-6">
            <h1 className="text-2xl font-bold text-primary mb-2">
              HÓA ĐƠN KHÁM BỆNH
            </h1>
            <p className="text-lg font-semibold">Số: {invoiceNumber}</p>
            <p className="text-sm text-muted-foreground">Ngày: {invoiceDate}</p>
          </div>

          {/* Doctor and Clinic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Thông tin bác sĩ & phòng khám
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  BS. {appointment.doctors.user_profiles.full_name}
                </span>
              </div>
              {appointment.doctors.license_number && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Số chứng chỉ hành nghề: {appointment.doctors.license_number}
                  </span>
                </div>
              )}
              {appointment.doctors.clinic_address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.doctors.clinic_address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin bệnh nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {appointment.patients.user_profiles.full_name}
                </span>
              </div>
              {appointment.patients.user_profiles.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.patients.user_profiles.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chi tiết khám bệnh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Ngày khám:{" "}
                  {format(
                    new Date(appointment.appointment_date),
                    "dd/MM/yyyy",
                    { locale: vi }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>
                  Giờ khám: {appointment.appointment_time.slice(0, 5)}
                </span>
              </div>
              <div>
                <span className="font-medium">Lý do khám:</span>{" "}
                {appointment.reason}
              </div>
              {appointment.duration_minutes && (
                <div>
                  <span className="font-medium">Thời gian khám:</span>{" "}
                  {appointment.duration_minutes} phút
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chi tiết thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Phí khám bệnh:</span>
                  <span className="font-medium">
                    {subtotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>VAT (10%):</span>
                  <span className="font-medium">
                    {taxAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">
                    {totalAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                {payment && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">
                        Trạng thái thanh toán:
                      </span>{" "}
                      <span
                        className={`${
                          payment.status === "completed"
                            ? "text-green-600"
                            : payment.status === "pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {payment.status === "completed"
                          ? "Đã thanh toán"
                          : payment.status === "pending"
                          ? "Chờ thanh toán"
                          : "Chưa thanh toán"}
                      </span>
                    </p>
                    {payment.status === "completed" && (
                      <p className="text-sm text-muted-foreground">
                        Thanh toán vào:{" "}
                        {format(
                          new Date(payment.created_at),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
            <p>Hóa đơn này được tạo tự động bởi hệ thống.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
