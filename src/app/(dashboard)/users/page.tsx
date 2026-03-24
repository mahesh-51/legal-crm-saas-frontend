"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import type { User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mockUsers: User[] = [
  {
    id: "1",
    name: "Jennifer Martinez",
    email: "jmartinez@smithlaw.com",
    role: "lawyer",
  },
  {
    id: "2",
    name: "David Chen",
    email: "dchen@smithlaw.com",
    role: "firm",
  },
];

const roleLabels: Record<string, string> = {
  firm: "Firm Admin",
  lawyer: "Lawyer",
  client: "Client",
};

const columns: Column<User>[] = [
  {
    key: "name",
    header: "User",
    render: (u) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {u.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <span>{u.name}</span>
      </div>
    ),
  },
  { key: "email", header: "Email" },
  {
    key: "role",
    header: "Role",
    render: (u) => <Badge variant="secondary">{roleLabels[u.role]}</Badge>,
  },
];

export default function UsersPage() {
  const [users] = useState<User[]>(mockUsers);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Firm members, attorneys, and access"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        }
      />
      <DataTable
        data={users}
        columns={columns}
        keyExtractor={(u) => u.id}
        emptyTitle="No team members"
        emptyDescription="Invite attorneys and staff to your firm."
      />
    </div>
  );
}
