"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { cancelAppointment } from "@/actions";
import { AppointmentWithDoctor } from "./types";

interface AppointmentCancelDialogProps {
  appointment: AppointmentWithDoctor | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AppointmentCancelDialog({
  appointment,
  isOpen,
  onClose,
  onSuccess,
}: AppointmentCancelDialogProps) {
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  async function handleSubmit() {
    if (!appointment || !cancelReason.trim()) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng nhập lý do hủy lịch hẹn.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await cancelAppointment(
        appointment.id,
        cancelReason.trim()
      );

      if (result.success) {
        toast({
          title: "Hủy lịch hẹn thành công",
          description: "Lịch hẹn đã được hủy.",
        });
        handleClose();
        onSuccess();
      } else {
        toast({
          title: "Hủy lịch hẹn thất bại",
          description: result.error || "Có lỗi xảy ra khi hủy lịch hẹn.",
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
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      setCancelReason("");
      onClose();
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      handleClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hủy lịch hẹn</DialogTitle>
          <DialogDescription>
            Vui lòng cho biết lý do hủy lịch hẹn
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Lý do hủy lịch hẹn *</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Nhập lý do hủy lịch hẹn..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Đóng
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting || !cancelReason.trim()}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hủy lịch hẹn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
