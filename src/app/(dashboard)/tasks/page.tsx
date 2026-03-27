"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
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
  tasksService,
  type Task,
  type TaskKind,
  type TaskStatus,
} from "@/lib/api/services/tasks.service";
import { getErrorMessage } from "@/lib/api/error-handler";
import { nativeSelectClassName } from "@/lib/native-select";
import type { Client, Matter } from "@/types";

const KIND_OPTIONS: { value: TaskKind | ""; label: string }[] = [
  { value: "", label: "All kinds" },
  { value: "task", label: "Task" },
  { value: "follow_up", label: "Follow-up" },
];

const STATUS_OPTIONS: { value: TaskStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

const filterSelectClass = cn(
  nativeSelectClassName("md"),
  "max-w-[11rem]"
);

function taskStatusBadgeVariant(
  s: TaskStatus
): "default" | "secondary" | "outline" | "destructive" {
  if (s === "done") return "secondary";
  if (s === "cancelled") return "outline";
  return "default";
}

function formatWhen(iso: string | null | undefined): string {
  if (!iso?.trim()) return "—";
  try {
    return format(new Date(iso), "PPp");
  } catch {
    return iso;
  }
}

export default function TasksPage() {
  const firmId = useCurrentFirmId();
  const [list, setList] = useState<Task[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<TaskKind | "">("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");

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
      /* optional for table */
    }
  }, [firmId]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadRefs();
      const { data } = await tasksService.list({
        firmId,
        kind: kindFilter || undefined,
        status: statusFilter || undefined,
      });
      const copy = [...data];
      copy.sort((a, b) => {
        if (!a.dueAt && !b.dueAt) return 0;
        if (!a.dueAt) return 1;
        if (!b.dueAt) return -1;
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      });
      setList(copy);
    } catch (e) {
      toast.error(getErrorMessage(e));
      setList([]);
    } finally {
      setIsLoading(false);
    }
  }, [firmId, kindFilter, statusFilter, loadRefs]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: Column<Task>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <span className="font-medium text-foreground">{row.title}</span>
      ),
    },
    {
      key: "kind",
      header: "Kind",
      render: (row) => (
        <span className="capitalize">{row.kind.replace("_", " ")}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={taskStatusBadgeVariant(row.status)} className="capitalize">
          {row.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "dueAt",
      header: "Due",
      render: (row) => formatWhen(row.dueAt),
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
            href={`/tasks/${row.id}/edit`}
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
        title="Tasks"
        description="Work items and follow-ups for your firm."
        action={
          <Link
            href="/tasks/new"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add task
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-muted/20 p-4 shadow-sm ring-1 ring-border/40">
        <ListChecks className="h-4 w-4 text-muted-foreground" />
        <select
          className={filterSelectClass}
          value={kindFilter}
          onChange={(e) => setKindFilter((e.target.value || "") as TaskKind | "")}
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className={filterSelectClass}
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter((e.target.value || "") as TaskStatus | "")
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
        emptyTitle="No tasks"
        emptyDescription={
          firmId
            ? "Create a task or adjust filters."
            : "Select or join a firm to manage tasks."
        }
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete task?"
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await tasksService.delete(deleteId);
            toast.success("Task deleted");
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
