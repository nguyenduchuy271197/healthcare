"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Appointment } from "@/types/custom.types";
import { getAvailableSlots, rescheduleAppointment } from "@/actions";

interface AppointmentRescheduleFormProps {
  appointment: Appointment & {
    doctors: {
      user_profiles: {
        full_name: string;
      };
      doctor_schedules: {
        id: number;
        day_of_week: number;
        start_time: string;
        end_time: string;
        slot_duration_minutes: number | null;
        is_active: boolean | null;
      }[];
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AvailableSlot {
  time: string;
  available: boolean;
}

export function AppointmentRescheduleForm({
  appointment,
  isOpen,
  onClose,
  onSuccess,
}: AppointmentRescheduleFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState("");

  const { toast } = useToast();

  const loadAvailableSlots = useCallback(async () => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    setAvailableSlots([]);

    try {
      const dateString = selectedDate.toISOString().split("T")[0];
      const result = await getAvailableSlots(appointment.doctor_id, dateString);

      if (result.success && result.data) {
        setAvailableSlots(result.data);
      } else {
        toast({
          title: "Lỗi tải lịch",
          description: result.error || "Không thể tải lịch trống.",
          variant: "destructive",
        });
        setAvailableSlots([]);
      }
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi tải lịch trống.",
        variant: "destructive",
      });
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedDate, appointment.doctor_id, toast]);

  useEffect(() => {
    loadAvailableSlots();
  }, [loadAvailableSlots]);

  function isDateDisabled(date: Date) {
    // Disable past dates (but allow today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) return true;

    // Disable dates more than 30 days in the future
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    if (checkDate > maxDate) return true;

    // Check if doctor has schedule for this day
    const dayOfWeek = checkDate.getDay();
    const hasSchedule = appointment.doctors.doctor_schedules.some(
      (schedule) => schedule.day_of_week === dayOfWeek && schedule.is_active
    );

    return !hasSchedule;
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTime(timeString: string) {
    return timeString.slice(0, 5); // HH:MM format
  }

  async function handleReschedule() {
    if (!selectedDate || !selectedSlot || !rescheduleReason.trim()) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng chọn ngày, giờ mới và nhập lý do thay đổi.",
        variant: "destructive",
      });
      return;
    }

    setIsRescheduling(true);

    try {
      const result = await rescheduleAppointment(appointment.id, {
        newDate: selectedDate.toISOString().split("T")[0],
        newTime: selectedSlot,
        reason: rescheduleReason.trim(),
      });

      if (result.success) {
        toast({
          title: "Thay đổi lịch hẹn thành công",
          description:
            "Lịch hẹn đã được thay đổi. Vui lòng chờ bác sĩ xác nhận.",
        });
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Thay đổi lịch hẹn thất bại",
          description: result.error || "Có lỗi xảy ra khi thay đổi lịch hẹn.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsRescheduling(false);
    }
  }

  function handleClose() {
    if (!isRescheduling) {
      setSelectedDate(undefined);
      setSelectedSlot("");
      setRescheduleReason("");
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Thay đổi lịch hẹn
          </DialogTitle>
          <DialogDescription>
            Thay đổi lịch hẹn với bác sĩ{" "}
            {appointment.doctors.user_profiles.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Current Appointment Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Lịch hẹn hiện tại:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Ngày:</span>{" "}
                    {formatDate(new Date(appointment.appointment_date))}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Giờ:</span>{" "}
                    {formatTime(appointment.appointment_time)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Calendar */}
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Chọn ngày mới:</h4>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    className="rounded-md border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Available Slots */}
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Giờ khám có sẵn
                  </h4>

                  {!selectedDate ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Vui lòng chọn ngày để xem các giờ khám có sẵn
                    </p>
                  ) : isLoadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2 text-sm">Đang tải...</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Không có giờ khám nào trong ngày này
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={
                            selectedSlot === slot.time
                              ? "default"
                              : slot.available
                              ? "outline"
                              : "secondary"
                          }
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`text-xs ${
                            !slot.available && "opacity-50 cursor-not-allowed"
                          }`}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reschedule Reason */}
          <div className="space-y-2">
            <Label htmlFor="reschedule-reason">Lý do thay đổi lịch hẹn *</Label>
            <Textarea
              id="reschedule-reason"
              placeholder="Nhập lý do cần thay đổi lịch hẹn..."
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              rows={3}
              disabled={isRescheduling}
            />
          </div>

          {/* Important Notes */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-4">
              <div className="space-y-1 text-sm text-amber-800">
                <p className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Lưu ý quan trọng:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs ml-6">
                  <li>Lịch hẹn mới cần được bác sĩ xác nhận lại</li>
                  <li>Chỉ có thể thay đổi lịch hẹn trước 2 giờ</li>
                  <li>Nếu thay đổi nhiều lần có thể ảnh hưởng đến uy tín</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isRescheduling}
          >
            Hủy
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={
              isRescheduling ||
              !selectedDate ||
              !selectedSlot ||
              !rescheduleReason.trim()
            }
          >
            {isRescheduling && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Xác nhận thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
