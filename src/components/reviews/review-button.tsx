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
        className={`animate-pulse bg-gray-200 rounded-lg h-9 w-24 ${className}`}
      />
    );
  }

  if (existingReview) {
    return (
      <>
        <div className={`flex items-center space-x-2 ${className}`}>
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 px-3 py-1 font-medium">
            <Star className="h-3 w-3 fill-white mr-1" />
            {existingReview.rating}/5
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFormOpen(true)}
            className="h-9 px-3 hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700 transition-colors"
          >
            <Edit className="h-3 w-3 mr-1" />
            Sửa đánh giá
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
        className={`h-9 px-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200 ${className}`}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Đánh giá bác sĩ
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
