"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Pill, Loader2, Plus, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  createPrescriptionWithItems,
  addPrescriptionItemWithPrice,
} from "@/actions";
import { MedicalRecord } from "@/types/custom.types";

interface PrescriptionFormProps {
  medicalRecord: MedicalRecord & {
    patients?: {
      user_profiles: {
        full_name: string;
      };
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface MedicationItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  unitPrice: number;
  instructions: string;
}

export function PrescriptionForm({
  medicalRecord,
  isOpen,
  onClose,
  onSuccess,
}: PrescriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validUntil, setValidUntil] = useState<Date>();
  const [instructions, setInstructions] = useState("");
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [editingMedication, setEditingMedication] =
    useState<MedicationItem | null>(null);
  const [showMedicationForm, setShowMedicationForm] = useState(false);

  const [medicationForm, setMedicationForm] = useState({
    medicationName: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: 1,
    unitPrice: 0,
    instructions: "",
  });

  const { toast } = useToast();

  function resetMedicationForm() {
    setMedicationForm({
      medicationName: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: 1,
      unitPrice: 0,
      instructions: "",
    });
    setEditingMedication(null);
  }

  function handleAddMedication() {
    if (
      !medicationForm.medicationName.trim() ||
      !medicationForm.dosage.trim()
    ) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên thuốc và liều dùng.",
        variant: "destructive",
      });
      return;
    }

    const newMedication: MedicationItem = {
      id: editingMedication?.id || Date.now().toString(),
      ...medicationForm,
    };

    if (editingMedication) {
      setMedications((prev) =>
        prev.map((med) =>
          med.id === editingMedication.id ? newMedication : med
        )
      );
    } else {
      setMedications((prev) => [...prev, newMedication]);
    }

    resetMedicationForm();
    setShowMedicationForm(false);
  }

  function handleEditMedication(medication: MedicationItem) {
    setMedicationForm(medication);
    setEditingMedication(medication);
    setShowMedicationForm(true);
  }

  function handleDeleteMedication(id: string) {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  }

  function calculateTotalAmount() {
    return medications.reduce(
      (total, med) => total + med.quantity * med.unitPrice,
      0
    );
  }

  async function handleSubmit() {
    if (medications.length === 0) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng thêm ít nhất một loại thuốc.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create prescription first
      const prescriptionResult = await createPrescriptionWithItems({
        medicalRecordId: medicalRecord.id,
        patientId: medicalRecord.patient_id,
        doctorId: medicalRecord.doctor_id,
        instructions: instructions.trim() || undefined,
        totalAmount: calculateTotalAmount(),
        validUntil: validUntil?.toISOString().split("T")[0],
      });

      if (!prescriptionResult.success || !prescriptionResult.data) {
        throw new Error(
          prescriptionResult.error || "Failed to create prescription"
        );
      }

      // Add prescription items
      const prescriptionId = prescriptionResult.data.id;

      for (const medication of medications) {
        const itemResult = await addPrescriptionItemWithPrice(prescriptionId, {
          medicationName: medication.medicationName,
          dosage: medication.dosage,
          frequency: medication.frequency,
          duration: medication.duration,
          quantity: medication.quantity,
          unitPrice: medication.unitPrice,
          instructions: medication.instructions || undefined,
        });

        if (!itemResult.success) {
          console.error("Failed to add medication:", medication.medicationName);
        }
      }

      toast({
        title: "Kê đơn thuốc thành công",
        description: "Đơn thuốc điện tử đã được tạo.",
      });

      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      toast({
        title: "Lỗi kê đơn thuốc",
        description: "Có lỗi xảy ra khi tạo đơn thuốc.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      setInstructions("");
      setMedications([]);
      setValidUntil(undefined);
      resetMedicationForm();
      setShowMedicationForm(false);
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Kê đơn thuốc điện tử
          </DialogTitle>
          <DialogDescription>
            Tạo đơn thuốc cho bệnh nhân{" "}
            {medicalRecord.patients?.user_profiles?.full_name || "N/A"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Patient Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Bệnh nhân:</span>{" "}
                  {medicalRecord.patients?.user_profiles?.full_name || "N/A"}
                </div>
                <div>
                  <span className="text-muted-foreground">Chẩn đoán:</span>{" "}
                  {medicalRecord.diagnosis}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescription Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instructions">Hướng dẫn sử dụng chung</Label>
              <Textarea
                id="instructions"
                placeholder="Hướng dẫn chung về cách sử dụng thuốc..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Có hiệu lực đến</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validUntil && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validUntil
                      ? format(validUntil, "dd/MM/yyyy", { locale: vi })
                      : "Chọn ngày hết hạn"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={validUntil}
                    onSelect={setValidUntil}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Medications List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Danh sách thuốc</h3>
              <Button
                onClick={() => setShowMedicationForm(true)}
                disabled={isSubmitting}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm thuốc
              </Button>
            </div>

            {medications.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên thuốc</TableHead>
                      <TableHead>Liều dùng</TableHead>
                      <TableHead>Tần suất</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead>Đơn giá</TableHead>
                      <TableHead>Thành tiền</TableHead>
                      <TableHead className="w-20">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((medication) => (
                      <TableRow key={medication.id}>
                        <TableCell className="font-medium">
                          {medication.medicationName}
                        </TableCell>
                        <TableCell>{medication.dosage}</TableCell>
                        <TableCell>{medication.frequency}</TableCell>
                        <TableCell>{medication.duration}</TableCell>
                        <TableCell>{medication.quantity}</TableCell>
                        <TableCell>
                          {medication.unitPrice.toLocaleString("vi-VN")}đ
                        </TableCell>
                        <TableCell>
                          {(
                            medication.quantity * medication.unitPrice
                          ).toLocaleString("vi-VN")}
                          đ
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMedication(medication)}
                              disabled={isSubmitting}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteMedication(medication.id)
                              }
                              disabled={isSubmitting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={6} className="text-right font-medium">
                        Tổng cộng:
                      </TableCell>
                      <TableCell className="font-bold">
                        {calculateTotalAmount().toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Pill className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Chưa có thuốc nào được thêm</p>
                    <p className="text-sm">
                      Nhấn &quot;Thêm thuốc&quot; để bắt đầu
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Add/Edit Medication Form */}
          {showMedicationForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingMedication ? "Sửa thông tin thuốc" : "Thêm thuốc mới"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicationName">Tên thuốc *</Label>
                    <Input
                      id="medicationName"
                      placeholder="Nhập tên thuốc..."
                      value={medicationForm.medicationName}
                      onChange={(e) =>
                        setMedicationForm((prev) => ({
                          ...prev,
                          medicationName: e.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dosage">Liều dùng *</Label>
                    <Input
                      id="dosage"
                      placeholder="VD: 500mg"
                      value={medicationForm.dosage}
                      onChange={(e) =>
                        setMedicationForm((prev) => ({
                          ...prev,
                          dosage: e.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Tần suất</Label>
                    <Input
                      id="frequency"
                      placeholder="VD: 2 lần/ngày"
                      value={medicationForm.frequency}
                      onChange={(e) =>
                        setMedicationForm((prev) => ({
                          ...prev,
                          frequency: e.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Thời gian dùng</Label>
                    <Input
                      id="duration"
                      placeholder="VD: 7 ngày"
                      value={medicationForm.duration}
                      onChange={(e) =>
                        setMedicationForm((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Số lượng</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={medicationForm.quantity}
                      onChange={(e) =>
                        setMedicationForm((prev) => ({
                          ...prev,
                          quantity: parseInt(e.target.value) || 1,
                        }))
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Đơn giá (VNĐ)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      min="0"
                      value={medicationForm.unitPrice}
                      onChange={(e) =>
                        setMedicationForm((prev) => ({
                          ...prev,
                          unitPrice: parseFloat(e.target.value) || 0,
                        }))
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicationInstructions">
                    Hướng dẫn sử dụng
                  </Label>
                  <Textarea
                    id="medicationInstructions"
                    placeholder="Hướng dẫn cụ thể cho thuốc này..."
                    value={medicationForm.instructions}
                    onChange={(e) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }))
                    }
                    rows={2}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddMedication}
                    disabled={
                      isSubmitting || !medicationForm.medicationName.trim()
                    }
                  >
                    {editingMedication ? "Cập nhật" : "Thêm thuốc"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetMedicationForm();
                      setShowMedicationForm(false);
                    }}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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
            disabled={isSubmitting || medications.length === 0}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo đơn thuốc
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
