"use client";

import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface DashboardNavbarProps {
  /** Opens the mobile sidebar */
  onMenuClick?: () => void;
  mobileSidebarOpen?: boolean;
}

export function DashboardNavbar({
  onMenuClick,
  mobileSidebarOpen = false,
}: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-3 sm:h-16 sm:gap-4 sm:px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-expanded={mobileSidebarOpen}
        aria-controls="mobile-sidebar-nav"
        aria-label="Open menu"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent className="w-56" align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={logout}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
