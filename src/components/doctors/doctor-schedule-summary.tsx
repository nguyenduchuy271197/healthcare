"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Settings,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";
import { getDoctorSchedules } from "@/actions";
import { DoctorSchedule } from "@/types/custom.types";

const DAYS_OF_WEEK = [
  { value: 1, label: "T2", fullLabel: "Thứ 2" },
  { value: 2, label: "T3", fullLabel: "Thứ 3" },
  { value: 3, label: "T4", fullLabel: "Thứ 4" },
  { value: 4, label: "T5", fullLabel: "Thứ 5" },
  { value: 5, label: "T6", fullLabel: "Thứ 6" },
  { value: 6, label: "T7", fullLabel: "Thứ 7" },
  { value: 0, label: "CN", fullLabel: "Chủ nhật" },
];

interface DoctorScheduleSummaryProps {
  className?: string;
}

export function DoctorScheduleSummary({
  className,
}: DoctorScheduleSummaryProps) {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSchedules() {
      try {
        const result = await getDoctorSchedules();
        if (result.success && result.data) {
          setSchedules(result.data);
        }
      } catch (error) {
        console.error("Error loading schedules:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSchedules();
  }, []);

  function formatTime(time: string) {
    return time.slice(0, 5);
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="space-y-3 text-center">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse mx-auto" />
            <div className="h-4 bg-muted rounded animate-pulse w-32 mx-auto" />
            <div className="h-3 bg-muted rounded animate-pulse w-24 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Chưa có lịch làm việc
          </CardTitle>
          <CardDescription>
            Thiết lập lịch làm việc để bệnh nhân có thể đặt lịch khám
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/schedule">
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Thiết lập lịch làm việc
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const activeSchedules = schedules.filter((s) => s.is_active);
  const totalWorkingDays = activeSchedules.length;
  const totalWorkingHours = activeSchedules.reduce((total, schedule) => {
    const start = new Date(`2000-01-01T${schedule.start_time}`);
    const end = new Date(`2000-01-01T${schedule.end_time}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return total + hours;
  }, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Lịch làm việc
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {totalWorkingDays} ngày
          </Badge>
        </CardTitle>
        <CardDescription>
          Tổng {totalWorkingHours.toFixed(1)} giờ/tuần
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly Overview */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((day) => {
            const daySchedule = schedules.find(
              (s) => s.day_of_week === day.value && s.is_active
            );
            return (
              <div
                key={day.value}
                className={`text-center p-2 rounded text-xs ${
                  daySchedule
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-400"
                }`}
                title={
                  daySchedule
                    ? `${day.fullLabel}: ${formatTime(
                        daySchedule.start_time
                      )} - ${formatTime(daySchedule.end_time)}`
                    : `${day.fullLabel}: Nghỉ`
                }
              >
                <div className="font-medium">{day.label}</div>
                {daySchedule && (
                  <div className="text-xs mt-1">
                    {formatTime(daySchedule.start_time)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Schedule Details */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Chi tiết lịch làm việc:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {schedules
              .filter((s) => s.is_active)
              .sort((a, b) => a.day_of_week - b.day_of_week)
              .map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {DAYS_OF_WEEK.find((d) => d.value === schedule.day_of_week)
                      ?.fullLabel || ""}
                  </span>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {formatTime(schedule.start_time)} -{" "}
                    {formatTime(schedule.end_time)}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href="/schedule" className="flex-1">
            <Button variant="outline" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Cài đặt
            </Button>
          </Link>
          <Link href="/appointments" className="flex-1">
            <Button variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Lịch hẹn
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
