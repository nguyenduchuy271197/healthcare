"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  FileText,
  Calendar,
  User,
  Pill,
  Clock,
  Stethoscope,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { MedicalRecordWithDetails } from "@/types/custom.types";

interface MedicalRecordViewProps {
  medicalRecord: MedicalRecordWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export function MedicalRecordView({
  medicalRecord,
  isOpen,
  onClose,
}: MedicalRecordViewProps) {
  const [selectedPrescription, setSelectedPrescription] = useState<{
    id: number;
    instructions?: string | null;
    total_amount?: number | null;
    valid_until?: string | null;
    status: string | null;
    created_at: string | null;
    prescription_items: Array<{
      id: number;
      medication_name: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
      unit_price?: number | null;
      instructions?: string | null;
    }>;
  } | null>(null);
  const [showPrescriptionDetail, setShowPrescriptionDetail] = useState(false);

  function handleViewPrescription(prescription: {
    id: number;
    instructions?: string | null;
    total_amount?: number | null;
    valid_until?: string | null;
    status: string | null;
    created_at: string | null;
    prescription_items: Array<{
      id: number;
      medication_name: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
      unit_price?: number | null;
      instructions?: string | null;
    }>;
  }) {
    setSelectedPrescription(prescription);
    setShowPrescriptionDetail(true);
  }

  function formatDate(dateString: string) {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  }

  function formatDateTime(dateString: string) {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Hồ sơ khám bệnh
            </DialogTitle>
            <DialogDescription>
              Chi tiết thông tin khám bệnh và điều trị
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            {/* Appointment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin lịch khám</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Ngày khám:</strong>{" "}
                      {formatDate(medicalRecord.appointments.appointment_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Giờ khám:</strong>{" "}
                      {medicalRecord.appointments.appointment_time.slice(0, 5)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Bác sĩ:</strong>{" "}
                      {medicalRecord.doctors.user_profiles.full_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Lý do khám:</strong>{" "}
                      {medicalRecord.appointments.reason}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Details */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Symptoms */}
              {medicalRecord.symptoms && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Triệu chứng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">
                      {medicalRecord.symptoms}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Diagnosis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chẩn đoán</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">
                    {medicalRecord.diagnosis}
                  </p>
                </CardContent>
              </Card>

              {/* Treatment Plan */}
              {medicalRecord.treatment_plan && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Hướng điều trị</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">
                      {medicalRecord.treatment_plan}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {medicalRecord.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ghi chú</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">
                      {medicalRecord.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Follow-up */}
            {medicalRecord.follow_up_required && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tái khám</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Cần tái khám</Badge>
                    {medicalRecord.follow_up_date && (
                      <span className="text-sm">
                        Ngày tái khám:{" "}
                        {formatDate(medicalRecord.follow_up_date)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prescriptions */}
            {medicalRecord.prescriptions &&
              medicalRecord.prescriptions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Đơn thuốc
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {medicalRecord.prescriptions.map((prescription) => (
                        <div
                          key={prescription.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                Đơn thuốc #{prescription.id}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDateTime(prescription.created_at!)}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleViewPrescription(prescription)
                              }
                            >
                              Xem chi tiết
                            </Button>
                          </div>

                          {prescription.instructions && (
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>Hướng dẫn:</strong>{" "}
                              {prescription.instructions}
                            </p>
                          )}

                          <p className="text-sm">
                            <strong>Số loại thuốc:</strong>{" "}
                            {prescription.prescription_items.length}
                          </p>

                          {prescription.total_amount && (
                            <p className="text-sm">
                              <strong>Tổng tiền:</strong>{" "}
                              {prescription.total_amount.toLocaleString(
                                "vi-VN"
                              )}
                              đ
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Detail Dialog */}
      {selectedPrescription && (
        <Dialog
          open={showPrescriptionDetail}
          onOpenChange={setShowPrescriptionDetail}
        >
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Chi tiết đơn thuốc #{selectedPrescription.id}
              </DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về các loại thuốc được kê
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedPrescription.instructions && (
                <div>
                  <h4 className="font-medium mb-2">Hướng dẫn sử dụng chung:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedPrescription.instructions}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Danh sách thuốc:</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên thuốc</TableHead>
                        <TableHead>Liều dùng</TableHead>
                        <TableHead>Tần suất</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead>Đơn giá</TableHead>
                        <TableHead>Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPrescription.prescription_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {item.medication_name}
                              </div>
                              {item.instructions && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.instructions}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.dosage}</TableCell>
                          <TableCell>{item.frequency}</TableCell>
                          <TableCell>{item.duration}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {item.unit_price
                              ? `${item.unit_price.toLocaleString("vi-VN")}đ`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {item.unit_price
                              ? `${(
                                  item.quantity * item.unit_price
                                ).toLocaleString("vi-VN")}đ`
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {selectedPrescription.total_amount && (
                <div className="text-right">
                  <p className="text-lg font-bold">
                    Tổng cộng:{" "}
                    {selectedPrescription.total_amount.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
