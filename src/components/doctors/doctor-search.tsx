"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MapPin,
  Star,
  DollarSign,
  Filter,
  Loader2,
  User,
  Stethoscope,
  GraduationCap,
  Clock,
  X,
} from "lucide-react";
import { Doctor } from "@/types/custom.types";
import { searchDoctors } from "@/actions";

const SPECIALIZATIONS = [
  "Nội khoa",
  "Ngoại khoa",
  "Sản phụ khoa",
  "Nhi khoa",
  "Tim mạch",
  "Thần kinh",
  "Da liễu",
  "Mắt",
  "Tai mũi họng",
  "Răng hàm mặt",
  "Tâm lý",
  "Dinh dưỡng",
  "Vật lý trị liệu",
  "Y học cổ truyền",
];

interface SearchFilters {
  search: string;
  specialization: string;
  location: string;
  minRating: string;
  minExperience: string;
  maxFee: string;
  isAvailable: boolean;
}

export function DoctorSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    specialization: "all",
    location: "",
    minRating: "all",
    minExperience: "all",
    maxFee: "",
    isAvailable: true,
  });

  const [doctors, setDoctors] = useState<
    (Doctor & {
      user_profiles: {
        full_name: string;
        avatar_url?: string | null;
      };
    })[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 12;

  const handleSearch = useCallback(
    async (loadMore = false) => {
      if (!loadMore) {
        setIsLoading(true);
      }

      try {
        const searchFilters = {
          specialization:
            filters.specialization === "all"
              ? undefined
              : filters.specialization,
          location: filters.location.trim() || undefined,
          minRating:
            filters.minRating === "all"
              ? undefined
              : parseFloat(filters.minRating),
          minExperience:
            filters.minExperience === "all"
              ? undefined
              : parseInt(filters.minExperience),
          maxFee: filters.maxFee ? parseFloat(filters.maxFee) : undefined,
          isAvailable: filters.isAvailable,
          limit: ITEMS_PER_PAGE,
          offset: loadMore ? (page + 1) * ITEMS_PER_PAGE : 0,
        };

        const result = await searchDoctors(searchFilters);

        if (result.success && result.data) {
          if (loadMore) {
            setDoctors((prev) => [...prev, ...result.data!]);
            setPage((prev) => prev + 1);
          } else {
            setDoctors(result.data);
            setPage(0);
          }
          setTotal(result.total || 0);
        } else {
          toast({
            title: "Lỗi tìm kiếm",
            description: result.error || "Có lỗi xảy ra khi tìm kiếm bác sĩ.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Lỗi hệ thống",
          description: "Có lỗi xảy ra. Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [filters, page, toast]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [filters, handleSearch]);

  function handleFilterChange(
    key: keyof SearchFilters,
    value: string | boolean
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters({
      search: "",
      specialization: "all",
      location: "",
      minRating: "all",
      minExperience: "all",
      maxFee: "",
      isAvailable: true,
    });
  }

  function getRatingStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  }

  function handleDoctorClick(doctorId: string) {
    router.push(`/doctors/${doctorId}`);
  }

  function getActiveFiltersCount() {
    let count = 0;
    if (filters.specialization !== "all") count++;
    if (filters.location.trim()) count++;
    if (filters.minRating !== "all") count++;
    if (filters.minExperience !== "all") count++;
    if (filters.maxFee.trim()) count++;
    return count;
  }

  return (
    <div className="space-y-4">
      {/* Filters and Results Header */}
      <div className="flex items-center justify-between">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 ${
              showFilters ? "bg-blue-500 text-white border-blue-500" : ""
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc
            {getActiveFiltersCount() > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </div>

        {/* Results Count */}
        {total > 0 && (
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 rounded-full p-2">
              <Search className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">
              Tìm thấy <span className="font-bold text-blue-600">{total}</span>{" "}
              bác sĩ
            </p>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Bộ lọc nâng cao
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Chuyên khoa
                </Label>
                <Select
                  value={filters.specialization}
                  onValueChange={(value) =>
                    handleFilterChange("specialization", value)
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Chọn chuyên khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả chuyên khoa</SelectItem>
                    {SPECIALIZATIONS.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Địa điểm
                </Label>
                <Input
                  placeholder="Nhập địa chỉ phòng khám"
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Đánh giá tối thiểu
                </Label>
                <Select
                  value={filters.minRating}
                  onValueChange={(value) =>
                    handleFilterChange("minRating", value)
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Chọn đánh giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả đánh giá</SelectItem>
                    <SelectItem value="4">4+ sao</SelectItem>
                    <SelectItem value="3">3+ sao</SelectItem>
                    <SelectItem value="2">2+ sao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Kinh nghiệm tối thiểu
                </Label>
                <Select
                  value={filters.minExperience}
                  onValueChange={(value) =>
                    handleFilterChange("minExperience", value)
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Chọn kinh nghiệm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="1">1+ năm</SelectItem>
                    <SelectItem value="3">3+ năm</SelectItem>
                    <SelectItem value="5">5+ năm</SelectItem>
                    <SelectItem value="10">10+ năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Phí khám tối đa (VNĐ)
                </Label>
                <Input
                  type="number"
                  placeholder="Nhập phí khám tối đa"
                  value={filters.maxFee}
                  onChange={(e) => handleFilterChange("maxFee", e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </Button>
              <Button
                onClick={() => handleSearch()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Áp dụng bộ lọc
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="space-y-6">
        {isLoading && doctors.length === 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 rounded-full bg-gray-200 animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : doctors.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50/50 overflow-hidden"
                  onClick={() => handleDoctorClick(doctor.id)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Doctor Header */}
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <Avatar className="h-14 w-14 ring-2 ring-white shadow-lg group-hover:scale-105 transition-transform">
                            <AvatarImage
                              src={doctor.user_profiles.avatar_url || ""}
                              alt={doctor.user_profiles.full_name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              <User className="h-7 w-7" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                            <Stethoscope className="h-3 w-3 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {doctor.user_profiles.full_name}
                          </h3>
                          <p className="text-sm font-medium text-blue-600">
                            {doctor.specialization || "Bác sĩ đa khoa"}
                          </p>
                          {doctor.qualification && (
                            <div className="flex items-center space-x-1 mt-1">
                              <GraduationCap className="h-3 w-3 text-gray-400" />
                              <p className="text-xs text-gray-500 truncate">
                                {doctor.qualification}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Rating and Experience */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center space-x-1">
                            {getRatingStars(doctor.average_rating || 0)}
                          </div>
                          <span className="text-sm font-medium text-gray-600 ml-1">
                            ({doctor.total_reviews || 0})
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-purple-500" />
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs font-medium">
                            {doctor.experience_years || 0} năm KN
                          </Badge>
                        </div>
                      </div>

                      {/* Location */}
                      {doctor.clinic_address && (
                        <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                          <div className="flex items-center space-x-2">
                            <div className="bg-orange-500 rounded-full p-1">
                              <MapPin className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                              Địa chỉ
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                            {doctor.clinic_address}
                          </p>
                        </div>
                      )}

                      {/* Fee and Availability */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div className="bg-green-500 rounded-full p-1">
                            <DollarSign className="h-3 w-3 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                              Phí khám
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {doctor.consultation_fee?.toLocaleString("vi-VN")}{" "}
                              VNĐ
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`font-medium px-3 py-1 ${
                            doctor.is_available
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {doctor.is_available ? "Khả dụng" : "Bận"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {doctors.length < total && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleSearch(true)}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 text-blue-700 hover:text-blue-800 px-8 py-3"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  Xem thêm bác sĩ ({doctors.length}/{total})
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
            <CardContent className="text-center py-16">
              <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy bác sĩ
              </h3>
              <p className="text-gray-600 mb-6">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy bác sĩ phù
                hợp
              </p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
              >
                <X className="h-4 w-4 mr-2" />
                Xóa tất cả bộ lọc
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
