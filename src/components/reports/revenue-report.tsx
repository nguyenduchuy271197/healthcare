"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Download,
  RefreshCw,
  CreditCard,
  Banknote,
  Wallet,
  HandCoins,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getRevenueReport } from "@/actions";

interface RevenueData {
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

export function RevenueReport() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("last_12_months");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const { toast } = useToast();

  const fetchRevenueData = useCallback(async () => {
    function getDateRange() {
      const now = new Date();
      const endDate = now.toISOString().split("T")[0];

      switch (dateRange) {
        case "last_30_days":
          const start30 = new Date(now.setDate(now.getDate() - 30));
          return { startDate: start30.toISOString().split("T")[0], endDate };
        case "last_3_months":
          const start3 = new Date(now.setMonth(now.getMonth() - 3));
          return { startDate: start3.toISOString().split("T")[0], endDate };
        case "last_6_months":
          const start6 = new Date(now.setMonth(now.getMonth() - 6));
          return { startDate: start6.toISOString().split("T")[0], endDate };
        case "last_12_months":
          const start12 = new Date(now.setFullYear(now.getFullYear() - 1));
          return { startDate: start12.toISOString().split("T")[0], endDate };
        case "custom":
          return { startDate: customStartDate, endDate: customEndDate };
        default:
          return { startDate: undefined, endDate: undefined };
      }
    }

    try {
      setIsLoading(true);
      const { startDate, endDate } = getDateRange();
      const result = await getRevenueReport(startDate, endDate);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể tải báo cáo doanh thu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching revenue report:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi tải báo cáo doanh thu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, customStartDate, customEndDate, toast]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  function getPaymentMethodIcon(method: string) {
    switch (method) {
      case "credit_card":
        return <CreditCard className="h-4 w-4" />;
      case "bank_transfer":
        return <Banknote className="h-4 w-4" />;
      case "wallet":
        return <Wallet className="h-4 w-4" />;
      case "cash":
        return <HandCoins className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  }

  function getPaymentMethodLabel(method: string) {
    switch (method) {
      case "credit_card":
        return "Thẻ tín dụng";
      case "bank_transfer":
        return "Chuyển khoản";
      case "wallet":
        return "Ví điện tử";
      case "cash":
        return "Tiền mặt";
      default:
        return method;
    }
  }

  function handleExportReport() {
    if (!data) return;

    const csvContent = [
      ["Báo cáo doanh thu"],
      [""],
      ["Tổng quan"],
      ["Tổng doanh thu", `${data.totalRevenue.toLocaleString("vi-VN")}đ`],
      ["Tổng lịch hẹn", data.totalAppointments.toString()],
      ["Lịch hẹn hoàn thành", data.completedAppointments.toString()],
      [
        "Phí khám trung bình",
        `${data.averageConsultationFee.toLocaleString("vi-VN")}đ`,
      ],
      [""],
      ["Doanh thu theo tháng"],
      ["Tháng", "Doanh thu", "Số lịch hẹn"],
      ...data.monthlyRevenue.map((item) => [
        item.month,
        `${item.revenue.toLocaleString("vi-VN")}đ`,
        item.appointments.toString(),
      ]),
      [""],
      ["Phương thức thanh toán"],
      ["Phương thức", "Số tiền", "Số lượng"],
      ...data.paymentMethodBreakdown.map((item) => [
        getPaymentMethodLabel(item.method),
        `${item.amount.toLocaleString("vi-VN")}đ`,
        item.count.toString(),
      ]),
    ];

    const csv = csvContent.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bao-cao-doanh-thu-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Xuất báo cáo thành công",
      description: "File CSV đã được tải xuống",
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Báo cáo doanh thu
          </h1>
          <p className="text-muted-foreground">
            Theo dõi doanh thu và hiệu suất kinh doanh
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchRevenueData}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button onClick={handleExportReport} disabled={!data}>
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc thời gian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateRange">Khoảng thời gian</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_30_days">30 ngày qua</SelectItem>
                  <SelectItem value="last_3_months">3 tháng qua</SelectItem>
                  <SelectItem value="last_6_months">6 tháng qua</SelectItem>
                  <SelectItem value="last_12_months">12 tháng qua</SelectItem>
                  <SelectItem value="custom">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Từ ngày</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Đến ngày</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng doanh thu
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.totalRevenue.toLocaleString("vi-VN")}đ
                </div>
                <p className="text-xs text-muted-foreground">
                  Từ {data.completedAppointments} lịch hẹn hoàn thành
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng lịch hẹn
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.totalAppointments}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.completedAppointments} hoàn thành
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Phí khám trung bình
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.averageConsultationFee.toLocaleString("vi-VN")}đ
                </div>
                <p className="text-xs text-muted-foreground">
                  Trên mỗi lịch hẹn
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tỷ lệ hoàn thành
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.totalAppointments > 0
                    ? Math.round(
                        (data.completedAppointments / data.totalAppointments) *
                          100
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  Lịch hẹn hoàn thành
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Revenue Table */}
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tháng</TableHead>
                    <TableHead>Doanh thu</TableHead>
                    <TableHead>Số lịch hẹn</TableHead>
                    <TableHead>Doanh thu trung bình</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.monthlyRevenue.map((item) => (
                    <TableRow key={item.month}>
                      <TableCell className="font-medium">
                        {format(new Date(item.month + "-01"), "MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {item.revenue.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell>{item.appointments}</TableCell>
                      <TableCell>
                        {item.appointments > 0
                          ? (item.revenue / item.appointments).toLocaleString(
                              "vi-VN"
                            )
                          : "0"}
                        đ
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {data.paymentMethodBreakdown.map((item) => (
                  <div
                    key={item.method}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getPaymentMethodIcon(item.method)}
                      <div>
                        <p className="font-medium">
                          {getPaymentMethodLabel(item.method)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.count} giao dịch
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {item.amount.toLocaleString("vi-VN")}đ
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {data.totalRevenue > 0
                          ? Math.round((item.amount / data.totalRevenue) * 100)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Revenue (Last 30 days) */}
          {data.dailyRevenue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu 30 ngày gần nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Doanh thu</TableHead>
                      <TableHead>Số lịch hẹn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.dailyRevenue.slice(-10).map((item) => (
                      <TableRow key={item.date}>
                        <TableCell className="font-medium">
                          {format(new Date(item.date), "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </TableCell>
                        <TableCell>
                          {item.revenue.toLocaleString("vi-VN")}đ
                        </TableCell>
                        <TableCell>{item.appointments}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
