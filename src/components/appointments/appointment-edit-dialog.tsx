"use client";

import { useState, useEffect } from "react";
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
import { updateAppointment } from "@/actions";
import { AppointmentWithDoctor } from "./types";

interface AppointmentEditDialogProps {
  appointment: AppointmentWithDoctor | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AppointmentEditDialog({
  appointment,
  isOpen,
  onClose,
  onSuccess,
}: AppointmentEditDialogProps) {
  const [editReason, setEditReason] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // Initialize form when appointment changes
  useEffect(() => {
    if (appointment) {
      setEditReason(appointment.reason);
      setEditNotes(appointment.notes || "");
    }
  }, [appointment]);

  async function handleSubmit() {
    if (!appointment || !editReason.trim()) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng nhập lý do khám bệnh.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateAppointment(appointment.id, {
        reason: editReason.trim(),
        notes: editNotes.trim() || undefined,
      });

      if (result.success) {
        toast({
          title: "Cập nhật lịch hẹn thành công",
          description: "Thông tin lịch hẹn đã được cập nhật.",
        });
        handleClose();
        onSuccess();
      } else {
        toast({
          title: "Cập nhật lịch hẹn thất bại",
          description: result.error || "Có lỗi xảy ra khi cập nhật lịch hẹn.",
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
      setEditReason("");
      setEditNotes("");
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
          <DialogTitle>Sửa lịch hẹn</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin lý do khám và ghi chú
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-reason">Lý do khám bệnh *</Label>
            <Textarea
              id="edit-reason"
              placeholder="Mô tả triệu chứng hoặc lý do cần khám..."
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Ghi chú thêm</Label>
            <Textarea
              id="edit-notes"
              placeholder="Thông tin bổ sung (tùy chọn)..."
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={2}
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
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !editReason.trim()}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
