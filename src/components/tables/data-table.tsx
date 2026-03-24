"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Optional icon above empty-state copy */
  emptyIcon?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyTitle = "No data",
  emptyDescription = "Get started by adding your first entry.",
  emptyIcon,
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingSkeleton type="table" />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-border/40">
      <Table className="w-full min-w-[640px]">
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className="h-12 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground first:rounded-tl-2xl last:rounded-tr-2xl"
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={keyExtractor(item)}
              className="border-border/50 transition-colors hover:bg-muted/35"
            >
              {columns.map((col) => (
                <TableCell key={col.key} className="py-3.5 align-middle text-sm">
                  {col.render
                    ? col.render(item)
                    : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
