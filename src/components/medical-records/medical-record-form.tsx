"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createMedicalRecord } from "@/actions";
import { Appointment } from "@/types/custom.types";

interface MedicalRecordFormProps {
  appointment: Appointment & {
    patients: {
      user_profiles: {
        full_name: string;
      };
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MedicalRecordForm({
  appointment,
  isOpen,
  onClose,
  onSuccess,
}: MedicalRecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date>();
  const [formData, setFormData] = useState({
    symptoms: "",
    diagnosis: "",
    treatmentPlan: "",
    notes: "",
    followUpRequired: false,
  });

  const { toast } = useToast();

  function handleInputChange(field: string, value: string | boolean) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit() {
    if (!formData.diagnosis.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập chẩn đoán.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createMedicalRecord({
        appointmentId: appointment.id,
        symptoms: formData.symptoms.trim() || "",
        diagnosis: formData.diagnosis.trim(),
        treatmentPlan: formData.treatmentPlan.trim() || "",
        notes: formData.notes.trim() || undefined,
        followUpRequired: formData.followUpRequired,
        followUpDate: followUpDate?.toISOString().split("T")[0],
      });

      if (result.success) {
        toast({
          title: "Tạo hồ sơ khám bệnh thành công",
          description: "Thông tin khám bệnh đã được lưu.",
        });
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Lỗi tạo hồ sơ",
          description: result.error || "Có lỗi xảy ra khi tạo hồ sơ khám bệnh.",
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
      setFormData({
        symptoms: "",
        diagnosis: "",
        treatmentPlan: "",
        notes: "",
        followUpRequired: false,
      });
      setFollowUpDate(undefined);
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ghi chú khám bệnh
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin khám bệnh cho bệnh nhân{" "}
            {appointment.patients.user_profiles.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Appointment Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Bệnh nhân:</span>{" "}
                  {appointment.patients.user_profiles.full_name}
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày khám:</span>{" "}
                  {format(
                    new Date(appointment.appointment_date),
                    "dd/MM/yyyy",
                    { locale: vi }
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Giờ khám:</span>{" "}
                  {appointment.appointment_time.slice(0, 5)}
                </div>
                <div>
                  <span className="text-muted-foreground">Lý do khám:</span>{" "}
                  {appointment.reason}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Symptoms */}
          <div className="space-y-2">
            <Label htmlFor="symptoms">Triệu chứng</Label>
            <Textarea
              id="symptoms"
              placeholder="Mô tả các triệu chứng mà bệnh nhân trình bày..."
              value={formData.symptoms}
              onChange={(e) => handleInputChange("symptoms", e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Diagnosis */}
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Chẩn đoán *</Label>
            <Textarea
              id="diagnosis"
              placeholder="Nhập chẩn đoán bệnh..."
              value={formData.diagnosis}
              onChange={(e) => handleInputChange("diagnosis", e.target.value)}
              rows={3}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Treatment Plan */}
          <div className="space-y-2">
            <Label htmlFor="treatmentPlan">Hướng điều trị</Label>
            <Textarea
              id="treatmentPlan"
              placeholder="Mô tả phương pháp điều trị, thuốc cần dùng..."
              value={formData.treatmentPlan}
              onChange={(e) =>
                handleInputChange("treatmentPlan", e.target.value)
              }
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Follow-up */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUp"
                checked={formData.followUpRequired}
                onCheckedChange={(checked) =>
                  handleInputChange("followUpRequired", checked as boolean)
                }
                disabled={isSubmitting}
              />
              <Label htmlFor="followUp">Cần tái khám</Label>
            </div>

            {formData.followUpRequired && (
              <div className="space-y-2">
                <Label>Ngày tái khám</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !followUpDate && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {followUpDate
                        ? format(followUpDate, "dd/MM/yyyy", { locale: vi })
                        : "Chọn ngày tái khám"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={followUpDate}
                      onSelect={setFollowUpDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú thêm</Label>
            <Textarea
              id="notes"
              placeholder="Các ghi chú khác về quá trình khám..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.diagnosis.trim()}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu hồ sơ khám bệnh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
