"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare, Edit } from "lucide-react";
import { ReviewForm } from "./review-form";
import { createClient } from "@/lib/supabase/client";

interface ReviewButtonProps {
  appointmentId: number;
  doctorName: string;
  appointmentStatus: string;
  className?: string;
}

interface ExistingReview {
  id: number;
  rating: number;
  comment?: string | null;
  is_anonymous?: boolean | null;
}

export function ReviewButton({
  appointmentId,
  doctorName,
  appointmentStatus,
  className,
}: ReviewButtonProps) {
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkExistingReview = useCallback(async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, is_anonymous")
        .eq("appointment_id", appointmentId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking review:", error);
        return;
      }

      if (data) {
        setExistingReview(data);
      }
    } catch (error) {
      console.error("Error checking existing review:", error);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    checkExistingReview();
  }, [checkExistingReview]);

  function handleSuccess() {
    checkExistingReview();
    toast({
      title: "Thành công",
      description: existingReview
        ? "Đánh giá đã được cập nhật"
        : "Đánh giá đã được gửi",
    });
  }

  // Only show for completed appointments
  if (appointmentStatus !== "completed") {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className={`animate-pulse bg-gray-200 rounded h-8 w-20 ${className}`}
      />
    );
  }

  if (existingReview) {
    return (
      <>
        <div className={`flex items-center space-x-2 ${className}`}>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{existingReview.rating}/5</span>
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFormOpen(true)}
            className="h-8 px-2"
          >
            <Edit className="h-3 w-3 mr-1" />
            Sửa
          </Button>
        </div>

        <ReviewForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleSuccess}
          existingReview={existingReview}
          doctorName={doctorName}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsFormOpen(true)}
        className={`h-8 ${className}`}
      >
        <MessageSquare className="h-3 w-3 mr-1" />
        Đánh giá
      </Button>

      <ReviewForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleSuccess}
        appointmentId={appointmentId}
        doctorName={doctorName}
      />
    </>
  );
}
