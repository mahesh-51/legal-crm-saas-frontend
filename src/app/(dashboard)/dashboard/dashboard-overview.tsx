"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { format } from "date-fns";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Briefcase,
  Calendar,
  CheckSquare,
  Clock,
  CalendarClock,
  GanttChartSquare,
  Inbox,
  ListChecks,
  PieChart,
  Receipt,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import {
  AreaChart,
  BadgeDelta,
  BarList,
  DonutChart,
  Flex,
} from "@tremor/react";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { getErrorMessage } from "@/lib/api/error-handler";
import {
  dashboardService,
  type DashboardKpiMetric,
  type DashboardOverview,
  type DashboardUpcomingReminderRow,
} from "@/lib/api/services/dashboard.service";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Tremor chart `colors` must use **named palette keys** (e.g. `indigo`, `violet`).
 * Hex values break in Tailwind v4: classes like `fill-[#6366f1]` are not emitted, so slices render black.
 */
const TREMOR_AREA_COLOR = "indigo" as const;

const TREMOR_DONUT_COLORS = [
  "indigo",
  "violet",
  "cyan",
  "amber",
  "emerald",
  "rose",
] as const;

/** Per-row bar colors (Tremor named colors) for ranked lists */
const BAR_LIST_COLORS = [
  "violet",
  "indigo",
  "cyan",
  "fuchsia",
  "emerald",
] as const;

function formatMoney(amount: number, currency = "INR") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

function activityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    "task.created": "Task created",
    "meeting.created": "Meeting scheduled",
  };
  return labels[type] ?? type.replace(/\./g, " · ");
}

function reminderRowHref(row: DashboardUpcomingReminderRow): string | null {
  if (row.href?.trim()) return row.href;
  if (row.matterId) return `/matters/${row.matterId}/edit`;
  if (row.clientId) return `/clients/${row.clientId}/edit`;
  return null;
}

function matterClientEditHref(
  matterId?: string | null,
  clientId?: string | null
): string | null {
  if (matterId) return `/matters/${matterId}/edit`;
  if (clientId) return `/clients/${clientId}/edit`;
  return null;
}

function deltaTypeForPercent(
  p: number,
  threshold: number
): "increase" | "moderateIncrease" | "decrease" | "moderateDecrease" | "unchanged" {
  if (p === 0 || Number.isNaN(p)) return "unchanged";
  if (p > threshold) return "moderateIncrease";
  if (p > 0) return "increase";
  if (p < -threshold) return "moderateDecrease";
  return "decrease";
}

function KpiCard({
  title,
  metric,
  icon: Icon,
  delayMs = 0,
}: {
  title: string;
  metric: DashboardKpiMetric;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  delayMs?: number;
}) {
  const { value, deltaPercent, increaseIsPositive = true } = metric;
  const d = deltaPercent ?? null;
  const deltaType =
    d == null || Number.isNaN(d) ? null : deltaTypeForPercent(d, 10);
  const showDelta = deltaType != null && deltaType !== "unchanged";

  return (
    <Card
      className={cn(
        "animate-dashboard-fade-up group relative overflow-hidden border-border/70 bg-card/95 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.07]"
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100"
      />
      <CardContent className="relative flex flex-col gap-4 pt-6 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="font-heading text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            {showDelta && d != null && (
              <Flex className="mt-1 flex-wrap gap-x-2 gap-y-1" justifyContent="start">
                <BadgeDelta
                  deltaType={deltaType!}
                  isIncreasePositive={increaseIsPositive}
                  size="xs"
                >
                  {d > 0 ? "+" : ""}
                  {d.toFixed(1)}%
                </BadgeDelta>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </Flex>
            )}
          </div>
          <div
            className={cn(
              "shrink-0 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 p-3 text-primary",
              "ring-1 ring-primary/15 transition-transform duration-300 group-hover:scale-105"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-6 py-14 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground ring-1 ring-border/50">
        <Icon className="h-7 w-7 opacity-80" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-8 w-64 max-w-full rounded-lg" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[7.5rem] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[22rem] rounded-2xl" />
        <Skeleton className="h-[22rem] rounded-2xl" />
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const { user } = useAuth();
  const firmId = useCurrentFirmId();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const ac = new AbortController();
    setError(null);
    setLoading(true);
    dashboardService
      .getOverview(firmId, { signal: ac.signal })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(getErrorMessage(err));
        setData(null);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, [firmId, user]);

  const donutData = useMemo(() => {
    const rows = data?.mattersByStatus ?? [];
    return rows.map((r) => ({
      name: r.status,
      value: r.count,
    }));
  }, [data?.mattersByStatus]);

  const donutSliceColors = useMemo(
    () =>
      donutData.map(
        (_, i) => TREMOR_DONUT_COLORS[i % TREMOR_DONUT_COLORS.length]!
      ),
    [donutData]
  );

  const revenueCurrency = data?.topRevenue?.[0]?.currency ?? "INR";
  const firstName = user?.name?.split(" ")[0] || "Counsel";

  if (!user) {
    return null;
  }

  return (
    <div className="relative pb-10">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
        aria-hidden
      >
        <div className="absolute -left-[20%] -top-32 h-[22rem] w-[22rem] rounded-full bg-primary/[0.09] blur-3xl" />
        <div className="absolute -right-[15%] top-1/3 h-[18rem] w-[18rem] rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-px w-2/3 max-w-3xl -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      </div>

      {/* Hero */}
      <div className="animate-dashboard-fade-up mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-medium text-primary shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live workspace
          </div>
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              Your practice at a glance — clarity on clients, matters, and what needs attention next.
            </p>
          </div>
        </div>
        {/* <div className="flex shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-4 py-3 text-sm text-muted-foreground shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <span>
            Metrics refresh when you load this page
          </span>
        </div> */}
      </div>

      {error && (
        <Card className="animate-dashboard-fade-up mb-8 border-destructive/30 bg-destructive/[0.06] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Dashboard unavailable</CardTitle>
            <CardDescription className="text-destructive/90">
              {error} If the API is not ready yet, see{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                docs/dashboard-overview-api-backend-prompt.md
              </code>
              .
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {loading && !data && !error && <DashboardSkeleton />}

      {data && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard
              title="Active clients"
              metric={data.kpis.activeClients}
              icon={Users}
              delayMs={0}
            />
            <KpiCard
              title="Open matters"
              metric={data.kpis.openMatters}
              icon={Briefcase}
              delayMs={40}
            />
            <KpiCard
              title="Upcoming court dates"
              metric={data.kpis.upcomingCourtDates}
              icon={Calendar}
              delayMs={80}
            />
            <KpiCard
              title="Invoices outstanding"
              metric={data.kpis.invoicesOutstanding}
              icon={Receipt}
              delayMs={120}
            />
            <KpiCard
              title="Pending tasks"
              metric={data.kpis.pendingTasks ?? { value: 0 }}
              icon={CheckSquare}
              delayMs={160}
            />
            <KpiCard
              title="Meetings (14 days)"
              metric={data.kpis.upcomingMeetingsNextDays ?? { value: 0 }}
              icon={CalendarClock}
              delayMs={200}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card
              className="animate-dashboard-fade-up border-border/70 bg-card/95 shadow-md ring-1 ring-black/[0.03] backdrop-blur-sm"
              style={{ animationDelay: "220ms" }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/12 p-2.5 text-primary ring-1 ring-primary/15">
                    <CheckSquare className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-lg">Upcoming tasks</CardTitle>
                    <CardDescription>Open items by due date</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(data.upcomingTasks ?? []).length === 0 ? (
                  <EmptyPanel
                    icon={CheckSquare}
                    title="No upcoming tasks"
                    description="Tasks with due dates appear here."
                  />
                ) : (
                  <ul className="space-y-3">
                    {(data.upcomingTasks ?? []).slice(0, 5).map((t) => {
                      const href = matterClientEditHref(t.matterId, t.clientId);
                      const inner = (
                        <>
                          <p className="font-medium leading-snug">{t.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.dueAt
                              ? format(new Date(t.dueAt), "PPp")
                              : "No due date"}
                            {t.kind === "follow_up" ? " · Follow-up" : ""}
                          </p>
                        </>
                      );
                      return (
                        <li key={t.id}>
                          {href ? (
                            <Link
                              href={href}
                              className="block rounded-lg border border-border/50 bg-muted/10 p-3 transition-colors hover:border-primary/25 hover:bg-muted/20"
                            >
                              {inner}
                            </Link>
                          ) : (
                            <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                              {inner}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card
              className="animate-dashboard-fade-up border-border/70 bg-card/95 shadow-md ring-1 ring-black/[0.03] backdrop-blur-sm"
              style={{ animationDelay: "260ms" }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/12 p-2.5 text-primary ring-1 ring-primary/15">
                    <Video className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-lg">Upcoming meetings</CardTitle>
                    <CardDescription>Next 14 days · scheduled</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(data.upcomingMeetings ?? []).length === 0 ? (
                  <EmptyPanel
                    icon={Video}
                    title="No meetings in window"
                    description="Scheduled meetings with start times in the next two weeks."
                  />
                ) : (
                  <ul className="space-y-3">
                    {(data.upcomingMeetings ?? []).slice(0, 5).map((m) => {
                      const href = matterClientEditHref(m.matterId, m.clientId);
                      return (
                        <li
                          key={m.id}
                          className="rounded-lg border border-border/50 bg-muted/10 p-3"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              {href ? (
                                <Link href={href} className="font-medium hover:underline">
                                  {m.title?.trim() || "Meeting"}
                                </Link>
                              ) : (
                                <p className="font-medium">{m.title?.trim() || "Meeting"}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(m.startAt), "PPp")}
                              </p>
                            </div>
                            {m.meetingUrl && (
                              <a
                                href={m.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  buttonVariants({ variant: "outline", size: "xs" }),
                                  "inline-flex shrink-0 gap-1"
                                )}
                              >
                                <Video className="h-3.5 w-3.5" />
                                Join
                              </a>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card
              className="animate-dashboard-fade-up border-border/70 bg-card/95 shadow-md ring-1 ring-black/[0.03] backdrop-blur-sm"
              style={{ animationDelay: "300ms" }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/12 p-2.5 text-primary ring-1 ring-primary/15">
                    <Bell className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-lg">Reminders</CardTitle>
                    <CardDescription>Next 7 days</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(data.upcomingReminders ?? []).length === 0 ? (
                  <EmptyPanel
                    icon={Bell}
                    title="No reminders due"
                    description="Task and meeting reminders in the coming week."
                  />
                ) : (
                  <ul className="space-y-2">
                    {(data.upcomingReminders ?? []).slice(0, 10).map((r, idx) => {
                      const href = reminderRowHref(r);
                      const label =
                        r.source === "task"
                          ? "Task"
                          : r.source === "meeting"
                            ? "Meeting"
                            : r.source;
                      return (
                        <li key={`${r.source}-${r.title}-${idx}`}>
                          {href ? (
                            <Link
                              href={href}
                              className="flex flex-col rounded-lg border border-border/50 bg-muted/10 px-3 py-2 transition-colors hover:border-primary/25 hover:bg-muted/20"
                            >
                              <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                                {label}
                              </span>
                              <span className="font-medium leading-snug">{r.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(r.remindAt), "PPp")}
                              </span>
                            </Link>
                          ) : (
                            <div className="flex flex-col rounded-lg border border-border/50 bg-muted/10 px-3 py-2">
                              <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                                {label}
                              </span>
                              <span className="font-medium leading-snug">{r.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(r.remindAt), "PPp")}
                              </span>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="animate-dashboard-fade-up border-border/70 bg-card/95 shadow-md ring-1 ring-black/[0.03] backdrop-blur-sm" style={{ animationDelay: "340ms" }}>
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/12 p-2.5 text-primary ring-1 ring-primary/15">
                  <CalendarClock className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <CardTitle className="font-heading text-lg">Top daily listings</CardTitle>
                  <CardDescription>Upcoming and recent diary highlights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(data.topDailyListings ?? []).length === 0 ? (
                <EmptyPanel
                  icon={ListChecks}
                  title="No listings to show"
                  description="Add diary entries to see them prioritized here."
                />
              ) : (
                <div className="overflow-hidden rounded-xl border border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead>Matter</TableHead>
                        <TableHead>Case</TableHead>
                        <TableHead>Current date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right"> </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data.topDailyListings ?? []).slice(0, 5).map((row) => (
                        <TableRow key={row.id} className="group border-border/50">
                          <TableCell className="font-medium">{row.matterTitle}</TableCell>
                          <TableCell className="max-w-[10rem] truncate text-muted-foreground">
                            {[row.caseType, row.caseNo].filter(Boolean).join(" · ") || "—"}
                          </TableCell>
                          <TableCell className="tabular-nums text-muted-foreground">
                            {row.currentDate}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal">
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link
                              href={`/daily-listings/${row.id}/edit`}
                              className={cn(
                                buttonVariants({ variant: "outline", size: "xs" }),
                                "inline-flex gap-1"
                              )}
                            >
                              Open
                              <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="animate-dashboard-fade-up border-border/70 bg-card/95 shadow-md ring-1 ring-black/[0.03] backdrop-blur-sm" style={{ animationDelay: "260ms" }}>
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/12 p-2.5 text-primary ring-1 ring-primary/15">
                  <Activity className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <CardTitle className="font-heading text-lg">Recent activity</CardTitle>
                  <CardDescription>
                    Filings, matter updates, and deadlines
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(data.recentActivity ?? []).length === 0 ? (
                <EmptyPanel
                  icon={Activity}
                  title="No recent activity"
                  description="As your team works, the feed will light up here."
                />
              ) : (
                <ul className="space-y-3">
                  {(data.recentActivity ?? []).map((a, idx) => (
                    <li
                      key={a.id}
                      className={cn(
                        "animate-dashboard-fade-up rounded-xl border border-border/50 bg-gradient-to-r from-muted/20 to-transparent p-4 transition-colors hover:border-primary/20 hover:from-muted/35",
                        a.href && "cursor-pointer"
                      )}
                      style={{ animationDelay: `${280 + idx * 40}ms` }}
                    >
                      {a.href ? (
                        <Link
                          href={a.href}
                          className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl -m-4 p-4"
                        >
                          <ActivityRow a={a} />
                        </Link>
                      ) : (
                        <ActivityRow a={a} />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="animate-dashboard-fade-up overflow-hidden border-border/70 bg-card/95 shadow-md ring-1 ring-black/[0.03] backdrop-blur-sm transition-shadow hover:shadow-lg" style={{ animationDelay: "320ms" }}>
              <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/12 p-2.5 text-primary ring-1 ring-primary/15">
                    <GanttChartSquare className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <CardTitle className="font-heading text-lg">Matters opened</CardTitle>
                    <CardDescription>
                      New matters over time (firm-scoped)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {data.mattersOpenedTrend.length === 0 ? (
                  <EmptyPanel
                    icon={TrendingUp}
                    title="No trend data yet"
                    description="Once matters accumulate, you will see momentum here."
                  />
                ) : (
                  <div className="relative overflow-hidden rounded-xl border border-indigo-200/35 bg-gradient-to-br from-indigo-500/[0.09] via-violet-500/[0.05] to-cyan-500/[0.06] p-2 ring-1 ring-indigo-500/10 dark:border-indigo-500/25 dark:from-indigo-500/15 dark:via-violet-500/10 dark:to-cyan-500/10 dark:ring-indigo-400/15">
                    <AreaChart
                      className="mt-0 h-80"
                      data={data.mattersOpenedTrend}
                      index="period"
                      categories={["count"]}
                      colors={[TREMOR_AREA_COLOR]}
                      valueFormatter={(v) => `${Math.round(v)}`}
                      showLegend={false}
                      yAxisLabel="Matters"
                      curveType="natural"
                      showAnimation={true}
                      showGradient={true}
                      showGridLines={true}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="animate-dashboard-fade-up overflow-hidden border-border/70 bg-card/95 shadow-md ring-1 ring-black/[0.03] backdrop-blur-sm transition-shadow hover:shadow-lg" style={{ animationDelay: "380ms" }}>
              <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/12 p-2.5 text-primary ring-1 ring-primary/15">
                    <PieChart className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <CardTitle className="font-heading text-lg">Matters by status</CardTitle>
                    <CardDescription>
                      How workload splits across stages
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {donutData.length === 0 ? (
                  <EmptyPanel
                    icon={Briefcase}
                    title="No matters yet"
                    description="Create a matter to see its status mix here."
                  />
                ) : (
                  <div className="relative overflow-hidden rounded-xl border border-violet-200/35 bg-gradient-to-br from-violet-500/[0.08] via-fuchsia-500/[0.05] to-cyan-500/[0.07] p-4 ring-1 ring-violet-500/10 dark:border-violet-500/25 dark:from-violet-500/12 dark:via-fuchsia-500/10 dark:to-cyan-500/12 dark:ring-violet-400/15">
                    <DonutChart
                      className="h-56"
                      data={donutData}
                      category="value"
                      index="name"
                      colors={donutSliceColors}
                      valueFormatter={(v) => `${v}`}
                      showAnimation={true}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="animate-dashboard-fade-up border-border/70 bg-card/95 shadow-md ring-1 ring-black/[0.03] backdrop-blur-sm" style={{ animationDelay: "440ms" }}>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/12 p-2.5 text-primary ring-1 ring-primary/15">
                    <Users className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-lg">Top clients</CardTitle>
                    <CardDescription>By activity score · top 5</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(data.topClients ?? []).length === 0 ? (
                  <EmptyPanel
                    icon={Inbox}
                    title="No client activity yet"
                    description="Scores appear as you work with clients and matters."
                  />
                ) : (
                  <div className="rounded-xl border border-violet-200/25 bg-gradient-to-b from-violet-500/[0.06] to-muted/10 p-3 ring-1 ring-violet-500/10 dark:border-violet-500/20 dark:from-violet-500/10">
                    <BarList
                      data={(data.topClients ?? []).slice(0, 5).map((c, i) => ({
                        name: c.subtitle ? `${c.name} — ${c.subtitle}` : c.name,
                        value: c.score,
                        href: `/clients/${c.clientId}/edit`,
                        color: BAR_LIST_COLORS[i % BAR_LIST_COLORS.length],
                      }))}
                      sortOrder="none"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="animate-dashboard-fade-up border-border/70 bg-card/95 shadow-md ring-1 ring-black/[0.03] backdrop-blur-sm" style={{ animationDelay: "500ms" }}>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/12 p-2.5 text-primary ring-1 ring-primary/15">
                    <TrendingUp className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-lg">Top revenue</CardTitle>
                    <CardDescription>By matter · top 5</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(data.topRevenue ?? []).length === 0 ? (
                  <EmptyPanel
                    icon={Receipt}
                    title="No billed amounts yet"
                    description="Invoice and collect to surface leaders here."
                  />
                ) : (
                  <div className="rounded-xl border border-cyan-200/25 bg-gradient-to-b from-cyan-500/[0.07] to-muted/10 p-3 ring-1 ring-cyan-500/10 dark:border-cyan-500/20 dark:from-cyan-500/10">
                    <BarList
                      data={(data.topRevenue ?? []).slice(0, 5).map((r, i) => ({
                        name: r.matterTitle,
                        value: r.amount,
                        href: `/matters/${r.matterId}/edit`,
                        color: BAR_LIST_COLORS[
                          (i + 2) % BAR_LIST_COLORS.length
                        ],
                      }))}
                      valueFormatter={(v: number) => formatMoney(v, revenueCurrency)}
                      sortOrder="none"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityRow({
  a,
}: {
  a: NonNullable<DashboardOverview["recentActivity"]>[number];
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_0_4px] shadow-primary/20" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-medium leading-snug text-foreground">{a.title}</p>
        {a.description && (
          <p className="text-sm text-muted-foreground">{a.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          <span className="rounded-md bg-muted/80 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            {activityTypeLabel(a.type)}
          </span>
          <span className="mx-2 text-border">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="inline h-3 w-3" strokeWidth={1.75} />
            {format(new Date(a.occurredAt), "PPp")}
          </span>
        </p>
      </div>
    </div>
  );
}
