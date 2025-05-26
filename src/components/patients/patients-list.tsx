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
  AlertTriangle,
  Heart,
  Filter,
  UserPlus,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getRegularPatients } from "@/actions";
import { PatientDetailDialog } from "./patient-detail-dialog";

interface Patient {
  id: string;
  user_profiles: {
    full_name: string;
    phone?: string | null;
    date_of_birth?: string | null;
    avatar_url?: string | null;
    gender?: string | null;
    address?: string | null;
  };
  totalAppointments: number;
  lastAppointmentDate: string;
  totalSpent: number;
  averageRating?: number;
  chronicConditions?: string[];
  allergies?: string[];
  lastDiagnosis?: string;
  nextFollowUpDate?: string;
  blood_type?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
}

export function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("lastAppointmentDate");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      // Lấy tất cả bệnh nhân (minAppointments = 0)
      const result = await getRegularPatients(0);
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
      console.error("Error fetching patients:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi tải danh sách bệnh nhân",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    const filtered = patients.filter((patient) => {
      const matchesSearch =
        patient.user_profiles.full_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.user_profiles.phone?.includes(searchTerm) ||
        patient.lastDiagnosis?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = (() => {
        switch (filterType) {
          case "regular":
            return patient.totalAppointments >= 3;
          case "new":
            return patient.totalAppointments <= 1;
          case "chronic":
            return (
              patient.chronicConditions && patient.chronicConditions.length > 0
            );
          case "followup":
            return (
              patient.nextFollowUpDate &&
              new Date(patient.nextFollowUpDate) > new Date()
            );
          default:
            return true;
        }
      })();

      return matchesSearch && matchesFilter;
    });

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
  }, [patients, searchTerm, filterType, sortBy]);

  function calculateAge(dateOfBirth?: string | null) {
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

  function getPatientTypeLabel(patient: Patient) {
    if (patient.totalAppointments >= 5)
      return { label: "VIP", color: "bg-purple-100 text-purple-800" };
    if (patient.totalAppointments >= 3)
      return { label: "Thường xuyên", color: "bg-blue-100 text-blue-800" };
    if (patient.totalAppointments <= 1)
      return { label: "Mới", color: "bg-green-100 text-green-800" };
    return { label: "Bình thường", color: "bg-gray-100 text-gray-800" };
  }

  function handleExportPatients() {
    if (filteredPatients.length === 0) return;

    const csvContent = [
      ["Danh sách bệnh nhân"],
      [""],
      [
        "Họ tên",
        "Số điện thoại",
        "Tuổi",
        "Giới tính",
        "Nhóm máu",
        "Số lịch hẹn",
        "Lần khám cuối",
        "Tổng chi tiêu",
        "Loại bệnh nhân",
        "Chẩn đoán cuối",
      ],
      ...filteredPatients.map((patient) => [
        patient.user_profiles.full_name,
        patient.user_profiles.phone || "",
        patient.user_profiles.date_of_birth
          ? calculateAge(patient.user_profiles.date_of_birth)?.toString() || ""
          : "",
        patient.user_profiles.gender || "",
        patient.blood_type || "",
        patient.totalAppointments.toString(),
        format(new Date(patient.lastAppointmentDate), "dd/MM/yyyy", {
          locale: vi,
        }),
        `${patient.totalSpent.toLocaleString("vi-VN")}đ`,
        getPatientTypeLabel(patient).label,
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
      `danh-sach-benh-nhan-${format(new Date(), "dd-MM-yyyy")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Xuất file thành công",
      description: `Đã xuất ${filteredPatients.length} bệnh nhân`,
    });
  }

  function handleViewPatient(patient: Patient) {
    setSelectedPatient(patient);
    setShowPatientDetail(true);
  }

  const stats = {
    total: patients.length,
    regular: patients.filter((p) => p.totalAppointments >= 3).length,
    new: patients.filter((p) => p.totalAppointments <= 1).length,
    chronic: patients.filter(
      (p) => p.chronicConditions && p.chronicConditions.length > 0
    ).length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Tổng bệnh nhân
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {stats.total}
            </div>
            <p className="text-xs text-blue-600">Tất cả bệnh nhân</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Bệnh nhân thường xuyên
            </CardTitle>
            <Heart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {stats.regular}
            </div>
            <p className="text-xs text-green-600">≥3 lần khám</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Bệnh nhân mới
            </CardTitle>
            <UserPlus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {stats.new}
            </div>
            <p className="text-xs text-purple-600">≤1 lần khám</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Bệnh mãn tính
            </CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {stats.chronic}
            </div>
            <p className="text-xs text-orange-600">Cần theo dõi</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Danh sách bệnh nhân
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý thông tin và theo dõi bệnh nhân
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-blue-50 border-blue-200" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPatients}
                disabled={filteredPatients.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPatients}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên, số điện thoại, chẩn đoán..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastAppointmentDate">
                      Lần khám cuối
                    </SelectItem>
                    <SelectItem value="totalAppointments">
                      Số lần khám
                    </SelectItem>
                    <SelectItem value="totalSpent">Tổng chi tiêu</SelectItem>
                    <SelectItem value="name">Tên A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Loại bệnh nhân
                    </Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="regular">Thường xuyên</SelectItem>
                        <SelectItem value="new">Mới</SelectItem>
                        <SelectItem value="chronic">Bệnh mãn tính</SelectItem>
                        <SelectItem value="followup">Cần tái khám</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Hiển thị {filteredPatients.length} / {patients.length} bệnh nhân
            </span>
          </div>

          {/* Patients Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Thông tin liên hệ</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Số lần khám</TableHead>
                  <TableHead>Lần khám cuối</TableHead>
                  <TableHead>Tổng chi tiêu</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => {
                  const age = calculateAge(patient.user_profiles.date_of_birth);
                  const patientType = getPatientTypeLabel(patient);

                  return (
                    <TableRow key={patient.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={patient.user_profiles.avatar_url || ""}
                              alt={patient.user_profiles.full_name}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {getPatientInitials(
                                patient.user_profiles.full_name
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">
                              {patient.user_profiles.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {age ? `${age} tuổi` : "Chưa có thông tin tuổi"}
                              {patient.user_profiles.gender &&
                                ` • ${patient.user_profiles.gender}`}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {patient.user_profiles.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {patient.user_profiles.phone}
                            </div>
                          )}
                          {patient.blood_type && (
                            <Badge variant="outline" className="text-xs">
                              {patient.blood_type}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={patientType.color}>
                          {patientType.label}
                        </Badge>
                        {patient.chronicConditions &&
                          patient.chronicConditions.length > 0 && (
                            <div className="mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs bg-red-50 text-red-700 border-red-200"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Mãn tính
                              </Badge>
                            </div>
                          )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
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
                            {
                              locale: vi,
                            }
                          )}
                        </div>
                        {patient.lastDiagnosis && (
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-32">
                            {patient.lastDiagnosis}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-700">
                            {patient.totalSpent.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPatient(patient)}
                          className="hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy bệnh nhân
                </h3>
                <p className="text-gray-600">
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Detail Dialog */}
      {selectedPatient && (
        <PatientDetailDialog
          patient={selectedPatient}
          isOpen={showPatientDetail}
          onClose={() => setShowPatientDetail(false)}
        />
      )}
    </div>
  );
}
