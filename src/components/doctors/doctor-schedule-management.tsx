"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  createDoctorSchedule,
  updateDoctorSchedule,
  deleteDoctorSchedule,
  getDoctorSchedules,
} from "@/actions";
import { DoctorSchedule } from "@/types/custom.types";

const scheduleSchema = z.object({
  day_of_week: z.coerce.number().min(0).max(6),
  start_time: z.string().min(1, "Giờ bắt đầu là bắt buộc"),
  end_time: z.string().min(1, "Giờ kết thúc là bắt buộc"),
  slot_duration_minutes: z.coerce.number().min(15).max(120).optional(),
  is_active: z.boolean().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

const DAYS_OF_WEEK = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
];

const SLOT_DURATIONS = [
  { value: 15, label: "15 phút" },
  { value: 20, label: "20 phút" },
  { value: 30, label: "30 phút" },
  { value: 45, label: "45 phút" },
  { value: 60, label: "60 phút" },
];

export function DoctorScheduleManagement() {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DoctorSchedule | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      day_of_week: 1,
      start_time: "08:00",
      end_time: "17:00",
      slot_duration_minutes: 30,
      is_active: true,
    },
  });

  // Load schedules
  const loadSchedules = useCallback(async () => {
    try {
      const result = await getDoctorSchedules();
      if (result.success && result.data) {
        setSchedules(result.data);
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể tải lịch làm việc",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi tải lịch làm việc",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  function getDayLabel(dayOfWeek: number) {
    return DAYS_OF_WEEK.find((day) => day.value === dayOfWeek)?.label || "";
  }

  function formatTime(time: string) {
    return time.slice(0, 5);
  }

  function handleEdit(schedule: DoctorSchedule) {
    setEditingSchedule(schedule);
    form.reset({
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time.slice(0, 5),
      end_time: schedule.end_time.slice(0, 5),
      slot_duration_minutes: schedule.slot_duration_minutes || 30,
      is_active: schedule.is_active ?? true,
    });
    setIsDialogOpen(true);
  }

  function handleAdd() {
    setEditingSchedule(null);
    form.reset({
      day_of_week: 1,
      start_time: "08:00",
      end_time: "17:00",
      slot_duration_minutes: 30,
      is_active: true,
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(data: ScheduleFormData) {
    // Validate time range
    if (data.start_time >= data.end_time) {
      toast({
        title: "Lỗi",
        description: "Giờ kết thúc phải sau giờ bắt đầu",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data with defaults
      const scheduleData = {
        ...data,
        slot_duration_minutes: data.slot_duration_minutes || 30,
        is_active: data.is_active ?? true,
      };

      const result = editingSchedule
        ? await updateDoctorSchedule(editingSchedule.id, scheduleData)
        : await createDoctorSchedule(scheduleData);

      if (result.success) {
        toast({
          title: "Thành công",
          description: editingSchedule
            ? "Cập nhật lịch làm việc thành công"
            : "Thêm lịch làm việc thành công",
        });
        setIsDialogOpen(false);
        await loadSchedules();
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể lưu lịch làm việc",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi lưu lịch làm việc",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(scheduleId: number) {
    try {
      const result = await deleteDoctorSchedule(scheduleId);
      if (result.success) {
        toast({
          title: "Thành công",
          description: "Xóa lịch làm việc thành công",
        });
        await loadSchedules();
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể xóa lịch làm việc",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi xóa lịch làm việc",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải lịch làm việc...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lịch làm việc
              </CardTitle>
              <CardDescription>
                Cấu hình khung giờ làm việc, thời gian cho mỗi ca khám
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm lịch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingSchedule
                      ? "Sửa lịch làm việc"
                      : "Thêm lịch làm việc"}
                  </DialogTitle>
                  <DialogDescription>
                    Cấu hình khung giờ làm việc cho từng ngày trong tuần
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="day_of_week"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày trong tuần</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={field.value.toString()}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn ngày" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DAYS_OF_WEEK.map((day) => (
                                <SelectItem
                                  key={day.value}
                                  value={day.value.toString()}
                                >
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giờ bắt đầu</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="end_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giờ kết thúc</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="slot_duration_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thời gian mỗi ca khám</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={field.value?.toString() || "30"}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn thời gian" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SLOT_DURATIONS.map((duration) => (
                                <SelectItem
                                  key={duration.value}
                                  value={duration.value.toString()}
                                >
                                  {duration.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Thời gian dành cho mỗi lần khám bệnh
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isSubmitting}
                      >
                        Hủy
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {editingSchedule ? "Cập nhật" : "Thêm"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {schedules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Giờ làm việc</TableHead>
                  <TableHead>Thời gian/ca</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules
                  .sort((a, b) => a.day_of_week - b.day_of_week)
                  .map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        {getDayLabel(schedule.day_of_week)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatTime(schedule.start_time)} -{" "}
                          {formatTime(schedule.end_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {schedule.slot_duration_minutes || 30} phút
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={schedule.is_active ? "default" : "secondary"}
                        >
                          {schedule.is_active ? "Hoạt động" : "Tạm dừng"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Xác nhận xóa
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa lịch làm việc{" "}
                                  {getDayLabel(schedule.day_of_week)} không?
                                  Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(schedule.id)}
                                >
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">
                Chưa có lịch làm việc
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Thêm lịch làm việc để bệnh nhân có thể đặt lịch khám
              </p>
              <div className="mt-6">
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm lịch làm việc đầu tiên
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Setup Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Thiết lập nhanh
          </CardTitle>
          <CardDescription>Các mẫu lịch làm việc phổ biến</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h4 className="font-medium mb-2">Lịch hành chính</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Thứ 2 - Thứ 6: 8:00 - 17:00 (30 phút/ca)
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const weekdaySchedules = [1, 2, 3, 4, 5].map((day) => ({
                    day_of_week: day,
                    start_time: "08:00",
                    end_time: "17:00",
                    slot_duration_minutes: 30,
                    is_active: true,
                  }));

                  for (const schedule of weekdaySchedules) {
                    await createDoctorSchedule(schedule);
                  }
                  await loadSchedules();
                  toast({
                    title: "Thành công",
                    description: "Đã thiết lập lịch hành chính",
                  });
                }}
              >
                Áp dụng
              </Button>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-2">Lịch toàn thời gian</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Thứ 2 - Chủ nhật: 8:00 - 20:00 (30 phút/ca)
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const allDaySchedules = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
                    day_of_week: day,
                    start_time: "08:00",
                    end_time: "20:00",
                    slot_duration_minutes: 30,
                    is_active: true,
                  }));

                  for (const schedule of allDaySchedules) {
                    await createDoctorSchedule(schedule);
                  }
                  await loadSchedules();
                  toast({
                    title: "Thành công",
                    description: "Đã thiết lập lịch toàn thời gian",
                  });
                }}
              >
                Áp dụng
              </Button>
            </Card>
          </div>

          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Lưu ý quan trọng</h4>
                <p className="text-sm text-amber-700 mt-1">
                  • Lịch làm việc sẽ áp dụng cho tất cả các tuần
                  <br />
                  • Bệnh nhân chỉ có thể đặt lịch trong khung giờ đã cấu hình
                  <br />
                  • Thay đổi lịch có thể ảnh hưởng đến các lịch hẹn đã đặt
                  <br />• Nên thiết lập lịch nghỉ riêng cho các ngày lễ
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
