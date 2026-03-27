"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import type { ModulePermissionSelection, User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { firmUsersService, type FirmUserListItem } from "@/lib/api/services/firm-users.service";
import { getErrorMessage } from "@/lib/api/error-handler";

interface TeamMemberRow extends User {
  userId: string;
  modulePermissions: ModulePermissionSelection[];
  status?: string;
}

const roleLabels: Record<string, string> = {
  firm: "Firm Admin",
  lawyer: "Lawyer",
  client: "Client",
  FIRM_ADMIN: "Firm Admin",
  LAWYER: "Lawyer",
  CLIENT: "Client",
  INDIVIDUAL: "Individual",
  SUPER_ADMIN: "Super Admin",
};

const roleLabel = (role: string): string => roleLabels[role] ?? role;

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function mapFirmUserItemToRow(item: FirmUserListItem): TeamMemberRow {
  const nested = item.user;
  const role = (item.role ?? nested?.role ?? "LAWYER") as User["role"];
  return {
    id: nested?.id ?? item.userId,
    userId: item.userId,
    email: nested?.email ?? item.email ?? "",
    name: nested?.name ?? item.name ?? item.email ?? "Unknown User",
    role,
    firmId: nested?.firmId ?? item.firmId,
    createdAt: nested?.createdAt ?? item.createdAt,
    status: item.status,
    modulePermissions: item.modulePermissions ?? [],
  };
}

const columns: Column<TeamMemberRow>[] = [
  {
    key: "name",
    header: "User",
    render: (u) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{getInitials(u.name)}</AvatarFallback>
        </Avatar>
        <span>{u.name}</span>
      </div>
    ),
  },
  { key: "email", header: "Email" },
  {
    key: "role",
    header: "Role",
    render: (u) => <Badge variant="secondary">{roleLabel(u.role)}</Badge>,
  },
  {
    key: "actions",
    header: "Actions",
    render: (u) => (
      <div className="flex items-center gap-2">
        <Link
          href={`/users/${u.userId}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          View details
        </Link>
        <Link
          href={`/users/${u.userId}/permissions`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
          Edit permissions
        </Link>
      </div>
    ),
  },
];

export default function UsersPage() {
  const firmId = useCurrentFirmId();
  const [users, setUsers] = useState<TeamMemberRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = async () => {
    if (!firmId) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await firmUsersService.list(firmId);
      const mappedUsers = data.map(mapFirmUserItemToRow);
      setUsers(mappedUsers);
    } catch (error) {
      setUsers([]);
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [firmId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Firm members, attorneys, and access"
        action={
          <Link
            href="/users/invite"
            className={cn(buttonVariants({ variant: "default", size: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" />
            Invite User
          </Link>
        }
      />
      <DataTable
        data={users}
        columns={columns}
        keyExtractor={(u) => u.id}
        emptyTitle="No team members"
        emptyDescription="Invite attorneys and staff to your firm."
        isLoading={isLoading}
      />
    </div>
  );
}
