"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, User, ChevronRight } from "lucide-react";
import { MedicalRecord } from "@/types/custom.types";
import { getPatientMedicalRecords } from "@/actions";

interface MedicalRecordsListProps {
  patientId: string;
}

export function MedicalRecordsList({ patientId }: MedicalRecordsListProps) {
  const [medicalRecords, setMedicalRecords] = useState<
    (MedicalRecord & {
      doctors: {
        user_profiles: {
          full_name: string;
        };
        specialization?: string | null;
      };
      appointments: {
        appointment_date: string;
        appointment_time: string;
      };
    })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMedicalRecords() {
      try {
        const result = await getPatientMedicalRecords(patientId);
        if (result.success && result.data) {
          setMedicalRecords(result.data);
        }
      } catch (error) {
        console.error("Error loading medical records:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMedicalRecords();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (medicalRecords.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Chưa có hồ sơ khám bệnh</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Hồ sơ khám bệnh sẽ được tạo sau khi bạn hoàn thành các cuộc hẹn với
            bác sĩ
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lịch sử khám bệnh</h2>
        <Badge variant="secondary">{medicalRecords.length} hồ sơ</Badge>
      </div>

      <div className="space-y-4">
        {medicalRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{record.diagnosis}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      {record.doctors.user_profiles.full_name}
                      {record.doctors.specialization && (
                        <span className="text-muted-foreground">
                          {" "}
                          - {record.doctors.specialization}
                        </span>
                      )}
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(
                        record.appointments.appointment_date
                      ).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{record.appointments.appointment_time}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {record.symptoms && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Triệu chứng
                    </h4>
                    <p className="text-sm">{record.symptoms}</p>
                  </div>
                )}

                {record.treatment_plan && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Phương pháp điều trị
                    </h4>
                    <p className="text-sm">{record.treatment_plan}</p>
                  </div>
                )}

                {record.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Ghi chú của bác sĩ
                    </h4>
                    <p className="text-sm">{record.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4">
                    {record.follow_up_required && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Cần tái khám
                        {record.follow_up_date && (
                          <span className="ml-1">
                            (
                            {new Date(record.follow_up_date).toLocaleDateString(
                              "vi-VN"
                            )}
                            )
                          </span>
                        )}
                      </Badge>
                    )}
                    {record.attachments && record.attachments.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {record.attachments.length} tệp đính kèm
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    Xem chi tiết
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
