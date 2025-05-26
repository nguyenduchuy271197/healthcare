"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  User,
  Loader2,
  MessageSquare,
  Calendar,
  TrendingUp,
  Filter,
  BarChart3,
} from "lucide-react";
import { getDoctorReviews } from "@/actions";

interface DoctorReview {
  id: number;
  rating: number;
  comment?: string | null;
  is_anonymous?: boolean | null;
  created_at: string | null;
  patients: {
    user_profiles: {
      full_name: string;
      avatar_url?: string | null;
    };
  };
}

interface DoctorReviewsListProps {
  doctorId?: string;
}

export function DoctorReviewsList({ doctorId }: DoctorReviewsListProps) {
  const [reviews, setReviews] = useState<DoctorReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [filterRating, setFilterRating] = useState<string>("all");
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 10;

  const loadReviews = useCallback(
    async (reset = true) => {
      if (reset) {
        setIsLoading(true);
        setPage(0);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await getDoctorReviews(doctorId || "", {
          limit: ITEMS_PER_PAGE,
          offset: reset ? 0 : (page + 1) * ITEMS_PER_PAGE,
        });

        if (result.success && result.data) {
          let filteredData = result.data;

          // Apply rating filter
          if (filterRating !== "all") {
            const targetRating = parseInt(filterRating);
            filteredData = result.data.filter(
              (review) => review.rating === targetRating
            );
          }

          if (reset) {
            setReviews(filteredData);
            setPage(0);
          } else {
            setReviews((prev) => [...prev, ...filteredData]);
            setPage((prev) => prev + 1);
          }
          setTotal(result.total || 0);
          setAverageRating(result.averageRating || 0);
        } else {
          toast({
            title: "Lỗi tải đánh giá",
            description: result.error || "Không thể tải danh sách đánh giá.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Lỗi hệ thống",
          description: "Có lỗi xảy ra khi tải đánh giá.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [doctorId, filterRating, page, toast]
  );

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  function getRatingStars(rating: number, size = "h-4 w-4") {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getRatingDistribution() {
    const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    return distribution;
  }

  const hasMoreReviews = reviews.length < total;
  const distribution = getRatingDistribution();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
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
          <h2 className="text-2xl font-bold">Đánh giá từ bệnh nhân</h2>
          <p className="text-muted-foreground">
            Xem và quản lý các đánh giá bạn nhận được ({total})
          </p>
        </div>
      </div>

      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tổng quan đánh giá
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                {getRatingStars(averageRating, "h-5 w-5")}
              </div>
              <p className="text-sm text-muted-foreground">
                Dựa trên {total} đánh giá
              </p>
              {total > 0 && (
                <div className="flex items-center justify-center space-x-1 text-green-600 mt-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {(
                      ((distribution[4] + distribution[3]) / total) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                  <span className="text-xs text-muted-foreground">
                    tích cực
                  </span>
                </div>
              )}
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = distribution[stars - 1];
                const percentage = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={stars} className="flex items-center space-x-2">
                    <span className="text-sm w-6">{stars}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Lọc theo:</span>
            </div>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Chọn số sao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="5">5 sao</SelectItem>
                <SelectItem value="4">4 sao</SelectItem>
                <SelectItem value="3">3 sao</SelectItem>
                <SelectItem value="2">2 sao</SelectItem>
                <SelectItem value="1">1 sao</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">
              {filterRating === "all"
                ? "Chưa có đánh giá"
                : "Không có đánh giá phù hợp"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {filterRating === "all"
                ? "Bạn chưa nhận được đánh giá nào từ bệnh nhân."
                : "Thử thay đổi bộ lọc để xem các đánh giá khác."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Review Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={
                              review.is_anonymous
                                ? ""
                                : review.patients?.user_profiles.avatar_url ||
                                  ""
                            }
                            alt={
                              review.is_anonymous
                                ? "Ẩn danh"
                                : review.patients?.user_profiles.full_name ||
                                  "Bệnh nhân"
                            }
                          />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-lg">
                            {review.is_anonymous
                              ? "Bệnh nhân ẩn danh"
                              : review.patients?.user_profiles.full_name ||
                                "Bệnh nhân"}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              {getRatingStars(review.rating)}
                            </div>
                            <span className="text-sm font-medium">
                              {review.rating}/5
                            </span>
                            {review.is_anonymous && (
                              <Badge variant="secondary" className="text-xs">
                                Ẩn danh
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(review.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    {review.comment && (
                      <div className="bg-background border rounded-lg p-4">
                        <p className="text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {hasMoreReviews && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => loadReviews(false)}
                disabled={isLoadingMore}
              >
                {isLoadingMore && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Xem thêm đánh giá
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
