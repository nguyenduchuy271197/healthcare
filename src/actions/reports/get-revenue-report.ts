"use server";

import { createClient } from "@/lib/supabase/server";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface RevenueData {
  totalRevenue: number;
  totalAppointments: number;
  avgRevenuePerAppointment: number;
  completedAppointments: number;
  cancelledAppointments: number;
  monthlyBreakdown: {
    month: string;
    revenue: number;
    appointments: number;
  }[];
  paymentMethods: {
    method: string;
    count: number;
    total: number;
  }[];
}

interface GetRevenueReportResult {
  success: boolean;
  error?: string;
  data?: RevenueData;
}

export async function getRevenueReport(
  doctorId?: string,
  dateRange?: DateRange
): Promise<GetRevenueReportResult> {
  try {
    const supabase = createClient();

    let targetDoctorId = doctorId;

    // If no doctorId provided, get current user
    if (!targetDoctorId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      targetDoctorId = user.id;
    }

    // Set default date range if not provided (last 12 months)
    const endDate = dateRange?.endDate || new Date().toISOString().split('T')[0];
    const startDate = dateRange?.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get appointments with payments in date range
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        id,
        status,
        consultation_fee,
        appointment_date,
        payments (
          amount,
          status,
          payment_method,
          paid_at
        )
      `)
      .eq("doctor_id", targetDoctorId)
      .gte("appointment_date", startDate)
      .lte("appointment_date", endDate);

    if (appointmentsError) {
      return {
        success: false,
        error: appointmentsError.message,
      };
    }

    if (!appointments) {
      return {
        success: true,
        data: {
          totalRevenue: 0,
          totalAppointments: 0,
          avgRevenuePerAppointment: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          monthlyBreakdown: [],
          paymentMethods: [],
        },
      };
    }

    // Calculate metrics
    let totalRevenue = 0;
    let completedAppointments = 0;
    let cancelledAppointments = 0;
    const monthlyData = new Map<string, { revenue: number; appointments: number }>();
    const paymentMethodData = new Map<string, { count: number; total: number }>();

    appointments.forEach(appointment => {
      const date = new Date(appointment.appointment_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Initialize monthly data if not exists
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { revenue: 0, appointments: 0 });
      }

      const monthData = monthlyData.get(monthKey)!;
      monthData.appointments++;

      if (appointment.status === "completed") {
        completedAppointments++;
      } else if (appointment.status === "cancelled") {
        cancelledAppointments++;
      }

      // Process payments
      if (appointment.payments && Array.isArray(appointment.payments)) {
        appointment.payments.forEach((payment) => {
          if (payment.status === "completed") {
            totalRevenue += payment.amount;
            monthData.revenue += payment.amount;

            // Track payment methods
            const method = payment.payment_method;
            if (!paymentMethodData.has(method)) {
              paymentMethodData.set(method, { count: 0, total: 0 });
            }
            const methodData = paymentMethodData.get(method)!;
            methodData.count++;
            methodData.total += payment.amount;
          }
        });
      }
    });

    // Prepare monthly breakdown
    const monthlyBreakdown = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        appointments: data.appointments,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Prepare payment methods breakdown
    const paymentMethods = Array.from(paymentMethodData.entries())
      .map(([method, data]) => ({
        method,
        count: data.count,
        total: data.total,
      }))
      .sort((a, b) => b.total - a.total);

    const avgRevenuePerAppointment = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;

    return {
      success: true,
      data: {
        totalRevenue,
        totalAppointments: appointments.length,
        avgRevenuePerAppointment: Math.round(avgRevenuePerAppointment * 100) / 100,
        completedAppointments,
        cancelledAppointments,
        monthlyBreakdown,
        paymentMethods,
      },
    };
  } catch (error) {
    console.error("Get revenue report error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while generating revenue report",
    };
  }
} 