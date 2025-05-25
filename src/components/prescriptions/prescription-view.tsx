"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Pill,
  Download,
  Printer,
  Calendar,
  User,
  MapPin,
  FileText,
  Loader2,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { PrescriptionViewData } from "@/types/custom.types";

interface PrescriptionViewProps {
  prescription: PrescriptionViewData;
  isOpen: boolean;
  onClose: () => void;
}

export function PrescriptionView({
  prescription,
  isOpen,
  onClose,
}: PrescriptionViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const prescriptionNumber = `RX-${prescription.id}-${format(
    new Date(prescription.created_at!),
    "yyyyMMdd"
  )}`;
  const prescriptionDate = format(
    new Date(prescription.created_at!),
    "dd/MM/yyyy",
    { locale: vi }
  );

  function getStatusBadge(status: string) {
    const statusConfig = {
      active: { label: "Đang hiệu lực", variant: "default" as const },
      completed: { label: "Đã hoàn thành", variant: "outline" as const },
      cancelled: { label: "Đã hủy", variant: "destructive" as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPDF() {
    setIsGenerating(true);
    try {
      // In a real implementation, this would call a PDF generation service
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Tải xuống thành công",
        description: "Đơn thuốc đã được tải xuống.",
      });
    } catch {
      toast({
        title: "Lỗi tải xuống",
        description: "Không thể tải xuống đơn thuốc. Vui lòng thử lại.",
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
            <Pill className="h-5 w-5" />
            Đơn thuốc điện tử
          </DialogTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              In đơn thuốc
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
          {/* Prescription Header */}
          <div className="text-center border-b pb-6">
            <h1 className="text-2xl font-bold text-primary mb-2">
              ĐƠN THUỐC ĐIỆN TỬ
            </h1>
            <p className="text-lg font-semibold">Số: {prescriptionNumber}</p>
            <p className="text-sm text-muted-foreground">
              Ngày kê đơn: {prescriptionDate}
            </p>
            <div className="mt-2">
              {getStatusBadge(prescription.status || "active")}
            </div>
          </div>

          {/* Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin bác sĩ kê đơn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  BS. {prescription.doctors.user_profiles.full_name}
                </span>
              </div>
              {prescription.doctors.specialization && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Chuyên khoa: {prescription.doctors.specialization}
                  </span>
                </div>
              )}
              {prescription.doctors.license_number && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Số chứng chỉ hành nghề:{" "}
                    {prescription.doctors.license_number}
                  </span>
                </div>
              )}
              {prescription.doctors.clinic_address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{prescription.doctors.clinic_address}</span>
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
                  {prescription.patients.user_profiles.full_name}
                </span>
              </div>
              {prescription.patients.user_profiles.date_of_birth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Ngày sinh:{" "}
                    {format(
                      new Date(
                        prescription.patients.user_profiles.date_of_birth
                      ),
                      "dd/MM/yyyy",
                      { locale: vi }
                    )}
                  </span>
                </div>
              )}
              {prescription.patients.user_profiles.phone && (
                <div className="flex items-center gap-2">
                  <span>SĐT: {prescription.patients.user_profiles.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diagnosis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chẩn đoán</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {prescription.medical_records.diagnosis}
              </p>
              {prescription.medical_records.symptoms && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">
                    Triệu chứng:{" "}
                  </span>
                  <span className="text-sm">
                    {prescription.medical_records.symptoms}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Danh sách thuốc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">STT</TableHead>
                      <TableHead>Tên thuốc</TableHead>
                      <TableHead>Liều dùng</TableHead>
                      <TableHead>Tần suất</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescription.prescription_items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {item.medication_name}
                            </p>
                            {item.instructions && (
                              <p className="text-sm text-muted-foreground">
                                {item.instructions}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.dosage}</TableCell>
                        <TableCell>{item.frequency}</TableCell>
                        <TableCell>{item.duration}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {item.unit_price
                            ? `${item.unit_price.toLocaleString("vi-VN")}đ`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {prescription.total_amount && (
                <div className="mt-4 flex justify-end">
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      Tổng tiền thuốc:{" "}
                      {prescription.total_amount.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          {prescription.instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hướng dẫn sử dụng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">
                  {prescription.instructions}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Validity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin hiệu lực</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Ngày kê đơn: {prescriptionDate}</span>
              </div>
              {prescription.valid_until && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Có hiệu lực đến:{" "}
                    {format(new Date(prescription.valid_until), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </span>
                </div>
              )}
              {prescription.dispensed_at && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600">
                    Đã cấp phát:{" "}
                    {format(
                      new Date(prescription.dispensed_at),
                      "dd/MM/yyyy HH:mm",
                      { locale: vi }
                    )}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Đơn thuốc này được tạo tự động bởi hệ thống.</p>
            <p>Vui lòng mang đơn thuốc này đến nhà thuốc để mua thuốc.</p>
            <div className="mt-2 text-right">
              <p className="font-medium">Chữ ký bác sĩ</p>
              <div className="mt-8">
                <p>BS. {prescription.doctors.user_profiles.full_name}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
