"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  Users,
  FileText,
  BarChart3,
  Clock,
  Stethoscope,
  Home,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Bell,
  Pill,
} from "lucide-react";
import { Profile } from "@/types/custom.types";

interface SidebarProps {
  userProfile: Profile | null;
  className?: string;
}

export function Sidebar({ userProfile, className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (!userProfile) return null;

  const patientNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Tìm bác sĩ",
      href: "/doctors",
      icon: UserCheck,
    },
    {
      title: "Lịch hẹn",
      href: "/appointments",
      icon: Calendar,
    },
    {
      title: "Hồ sơ Y tế",
      href: "/medical-records",
      icon: FileText,
    },
    {
      title: "Đơn thuốc",
      href: "/prescriptions",
      icon: Pill,
    },
    {
      title: "Thanh toán",
      href: "/payments",
      icon: CreditCard,
    },
    {
      title: "Thông báo",
      href: "/notifications",
      icon: Bell,
    },
  ];

  const doctorNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Quản lý lịch hẹn",
      href: "/appointments/manage",
      icon: Calendar,
    },
    {
      title: "Bệnh nhân thường xuyên",
      href: "/patients/regular",
      icon: Users,
    },
    {
      title: "Đơn thuốc",
      href: "/prescriptions",
      icon: Pill,
    },
    {
      title: "Thanh toán",
      href: "/payments",
      icon: CreditCard,
    },
    {
      title: "Báo cáo doanh thu",
      href: "/reports/revenue",
      icon: BarChart3,
    },
    {
      title: "Lịch làm việc",
      href: "/schedule",
      icon: Clock,
    },
    {
      title: "Thông báo",
      href: "/notifications",
      icon: Bell,
    },
  ];

  const navItems =
    userProfile.role === "doctor" ? doctorNavItems : patientNavItems;

  return (
    <TooltipProvider>
      <div
        className={cn(
          "transition-all duration-300 flex flex-col h-full",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        <div className="flex items-center justify-between px-4 border-b h-14">
          {!collapsed && (
            <div className="flex items-center">
              <Stethoscope className="h-6 w-6 mr-2" />
              <h2 className="text-lg font-semibold tracking-tight">
                HealthCare
              </h2>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 flex-shrink-0 hidden md:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              const buttonContent = (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full h-10 mb-1",
                    collapsed ? "justify-center px-2" : "justify-start",
                    isActive && "bg-secondary font-medium"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                  {!collapsed && item.title}
                </Button>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>{buttonContent}</Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link key={item.href} href={item.href}>
                  {buttonContent}
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
