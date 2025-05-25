"use server";

import { createClient } from "@/lib/supabase/server";

interface RevenueReportData {
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  averageConsultationFee: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    appointments: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    appointments: number;
  }>;
  paymentMethodBreakdown: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
}

interface RevenueReportResult {
  success: boolean;
  error?: string;
  data?: RevenueReportData;
}

export async function getRevenueReport(
  startDate?: string,
  endDate?: string
): Promise<RevenueReportResult> {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Verify user is a doctor
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || userProfile?.role !== "doctor") {
      return {
        success: false,
        error: "Access denied. Only doctors can view revenue reports.",
      };
    }

    // Set default date range if not provided (last 12 months)
    const defaultEndDate = new Date().toISOString().split("T")[0];
    const defaultStartDate = new Date(
      new Date().setFullYear(new Date().getFullYear() - 1)
    ).toISOString().split("T")[0];

    const queryStartDate = startDate || defaultStartDate;
    const queryEndDate = endDate || defaultEndDate;

    // Get completed appointments with payments
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        consultation_fee,
        status,
        payments (
          amount,
          payment_method,
          status,
          paid_at
        )
      `)
      .eq("doctor_id", user.id)
      .eq("status", "completed")
      .gte("appointment_date", queryStartDate)
      .lte("appointment_date", queryEndDate)
      .order("appointment_date", { ascending: false });

    if (appointmentsError) {
      return {
        success: false,
        error: appointmentsError.message,
      };
    }

    // Calculate total revenue and statistics
    const completedPayments = appointments?.filter(
      (apt) => apt.payments && apt.payments.length > 0 && 
      apt.payments.some((p) => p.status === "completed")
    ) || [];

    const totalRevenue = completedPayments.reduce((sum, apt) => {
      const paidAmount = apt.payments
        ?.filter((p) => p.status === "completed")
        .reduce((pSum, p) => pSum + p.amount, 0) || 0;
      return sum + paidAmount;
    }, 0);

    const totalAppointments = appointments?.length || 0;
    const completedAppointmentsCount = completedPayments.length;
    const averageConsultationFee = totalAppointments > 0 
      ? appointments.reduce((sum, apt) => sum + apt.consultation_fee, 0) / totalAppointments
      : 0;

    // Monthly revenue breakdown
    const monthlyData = new Map<string, { revenue: number; appointments: number }>();
    completedPayments.forEach((apt) => {
      const month = new Date(apt.appointment_date).toISOString().slice(0, 7); // YYYY-MM
      const paidAmount = apt.payments
        ?.filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0) || 0;
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { revenue: 0, appointments: 0 });
      }
      const current = monthlyData.get(month)!;
      current.revenue += paidAmount;
      current.appointments += 1;
    });

    const monthlyRevenue = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        appointments: data.appointments,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Daily revenue for last 30 days
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const dailyStartDate = last30Days.toISOString().split("T")[0];

    const dailyData = new Map<string, { revenue: number; appointments: number }>();
    completedPayments
      .filter((apt) => apt.appointment_date >= dailyStartDate)
      .forEach((apt) => {
        const date = apt.appointment_date;
        const paidAmount = apt.payments
          ?.filter((p) => p.status === "completed")
          .reduce((sum, p) => sum + p.amount, 0) || 0;
        
        if (!dailyData.has(date)) {
          dailyData.set(date, { revenue: 0, appointments: 0 });
        }
        const current = dailyData.get(date)!;
        current.revenue += paidAmount;
        current.appointments += 1;
      });

    const dailyRevenue = Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        appointments: data.appointments,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Payment method breakdown
    const paymentMethodData = new Map<string, { amount: number; count: number }>();
    completedPayments.forEach((apt) => {
      apt.payments?.filter((p) => p.status === "completed").forEach((payment) => {
        const method = payment.payment_method;
        if (!paymentMethodData.has(method)) {
          paymentMethodData.set(method, { amount: 0, count: 0 });
        }
        const current = paymentMethodData.get(method)!;
        current.amount += payment.amount;
        current.count += 1;
      });
    });

    const paymentMethodBreakdown = Array.from(paymentMethodData.entries())
      .map(([method, data]) => ({
        method,
        amount: data.amount,
        count: data.count,
      }));

    return {
      success: true,
      data: {
        totalRevenue,
        totalAppointments,
        completedAppointments: completedAppointmentsCount,
        averageConsultationFee,
        monthlyRevenue,
        dailyRevenue,
        paymentMethodBreakdown,
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