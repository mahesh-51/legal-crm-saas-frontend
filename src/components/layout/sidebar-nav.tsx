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
  { href: "/daily-listings", label: "Daily listing", icon: Calendar },
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
  { href: "/daily-listings", label: "Daily listing", icon: Calendar },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const clientNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-cases", label: "My Cases", icon: Briefcase },
  { href: "/daily-listings", label: "Daily listing", icon: Calendar },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
];

function getNavItems(role: UserRole): NavItem[] {
  if (role === "firm") return firmNavItems;
  if (role === "lawyer") return lawyerNavItems;
  return clientNavItems;
}

export function SidebarNav({
  role,
  collapsed = false,
  onNavigate,
}: {
  role: UserRole;
  collapsed?: boolean;
  /** Called after a link is chosen (e.g. close mobile drawer) */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
            className={cn(
              "group flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors",
              collapsed
                ? "justify-center px-2"
                : "gap-3 px-3",
              isActive
                ? "bg-[#1e3a5f] text-white shadow-sm dark:bg-[#1e3a5f] dark:text-white"
                : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                isActive
                  ? "text-white"
                  : "text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-500 dark:group-hover:text-neutral-300"
              )}
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
