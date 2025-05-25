"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Loader2, DollarSign } from "lucide-react";
import { Doctor } from "@/types/custom.types";
import { createAppointment } from "@/actions";

interface AppointmentBookingFormProps {
  doctor: Doctor & {
    user_profiles: {
      full_name: string;
      avatar_url?: string | null;
    };
  };
  selectedDate: Date;
  selectedTime: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AppointmentBookingForm({
  doctor,
  selectedDate,
  selectedTime,
  isOpen,
  onClose,
  onSuccess,
}: AppointmentBookingFormProps) {
  const [isBooking, setIsBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    reason: "",
    notes: "",
  });

  const router = useRouter();
  const { toast } = useToast();

  function handleFormChange(field: string, value: string) {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  async function handleBookAppointment() {
    if (!bookingForm.reason.trim()) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng nhập lý do khám bệnh.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      const appointmentData = {
        doctorId: doctor.id,
        appointmentDate: selectedDate.toISOString().split("T")[0],
        appointmentTime: selectedTime,
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

        // Reset form
        setBookingForm({ reason: "", notes: "" });
        onClose();

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          // Default behavior: redirect to appointments page
          router.push("/appointments");
        }
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

  function handleClose() {
    if (!isBooking) {
      setBookingForm({ reason: "", notes: "" });
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Đặt lịch khám bệnh
          </DialogTitle>
          <DialogDescription>
            Bác sĩ {doctor.user_profiles.full_name} - {formatDate(selectedDate)}{" "}
            lúc {selectedTime}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* Doctor Info Summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bác sĩ:</span>
                  <span className="font-medium">
                    {doctor.user_profiles.full_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chuyên khoa:</span>
                  <span>{doctor.specialization || "Bác sĩ đa khoa"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ngày khám:</span>
                  <span>{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Giờ khám:</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-2">
                  <span className="text-muted-foreground">Phí khám:</span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {doctor.consultation_fee?.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do khám bệnh *</Label>
              <Textarea
                id="reason"
                placeholder="Mô tả triệu chứng hoặc lý do cần khám..."
                value={bookingForm.reason}
                onChange={(e) => handleFormChange("reason", e.target.value)}
                rows={3}
                disabled={isBooking}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú thêm</Label>
              <Textarea
                id="notes"
                placeholder="Thông tin bổ sung (tùy chọn)..."
                value={bookingForm.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                rows={2}
                disabled={isBooking}
              />
            </div>
          </div>

          {/* Important Notes */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="space-y-1 text-sm text-blue-800">
                <p className="font-medium">Lưu ý quan trọng:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>
                    Lịch hẹn cần được bác sĩ xác nhận trước khi có hiệu lực
                  </li>
                  <li>
                    Vui lòng đến đúng giờ hẹn để tránh ảnh hưởng đến lịch khám
                  </li>
                  <li>Có thể hủy hoặc thay đổi lịch hẹn trước 2 giờ</li>
                  <li>Mang theo giấy tờ tùy thân khi đến khám</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isBooking}>
            Hủy
          </Button>
          <Button
            onClick={handleBookAppointment}
            disabled={isBooking || !bookingForm.reason.trim()}
          >
            {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận đặt lịch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
