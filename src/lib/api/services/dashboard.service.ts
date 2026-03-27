import { apiClient } from "../axios";

/** Single KPI tile (value + optional period-over-period delta). */
export interface DashboardKpiMetric {
  value: number;
  /** Percent change vs comparison period (e.g. last month). Omit if unknown. */
  deltaPercent?: number | null;
  /** When false, a positive delta is undesirable (e.g. outstanding invoices). Default true. */
  increaseIsPositive?: boolean;
}

export interface DashboardActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  occurredAt: string;
  href?: string | null;
}

export interface DashboardRankedClient {
  clientId: string;
  name: string;
  /** Primary ranking metric (e.g. active matters or composite score). */
  score: number;
  subtitle?: string | null;
}

export interface DashboardRankedRevenue {
  matterId: string;
  matterTitle: string;
  amount: number;
  /** ISO 4217; default INR on the frontend if omitted. */
  currency?: string;
}

export interface DashboardTopDailyListing {
  id: string;
  matterId: string;
  matterTitle: string;
  caseNo?: string | null;
  caseType?: string | null;
  currentDate: string;
  status: string;
}

export type DashboardUpcomingTaskKind = "task" | "follow_up";
export type DashboardUpcomingTaskStatus =
  | "pending"
  | "in_progress"
  | "done"
  | "cancelled";

export interface DashboardUpcomingTaskRow {
  id: string;
  title: string;
  kind?: DashboardUpcomingTaskKind;
  status?: DashboardUpcomingTaskStatus;
  dueAt?: string | null;
  matterId?: string | null;
  clientId?: string | null;
}

export type DashboardMeetingLinkProvider =
  | "google_meet"
  | "microsoft_teams"
  | "zoom"
  | "other";

export interface DashboardUpcomingMeetingRow {
  id: string;
  title?: string | null;
  startAt: string;
  meetingUrl?: string | null;
  meetingLinkProvider?: DashboardMeetingLinkProvider | null;
  shareLinkWithClient?: boolean;
  matterId?: string | null;
  clientId?: string | null;
}

export interface DashboardUpcomingReminderRow {
  source: "task" | "meeting";
  title: string;
  remindAt: string;
  matterId?: string | null;
  clientId?: string | null;
  href?: string | null;
}

/** Full payload for the practice dashboard (one round-trip). */
export interface DashboardOverview {
  kpis: {
    activeClients: DashboardKpiMetric;
    openMatters: DashboardKpiMetric;
    upcomingCourtDates: DashboardKpiMetric;
    invoicesOutstanding: DashboardKpiMetric;
    /** Open tasks (not done / cancelled). */
    pendingTasks?: DashboardKpiMetric;
    /** Scheduled meetings with startAt in the next 14 days. */
    upcomingMeetingsNextDays?: DashboardKpiMetric;
  };
  recentActivity: DashboardActivityItem[];
  /** Already sorted; UI shows top 5. */
  topClients: DashboardRankedClient[];
  topRevenue: DashboardRankedRevenue[];
  topDailyListings: DashboardTopDailyListing[];
  mattersByStatus: { status: string; count: number }[];
  /** e.g. last 6 months — labels are shown on the chart as-is. */
  mattersOpenedTrend: { period: string; count: number }[];
  /** Up to 5 open tasks by due date. */
  upcomingTasks?: DashboardUpcomingTaskRow[];
  /** Up to 5 scheduled meetings in the next 14 days. */
  upcomingMeetings?: DashboardUpcomingMeetingRow[];
  /** Merged reminders in the next 7 days (tasks + meetings), up to 10. */
  upcomingReminders?: DashboardUpcomingReminderRow[];
}

export const dashboardService = {
  getOverview: (firmId: string | null, config?: { signal?: AbortSignal }) =>
    apiClient.get<DashboardOverview>("/dashboard/overview", {
      params: firmId ? { firmId } : {},
      signal: config?.signal,
    }),
};
