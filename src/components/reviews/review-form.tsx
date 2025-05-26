"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Star, Loader2 } from "lucide-react";
import { createReview, updateReview } from "@/actions";

const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Vui lòng chọn số sao")
    .max(5, "Số sao tối đa là 5"),
  comment: z.string().optional(),
  isAnonymous: z.boolean().optional().default(false),
});

type ReviewFormData = {
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
};

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointmentId?: number;
  existingReview?: {
    id: number;
    rating: number;
    comment?: string | null;
    is_anonymous?: boolean | null;
  };
  doctorName: string;
}

export function ReviewForm({
  isOpen,
  onClose,
  onSuccess,
  appointmentId,
  existingReview,
  doctorName,
}: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(
    existingReview?.rating || 0
  );
  const { toast } = useToast();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || "",
      isAnonymous: existingReview?.is_anonymous || false,
    },
  });

  const isEditing = !!existingReview;

  async function onSubmit(data: ReviewFormData) {
    if (!appointmentId && !existingReview) {
      toast({
        title: "Lỗi",
        description: "Thiếu thông tin cuộc hẹn",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let result;

      if (isEditing && existingReview) {
        result = await updateReview(existingReview.id, {
          rating: data.rating,
          comment: data.comment,
          isAnonymous: data.isAnonymous,
        });
      } else {
        result = await createReview({
          appointmentId: appointmentId!,
          rating: data.rating,
          comment: data.comment,
          isAnonymous: data.isAnonymous,
        });
      }

      if (result.success) {
        toast({
          title: isEditing ? "Cập nhật thành công" : "Đánh giá thành công",
          description: isEditing
            ? "Đánh giá của bạn đã được cập nhật"
            : "Cảm ơn bạn đã đánh giá bác sĩ",
        });
        onSuccess();
        onClose();
        form.reset();
        setSelectedRating(0);
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Có lỗi xảy ra khi gửi đánh giá",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleStarClick(rating: number) {
    setSelectedRating(rating);
    form.setValue("rating", rating);
  }

  function handleClose() {
    if (!isSubmitting) {
      onClose();
      form.reset();
      setSelectedRating(existingReview?.rating || 0);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa đánh giá" : "Đánh giá bác sĩ"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Đánh giá cho bác sĩ {doctorName}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating Stars */}
            <FormField
              control={form.control}
              name="rating"
              render={() => (
                <FormItem>
                  <FormLabel>Đánh giá *</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= selectedRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 hover:text-yellow-300"
                            }`}
                          />
                        </button>
                      ))}
                      {selectedRating > 0 && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          {selectedRating}/5 sao
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhận xét (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Chia sẻ trải nghiệm của bạn với bác sĩ..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Anonymous Option */}
            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Đánh giá ẩn danh</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Tên của bạn sẽ không hiển thị công khai
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedRating === 0}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Cập nhật" : "Gửi đánh giá"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
