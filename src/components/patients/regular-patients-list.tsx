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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Search,
  Download,
  RefreshCw,
  Eye,
  Phone,
  Calendar,
  DollarSign,
  Star,
  AlertTriangle,
  Heart,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getRegularPatients } from "@/actions";
import { PatientDetailDialog } from "./patient-detail-dialog";

interface RegularPatient {
  id: string;
  user_profiles: {
    full_name: string;
    phone?: string | null;
    date_of_birth?: string | null;
    avatar_url?: string | null;
  };
  totalAppointments: number;
  lastAppointmentDate: string;
  totalSpent: number;
  averageRating?: number;
  chronicConditions?: string[];
  allergies?: string[];
  lastDiagnosis?: string;
  nextFollowUpDate?: string;
}

export function RegularPatientsList() {
  const [patients, setPatients] = useState<RegularPatient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<RegularPatient[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [minAppointments, setMinAppointments] = useState("3");
  const [sortBy, setSortBy] = useState("totalAppointments");
  const [selectedPatient, setSelectedPatient] = useState<RegularPatient | null>(
    null
  );
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const { toast } = useToast();

  const fetchRegularPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getRegularPatients(parseInt(minAppointments));
      if (result.success && result.data) {
        setPatients(result.data);
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể tải danh sách bệnh nhân",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching regular patients:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi tải danh sách bệnh nhân",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [minAppointments, toast]);

  useEffect(() => {
    fetchRegularPatients();
  }, [fetchRegularPatients]);

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        patient.user_profiles.full_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.user_profiles.phone?.includes(searchTerm) ||
        patient.lastDiagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort patients
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "totalAppointments":
          return b.totalAppointments - a.totalAppointments;
        case "totalSpent":
          return b.totalSpent - a.totalSpent;
        case "lastAppointmentDate":
          return (
            new Date(b.lastAppointmentDate).getTime() -
            new Date(a.lastAppointmentDate).getTime()
          );
        case "name":
          return a.user_profiles.full_name.localeCompare(
            b.user_profiles.full_name
          );
        default:
          return 0;
      }
    });

    setFilteredPatients(filtered);
  }, [patients, searchTerm, sortBy]);

  function calculateAge(dateOfBirth?: string) {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  function getPatientInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function handleExportPatients() {
    if (filteredPatients.length === 0) return;

    const csvContent = [
      ["Danh sách bệnh nhân thường xuyên"],
      [""],
      [
        "Họ tên",
        "Số điện thoại",
        "Tuổi",
        "Số lịch hẹn",
        "Lần khám cuối",
        "Tổng chi tiêu",
        "Đánh giá TB",
        "Chẩn đoán cuối",
      ],
      ...filteredPatients.map((patient) => [
        patient.user_profiles.full_name,
        patient.user_profiles.phone || "",
        patient.user_profiles.date_of_birth
          ? calculateAge(patient.user_profiles.date_of_birth)?.toString() || ""
          : "",
        patient.totalAppointments.toString(),
        format(new Date(patient.lastAppointmentDate), "dd/MM/yyyy", {
          locale: vi,
        }),
        `${patient.totalSpent.toLocaleString("vi-VN")}đ`,
        patient.averageRating?.toString() || "",
        patient.lastDiagnosis || "",
      ]),
    ];

    const csv = csvContent.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `benh-nhan-thuong-xuyen-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Xuất danh sách thành công",
      description: "File CSV đã được tải xuống",
    });
  }

  function handleViewPatient(patient: RegularPatient) {
    setSelectedPatient(patient);
    setShowPatientDetail(true);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bệnh nhân thường xuyên
          </h1>
          <p className="text-muted-foreground">
            Quản lý danh sách bệnh nhân có nhiều lần khám bệnh
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchRegularPatients}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button
            onClick={handleExportPatients}
            disabled={filteredPatients.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Xuất danh sách
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc và tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Tên, SĐT, chẩn đoán..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minAppointments">Số lịch hẹn tối thiểu</Label>
              <Select
                value={minAppointments}
                onValueChange={setMinAppointments}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 lần trở lên</SelectItem>
                  <SelectItem value="3">3 lần trở lên</SelectItem>
                  <SelectItem value="5">5 lần trở lên</SelectItem>
                  <SelectItem value="10">10 lần trở lên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortBy">Sắp xếp theo</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalAppointments">Số lịch hẹn</SelectItem>
                  <SelectItem value="totalSpent">Tổng chi tiêu</SelectItem>
                  <SelectItem value="lastAppointmentDate">
                    Lần khám cuối
                  </SelectItem>
                  <SelectItem value="name">Tên A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tổng số bệnh nhân</Label>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Users className="h-5 w-5" />
                {filteredPatients.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bệnh nhân ({filteredPatients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Không có bệnh nhân nào</h3>
              <p className="text-muted-foreground">
                Không tìm thấy bệnh nhân thường xuyên với tiêu chí đã chọn
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Số lịch hẹn</TableHead>
                  <TableHead>Lần khám cuối</TableHead>
                  <TableHead>Tổng chi tiêu</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead>Tình trạng sức khỏe</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={patient.user_profiles.avatar_url || ""}
                          />
                          <AvatarFallback>
                            {getPatientInitials(
                              patient.user_profiles.full_name
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {patient.user_profiles.full_name}
                          </p>
                          {patient.user_profiles.date_of_birth && (
                            <p className="text-sm text-muted-foreground">
                              {calculateAge(
                                patient.user_profiles.date_of_birth
                              )}{" "}
                              tuổi
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {patient.user_profiles.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {patient.user_profiles.phone}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {patient.totalAppointments}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {format(
                          new Date(patient.lastAppointmentDate),
                          "dd/MM/yyyy",
                          { locale: vi }
                        )}
                      </div>
                      {patient.nextFollowUpDate && (
                        <div className="text-xs text-muted-foreground">
                          Tái khám:{" "}
                          {format(
                            new Date(patient.nextFollowUpDate),
                            "dd/MM/yyyy",
                            { locale: vi }
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {patient.totalSpent.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {patient.averageRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {patient.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {patient.chronicConditions &&
                          patient.chronicConditions.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Heart className="h-3 w-3 mr-1" />
                              {patient.chronicConditions.length} bệnh mãn tính
                            </Badge>
                          )}
                        {patient.allergies && patient.allergies.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {patient.allergies.length} dị ứng
                          </Badge>
                        )}
                        {patient.lastDiagnosis && (
                          <div className="text-xs text-muted-foreground truncate max-w-32">
                            {patient.lastDiagnosis}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPatient(patient)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Chi tiết
                        </Button>

                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Patient Detail Dialog */}
      <PatientDetailDialog
        patient={selectedPatient}
        isOpen={showPatientDetail}
        onClose={() => {
          setShowPatientDetail(false);
          setSelectedPatient(null);
        }}
      />
    </div>
  );
}
