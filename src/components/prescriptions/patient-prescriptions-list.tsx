"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Calendar,
  User,
  Eye,
  Loader2,
  Clock,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getPatientPrescriptions } from "@/actions";
import {
  PrescriptionWithDoctorAndItems,
  PrescriptionViewData,
} from "@/types/custom.types";
import { PrescriptionView } from "./prescription-view";

interface PatientPrescriptionsListProps {
  patientId: string;
}

export function PatientPrescriptionsList({
  patientId,
}: PatientPrescriptionsListProps) {
  const [prescriptions, setPrescriptions] = useState<
    PrescriptionWithDoctorAndItems[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] =
    useState<PrescriptionViewData | null>(null);
  const [showPrescriptionView, setShowPrescriptionView] = useState(false);

  const { toast } = useToast();

  const loadPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPatientPrescriptions(patientId);
      if (result.success && result.data) {
        setPrescriptions(result.data);
      } else {
        toast({
          title: "Lỗi tải dữ liệu",
          description: result.error || "Không thể tải danh sách đơn thuốc.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi tải danh sách đơn thuốc.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [patientId, toast]);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  function handleViewPrescription(
    prescription: PrescriptionWithDoctorAndItems
  ) {
    // Transform the prescription data to match PrescriptionViewData type
    const prescriptionViewData: PrescriptionViewData = {
      ...prescription,
      patients: {
        user_profiles: {
          full_name: "N/A", // This will be populated from the actual patient data
          phone: undefined,
          date_of_birth: undefined,
        },
      },
      doctors: {
        ...prescription.doctors,
        clinic_address: undefined,
        license_number: undefined,
      },
      medical_records: {
        diagnosis: prescription.medical_records.diagnosis,
        symptoms: undefined,
      },
    };

    setSelectedPrescription(prescriptionViewData);
    setShowPrescriptionView(true);
  }

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

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Đang tải danh sách đơn thuốc...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Đơn thuốc của tôi
          </CardTitle>
          <CardDescription>
            Danh sách các đơn thuốc đã được bác sĩ kê cho bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prescriptions.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chưa có đơn thuốc nào</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bác sĩ kê đơn</TableHead>
                    <TableHead>Ngày kê đơn</TableHead>
                    <TableHead>Số loại thuốc</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hiệu lực</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              BS.{" "}
                              {prescription.doctors.user_profiles.full_name ||
                                "N/A"}
                            </span>
                          </div>
                          {prescription.doctors.specialization && (
                            <div className="text-sm text-muted-foreground">
                              {prescription.doctors.specialization}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(
                              new Date(prescription.created_at!),
                              "dd/MM/yyyy",
                              { locale: vi }
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {prescription.prescription_items.length} loại
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {prescription.total_amount
                            ? `${prescription.total_amount.toLocaleString(
                                "vi-VN"
                              )}đ`
                            : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(prescription.status || "active")}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {prescription.valid_until ? (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {format(
                                  new Date(prescription.valid_until),
                                  "dd/MM/yyyy",
                                  { locale: vi }
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Không giới hạn
                            </span>
                          )}
                          {prescription.dispensed_at && (
                            <div className="text-xs text-green-600">
                              Đã cấp phát
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPrescription(prescription)}
                        >
                          <Eye className="h-4 w-4" />
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription View */}
      {selectedPrescription && (
        <PrescriptionView
          prescription={selectedPrescription}
          isOpen={showPrescriptionView}
          onClose={() => {
            setShowPrescriptionView(false);
            setSelectedPrescription(null);
          }}
        />
      )}
    </div>
  );
}
