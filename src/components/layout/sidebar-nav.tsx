"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Receipt,
  UserCog,
  BarChart3,
  Settings,
  Layers,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const firmNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/matters", label: "Matters", icon: Briefcase },
  { href: "/court-types", label: "Court types", icon: Layers },
  { href: "/court-names", label: "Court names", icon: Landmark },
  { href: "/hearings", label: "Hearings", icon: Calendar },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/users", label: "Users", icon: UserCog },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const lawyerNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/matters", label: "Matters", icon: Briefcase },
  { href: "/court-types", label: "Court types", icon: Layers },
  { href: "/court-names", label: "Court names", icon: Landmark },
  { href: "/hearings", label: "Hearings", icon: Calendar },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const clientNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-cases", label: "My Cases", icon: Briefcase },
  { href: "/hearings", label: "Hearings", icon: Calendar },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
];

function getNavItems(role: UserRole): NavItem[] {
  if (role === "firm") return firmNavItems;
  if (role === "lawyer") return lawyerNavItems;
  return clientNavItems;
}

export function SidebarNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  return (
    <nav className="flex flex-col gap-1 px-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
