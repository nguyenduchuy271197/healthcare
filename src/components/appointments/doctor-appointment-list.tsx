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
  Calendar,
  Clock,
  FileText,
  Pill,
  User,
  Phone,
  CheckCircle,
  XCircle,
  Loader2,
  Receipt,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  getDoctorAppointmentsDetailed,
  updateAppointmentStatus,
  completeAppointment,
  generateInvoice,
} from "@/actions";
import {
  AppointmentStatus,
  MedicalRecord,
  AppointmentWithPatient,
  MedicalRecordForPrescription,
  PrescriptionWithItems,
  PrescriptionViewData,
  AppointmentForInvoice,
} from "@/types/custom.types";
import { MedicalRecordForm } from "@/components/medical-records/medical-record-form";
import { PrescriptionForm } from "@/components/prescriptions/prescription-form";
import { InvoiceView } from "@/components/invoices/invoice-view";
import { PrescriptionView } from "@/components/prescriptions/prescription-view";

interface DoctorAppointmentListProps {
  doctorId: string;
}

export function DoctorAppointmentList({
  doctorId,
}: DoctorAppointmentListProps) {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithPatient | null>(null);
  const [selectedMedicalRecord, setSelectedMedicalRecord] =
    useState<MedicalRecordForPrescription | null>(null);
  const [selectedPrescription, setSelectedPrescription] =
    useState<PrescriptionViewData | null>(null);
  const [showMedicalRecordForm, setShowMedicalRecordForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const [showPrescriptionView, setShowPrescriptionView] = useState(false);

  const { toast } = useToast();

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDoctorAppointmentsDetailed(doctorId);
      if (result.success && result.data) {
        setAppointments(result.data as AppointmentWithPatient[]);
      } else {
        toast({
          title: "Lỗi tải dữ liệu",
          description: result.error || "Không thể tải danh sách lịch hẹn.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi tải danh sách lịch hẹn.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [doctorId, toast]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function handleUpdateStatus(
    appointmentId: number,
    status: AppointmentStatus
  ) {
    setActionLoading(`status-${appointmentId}`);
    try {
      const result = await updateAppointmentStatus(appointmentId, status);
      if (result.success) {
        toast({
          title: "Cập nhật thành công",
          description: `Lịch hẹn đã được ${
            status === "confirmed" ? "xác nhận" : "từ chối"
          }.`,
        });
        loadAppointments();
      } else {
        toast({
          title: "Lỗi cập nhật",
          description:
            result.error || "Không thể cập nhật trạng thái lịch hẹn.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi cập nhật trạng thái.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCompleteAppointment(appointmentId: number) {
    setActionLoading(`complete-${appointmentId}`);
    try {
      const result = await completeAppointment(appointmentId);
      if (result.success) {
        toast({
          title: "Hoàn thành lịch hẹn",
          description: "Lịch hẹn đã được đánh dấu hoàn thành.",
        });
        loadAppointments();
      } else {
        toast({
          title: "Lỗi hoàn thành",
          description: result.error || "Không thể hoàn thành lịch hẹn.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi hoàn thành lịch hẹn.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }

  function handleCreateMedicalRecord(appointment: AppointmentWithPatient) {
    setSelectedAppointment(appointment);
    setShowMedicalRecordForm(true);
  }

  function handleCreatePrescription(
    medicalRecord: MedicalRecord,
    appointment: AppointmentWithPatient
  ) {
    // Create a medical record with patient information for the prescription form
    const medicalRecordWithPatient: MedicalRecordForPrescription = {
      ...medicalRecord,
      patients: {
        user_profiles: {
          full_name: appointment.patients.user_profiles.full_name,
        },
      },
    };

    setSelectedMedicalRecord(medicalRecordWithPatient);
    setShowPrescriptionForm(true);
  }

  async function handleGenerateInvoice(appointmentId: number) {
    setActionLoading(`invoice-${appointmentId}`);
    try {
      const result = await generateInvoice(appointmentId);
      if (result.success) {
        toast({
          title: "Tạo hóa đơn thành công",
          description: "Hóa đơn đã được tạo và gửi cho bệnh nhân.",
        });
        loadAppointments();
      } else {
        toast({
          title: "Lỗi tạo hóa đơn",
          description: result.error || "Không thể tạo hóa đơn.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi tạo hóa đơn.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }

  function handleViewInvoice(appointment: AppointmentWithPatient) {
    setSelectedAppointment(appointment);
    setShowInvoiceView(true);
  }

  function handleViewPrescription(
    prescription: PrescriptionWithItems,
    appointment: AppointmentWithPatient
  ) {
    // Transform the prescription data to match PrescriptionViewData type
    const prescriptionViewData: PrescriptionViewData = {
      ...prescription,
      patients: {
        user_profiles: {
          full_name: appointment.patients.user_profiles.full_name,
          phone: appointment.patients.user_profiles.phone,
          date_of_birth: appointment.patients.user_profiles.date_of_birth,
        },
      },
      doctors: {
        user_profiles: {
          full_name: appointment.doctors?.user_profiles.full_name || "N/A",
        },
        clinic_address: appointment.doctors?.clinic_address,
        license_number: appointment.doctors?.license_number,
        specialization:
          appointment.doctors?.specialization === null
            ? undefined
            : appointment.doctors?.specialization,
      },
      medical_records: {
        diagnosis: appointment.medical_records?.[0]?.diagnosis || "N/A",
        symptoms: appointment.medical_records?.[0]?.symptoms || undefined,
      },
    };

    setSelectedPrescription(prescriptionViewData);
    setShowPrescriptionView(true);
  }

  function getStatusBadge(status: AppointmentStatus) {
    const statusConfig = {
      pending: { label: "Chờ xác nhận", variant: "secondary" as const },
      confirmed: { label: "Đã xác nhận", variant: "default" as const },
      completed: { label: "Hoàn thành", variant: "outline" as const },
      cancelled: { label: "Đã hủy", variant: "destructive" as const },
      rejected: { label: "Từ chối", variant: "destructive" as const },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  function formatDateTime(date: string, time: string) {
    const appointmentDate = new Date(date);
    return {
      date: format(appointmentDate, "dd/MM/yyyy", { locale: vi }),
      time: time.slice(0, 5),
      dayOfWeek: format(appointmentDate, "EEEE", { locale: vi }),
    };
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Đang tải danh sách lịch hẹn...</span>
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
            <Calendar className="h-5 w-5" />
            Danh sách lịch hẹn
          </CardTitle>
          <CardDescription>
            Quản lý lịch hẹn và thực hiện khám bệnh
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Không có lịch hẹn nào</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bệnh nhân</TableHead>
                    <TableHead>Ngày giờ</TableHead>
                    <TableHead>Lý do khám</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Phí khám</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => {
                    const dateTime = formatDateTime(
                      appointment.appointment_date,
                      appointment.appointment_time
                    );
                    const hasCompletedRecord =
                      appointment.medical_records &&
                      appointment.medical_records.length > 0;

                    return (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {appointment.patients.user_profiles.full_name}
                              </span>
                            </div>
                            {appointment.patients.user_profiles.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {appointment.patients.user_profiles.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{dateTime.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {dateTime.time} - {dateTime.dayOfWeek}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{appointment.reason}</p>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(appointment.status || "pending")}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {appointment.consultation_fee.toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {appointment.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleUpdateStatus(
                                      appointment.id,
                                      "confirmed"
                                    )
                                  }
                                  disabled={
                                    actionLoading === `status-${appointment.id}`
                                  }
                                >
                                  {actionLoading ===
                                  `status-${appointment.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                  Xác nhận
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleUpdateStatus(
                                      appointment.id,
                                      "rejected"
                                    )
                                  }
                                  disabled={
                                    actionLoading === `status-${appointment.id}`
                                  }
                                >
                                  <XCircle className="h-4 w-4" />
                                  Từ chối
                                </Button>
                              </>
                            )}

                            {appointment.status === "confirmed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleCompleteAppointment(appointment.id)
                                }
                                disabled={
                                  actionLoading === `complete-${appointment.id}`
                                }
                              >
                                {actionLoading ===
                                `complete-${appointment.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                                Hoàn thành
                              </Button>
                            )}

                            {appointment.status === "completed" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleCreateMedicalRecord(appointment)
                                }
                                disabled={hasCompletedRecord}
                              >
                                <FileText className="h-4 w-4" />
                                {hasCompletedRecord
                                  ? "Đã khám"
                                  : "Ghi chú khám"}
                              </Button>
                            )}

                            {hasCompletedRecord &&
                              appointment.medical_records && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleCreatePrescription(
                                        appointment.medical_records![0] as MedicalRecord,
                                        appointment
                                      )
                                    }
                                  >
                                    <Pill className="h-4 w-4" />
                                    Kê đơn thuốc
                                  </Button>

                                  {/* Generate Invoice Button */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleGenerateInvoice(appointment.id)
                                    }
                                    disabled={
                                      actionLoading ===
                                        `invoice-${appointment.id}` ||
                                      !!(
                                        appointment.payments &&
                                        appointment.payments.length > 0 &&
                                        appointment.payments[0].invoice_url
                                      )
                                    }
                                  >
                                    {actionLoading ===
                                    `invoice-${appointment.id}` ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Receipt className="h-4 w-4" />
                                    )}
                                    {appointment.payments &&
                                    appointment.payments.length > 0 &&
                                    appointment.payments[0].invoice_url
                                      ? "Đã tạo HĐ"
                                      : "Tạo hóa đơn"}
                                  </Button>

                                  {/* View Invoice Button */}
                                  {appointment.payments &&
                                    appointment.payments.length > 0 &&
                                    appointment.payments[0].invoice_url && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleViewInvoice(appointment)
                                        }
                                      >
                                        <Eye className="h-4 w-4" />
                                        Xem HĐ
                                      </Button>
                                    )}

                                  {/* View Prescriptions */}
                                  {appointment.medical_records[0]
                                    .prescriptions &&
                                    appointment.medical_records[0].prescriptions
                                      .length > 0 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleViewPrescription(
                                            appointment.medical_records![0]
                                              .prescriptions![0] as PrescriptionWithItems,
                                            appointment
                                          )
                                        }
                                      >
                                        <Eye className="h-4 w-4" />
                                        Xem đơn thuốc
                                      </Button>
                                    )}
                                </>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical Record Form */}
      {selectedAppointment && (
        <MedicalRecordForm
          appointment={selectedAppointment}
          isOpen={showMedicalRecordForm}
          onClose={() => {
            setShowMedicalRecordForm(false);
            setSelectedAppointment(null);
          }}
          onSuccess={() => {
            loadAppointments();
          }}
        />
      )}

      {/* Prescription Form */}
      {selectedMedicalRecord && (
        <PrescriptionForm
          medicalRecord={selectedMedicalRecord}
          isOpen={showPrescriptionForm}
          onClose={() => {
            setShowPrescriptionForm(false);
            setSelectedMedicalRecord(null);
          }}
          onSuccess={() => {
            loadAppointments();
          }}
        />
      )}

      {/* Invoice View */}
      {selectedAppointment && selectedAppointment.doctors && (
        <InvoiceView
          appointment={selectedAppointment as unknown as AppointmentForInvoice}
          isOpen={showInvoiceView}
          onClose={() => {
            setShowInvoiceView(false);
            setSelectedAppointment(null);
          }}
        />
      )}

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
