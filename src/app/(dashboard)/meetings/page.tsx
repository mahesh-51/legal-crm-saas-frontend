"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Pencil, Plus, Trash2, Video } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { clientsService } from "@/lib/api/services/clients.service";
import { mattersService } from "@/lib/api/services/matters.service";
import {
  meetingsService,
  type Meeting,
  type MeetingStatus,
} from "@/lib/api/services/meetings.service";
import { getErrorMessage } from "@/lib/api/error-handler";
import { nativeSelectClassName } from "@/lib/native-select";
import type { Client, Matter } from "@/types";

const STATUS_OPTIONS: { value: MeetingStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const filterSelectClass = cn(
  nativeSelectClassName("md"),
  "max-w-[11rem]"
);

function formatWhen(iso: string | null | undefined): string {
  if (!iso?.trim()) return "—";
  try {
    return format(new Date(iso), "PPp");
  } catch {
    return iso;
  }
}

export default function MeetingsPage() {
  const firmId = useCurrentFirmId();
  const [list, setList] = useState<Meeting[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | "">("");

  const matterMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const x of matters) {
      const label = x.matterName?.trim() || `${x.id.slice(0, 8)}…`;
      m.set(x.id, label);
    }
    return m;
  }, [matters]);

  const clientMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of clients) {
      m.set(c.id, c.name);
    }
    return m;
  }, [clients]);

  const loadRefs = useCallback(async () => {
    if (!firmId) {
      setMatters([]);
      setClients([]);
      return;
    }
    try {
      const [mr, cr] = await Promise.all([
        mattersService.list({ firmId }),
        clientsService.list(firmId),
      ]);
      setMatters(mr.data);
      setClients(cr.data);
    } catch {
      /* optional */
    }
  }, [firmId]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadRefs();
      const { data } = await meetingsService.list({
        firmId,
        status: statusFilter || undefined,
      });
      const copy = [...data];
      copy.sort(
        (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      );
      setList(copy);
    } catch (e) {
      toast.error(getErrorMessage(e));
      setList([]);
    } finally {
      setIsLoading(false);
    }
  }, [firmId, statusFilter, loadRefs]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: Column<Meeting>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <span className="font-medium text-foreground">
          {row.title?.trim() || "—"}
        </span>
      ),
    },
    {
      key: "startAt",
      header: "Start",
      render: (row) => formatWhen(row.startAt),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.status}
        </Badge>
      ),
    },
    {
      key: "links",
      header: "Linked",
      render: (row) => {
        const parts: string[] = [];
        if (row.matterId) parts.push(`Matter: ${matterMap.get(row.matterId) ?? row.matterId.slice(0, 8) + "…"}`);
        if (row.clientId) parts.push(`Client: ${clientMap.get(row.clientId) ?? "…"}`);
        if (row.dailyListingId) parts.push(`Listing: ${row.dailyListingId.slice(0, 8)}…`);
        return parts.length ? (
          <span className="text-muted-foreground">{parts.join(" · ")}</span>
        ) : (
          "—"
        );
      },
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/meetings/${row.id}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Edit
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteId(row.id)}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings"
        description="Scheduled calls and conferences."
        action={
          <Link
            href="/meetings/new"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule meeting
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-muted/20 p-4 shadow-sm ring-1 ring-border/40">
        <Video className="h-4 w-4 text-muted-foreground" />
        <select
          className={filterSelectClass}
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter((e.target.value || "") as MeetingStatus | "")
          }
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={list}
        columns={columns}
        keyExtractor={(r) => r.id}
        emptyTitle="No meetings"
        emptyDescription={
          firmId
            ? "Schedule a meeting or adjust filters."
            : "Select or join a firm to manage meetings."
        }
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete meeting?"
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await meetingsService.delete(deleteId);
            toast.success("Meeting deleted");
            void load();
          } catch (e) {
            toast.error(getErrorMessage(e));
            throw e;
          }
        }}
      />
    </div>
  );
}
