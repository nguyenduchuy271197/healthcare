"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import {
  confirmAppointment,
  rejectAppointment,
  completeAppointment,
} from "@/actions";
import { AppointmentStatus } from "@/types/custom.types";

interface AppointmentActionsProps {
  appointmentId: number;
  currentStatus: AppointmentStatus | null;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  onStatusChange?: () => void;
  className?: string;
}

export function AppointmentActions({
  appointmentId,
  currentStatus,
  patientName,
  appointmentDate,
  appointmentTime,
  onStatusChange,
  className,
}: AppointmentActionsProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleConfirm() {
    setIsConfirming(true);
    try {
      const result = await confirmAppointment(appointmentId);
      if (result.success) {
        toast({
          title: "Thành công",
          description: "Đã xác nhận lịch hẹn",
        });
        onStatusChange?.();
        router.refresh();
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể xác nhận lịch hẹn",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi xác nhận lịch hẹn",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do từ chối",
        variant: "destructive",
      });
      return;
    }

    setIsRejecting(true);
    try {
      const result = await rejectAppointment(appointmentId, rejectionReason);
      if (result.success) {
        toast({
          title: "Thành công",
          description: "Đã từ chối lịch hẹn",
        });
        setShowRejectDialog(false);
        setRejectionReason("");
        onStatusChange?.();
        router.refresh();
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể từ chối lịch hẹn",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi từ chối lịch hẹn",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  }

  async function handleComplete() {
    setIsCompleting(true);
    try {
      const result = await completeAppointment(appointmentId);
      if (result.success) {
        toast({
          title: "Thành công",
          description: "Đã hoàn thành lịch hẹn",
        });
        onStatusChange?.();
        router.refresh();
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể hoàn thành lịch hẹn",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi hoàn thành lịch hẹn",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  }

  function getStatusBadge() {
    switch (currentStatus) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Chờ xác nhận
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã xác nhận
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Hoàn thành
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Đã hủy
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            Bị từ chối
          </Badge>
        );
      default:
        return null;
    }
  }

  // Determine which actions are available based on current status
  const canConfirm = currentStatus === "pending";
  const canReject = currentStatus === "pending";
  const canComplete = currentStatus === "confirmed";

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium">Trạng thái:</span>
        {getStatusBadge()}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Confirm Button */}
        {canConfirm && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Xác nhận
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận lịch hẹn</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xác nhận lịch hẹn với bệnh nhân{" "}
                  <strong>{patientName}</strong> vào lúc{" "}
                  <strong>{appointmentTime}</strong> ngày{" "}
                  <strong>{appointmentDate}</strong>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirm}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Xác nhận
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Reject Button */}
        {canReject && (
          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive" disabled={isRejecting}>
                {isRejecting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Từ chối
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Từ chối lịch hẹn
                </DialogTitle>
                <DialogDescription>
                  Bạn đang từ chối lịch hẹn với bệnh nhân{" "}
                  <strong>{patientName}</strong> vào lúc{" "}
                  <strong>{appointmentTime}</strong> ngày{" "}
                  <strong>{appointmentDate}</strong>.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejection-reason">
                    Lý do từ chối <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Vui lòng nhập lý do từ chối lịch hẹn..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectionReason("");
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isRejecting || !rejectionReason.trim()}
                >
                  {isRejecting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Từ chối lịch hẹn
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Complete Button */}
        {canComplete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isCompleting}
              >
                {isCompleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Hoàn thành
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hoàn thành lịch hẹn</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn đánh dấu lịch hẹn với bệnh nhân{" "}
                  <strong>{patientName}</strong> là đã hoàn thành?
                  <br />
                  <br />
                  Sau khi hoàn thành, bệnh nhân có thể để lại đánh giá và bạn có
                  thể tạo hồ sơ y tế cho lần khám này.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleComplete}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Hoàn thành
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Status info for non-actionable states */}
        {!canConfirm && !canReject && !canComplete && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            {currentStatus === "completed" && "Lịch hẹn đã hoàn thành"}
            {currentStatus === "cancelled" && "Lịch hẹn đã bị hủy"}
            {currentStatus === "rejected" && "Lịch hẹn đã bị từ chối"}
          </div>
        )}
      </div>
    </div>
  );
}
