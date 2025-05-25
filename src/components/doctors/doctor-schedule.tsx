"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Doctor } from "@/types/custom.types";
import { getAvailableSlots, createAppointment } from "@/actions";

interface DoctorScheduleProps {
  doctor: Doctor & {
    user_profiles: {
      full_name: string;
      avatar_url?: string | null;
      phone?: string | null;
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
}

interface AvailableSlot {
  time: string;
  available: boolean;
}

export function DoctorSchedule({ doctor }: DoctorScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    reason: "",
    notes: "",
  });

  const router = useRouter();
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
      const result = await getAvailableSlots(doctor.id, dateString);

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
  }, [selectedDate, doctor.id, toast]);

  useEffect(() => {
    loadAvailableSlots();
  }, [selectedDate, doctor.id, toast, loadAvailableSlots]);

  function handleSlotSelect(time: string) {
    setSelectedSlot(time);
    setShowBookingDialog(true);
  }

  function handleBookingFormChange(field: string, value: string) {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleBookAppointment() {
    if (!selectedDate || !selectedSlot || !bookingForm.reason.trim()) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin đặt lịch.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      const appointmentData = {
        doctorId: doctor.id,
        appointmentDate: selectedDate.toISOString().split("T")[0],
        appointmentTime: selectedSlot,
        reason: bookingForm.reason.trim(),
        notes: bookingForm.notes.trim() || undefined,
        durationMinutes: 30,
      };

      const result = await createAppointment(appointmentData);

      if (result.success) {
        toast({
          title: "Đặt lịch thành công",
          description: "Lịch hẹn đã được tạo. Vui lòng chờ bác sĩ xác nhận.",
        });
        setShowBookingDialog(false);
        setSelectedSlot("");
        setBookingForm({ reason: "", notes: "" });
        loadAvailableSlots(); // Reload slots
        router.push("/appointments");
      } else {
        toast({
          title: "Đặt lịch thất bại",
          description: result.error || "Có lỗi xảy ra khi đặt lịch.",
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
      setIsBooking(false);
    }
  }

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
    const hasSchedule = doctor.doctor_schedules.some(
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

  return (
    <div className="space-y-6">
      {/* Doctor availability info */}
      {!doctor.is_available && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <p className="text-sm text-orange-800">
                Bác sĩ hiện tại không nhận lịch hẹn mới. Vui lòng thử lại sau.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Chọn ngày khám
            </CardTitle>
            <CardDescription>
              Chọn ngày bạn muốn đặt lịch khám bệnh
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                }
              }}
              disabled={isDateDisabled}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Available Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Giờ khám có sẵn
            </CardTitle>
            <CardDescription>
              {selectedDate
                ? formatDate(selectedDate)
                : "Chọn ngày để xem giờ khám"}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              <p className="text-sm text-muted-foreground text-center py-8">
                Không có giờ khám nào trong ngày này
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={slot.available ? "outline" : "secondary"}
                    size="sm"
                    disabled={!slot.available || !doctor.is_available}
                    onClick={() => handleSlotSelect(slot.time)}
                    className={`text-xs ${
                      slot.available
                        ? "hover:bg-primary hover:text-primary-foreground"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đặt lịch khám bệnh</DialogTitle>
            <DialogDescription>
              Bác sĩ {doctor.user_profiles.full_name} -{" "}
              {selectedDate && formatDate(selectedDate)} lúc {selectedSlot}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do khám bệnh *</Label>
              <Textarea
                id="reason"
                placeholder="Mô tả triệu chứng hoặc lý do cần khám..."
                value={bookingForm.reason}
                onChange={(e) =>
                  handleBookingFormChange("reason", e.target.value)
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú thêm</Label>
              <Textarea
                id="notes"
                placeholder="Thông tin bổ sung (tùy chọn)..."
                value={bookingForm.notes}
                onChange={(e) =>
                  handleBookingFormChange("notes", e.target.value)
                }
                rows={2}
              />
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Phí khám:</span>
                <span className="font-medium">
                  {doctor.consultation_fee?.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
              disabled={isBooking}
            >
              Hủy
            </Button>
            <Button
              onClick={handleBookAppointment}
              disabled={isBooking || !bookingForm.reason.trim()}
            >
              {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đặt lịch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
