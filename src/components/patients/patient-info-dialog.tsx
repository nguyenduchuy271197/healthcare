"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Shield,
  FileText,
  Pill,
  Clock,
  AlertTriangle,
  Loader2,
  Eye,
  Activity,
  UserCheck,
} from "lucide-react";
import { getPatientInfo, getPatientMedicalHistory } from "@/actions";
import { Patient } from "@/types/custom.types";

type PatientInfoData = Patient & {
  user_profiles: {
    full_name: string;
    email?: string | null;
    phone?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
    avatar_url?: string | null;
    address?: string | null;
  };
  appointments_count: number;
  last_appointment?: {
    appointment_date: string;
    appointment_time: string;
    status: string | null;
  };
};

type PatientHistoryData = {
  patient_info: {
    id: string;
    user_profiles: {
      full_name: string;
      date_of_birth?: string | null;
      gender?: string | null;
      phone?: string | null;
    };
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    insurance_number?: string | null;
    insurance_provider?: string | null;
  };
  medical_records: {
    id: number;
    diagnosis: string;
    symptoms?: string | null;
    treatment_plan?: string | null;
    notes?: string | null;
    created_at: string | null;
    doctors: {
      user_profiles: {
        full_name: string;
      };
      specialization?: string | null;
    };
  }[];
  prescriptions: {
    id: number;
    status: string | null;
    created_at: string | null;
    doctors: {
      user_profiles: {
        full_name: string;
      };
    };
    prescription_items: {
      medication_name: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
    }[];
  }[];
  appointments: {
    id: number;
    appointment_date: string;
    appointment_time: string;
    status: string | null;
    reason: string;
    doctors: {
      user_profiles: {
        full_name: string;
      };
      specialization?: string | null;
    };
  }[];
};

interface PatientInfoDialogProps {
  patientId: string;
  patientName: string;
  trigger?: React.ReactNode;
  className?: string;
}

export function PatientInfoDialog({
  patientId,
  patientName,
  trigger,
  className,
}: PatientInfoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState<PatientInfoData | null>(null);
  const [patientHistory, setPatientHistory] =
    useState<PatientHistoryData | null>(null);
  const { toast } = useToast();

  const loadPatientData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load basic patient info
      const infoResult = await getPatientInfo(patientId);
      if (infoResult.success && infoResult.data) {
        setPatientInfo(infoResult.data);
      }

      // Load medical history
      const historyResult = await getPatientMedicalHistory(patientId);
      if (historyResult.success && historyResult.data) {
        setPatientHistory(historyResult.data);
      }

      if (!infoResult.success && !historyResult.success) {
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin bệnh nhân",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading patient data:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi tải thông tin bệnh nhân",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [patientId, toast]);

  useEffect(() => {
    if (isOpen) {
      loadPatientData();
    }
  }, [isOpen, patientId, loadPatientData]);

  function calculateAge(dateOfBirth: string | null | undefined): string {
    if (!dateOfBirth) return "N/A";
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
    return `${age} tuổi`;
  }

  function getStatusBadge(status: string | null) {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Chờ xác nhận</Badge>
        );
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800">Đã xác nhận</Badge>;
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
        );
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
      case "rejected":
        return <Badge className="bg-gray-100 text-gray-800">Bị từ chối</Badge>;
      case "active":
        return <Badge className="bg-green-100 text-green-800">Đang dùng</Badge>;
      default:
        return <Badge variant="outline">{status || "N/A"}</Badge>;
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" className={className}>
      <Eye className="h-4 w-4 mr-2" />
      Xem thông tin
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Thông tin bệnh nhân: {patientName}
          </DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết và lịch sử y tế của bệnh nhân
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Đang tải thông tin bệnh nhân...</span>
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                <TabsTrigger value="medical">Hồ sơ y tế</TabsTrigger>
                <TabsTrigger value="prescriptions">Đơn thuốc</TabsTrigger>
                <TabsTrigger value="appointments">Lịch hẹn</TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Thông tin cá nhân
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Họ tên:</span>
                        <span>
                          {patientInfo?.user_profiles.full_name || patientName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Tuổi:</span>
                        <span>
                          {calculateAge(
                            patientInfo?.user_profiles.date_of_birth
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Giới tính:</span>
                        <span>
                          {patientInfo?.user_profiles.gender || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Điện thoại:</span>
                        <span>{patientInfo?.user_profiles.phone || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Địa chỉ:</span>
                        <span>
                          {patientInfo?.user_profiles.address || "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Medical Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Thông tin y tế
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-medium">Nhóm máu:</span>
                        <span className="ml-2">
                          {patientInfo?.blood_type || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Dị ứng:</span>
                        <div className="mt-1">
                          {patientInfo?.allergies &&
                          patientInfo.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {patientInfo.allergies.map((allergy, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Không có
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Bệnh mãn tính:</span>
                        <div className="mt-1">
                          {patientInfo?.chronic_conditions &&
                          patientInfo.chronic_conditions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {patientInfo.chronic_conditions.map(
                                (condition, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {condition}
                                  </Badge>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Không có
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emergency Contact */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Liên hệ khẩn cấp
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-medium">Tên:</span>
                        <span className="ml-2">
                          {patientInfo?.emergency_contact_name || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Điện thoại:</span>
                        <span className="ml-2">
                          {patientInfo?.emergency_contact_phone || "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Insurance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Bảo hiểm
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-medium">Nhà cung cấp:</span>
                        <span className="ml-2">
                          {patientInfo?.insurance_provider || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Số thẻ:</span>
                        <span className="ml-2">
                          {patientInfo?.insurance_number || "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thống kê</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {patientInfo?.appointments_count || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tổng lịch hẹn
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {patientHistory?.medical_records.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Hồ sơ y tế
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {patientHistory?.prescriptions.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Đơn thuốc
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {patientInfo?.last_appointment
                            ? format(
                                parseISO(
                                  patientInfo.last_appointment.appointment_date
                                ),
                                "dd/MM/yyyy",
                                { locale: vi }
                              )
                            : "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Lần khám cuối
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medical Records */}
              <TabsContent value="medical" className="space-y-4">
                {patientHistory?.medical_records &&
                patientHistory.medical_records.length > 0 ? (
                  <div className="space-y-4">
                    {patientHistory.medical_records.map((record) => (
                      <Card key={record.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Hồ sơ khám bệnh #{record.id}
                            </CardTitle>
                            <span className="text-sm text-muted-foreground">
                              {record.created_at &&
                                format(
                                  parseISO(record.created_at),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: vi }
                                )}
                            </span>
                          </div>
                          <CardDescription>
                            Bác sĩ: {record.doctors.user_profiles.full_name}
                            {record.doctors.specialization &&
                              ` - ${record.doctors.specialization}`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <span className="font-medium">Chẩn đoán:</span>
                            <p className="mt-1">{record.diagnosis}</p>
                          </div>
                          {record.symptoms && (
                            <div>
                              <span className="font-medium">Triệu chứng:</span>
                              <p className="mt-1">{record.symptoms}</p>
                            </div>
                          )}
                          {record.treatment_plan && (
                            <div>
                              <span className="font-medium">
                                Phương án điều trị:
                              </span>
                              <p className="mt-1">{record.treatment_plan}</p>
                            </div>
                          )}
                          {record.notes && (
                            <div>
                              <span className="font-medium">Ghi chú:</span>
                              <p className="mt-1">{record.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">
                      Chưa có hồ sơ y tế
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Bệnh nhân chưa có hồ sơ khám bệnh nào
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Prescriptions */}
              <TabsContent value="prescriptions" className="space-y-4">
                {patientHistory?.prescriptions &&
                patientHistory.prescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {patientHistory.prescriptions.map((prescription) => (
                      <Card key={prescription.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Pill className="h-4 w-4" />
                              Đơn thuốc #{prescription.id}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(prescription.status)}
                              <span className="text-sm text-muted-foreground">
                                {prescription.created_at &&
                                  format(
                                    parseISO(prescription.created_at),
                                    "dd/MM/yyyy",
                                    { locale: vi }
                                  )}
                              </span>
                            </div>
                          </div>
                          <CardDescription>
                            Bác sĩ:{" "}
                            {prescription.doctors.user_profiles.full_name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {prescription.prescription_items.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 border rounded"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {item.medication_name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {item.dosage} - {item.frequency} -{" "}
                                      {item.duration}
                                    </div>
                                  </div>
                                  <div className="text-sm">
                                    SL: {item.quantity}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Pill className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">
                      Chưa có đơn thuốc
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Bệnh nhân chưa có đơn thuốc nào
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Appointments */}
              <TabsContent value="appointments" className="space-y-4">
                {patientHistory?.appointments &&
                patientHistory.appointments.length > 0 ? (
                  <div className="space-y-4">
                    {patientHistory.appointments.map((appointment) => (
                      <Card key={appointment.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-100 rounded-lg">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span className="text-xs text-blue-600 font-medium">
                                  {appointment.appointment_time.slice(0, 5)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {format(
                                    parseISO(appointment.appointment_date),
                                    "EEEE, dd MMMM yyyy",
                                    { locale: vi }
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Lý do: {appointment.reason}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Bác sĩ:{" "}
                                  {appointment.doctors.user_profiles.full_name}
                                  {appointment.doctors.specialization &&
                                    ` - ${appointment.doctors.specialization}`}
                                </div>
                              </div>
                            </div>
                            <div>{getStatusBadge(appointment.status)}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">
                      Chưa có lịch hẹn
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Bệnh nhân chưa có lịch hẹn nào
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
