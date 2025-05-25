"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { Profile } from "@/types/custom.types";

interface MobileSidebarProps {
  userProfile: Profile | null;
}

export function MobileSidebar({ userProfile }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  if (!userProfile) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <Sidebar userProfile={userProfile} />
      </SheetContent>
    </Sheet>
  );
}
