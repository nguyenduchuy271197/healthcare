"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, User, Award, MapPin, DollarSign } from "lucide-react";
import {
  createDoctorProfile,
  updateDoctorProfile,
  getDoctorProfile,
} from "@/actions";
import { Doctor } from "@/types/custom.types";

const doctorProfileSchema = z.object({
  license_number: z.string().min(1, "Số giấy phép hành nghề là bắt buộc"),
  specialization: z.string().min(1, "Chuyên khoa là bắt buộc"),
  qualification: z.string().min(1, "Bằng cấp là bắt buộc"),
  experience_years: z.coerce
    .number()
    .min(0, "Số năm kinh nghiệm phải >= 0")
    .max(50, "Số năm kinh nghiệm phải <= 50"),
  consultation_fee: z.coerce.number().min(0, "Phí khám phải >= 0"),
  bio: z.string().optional(),
  clinic_address: z.string().optional(),
});

type DoctorProfileFormData = z.infer<typeof doctorProfileSchema>;

const SPECIALIZATIONS = [
  "Nội khoa",
  "Ngoại khoa",
  "Sản phụ khoa",
  "Nhi khoa",
  "Tim mạch",
  "Thần kinh",
  "Da liễu",
  "Mắt",
  "Tai mũi họng",
  "Răng hàm mặt",
  "Chấn thương chỉnh hình",
  "Ung bướu",
  "Tâm thần",
  "Phục hồi chức năng",
  "Y học cổ truyền",
  "Bác sĩ đa khoa",
];

interface DoctorProfileFormProps {
  initialData?: Doctor | null;
  onSuccess?: () => void;
}

export function DoctorProfileForm({
  initialData,
  onSuccess,
}: DoctorProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(!initialData);
  const { toast } = useToast();

  const form = useForm<DoctorProfileFormData>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      license_number: "",
      specialization: "",
      qualification: "",
      experience_years: 0,
      consultation_fee: 100000,
      bio: "",
      clinic_address: "",
    },
  });

  // Load existing profile if not provided
  useEffect(() => {
    async function loadProfile() {
      if (initialData) {
        form.reset({
          license_number: initialData.license_number || "",
          specialization: initialData.specialization || "",
          qualification: initialData.qualification || "",
          experience_years: initialData.experience_years || 0,
          consultation_fee: initialData.consultation_fee || 100000,
          bio: initialData.bio || "",
          clinic_address: initialData.clinic_address || "",
        });
        setIsLoadingProfile(false);
        return;
      }

      try {
        const result = await getDoctorProfile();
        if (result.success && result.data) {
          form.reset({
            license_number: result.data.license_number || "",
            specialization: result.data.specialization || "",
            qualification: result.data.qualification || "",
            experience_years: result.data.experience_years || 0,
            consultation_fee: result.data.consultation_fee || 100000,
            bio: result.data.bio || "",
            clinic_address: result.data.clinic_address || "",
          });
        }
      } catch (error) {
        console.error("Error loading doctor profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, [initialData, form]);

  async function onSubmit(data: DoctorProfileFormData) {
    setIsLoading(true);

    try {
      const isUpdate = initialData || form.getValues("license_number");

      const result = isUpdate
        ? await updateDoctorProfile(data)
        : await createDoctorProfile(data);

      if (result.success) {
        toast({
          title: isUpdate ? "Cập nhật thành công" : "Tạo hồ sơ thành công",
          description: isUpdate
            ? "Thông tin hồ sơ bác sĩ đã được cập nhật."
            : "Hồ sơ bác sĩ đã được tạo thành công.",
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Có lỗi xảy ra",
          description: result.error || "Không thể lưu thông tin hồ sơ.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi lưu thông tin.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingProfile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải thông tin...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Hồ sơ chuyên môn
        </CardTitle>
        <CardDescription>
          Cập nhật thông tin chuyên môn, bằng cấp và kinh nghiệm của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Professional Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số giấy phép hành nghề *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: 12345/BYT-GPHD"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Số giấy phép hành nghề do Bộ Y tế cấp
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chuyên khoa *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chuyên khoa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SPECIALIZATIONS.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bằng cấp *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Bác sĩ Y khoa, Thạc sĩ Y học"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Bằng cấp cao nhất trong lĩnh vực y tế
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số năm kinh nghiệm *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        placeholder="0"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Số năm hành nghề trong lĩnh vực y tế
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Financial Info */}
            <FormField
              control={form.control}
              name="consultation_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Phí khám bệnh (VNĐ) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="100000"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Phí khám bệnh cho mỗi lần khám (tính bằng VNĐ)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Giới thiệu bản thân
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả ngắn gọn về kinh nghiệm, chuyên môn và phương pháp điều trị của bạn..."
                      rows={4}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Thông tin này sẽ hiển thị cho bệnh nhân khi tìm kiếm bác sĩ
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Clinic Address */}
            <FormField
              control={form.control}
              name="clinic_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ phòng khám
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Địa chỉ chi tiết của phòng khám hoặc bệnh viện nơi bạn làm việc..."
                      rows={2}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Địa chỉ nơi bệnh nhân có thể đến khám bệnh
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {initialData ? "Cập nhật hồ sơ" : "Tạo hồ sơ"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
