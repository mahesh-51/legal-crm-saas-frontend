"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import type { Hearing } from "@/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { fetchHearingsByMatter } from "@/store/slices/hearings.slice";
import { fetchMatters } from "@/store/slices/matters.slice";

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-500/10 text-blue-700",
  COMPLETED: "bg-green-500/10 text-green-700",
  ADJOURNED: "bg-yellow-500/10 text-yellow-800",
  CANCELLED: "bg-muted text-muted-foreground",
};

const columns: Column<Hearing>[] = [
  { key: "synopsis", header: "Title" },
  { key: "matterTitle", header: "Matter" },
  {
    key: "currentDate",
    header: "Date",
    render: (h) => h.currentDate ?? h.hearingDate ?? "—",
  },
  {
    key: "status",
    header: "Status",
    render: (h) => (
      <Badge className={statusColors[h.status] ?? "bg-muted"}>{h.status}</Badge>
    ),
  },
  {
    key: "actions",
    header: "",
    render: (h) => (
      <Link
        href={`/hearings/${h.id}/edit`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <Pencil className="mr-1 h-3.5 w-3.5" />
        Edit
      </Link>
    ),
  },
];

export function HearingsList() {
  const searchParams = useSearchParams();
  const matterIdFromQuery = searchParams.get("matterId");
  const firmId = useCurrentFirmId();
  const dispatch = useAppDispatch();
  const matters = useAppSelector((s) => s.matters.list);
  const [selectedMatterId, setSelectedMatterId] = useState<string>("");

  useEffect(() => {
    if (firmId) dispatch(fetchMatters({ firmId }));
  }, [dispatch, firmId]);

  useEffect(() => {
    if (!matters.length) {
      setSelectedMatterId("");
      return;
    }
    if (matterIdFromQuery && matters.some((m) => m.id === matterIdFromQuery)) {
      setSelectedMatterId(matterIdFromQuery);
      return;
    }
    setSelectedMatterId((prev) => {
      if (prev && matters.some((m) => m.id === prev)) return prev;
      return matters[0].id;
    });
  }, [matters, matterIdFromQuery]);

  const hearings = useAppSelector((s) =>
    selectedMatterId ? s.hearings.byMatter[selectedMatterId] ?? [] : []
  );
  const { isLoading, error } = useAppSelector((s) => s.hearings);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (selectedMatterId) dispatch(fetchHearingsByMatter(selectedMatterId));
  }, [dispatch, selectedMatterId]);

  const newHearingHref = selectedMatterId
    ? `/hearings/new?matterId=${encodeURIComponent(selectedMatterId)}`
    : "/hearings/new";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Court dates & hearings"
        description="Scheduled hearings, depositions, and deadlines"
        action={
          matters.length ? (
            <Link
              href={newHearingHref}
              className={cn(buttonVariants({ variant: "default" }))}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add hearing
            </Link>
          ) : (
            <Button type="button" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Add hearing
            </Button>
          )
        }
      />
      <div className="max-w-xs">
        <label className="text-sm font-medium" htmlFor="matter-filter">
          Matter
        </label>
        <select
          id="matter-filter"
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedMatterId}
          onChange={(e) => setSelectedMatterId(e.target.value)}
        >
          {matters.map((m) => (
            <option key={m.id} value={m.id}>
              {m.matterName ?? m.caseTitle ?? m.id}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        data={hearings}
        columns={columns}
        keyExtractor={(h) => h.id}
        emptyTitle="No court dates"
        emptyDescription="Add hearings, depositions, and filing deadlines."
        isLoading={isLoading && !!selectedMatterId}
      />
    </div>
  );
}
