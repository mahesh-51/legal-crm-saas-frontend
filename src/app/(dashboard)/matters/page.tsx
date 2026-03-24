"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Briefcase, Calendar, Plus, Pencil, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import type { Matter } from "@/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { fetchMatters } from "@/store/slices/matters.slice";
import { fetchClients } from "@/store/slices/clients.slice";

function formatDate(value: string | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-500/10 text-blue-700",
  ACTIVE: "bg-green-500/10 text-green-700",
  ON_HOLD: "bg-yellow-500/10 text-yellow-700",
  CLOSED: "bg-muted text-muted-foreground",
};

const columns: Column<Matter>[] = [
  {
    key: "matterName",
    header: "Matter",
    render: (m) => {
      const title = m.matterName ?? m.caseTitle ?? "—";
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
            <Briefcase className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <span className="font-medium text-foreground">{title}</span>
        </div>
      );
    },
  },
  {
    key: "clientName",
    header: "Client",
    render: (m) => (
      <div className="flex items-center gap-2 text-muted-foreground">
        <User className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={2} />
        <span className="text-foreground">{m.clientName ?? m.client?.name ?? "—"}</span>
      </div>
    ),
  },
  {
    key: "caseType",
    header: "Type",
    render: (m) => <span className="text-muted-foreground">{m.caseType ?? "—"}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (matter) => (
      <Badge className={cn("font-medium", statusColors[matter.status] ?? "bg-muted")}>
        {matter.status}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    header: "Created",
    render: (m) => (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={2} />
        <span className="tabular-nums text-foreground">{formatDate(m.createdAt)}</span>
      </div>
    ),
  },
  {
    key: "actions",
    header: "",
    render: (m) => (
      <Link
        href={`/matters/${m.id}/edit`}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "gap-1.5 rounded-lg border-border/80 font-medium shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
        )}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
        Edit
      </Link>
    ),
  },
];

export default function MattersPage() {
  const firmId = useCurrentFirmId();
  const dispatch = useAppDispatch();
  const { list: matters, isLoading, error } = useAppSelector((s) => s.matters);

  useEffect(() => {
    if (firmId) {
      dispatch(fetchMatters({ firmId }));
      dispatch(fetchClients(firmId));
    }
  }, [dispatch, firmId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Matters"
        description="Track cases, parties, courts, and status across your firm."
        action={
          <Link
            href="/matters/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-10 gap-2 rounded-xl px-5 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25"
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Add matter
          </Link>
        }
      />
      <DataTable
        data={matters}
        columns={columns}
        keyExtractor={(m) => m.id}
        emptyTitle="No matters yet"
        emptyDescription="Create your first matter to track parties, courts, documents, and billing in one place."
        emptyIcon={<Briefcase className="h-7 w-7" strokeWidth={1.5} />}
        isLoading={isLoading}
      />
    </div>
  );
}
