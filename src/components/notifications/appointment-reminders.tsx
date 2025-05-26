"use client";

import { useEffect, useState, useCallback } from "react";
import { sendAppointmentReminder } from "@/actions/notifications/send-appointment-reminder";
import { getUserNotifications } from "@/actions/notifications/get-notifications";
import { markNotificationAsRead } from "@/actions/notifications/mark-as-read";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Calendar, User, MapPin, Check } from "lucide-react";
import { formatDate, formatTime, formatDateTime } from "@/lib/utils";
import { Notification } from "@/types/custom.types";
import { useToast } from "@/hooks/use-toast";

interface AppointmentRemindersProps {
  userId?: string;
}

type NotificationWithData = Notification & {
  data?: {
    appointment_id?: number;
    doctor_name?: string;
    appointment_date?: string;
    appointment_time?: string;
    clinic_address?: string;
  } | null;
};

export function AppointmentReminders({ userId }: AppointmentRemindersProps) {
  const [notifications, setNotifications] = useState<NotificationWithData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getUserNotifications(userId);

      if (result.success && result.data) {
        // Filter for appointment reminders only
        const reminderNotifications = result.data.filter(
          (notification) => notification.type === "appointment_reminder"
        );
        setNotifications(reminderNotifications);
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể tải thông báo",
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
  }, [userId, toast]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const result = await markNotificationAsRead(notificationId);

      if (result.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  is_read: true,
                  read_at: new Date().toISOString(),
                }
              : notification
          )
        );
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể đánh dấu thông báo đã đọc",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
        variant: "destructive",
      });
    }
  };

  const sendManualReminder = async (appointmentId: number) => {
    try {
      const result = await sendAppointmentReminder(appointmentId);

      if (result.success) {
        toast({
          title: "Đã gửi nhắc nhở",
          description: "Thông báo nhắc nhở lịch hẹn đã được gửi thành công",
        });
        // Reload notifications to show the new reminder
        loadNotifications();
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể gửi thông báo nhắc nhở",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadNotifications();

    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Không tìm thấy thông báo nhắc nhở lịch hẹn.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Thông báo nhắc nhở lịch hẹn</h3>
        <Badge variant="secondary">
          {notifications.filter((n) => !n.is_read).length} chưa đọc
        </Badge>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`transition-all ${
              !notification.is_read
                ? "border-blue-200 bg-blue-50/50"
                : "border-gray-200"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2 rounded-full ${
                      !notification.is_read
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      {!notification.is_read && (
                        <Badge variant="default" className="text-xs">
                          Mới
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>

                    {notification.data && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                        {notification.data.doctor_name && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Dr. {notification.data.doctor_name}</span>
                          </div>
                        )}

                        {notification.data.appointment_date &&
                          notification.data.appointment_time && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {formatDate(notification.data.appointment_date)}{" "}
                                lúc{" "}
                                {formatTime(notification.data.appointment_time)}
                              </span>
                            </div>
                          )}

                        {notification.data.clinic_address && (
                          <div className="flex items-center gap-1 sm:col-span-2">
                            <MapPin className="h-3 w-3" />
                            <span>{notification.data.clinic_address}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDateTime(notification.created_at || "")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}

                  {notification.data?.appointment_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        sendManualReminder(notification.data!.appointment_id!)
                      }
                    >
                      <Bell className="h-4 w-4 mr-1" />
                      Gửi lại
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
