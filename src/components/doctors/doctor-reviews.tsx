"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Star, User, Loader2, MessageSquare, Calendar } from "lucide-react";
import { Review } from "@/types/custom.types";
import { getDoctorReviews } from "@/actions";

interface DoctorReviewsProps {
  doctorId: string;
  initialReviews: (Review & {
    patients: {
      user_profiles: {
        full_name: string;
        avatar_url?: string | null;
      };
    };
  })[];
  initialTotal: number;
  averageRating: number;
}

export function DoctorReviews({
  doctorId,
  initialReviews,
  initialTotal,
  averageRating,
}: DoctorReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 10;

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

  function getRatingDistribution() {
    const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    return distribution;
  }

  async function loadMoreReviews() {
    setIsLoading(true);

    try {
      const result = await getDoctorReviews(doctorId, {
        limit: ITEMS_PER_PAGE,
        offset: (page + 1) * ITEMS_PER_PAGE,
      });

      if (result.success && result.data) {
        setReviews((prev) => [...prev, ...result.data!]);
        setPage((prev) => prev + 1);
      } else {
        toast({
          title: "Lỗi tải đánh giá",
          description: result.error || "Không thể tải thêm đánh giá.",
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
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const distribution = getRatingDistribution();
  const hasMoreReviews = reviews.length < initialTotal;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
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
                Dựa trên {initialTotal} đánh giá
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = distribution[stars - 1];
                const percentage =
                  initialTotal > 0 ? (count / initialTotal) * 100 : 0;

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

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Đánh giá từ bệnh nhân ({initialTotal})
          </h2>
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Chưa có đánh giá</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Bác sĩ này chưa có đánh giá nào từ bệnh nhân
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
                          <Avatar className="h-10 w-10">
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
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {review.is_anonymous
                                ? "Bệnh nhân ẩn danh"
                                : review.patients?.user_profiles.full_name ||
                                  "Bệnh nhân"}
                            </p>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                {getRatingStars(review.rating)}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(review.created_at!)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Review Content */}
                      {review.comment && (
                        <div className="pl-13">
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
                  onClick={loadMoreReviews}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Xem thêm đánh giá
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
