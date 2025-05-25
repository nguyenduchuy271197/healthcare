"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Calendar,
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
    specialization: "",
    location: "",
    minRating: "",
    minExperience: "",
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
      setIsLoading(true);

      try {
        const searchFilters = {
          search: filters.search.trim() || undefined,
          specialization: filters.specialization || undefined,
          location: filters.location.trim() || undefined,
          minRating: filters.minRating
            ? parseFloat(filters.minRating)
            : undefined,
          minExperience: filters.minExperience
            ? parseInt(filters.minExperience)
            : undefined,
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
    handleSearch();
  }, [handleSearch]);

  function handleFilterChange(
    key: keyof SearchFilters,
    value: string | boolean
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters({
      search: "",
      specialization: "",
      location: "",
      minRating: "",
      minExperience: "",
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

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Tìm kiếm bác sĩ
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo tên bác sĩ, chuyên khoa..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button onClick={() => handleSearch()} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tìm kiếm
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
              <div className="space-y-2">
                <Label>Chuyên khoa</Label>
                <Select
                  value={filters.specialization}
                  onValueChange={(value) =>
                    handleFilterChange("specialization", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chuyên khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả chuyên khoa</SelectItem>
                    {SPECIALIZATIONS.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Địa điểm</Label>
                <Input
                  placeholder="Nhập địa chỉ phòng khám"
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Đánh giá tối thiểu</Label>
                <Select
                  value={filters.minRating}
                  onValueChange={(value) =>
                    handleFilterChange("minRating", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đánh giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả đánh giá</SelectItem>
                    <SelectItem value="4">4+ sao</SelectItem>
                    <SelectItem value="3">3+ sao</SelectItem>
                    <SelectItem value="2">2+ sao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kinh nghiệm tối thiểu (năm)</Label>
                <Select
                  value={filters.minExperience}
                  onValueChange={(value) =>
                    handleFilterChange("minExperience", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kinh nghiệm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="1">1+ năm</SelectItem>
                    <SelectItem value="3">3+ năm</SelectItem>
                    <SelectItem value="5">5+ năm</SelectItem>
                    <SelectItem value="10">10+ năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Phí khám tối đa (VNĐ)</Label>
                <Input
                  type="number"
                  placeholder="Nhập phí khám tối đa"
                  value={filters.maxFee}
                  onChange={(e) => handleFilterChange("maxFee", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={clearFilters}>
                  Xóa bộ lọc
                </Button>
                <Button onClick={() => handleSearch()}>Áp dụng bộ lọc</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Kết quả tìm kiếm ({total} bác sĩ)
          </h2>
        </div>

        {isLoading && doctors.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : doctors.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleDoctorClick(doctor.id)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Doctor Info */}
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={doctor.user_profiles.avatar_url || ""}
                            alt={doctor.user_profiles.full_name}
                          />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">
                            {doctor.user_profiles.full_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specialization || "Bác sĩ đa khoa"}
                          </p>
                          {doctor.qualification && (
                            <p className="text-xs text-muted-foreground">
                              {doctor.qualification}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Rating and Experience */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {getRatingStars(doctor.average_rating || 0)}
                          <span className="text-sm text-muted-foreground ml-1">
                            ({doctor.total_reviews || 0})
                          </span>
                        </div>
                        <Badge variant="secondary">
                          {doctor.experience_years || 0} năm KN
                        </Badge>
                      </div>

                      {/* Location */}
                      {doctor.clinic_address && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">
                            {doctor.clinic_address}
                          </span>
                        </div>
                      )}

                      {/* Fee and Availability */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-sm">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            {doctor.consultation_fee?.toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </span>
                        </div>
                        <Badge
                          variant={
                            doctor.is_available ? "default" : "secondary"
                          }
                        >
                          {doctor.is_available
                            ? "Có thể đặt lịch"
                            : "Không khả dụng"}
                        </Badge>
                      </div>

                      {/* Action Button */}
                      <Button
                        className="w-full"
                        disabled={!doctor.is_available}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Xem chi tiết & Đặt lịch
                      </Button>
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
                  onClick={() => handleSearch(true)}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Xem thêm bác sĩ
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">
                Không tìm thấy bác sĩ
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
