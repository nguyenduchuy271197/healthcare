"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import { AppointmentCard } from "./appointment-card";
import { AppointmentWithDoctor } from "./types";

interface AppointmentFiltersProps {
  appointments: AppointmentWithDoctor[];
  onViewDetails: (appointment: AppointmentWithDoctor) => void;
  onEdit: (appointment: AppointmentWithDoctor) => void;
  onCancel: (appointment: AppointmentWithDoctor) => void;
  onReschedule: (appointment: AppointmentWithDoctor) => void;
}

export function AppointmentFilters({
  appointments,
  onViewDetails,
  onEdit,
  onCancel,
  onReschedule,
}: AppointmentFiltersProps) {
  const router = useRouter();

  function filterAppointmentsByStatus(status: string) {
    if (status === "all") return appointments;
    if (status === "upcoming")
      return appointments.filter(
        (apt) => apt.status === "pending" || apt.status === "confirmed"
      );
    return appointments.filter((apt) => apt.status === status);
  }

  function EmptyState({
    title,
    description,
    showFindDoctorButton = false,
  }: {
    title: string;
    description: string;
    showFindDoctorButton?: boolean;
  }) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          {showFindDoctorButton && (
            <Button className="mt-4" onClick={() => router.push("/doctors")}>
              Tìm bác sĩ
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  function AppointmentList({
    appointments,
  }: {
    appointments: AppointmentWithDoctor[];
  }) {
    return (
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onCancel={onCancel}
            onReschedule={onReschedule}
          />
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="all">Tất cả</TabsTrigger>
        <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
        <TabsTrigger value="confirmed">Đã xác nhận</TabsTrigger>
        <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
        <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        {filterAppointmentsByStatus("all").length === 0 ? (
          <EmptyState
            title="Chưa có lịch hẹn"
            description="Bạn chưa có lịch hẹn nào. Hãy tìm bác sĩ và đặt lịch khám."
            showFindDoctorButton
          />
        ) : (
          <AppointmentList appointments={filterAppointmentsByStatus("all")} />
        )}
      </TabsContent>

      <TabsContent value="upcoming" className="space-y-4">
        {filterAppointmentsByStatus("upcoming").length === 0 ? (
          <EmptyState
            title="Không có lịch hẹn sắp tới"
            description="Bạn không có lịch hẹn nào sắp tới."
          />
        ) : (
          <AppointmentList
            appointments={filterAppointmentsByStatus("upcoming")}
          />
        )}
      </TabsContent>

      <TabsContent value="confirmed" className="space-y-4">
        {filterAppointmentsByStatus("confirmed").length === 0 ? (
          <EmptyState
            title="Không có lịch hẹn đã xác nhận"
            description="Bạn không có lịch hẹn nào đã được xác nhận."
          />
        ) : (
          <AppointmentList
            appointments={filterAppointmentsByStatus("confirmed")}
          />
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        {filterAppointmentsByStatus("completed").length === 0 ? (
          <EmptyState
            title="Không có lịch hẹn hoàn thành"
            description="Bạn chưa có lịch hẹn nào hoàn thành."
          />
        ) : (
          <AppointmentList
            appointments={filterAppointmentsByStatus("completed")}
          />
        )}
      </TabsContent>

      <TabsContent value="cancelled" className="space-y-4">
        {filterAppointmentsByStatus("cancelled").length === 0 ? (
          <EmptyState
            title="Không có lịch hẹn đã hủy"
            description="Bạn không có lịch hẹn nào đã bị hủy."
          />
        ) : (
          <AppointmentList
            appointments={filterAppointmentsByStatus("cancelled")}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
