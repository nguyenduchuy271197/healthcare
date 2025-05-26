"use client";

import { useEffect, useState, useCallback } from "react";
import { getPatientAppointments } from "@/actions/appointments/get-patient-appointments";
import {
  useAppointmentReminders,
  useUpcomingAppointmentReminders,
} from "@/hooks/use-appointment-reminders";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentButton } from "@/components/appointments/payment-button";
import { Calendar, Clock, User, Bell, BellRing } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { Appointment, PaymentStatus } from "@/types/custom.types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type PatientAppointment = Appointment & {
  doctors: {
    user_profiles: {
      full_name: string;
      avatar_url?: string | null;
      phone?: string | null;
    };
    specialization?: string | null;
    clinic_address?: string | null;
    consultation_fee?: number | null;
    doctor_schedules: {
      id: number;
      day_of_week: number;
      start_time: string;
      end_time: string;
      slot_duration_minutes: number | null;
      is_active: boolean | null;
    }[];
  };
  payments?: Array<{
    id: number;
    amount: number;
    status: string;
    invoice_url?: string;
    created_at: string;
  }>;
};

interface UpcomingAppointmentsWidgetProps {
  limit?: number;
}

export function UpcomingAppointmentsWidget({
  limit = 3,
}: UpcomingAppointmentsWidgetProps) {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Extract appointment data for reminder hook
  const appointmentData = appointments.map((apt) => ({
    id: apt.id,
    appointment_date: apt.appointment_date,
    appointment_time: apt.appointment_time,
    status: apt.status || "pending",
    reminder_sent: apt.reminder_sent || false,
  }));

  // Set up automatic reminders
  useAppointmentReminders(appointmentData, { enabled: true });

  // Get reminder status helpers
  const reminderHelpers = useUpcomingAppointmentReminders();

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPatientAppointments();

      if (result.success && result.data) {
        // Filter for upcoming appointments and limit
        const upcoming = result.data
          .filter((apt) => {
            const appointmentDate = new Date(
              `${apt.appointment_date} ${apt.appointment_time}`
            );
            return appointmentDate > new Date();
          })
          .sort((a, b) => {
            const dateA = new Date(
              `${a.appointment_date} ${a.appointment_time}`
            );
            const dateB = new Date(
              `${b.appointment_date} ${b.appointment_time}`
            );
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, limit);

        setAppointments(upcoming);
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể tải lịch hẹn",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [limit, toast]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch hẹn sắp tới</CardTitle>
          <CardDescription>Các lịch hẹn tiếp theo của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch hẹn sắp tới</CardTitle>
          <CardDescription>Các lịch hẹn tiếp theo của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Không có lịch hẹn sắp tới</p>
            <Button asChild className="mt-4">
              <Link href="/doctors">Đặt lịch khám</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Lịch hẹn sắp tới</CardTitle>
          <CardDescription>
            {appointments.length} lịch hẹn tiếp theo của bạn
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/appointments">Xem tất cả</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const appointmentForReminder = {
              id: appointment.id,
              appointment_date: appointment.appointment_date,
              appointment_time: appointment.appointment_time,
              status: appointment.status || "pending",
              reminder_sent: appointment.reminder_sent || false,
            };

            const needsTomorrowReminder = reminderHelpers.needsTomorrowReminder(
              appointmentForReminder
            );
            const needsTwoHourReminder = reminderHelpers.needsTwoHourReminder(
              appointmentForReminder
            );
            const timeUntil = reminderHelpers.timeUntilAppointment(
              appointmentForReminder
            );

            // Get payment info from the appointment
            const payment = appointment.payments?.[0];

            return (
              <div
                key={appointment.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {appointment.doctors?.user_profiles?.full_name ||
                          "Bác sĩ"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctors?.specialization ||
                          "Khoa Tổng quát"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        appointment.status === "confirmed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {appointment.status}
                    </Badge>

                    {(needsTomorrowReminder || needsTwoHourReminder) && (
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-200"
                      >
                        <BellRing className="h-3 w-3 mr-1" />
                        Cần nhắc nhở
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(appointment.appointment_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(appointment.appointment_time)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Còn {timeUntil}</span>
                    {appointment.reminder_sent && (
                      <span className="ml-2 text-green-600">
                        <Bell className="h-3 w-3 inline mr-1" />
                        Đã gửi nhắc nhở
                      </span>
                    )}
                  </div>

                  <PaymentButton
                    appointmentId={appointment.id}
                    appointmentStatus={appointment.status || "pending"}
                    consultationFee={appointment.consultation_fee}
                    paymentStatus={payment?.status as PaymentStatus}
                    paymentId={payment?.id}
                    className="flex-shrink-0"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
