"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  isSameDay,
  parseISO,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  RefreshCw,
} from "lucide-react";
import { getDoctorAppointments } from "@/actions";
import { Appointment, AppointmentStatus } from "@/types/custom.types";
import { cn } from "@/lib/utils";
import { AppointmentActions } from "./appointment-actions";
import { PatientInfoDialog } from "../patients/patient-info-dialog";

type AppointmentWithPatient = Appointment & {
  patients: {
    user_profiles: {
      full_name: string;
      avatar_url?: string | null;
      phone?: string | null;
    };
  };
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  rejected: "bg-gray-100 text-gray-800",
};

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  rejected: "Bị từ chối",
};

interface EnhancedAppointmentManagementProps {
  className?: string;
}

export function EnhancedAppointmentManagement({
  className,
}: EnhancedAppointmentManagementProps) {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>(
    []
  );
  const [filteredAppointments, setFilteredAppointments] = useState<
    AppointmentWithPatient[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all"
  );
  const { toast } = useToast();

  // Load appointments
  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getDoctorAppointments();
      if (result.success && result.data) {
        setAppointments(result.data);
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể tải danh sách lịch hẹn",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi tải danh sách lịch hẹn",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Filter appointments based on view mode and status
  useEffect(() => {
    let filtered = appointments;

    // Filter by date range based on view mode
    if (viewMode === "day") {
      filtered = filtered.filter((apt) =>
        isSameDay(parseISO(apt.appointment_date), selectedDate)
      );
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(selectedDate, { locale: vi });
      const weekEnd = endOfWeek(selectedDate, { locale: vi });
      filtered = filtered.filter((apt) => {
        const aptDate = parseISO(apt.appointment_date);
        return aptDate >= weekStart && aptDate <= weekEnd;
      });
    } else if (viewMode === "month") {
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      filtered = filtered.filter((apt) => {
        const aptDate = parseISO(apt.appointment_date);
        return aptDate >= monthStart && aptDate <= monthEnd;
      });
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`);
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredAppointments(filtered);
  }, [appointments, selectedDate, viewMode, statusFilter]);

  function getStatusBadge(status: AppointmentStatus | null) {
    const statusKey = (status || "pending") as keyof typeof STATUS_COLORS;
    return (
      <Badge className={STATUS_COLORS[statusKey]}>
        {STATUS_LABELS[statusKey]}
      </Badge>
    );
  }

  function getStatusIcon(status: AppointmentStatus | null) {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  }

  function navigateDate(direction: "prev" | "next") {
    setSelectedDate((prev) => {
      if (viewMode === "day") {
        return addDays(prev, direction === "next" ? 1 : -1);
      } else if (viewMode === "week") {
        return addDays(prev, direction === "next" ? 7 : -7);
      } else {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
        return newDate;
      }
    });
  }

  function getDateRangeText() {
    if (viewMode === "day") {
      return format(selectedDate, "EEEE, dd MMMM yyyy", { locale: vi });
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(selectedDate, { locale: vi });
      const weekEnd = endOfWeek(selectedDate, { locale: vi });
      return `${format(weekStart, "dd MMM", { locale: vi })} - ${format(
        weekEnd,
        "dd MMM yyyy",
        { locale: vi }
      )}`;
    } else {
      return format(selectedDate, "MMMM yyyy", { locale: vi });
    }
  }

  function handleStatusChange() {
    // Reload appointments when status changes
    loadAppointments();
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải lịch hẹn...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Quản lý lịch hẹn
              </CardTitle>
              <CardDescription>
                Xem, xác nhận và quản lý các lịch hẹn của bệnh nhân
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadAppointments}
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
                />
                Làm mới
              </Button>

              <Select
                value={viewMode}
                onValueChange={(value: "day" | "week" | "month") =>
                  setViewMode(value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="month">Tháng</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value: AppointmentStatus | "all") =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="rejected">Bị từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Date navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">{getDateRangeText()}</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredAppointments.length}
              </div>
              <div className="text-sm text-muted-foreground">Tổng số</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {
                  filteredAppointments.filter((apt) => apt.status === "pending")
                    .length
                }
              </div>
              <div className="text-sm text-muted-foreground">Chờ xác nhận</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {
                  filteredAppointments.filter(
                    (apt) => apt.status === "confirmed"
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">Đã xác nhận</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  filteredAppointments.filter(
                    (apt) => apt.status === "completed"
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">Hoàn thành</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {
                  filteredAppointments.filter(
                    (apt) =>
                      apt.status === "cancelled" || apt.status === "rejected"
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">Đã hủy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments display */}
      <Card>
        <CardContent className="p-0">
          {viewMode === "day" ? (
            // Day view - detailed list with actions
            <div className="space-y-4 p-6">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="border-l-4 border-l-blue-500"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-100 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-blue-600 font-medium">
                              {appointment.appointment_time.slice(0, 5)}
                            </span>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-lg">
                                {appointment.patients.user_profiles.full_name}
                              </span>
                              {getStatusIcon(appointment.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {appointment.reason}
                              </span>
                              {appointment.patients.user_profiles.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {appointment.patients.user_profiles.phone}
                                </span>
                              )}
                              <span>
                                {appointment.duration_minutes || 30} phút
                              </span>
                            </div>
                            {appointment.notes && (
                              <div className="text-sm text-muted-foreground">
                                <strong>Ghi chú:</strong> {appointment.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 ml-4">
                          {/* Patient Info Button */}
                          <PatientInfoDialog
                            patientId={appointment.patient_id}
                            patientName={
                              appointment.patients.user_profiles.full_name
                            }
                            trigger={
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Xem thông tin
                              </Button>
                            }
                          />

                          {/* Appointment Actions */}
                          <AppointmentActions
                            appointmentId={appointment.id}
                            currentStatus={appointment.status}
                            patientName={
                              appointment.patients.user_profiles.full_name
                            }
                            appointmentDate={format(
                              parseISO(appointment.appointment_date),
                              "dd/MM/yyyy",
                              { locale: vi }
                            )}
                            appointmentTime={appointment.appointment_time.slice(
                              0,
                              5
                            )}
                            onStatusChange={handleStatusChange}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">
                    Không có lịch hẹn
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Không có lịch hẹn nào trong khoảng thời gian đã chọn
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Week/Month view - table format with actions
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Giờ</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Lý do khám</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {format(
                          parseISO(appointment.appointment_date),
                          "dd/MM",
                          { locale: vi }
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.appointment_time.slice(0, 5)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {appointment.patients.user_profiles.full_name}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {appointment.reason}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(appointment.status)}
                      </TableCell>
                      <TableCell>
                        {appointment.patients.user_profiles.phone || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <PatientInfoDialog
                            patientId={appointment.patient_id}
                            patientName={
                              appointment.patients.user_profiles.full_name
                            }
                            trigger={
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            }
                          />

                          {appointment.status === "pending" && (
                            <AppointmentActions
                              appointmentId={appointment.id}
                              currentStatus={appointment.status}
                              patientName={
                                appointment.patients.user_profiles.full_name
                              }
                              appointmentDate={format(
                                parseISO(appointment.appointment_date),
                                "dd/MM/yyyy",
                                { locale: vi }
                              )}
                              appointmentTime={appointment.appointment_time.slice(
                                0,
                                5
                              )}
                              onStatusChange={handleStatusChange}
                              className="flex items-center gap-1"
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <div className="text-sm font-medium">
                        Không có lịch hẹn
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Không có lịch hẹn nào trong khoảng thời gian đã chọn
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
