"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Pencil, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IsoDatePicker } from "@/components/ui/iso-date-picker";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import type { DailyListing } from "@/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { fetchDailyListings } from "@/store/slices/daily-listings.slice";
import { fetchMatters } from "@/store/slices/matters.slice";
import type { DailyListingsQueryParams } from "@/lib/api/services/daily-listings.service";

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-500/10 text-blue-700",
  COMPLETED: "bg-green-500/10 text-green-700",
  ADJOURNED: "bg-yellow-500/10 text-yellow-800",
  CANCELLED: "bg-muted text-muted-foreground",
};

function localTodayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function joinList(items: string[] | null | undefined, fallback = "—") {
  if (!items?.length) return fallback;
  return items.join(", ");
}

const columns: Column<DailyListing>[] = [
  {
    key: "matterTitle",
    header: "Matter",
    render: (row) => {
      const title = row.matterTitle?.trim();
      if (title) return title;
      if (row.matterId) return `${row.matterId.slice(0, 8)}…`;
      return "—";
    },
  },
  {
    key: "caseType",
    header: "Case type",
    render: (row) => row.caseType?.trim() || "—",
  },
  {
    key: "caseNo",
    header: "Case no.",
    render: (row) => row.caseNo?.trim() || "—",
  },
  {
    key: "complainants",
    header: "Complainants",
    render: (row) => joinList(row.complainants),
  },
  {
    key: "defendants",
    header: "Defendants",
    render: (row) => joinList(row.defendants),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <Badge className={statusColors[row.status] ?? "bg-muted"}>{row.status}</Badge>
    ),
  },
  {
    key: "currentDate",
    header: "Current date",
    render: (row) => row.currentDate ?? "—",
  },
  {
    key: "nextDate",
    header: "Next date",
    render: (row) => row.nextDate ?? "—",
  },
  {
    key: "clients",
    header: "Clients",
    render: (row) =>
      (row.clients ?? []).length
        ? (row.clients ?? []).map((c) => c.name).join(", ")
        : "—",
  },
  {
    key: "actions",
    header: "",
    render: (row) => (
      <Link
        href={`/daily-listings/${row.id}/edit`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <Pencil className="mr-1 h-3.5 w-3.5" />
        Edit
      </Link>
    ),
  },
];

export function DailyListingsList() {
  const firmId = useCurrentFirmId();
  const dispatch = useAppDispatch();
  const matters = useAppSelector((s) => s.matters.list);
  const rows = useAppSelector((s) => s.dailyListings.items);
  const { total, totalPages, isLoading, error } = useAppSelector((s) => s.dailyListings);

  const today = localTodayIso();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const prevFilterSigRef = useRef<string | null>(null);
  const filterSig = `${debouncedSearch}|${dateFrom}|${dateTo}`;

  useEffect(() => {
    if (firmId) dispatch(fetchMatters({ firmId }));
  }, [dispatch, firmId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    const filtersChanged =
      prevFilterSigRef.current !== null && prevFilterSigRef.current !== filterSig;
    prevFilterSigRef.current = filterSig;

    const effectivePage = filtersChanged ? 1 : page;
    if (filtersChanged && page !== 1) {
      setPage(1);
    }

    const params: DailyListingsQueryParams = {
      page: effectivePage,
      limit,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    let from = dateFrom;
    let to = dateTo;
    if (from && to && from > to) {
      [from, to] = [to, from];
    }
    if (from) params.dateFrom = from;
    if (to) params.dateTo = to;
    dispatch(fetchDailyListings(params));
  }, [filterSig, page, limit, debouncedSearch, dateFrom, dateTo, dispatch]);

  const safeTotalPages =
    total === 0 ? 1 : Math.max(totalPages || Math.ceil(total / limit), 1);
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  const newHref = "/daily-listings/new";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily listing"
        description="All matters — filter by current listing date and search"
        action={
          matters.length ? (
            <Link href={newHref} className={cn(buttonVariants({ variant: "default" }))}>
              <Plus className="mr-2 h-4 w-4" />
              Add listing
            </Link>
          ) : (
            <Button type="button" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Add listing
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-muted/20 p-4 shadow-sm ring-1 ring-border/40 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[200px] flex-1 space-y-1.5">
          <label className="text-sm font-medium" htmlFor="dl-search">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="dl-search"
              className="pl-9"
              placeholder="Case no., parties, clients…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
        <div className="min-w-[14rem] max-w-xs">
          <IsoDatePicker
            id="dl-from"
            label="Current date from"
            value={dateFrom}
            onChange={(iso) => {
              setDateFrom(iso);
              setPage(1);
            }}
            placeholder="Pick start date"
            displayFormat="PPP"
            showFooterActions
          />
        </div>
        <div className="min-w-[14rem] max-w-xs">
          <IsoDatePicker
            id="dl-to"
            label="Current date to"
            value={dateTo}
            onChange={(iso) => {
              setDateTo(iso);
              setPage(1);
            }}
            placeholder="Pick end date"
            displayFormat="PPP"
            showFooterActions
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setPage(1);
            }}
          >
            Clear dates
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={() => {
              const t = localTodayIso();
              setDateFrom(t);
              setDateTo(t);
              setPage(1);
            }}
          >
            Today
          </Button>
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        keyExtractor={(row) => row.id}
        emptyTitle="No daily listings"
        emptyDescription="Try widening the date range or clearing search."
        isLoading={isLoading}
      />

      {!isLoading && total > 0 ? (
        <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            of <span className="font-medium text-foreground">{total}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Per page
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-2"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[7rem] text-center text-sm tabular-nums">
                Page {page} of {safeTotalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-2"
                disabled={page >= safeTotalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
