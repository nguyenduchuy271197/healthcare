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
  FileText,
  Calendar,
  User,
  Pill,
  Clock,
  Eye,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getPatientMedicalRecords } from "@/actions";
import { MedicalRecordWithDetails } from "@/types/custom.types";
import { MedicalRecordView } from "./medical-record-view";

interface PatientMedicalRecordsProps {
  patientId: string;
}

export function PatientMedicalRecords({
  patientId,
}: PatientMedicalRecordsProps) {
  const [medicalRecords, setMedicalRecords] = useState<
    MedicalRecordWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] =
    useState<MedicalRecordWithDetails | null>(null);
  const [showRecordDetail, setShowRecordDetail] = useState(false);

  const { toast } = useToast();

  const loadMedicalRecords = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPatientMedicalRecords(patientId);
      if (result.success && result.data) {
        setMedicalRecords(result.data as MedicalRecordWithDetails[]);
      } else {
        toast({
          title: "Lỗi tải dữ liệu",
          description: result.error || "Không thể tải hồ sơ y tế.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi tải hồ sơ y tế.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [patientId, toast]);

  useEffect(() => {
    loadMedicalRecords();
  }, [loadMedicalRecords]);

  function handleViewRecord(record: MedicalRecordWithDetails) {
    setSelectedRecord(record);
    setShowRecordDetail(true);
  }

  function formatDate(dateString: string) {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  }

  function formatDateTime(dateString: string) {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Đang tải hồ sơ y tế...</span>
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
            <FileText className="h-5 w-5" />
            Lịch sử khám bệnh
          </CardTitle>
          <CardDescription>
            Xem chi tiết các lần khám bệnh và đơn thuốc
          </CardDescription>
        </CardHeader>
        <CardContent>
          {medicalRecords.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Chưa có hồ sơ khám bệnh nào
              </p>
              <p className="text-sm text-muted-foreground">
                Hồ sơ sẽ được tạo sau khi bạn hoàn thành lịch khám
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày khám</TableHead>
                    <TableHead>Bác sĩ</TableHead>
                    <TableHead>Chẩn đoán</TableHead>
                    <TableHead>Tái khám</TableHead>
                    <TableHead>Đơn thuốc</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicalRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {formatDate(record.appointments.appointment_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {record.appointments.appointment_time.slice(0, 5)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {record.doctors.user_profiles.full_name}
                            </span>
                          </div>
                          {record.doctors.user_profiles.specialization && (
                            <div className="text-sm text-muted-foreground">
                              {record.doctors.user_profiles.specialization}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm line-clamp-2">
                          {record.diagnosis}
                        </p>
                      </TableCell>
                      <TableCell>
                        {record.follow_up_required ? (
                          <div className="space-y-1">
                            <Badge variant="secondary">Cần tái khám</Badge>
                            {record.follow_up_date && (
                              <div className="text-xs text-muted-foreground">
                                {formatDate(record.follow_up_date)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Không
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.prescriptions &&
                        record.prescriptions.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {record.prescriptions.length} đơn thuốc
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDateTime(
                                record.prescriptions[0].created_at ||
                                  new Date().toISOString()
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Không có
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewRecord(record)}
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

      {/* Medical Record Detail */}
      {selectedRecord && (
        <MedicalRecordView
          medicalRecord={selectedRecord!}
          isOpen={showRecordDetail}
          onClose={() => {
            setShowRecordDetail(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
}
