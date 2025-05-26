"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, TrendingUp, MessageSquare, User, Eye } from "lucide-react";
import { getDoctorReviews } from "@/actions";

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  recentReviews: Array<{
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
  }>;
  ratingDistribution: number[];
}

export function DoctorReviewsWidget() {
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviewSummary();
  }, []);

  async function loadReviewSummary() {
    try {
      // Get current user's reviews (doctor)
      const result = await getDoctorReviews("", { limit: 3 }); // Empty string will use current user

      if (result.success && result.data) {
        // Calculate rating distribution
        const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
        result.data.forEach((review) => {
          if (review.rating >= 1 && review.rating <= 5) {
            distribution[review.rating - 1]++;
          }
        });

        setReviewSummary({
          averageRating: result.averageRating || 0,
          totalReviews: result.total || 0,
          recentReviews: result.data.slice(0, 3),
          ratingDistribution: distribution,
        });
      }
    } catch (error) {
      console.error("Error loading review summary:", error);
    } finally {
      setIsLoading(false);
    }
  }

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
      month: "short",
      day: "numeric",
    });
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5" />
            Đánh giá gần đây
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!reviewSummary) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Không thể tải đánh giá
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5" />
            Đánh giá gần đây
          </CardTitle>
          <Link href="/reviews">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Xem tất cả
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating Summary */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-primary">
              {reviewSummary.averageRating.toFixed(1)}
            </div>
            <div>
              <div className="flex items-center space-x-1">
                {getRatingStars(reviewSummary.averageRating)}
              </div>
              <p className="text-xs text-muted-foreground">
                {reviewSummary.totalReviews} đánh giá
              </p>
            </div>
          </div>
          {reviewSummary.totalReviews > 0 && (
            <div className="flex items-center space-x-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">
                {(
                  ((reviewSummary.ratingDistribution[4] +
                    reviewSummary.ratingDistribution[3]) /
                    reviewSummary.totalReviews) *
                  100
                ).toFixed(0)}
                %
              </span>
              <span className="text-xs text-muted-foreground">tích cực</span>
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        {reviewSummary.recentReviews.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Chưa có đánh giá nào
            </p>
            <p className="text-xs text-muted-foreground">
              Hoàn thành cuộc hẹn để nhận đánh giá từ bệnh nhân
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewSummary.recentReviews.map((review) => (
              <div key={review.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      review.is_anonymous
                        ? ""
                        : review.patients?.user_profiles.avatar_url || ""
                    }
                    alt={
                      review.is_anonymous
                        ? "Ẩn danh"
                        : review.patients?.user_profiles.full_name ||
                          "Bệnh nhân"
                    }
                  />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">
                        {review.is_anonymous
                          ? "Bệnh nhân ẩn danh"
                          : review.patients?.user_profiles.full_name ||
                            "Bệnh nhân"}
                      </p>
                      <div className="flex items-center space-x-1">
                        {getRatingStars(review.rating, "h-3 w-3")}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Link */}
        {reviewSummary.totalReviews > 3 && (
          <div className="pt-2 border-t">
            <Link href="/reviews">
              <Button variant="ghost" size="sm" className="w-full">
                Xem thêm {reviewSummary.totalReviews - 3} đánh giá
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
