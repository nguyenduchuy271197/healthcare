"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Phone,
  Calendar,
  DollarSign,
  Star,
  AlertTriangle,
  Pill,
  FileText,
  Clock,
  Heart,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getPatientMedicalHistory } from "@/actions";

interface PatientDetailDialogProps {
  patient: {
    id: string;
    user_profiles: {
      full_name: string;
      phone?: string | null;
      date_of_birth?: string | null;
      avatar_url?: string | null;
    };
    totalAppointments: number;
    lastAppointmentDate: string;
    totalSpent: number;
    averageRating?: number;
    chronicConditions?: string[];
    allergies?: string[];
    lastDiagnosis?: string;
    nextFollowUpDate?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

interface MedicalHistory {
  appointments: Array<{
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
  }>;
  medicalRecords: Array<{
    id: string;
    diagnosis: string;
    symptoms?: string;
    treatment_plan?: string;
    notes?: string;
    created_at: string;
  }>;
  prescriptions: Array<{
    id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    created_at: string;
  }>;
}

export function PatientDetailDialog({
  patient,
  isOpen,
  onClose,
}: PatientDetailDialogProps) {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadMedicalHistory = useCallback(async () => {
    if (!patient) return;

    setIsLoading(true);
    try {
      const result = await getPatientMedicalHistory(patient.id);
      if (result.success && result.data) {
        // Transform the data to match MedicalHistory interface
        const transformedData: MedicalHistory = {
          appointments: (result.data.appointments || []).map((apt) => ({
            id: apt.id.toString(),
            appointment_date: apt.appointment_date,
            appointment_time: apt.appointment_time,
            status: apt.status || "unknown",
            reason: apt.reason,
          })),
          medicalRecords: (result.data.medical_records || []).map((record) => ({
            id: record.id.toString(),
            diagnosis: record.diagnosis,
            symptoms: record.symptoms || undefined,
            treatment_plan: record.treatment_plan || undefined,
            notes: record.notes || undefined,
            created_at: record.created_at || new Date().toISOString(),
          })),
          prescriptions: (result.data.prescriptions || []).flatMap(
            (prescription) =>
              prescription.prescription_items.map((item) => ({
                id: `${prescription.id}-${item.medication_name}`,
                medication_name: item.medication_name,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                created_at: prescription.created_at || new Date().toISOString(),
              }))
          ),
        };
        setMedicalHistory(transformedData);
      }
    } catch (error) {
      console.error("Error loading medical history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [patient]);

  useEffect(() => {
    if (patient && isOpen) {
      loadMedicalHistory();
    }
  }, [patient, isOpen, loadMedicalHistory]);

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  function formatDate(dateString: string) {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  }

  function formatDateTime(dateString: string) {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  }

  function calculateAge(dateOfBirth: string) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Chi tiết bệnh nhân thường xuyên
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Patient Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={patient.user_profiles.avatar_url || ""}
                    alt={patient.user_profiles.full_name}
                  />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold">
                    {patient.user_profiles.full_name}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {patient.user_profiles.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{patient.user_profiles.phone}</span>
                      </div>
                    )}

                    {patient.user_profiles.date_of_birth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatDate(patient.user_profiles.date_of_birth)}(
                          {calculateAge(patient.user_profiles.date_of_birth)}{" "}
                          tuổi)
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.totalAppointments} lần khám</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatCurrency(patient.totalSpent)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Lần cuối: {formatDate(patient.lastAppointmentDate)}
                      </span>
                    </div>

                    {patient.averageRating && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{patient.averageRating.toFixed(1)}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Conditions */}
          {(patient.chronicConditions?.length ||
            patient.allergies?.length ||
            patient.lastDiagnosis) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Tình trạng sức khỏe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.lastDiagnosis && (
                  <div>
                    <h4 className="font-medium mb-2">Chẩn đoán gần nhất:</h4>
                    <p className="text-sm text-muted-foreground">
                      {patient.lastDiagnosis}
                    </p>
                  </div>
                )}

                {patient.chronicConditions?.length && (
                  <div>
                    <h4 className="font-medium mb-2">Bệnh mãn tính:</h4>
                    <div className="flex flex-wrap gap-2">
                      {patient.chronicConditions.map((condition, index) => (
                        <Badge key={index} variant="secondary">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {patient.allergies?.length && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Dị ứng:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {patient.nextFollowUpDate && (
                  <div>
                    <h4 className="font-medium mb-2">Lịch tái khám:</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(patient.nextFollowUpDate)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Medical History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Lịch sử khám bệnh
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : medicalHistory ? (
                <div className="space-y-4">
                  {/* Recent Appointments */}
                  {medicalHistory.appointments.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Lịch hẹn gần đây:</h4>
                      <div className="space-y-2">
                        {medicalHistory.appointments
                          .slice(0, 5)
                          .map((appointment) => (
                            <div
                              key={appointment.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">
                                  {appointment.reason}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(appointment.appointment_date)} -{" "}
                                  {appointment.appointment_time}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {appointment.status}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Recent Medical Records */}
                  {medicalHistory.medicalRecords.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Hồ sơ y tế gần đây:</h4>
                      <div className="space-y-2">
                        {medicalHistory.medicalRecords
                          .slice(0, 3)
                          .map((record) => (
                            <div
                              key={record.id}
                              className="p-3 border rounded-lg space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-medium">
                                  {record.diagnosis}
                                </p>
                                <span className="text-sm text-muted-foreground">
                                  {formatDateTime(record.created_at)}
                                </span>
                              </div>
                              {record.symptoms && (
                                <p className="text-sm text-muted-foreground">
                                  Triệu chứng: {record.symptoms}
                                </p>
                              )}
                              {record.treatment_plan && (
                                <p className="text-sm text-muted-foreground">
                                  Điều trị: {record.treatment_plan}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Recent Prescriptions */}
                  {medicalHistory.prescriptions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Đơn thuốc gần đây:
                      </h4>
                      <div className="space-y-2">
                        {medicalHistory.prescriptions
                          .slice(0, 3)
                          .map((prescription) => (
                            <div
                              key={prescription.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">
                                  {prescription.medication_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {prescription.dosage} -{" "}
                                  {prescription.frequency} -{" "}
                                  {prescription.duration}
                                </p>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {formatDateTime(prescription.created_at)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  Không có dữ liệu lịch sử khám bệnh
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
