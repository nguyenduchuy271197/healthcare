"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Doctor } from "@/types/custom.types";
import { getAvailableSlots } from "@/actions";
import { AppointmentBookingForm } from "@/components/appointments/appointment-booking-form";

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

  function handleBookingSuccess() {
    // Reload available slots after successful booking
    loadAvailableSlots();
  }

  function handleBookingClose() {
    setShowBookingDialog(false);
    setSelectedSlot("");
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

      {/* Appointment Booking Form */}
      {selectedDate && selectedSlot && (
        <AppointmentBookingForm
          doctor={doctor}
          selectedDate={selectedDate}
          selectedTime={selectedSlot}
          isOpen={showBookingDialog}
          onClose={handleBookingClose}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
