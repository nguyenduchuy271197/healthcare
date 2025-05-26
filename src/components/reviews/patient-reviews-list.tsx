"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  Loader2,
  MessageSquare,
  Calendar,
  Edit,
  Trash2,
  Stethoscope,
} from "lucide-react";
import { Review } from "@/types/custom.types";
import { getPatientReviews, deleteReview } from "@/actions";
import { ReviewForm } from "./review-form";

interface PatientReviewsListProps {
  patientId?: string;
}

type PatientReview = Review & {
  doctors: {
    user_profiles: {
      full_name: string;
      avatar_url?: string | null;
    };
    specialization?: string | null;
  };
  appointments: {
    appointment_date: string;
    appointment_time: string;
    reason: string;
  };
};

export function PatientReviewsList({ patientId }: PatientReviewsListProps) {
  const [reviews, setReviews] = useState<PatientReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [editingReview, setEditingReview] = useState<PatientReview | null>(
    null
  );
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
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
        const result = await getPatientReviews(patientId, {
          limit: ITEMS_PER_PAGE,
          offset: reset ? 0 : (page + 1) * ITEMS_PER_PAGE,
        });

        if (result.success && result.data) {
          if (reset) {
            setReviews(result.data);
            setPage(0);
          } else {
            setReviews((prev) => [...prev, ...result.data!]);
            setPage((prev) => prev + 1);
          }
          setTotal(result.total || 0);
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
    [patientId, page, toast]
  );

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  async function handleDeleteReview(reviewId: number) {
    try {
      const result = await deleteReview(reviewId);

      if (result.success) {
        toast({
          title: "Xóa thành công",
          description: "Đánh giá đã được xóa.",
        });
        setReviews((prev) => prev.filter((review) => review.id !== reviewId));
        setTotal((prev) => prev - 1);
      } else {
        toast({
          title: "Lỗi xóa đánh giá",
          description: result.error || "Không thể xóa đánh giá.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi xóa đánh giá.",
        variant: "destructive",
      });
    } finally {
      setDeletingReviewId(null);
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

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatDateTime(date: string, time: string) {
    const appointmentDate = new Date(`${date}T${time}`);
    return appointmentDate.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const hasMoreReviews = reviews.length < total;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Đánh giá của tôi</h2>
          <p className="text-muted-foreground">
            Quản lý các đánh giá bạn đã gửi cho bác sĩ ({total})
          </p>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Chưa có đánh giá</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Bạn chưa đánh giá bác sĩ nào. Hãy hoàn thành cuộc hẹn và đánh giá
              bác sĩ.
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
                            src={review.doctors.user_profiles.avatar_url || ""}
                            alt={review.doctors.user_profiles.full_name}
                          />
                          <AvatarFallback>
                            <Stethoscope className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-lg">
                            Bác sĩ {review.doctors.user_profiles.full_name}
                          </p>
                          {review.doctors.specialization && (
                            <p className="text-sm text-muted-foreground">
                              {review.doctors.specialization}
                            </p>
                          )}
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
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingReview(review)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingReviewId(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Appointment Info */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Cuộc hẹn:{" "}
                          {formatDateTime(
                            review.appointments.appointment_date,
                            review.appointments.appointment_time
                          )}
                        </span>
                      </div>
                      <p className="text-sm mt-1">
                        <strong>Lý do khám:</strong>{" "}
                        {review.appointments.reason}
                      </p>
                    </div>

                    {/* Review Content */}
                    {review.comment && (
                      <div className="bg-background border rounded-lg p-4">
                        <p className="text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    )}

                    {/* Review Date */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Đánh giá vào {formatDate(review.created_at!)}</span>
                      {review.updated_at !== review.created_at && (
                        <span>Cập nhật {formatDate(review.updated_at!)}</span>
                      )}
                    </div>
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

      {/* Edit Review Dialog */}
      {editingReview && (
        <ReviewForm
          isOpen={!!editingReview}
          onClose={() => setEditingReview(null)}
          onSuccess={() => {
            loadReviews();
            setEditingReview(null);
          }}
          existingReview={{
            id: editingReview.id,
            rating: editingReview.rating,
            comment: editingReview.comment,
            is_anonymous: editingReview.is_anonymous,
          }}
          doctorName={editingReview.doctors.user_profiles.full_name}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingReviewId}
        onOpenChange={() => setDeletingReviewId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đánh giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingReviewId && handleDeleteReview(deletingReviewId)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
