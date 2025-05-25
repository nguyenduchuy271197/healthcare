"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X, Heart, Shield, Phone, FileText } from "lucide-react";
import { Profile, Patient } from "@/types/custom.types";
import { createPatientProfile, updatePatientProfile } from "@/actions";

interface MedicalRecordsFormProps {
  user: Profile;
  patientData:
    | (Patient & {
        user_profiles: {
          full_name: string;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          avatar_url?: string | null;
        };
      })
    | null;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const COMMON_ALLERGIES = [
  "Penicillin",
  "Aspirin",
  "Ibuprofen",
  "Latex",
  "Peanuts",
  "Shellfish",
  "Eggs",
  "Milk",
  "Soy",
  "Wheat",
  "Dust mites",
  "Pollen",
  "Pet dander",
];

const COMMON_CONDITIONS = [
  "Cao huyết áp",
  "Tiểu đường",
  "Hen suyễn",
  "Bệnh tim",
  "Cholesterol cao",
  "Viêm khớp",
  "Loãng xương",
  "Trầm cảm",
  "Lo âu",
  "Đau nửa đầu",
  "Dị ứng",
  "Béo phì",
];

export function MedicalRecordsForm({
  user,
  patientData,
}: MedicalRecordsFormProps) {
  const [formData, setFormData] = useState({
    emergency_contact_name: patientData?.emergency_contact_name || "",
    emergency_contact_phone: patientData?.emergency_contact_phone || "",
    blood_type: patientData?.blood_type || "",
    allergies: patientData?.allergies || [],
    chronic_conditions: patientData?.chronic_conditions || [],
    insurance_number: patientData?.insurance_number || "",
    insurance_provider: patientData?.insurance_provider || "",
    medical_history: patientData?.medical_history || "",
  });

  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  console.log(user);

  function handleInputChange(field: string, value: string | string[]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function addAllergy(allergy: string) {
    if (allergy.trim() && !formData.allergies.includes(allergy.trim())) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, allergy.trim()],
      }));
      setNewAllergy("");
    }
  }

  function removeAllergy(allergy: string) {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== allergy),
    }));
  }

  function addCondition(condition: string) {
    if (
      condition.trim() &&
      !formData.chronic_conditions.includes(condition.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        chronic_conditions: [...prev.chronic_conditions, condition.trim()],
      }));
      setNewCondition("");
    }
  }

  function removeCondition(condition: string) {
    setFormData((prev) => ({
      ...prev,
      chronic_conditions: prev.chronic_conditions.filter(
        (c) => c !== condition
      ),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare form data with proper null handling
      const submitData = {
        ...formData,
        emergency_contact_name:
          formData.emergency_contact_name.trim() === ""
            ? null
            : formData.emergency_contact_name,
        emergency_contact_phone:
          formData.emergency_contact_phone.trim() === ""
            ? null
            : formData.emergency_contact_phone,
        blood_type: formData.blood_type === "" ? null : formData.blood_type,
        insurance_number:
          formData.insurance_number.trim() === ""
            ? null
            : formData.insurance_number,
        insurance_provider:
          formData.insurance_provider.trim() === ""
            ? null
            : formData.insurance_provider,
        medical_history:
          formData.medical_history.trim() === ""
            ? null
            : formData.medical_history,
        allergies: formData.allergies.length === 0 ? null : formData.allergies,
        chronic_conditions:
          formData.chronic_conditions.length === 0
            ? null
            : formData.chronic_conditions,
      };

      let result;
      if (patientData) {
        result = await updatePatientProfile(submitData);
      } else {
        result = await createPatientProfile(submitData);
      }

      if (result.success) {
        toast({
          title: "Cập nhật thành công",
          description: "Hồ sơ y tế đã được cập nhật.",
        });
        router.refresh();
      } else {
        toast({
          title: "Cập nhật thất bại",
          description: result.error || "Có lỗi xảy ra khi cập nhật hồ sơ y tế.",
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
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Emergency Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Thông tin liên hệ khẩn cấp
            </CardTitle>
            <CardDescription>
              Thông tin người liên hệ trong trường hợp khẩn cấp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">
                  Tên người liên hệ
                </Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) =>
                    handleInputChange("emergency_contact_name", e.target.value)
                  }
                  placeholder="Họ và tên người thân"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Số điện thoại</Label>
                <Input
                  id="emergency_contact_phone"
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) =>
                    handleInputChange("emergency_contact_phone", e.target.value)
                  }
                  placeholder="Số điện thoại liên hệ"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Thông tin y tế cơ bản
            </CardTitle>
            <CardDescription>Thông tin y tế cơ bản và nhóm máu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blood_type">Nhóm máu</Label>
              <Select
                value={formData.blood_type}
                onValueChange={(value) =>
                  handleInputChange("blood_type", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhóm máu" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card>
          <CardHeader>
            <CardTitle>Dị ứng</CardTitle>
            <CardDescription>
              Danh sách các chất gây dị ứng mà bạn đã biết
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.allergies.map((allergy) => (
                <Badge
                  key={allergy}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {allergy}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeAllergy(allergy)}
                  />
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Thêm dị ứng mới</Label>
              <div className="flex gap-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Nhập tên chất gây dị ứng"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAllergy(newAllergy);
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addAllergy(newAllergy)}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dị ứng phổ biến</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map((allergy) => (
                  <Badge
                    key={allergy}
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => addAllergy(allergy)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chronic Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Bệnh mãn tính</CardTitle>
            <CardDescription>
              Các bệnh mãn tính hoặc tình trạng sức khỏe hiện tại
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.chronic_conditions.map((condition) => (
                <Badge
                  key={condition}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {condition}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeCondition(condition)}
                  />
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Thêm bệnh mãn tính</Label>
              <div className="flex gap-2">
                <Input
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Nhập tên bệnh hoặc tình trạng"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCondition(newCondition);
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addCondition(newCondition)}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bệnh phổ biến</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_CONDITIONS.map((condition) => (
                  <Badge
                    key={condition}
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => addCondition(condition)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Thông tin bảo hiểm
            </CardTitle>
            <CardDescription>Thông tin bảo hiểm y tế của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="insurance_provider">
                  Nhà cung cấp bảo hiểm
                </Label>
                <Input
                  id="insurance_provider"
                  value={formData.insurance_provider}
                  onChange={(e) =>
                    handleInputChange("insurance_provider", e.target.value)
                  }
                  placeholder="Tên công ty bảo hiểm"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurance_number">Số thẻ bảo hiểm</Label>
                <Input
                  id="insurance_number"
                  value={formData.insurance_number}
                  onChange={(e) =>
                    handleInputChange("insurance_number", e.target.value)
                  }
                  placeholder="Số thẻ bảo hiểm y tế"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tiền sử bệnh
            </CardTitle>
            <CardDescription>
              Mô tả chi tiết về tiền sử bệnh, phẫu thuật, và điều trị trước đây
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="medical_history">Tiền sử bệnh chi tiết</Label>
              <Textarea
                id="medical_history"
                value={formData.medical_history}
                onChange={(e) =>
                  handleInputChange("medical_history", e.target.value)
                }
                placeholder="Mô tả chi tiết về các bệnh đã mắc, phẫu thuật, điều trị, thuốc đang sử dụng..."
                rows={6}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="min-w-[150px]">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {patientData ? "Cập nhật hồ sơ" : "Tạo hồ sơ y tế"}
          </Button>
        </div>
      </form>
    </div>
  );
}
