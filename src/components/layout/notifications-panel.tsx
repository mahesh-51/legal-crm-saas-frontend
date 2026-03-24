"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Bell, Heart, MessageCircle, Package, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type NotificationKind = "comment" | "generation" | "invite" | "like";

type UiNotification = {
  id: string;
  kind: NotificationKind;
  actorName: string;
  actorInitials: string;
  timeLabel: string;
  /** Primary line after actor (e.g. action + bold entity) */
  summary: ReactNode;
  /** Optional extra lines (comment preview, prompt, etc.) */
  detail?: ReactNode;
  unread: boolean;
};

const BADGE: Record<
  NotificationKind,
  { className: string; icon: typeof MessageCircle }
> = {
  comment: {
    className: "bg-violet-500",
    icon: MessageCircle,
  },
  generation: {
    className: "bg-amber-400",
    icon: Package,
  },
  invite: {
    className: "bg-emerald-500",
    icon: Plus,
  },
  like: {
    className: "bg-orange-500",
    icon: Heart,
  },
};

/** Static demo items — replace with API data later */
const MOCK_NOTIFICATIONS: UiNotification[] = [
  {
    id: "1",
    kind: "comment",
    actorName: "Alex Chen",
    actorInitials: "AC",
    timeLabel: "1h ago",
    summary: (
      <>
        Commented on{" "}
        <span className="font-semibold text-foreground">Classic Car in Studio</span>
      </>
    ),
    detail: (
      <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
        &ldquo;Love the lighting on this one — can we push the shadows a bit more on
        the driver side?&rdquo;
      </p>
    ),
    unread: true,
  },
  {
    id: "2",
    kind: "generation",
    actorName: "Studio AI",
    actorInitials: "SA",
    timeLabel: "3h ago",
    summary: (
      <>
        Generation finished for{" "}
        <span className="font-semibold text-foreground">Product hero v2</span>
      </>
    ),
    detail: (
      <p className="mt-1 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">Prompt:</span> cinematic
        product shot, soft daylight, minimal background
      </p>
    ),
    unread: true,
  },
  {
    id: "3",
    kind: "invite",
    actorName: "Jordan Lee",
    actorInitials: "JL",
    timeLabel: "Yesterday",
    summary: (
      <>
        Invited you to collaborate on{" "}
        <span className="font-semibold text-foreground">Q4 campaign</span>
      </>
    ),
    detail: (
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 flex-1 rounded-lg bg-muted text-foreground hover:bg-muted/80"
        >
          Decline
        </Button>
        <Button type="button" size="sm" className="h-8 flex-1 rounded-lg">
          Accept
        </Button>
      </div>
    ),
    unread: true,
  },
  {
    id: "4",
    kind: "like",
    actorName: "Sam Rivera",
    actorInitials: "SR",
    timeLabel: "2d ago",
    summary: (
      <>
        Liked{" "}
        <span className="font-semibold text-foreground">Mood board — interiors</span>
      </>
    ),
    unread: false,
  },
];

function NotificationRow({ item }: { item: UiNotification }) {
  const badge = BADGE[item.kind];
  const Icon = badge.icon;

  return (
    <div
      className="flex gap-3 border-b border-border/80 py-4 last:border-b-0"
      role="listitem"
    >
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11 border border-border/60">
          <AvatarFallback className="bg-muted text-sm font-medium text-foreground">
            {item.actorInitials}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute -right-0.5 -bottom-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background shadow-sm",
            badge.className
          )}
          aria-hidden
        >
          <Icon className="h-3 w-3 text-white" strokeWidth={2.25} />
        </span>
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="font-semibold text-foreground">{item.actorName}</span>
          <span className="text-xs text-muted-foreground">{item.timeLabel}</span>
        </div>
        <p className="mt-0.5 text-sm text-foreground/90">{item.summary}</p>
        {item.detail}
      </div>

      <div className="flex shrink-0 flex-col items-end pt-2">
        {item.unread ? (
          <span
            className="h-2.5 w-2.5 rounded-full bg-[#4CAF50]"
            title="Unread"
            aria-label="Unread"
          />
        ) : (
          <span className="h-2.5 w-2.5" aria-hidden />
        )}
      </div>
    </div>
  );
}

export function NotificationsPanel() {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const visible = useMemo(() => {
    if (filter === "unread") return MOCK_NOTIFICATIONS.filter((n) => n.unread);
    return MOCK_NOTIFICATIONS;
  }, [filter]);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full"
            aria-label={
              unreadCount > 0
                ? `Notifications (${unreadCount} unread)`
                : "Notifications"
            }
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 ? (
              <span
                className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#4CAF50] ring-2 ring-background"
                aria-hidden
              />
            ) : null}
          </Button>
        }
      />
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-1.5rem,22rem)] gap-0 rounded-[22px] border border-border/80 bg-card p-0 shadow-lg ring-1 ring-black/5"
      >
        <div className="border-b border-border/80 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Notifications
            </h2>
            <div
              className="flex rounded-full bg-muted/80 p-0.5"
              role="tablist"
              aria-label="Notification filter"
            >
              <button
                type="button"
                role="tab"
                aria-selected={filter === "all"}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filter === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === "unread"}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filter === "unread"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setFilter("unread")}
              >
                Unread
              </button>
            </div>
          </div>
        </div>

        <div
          className="max-h-[min(70vh,28rem)] overflow-y-auto overscroll-contain px-4 py-4"
          role="list"
        >
          {visible.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No notifications to show.
            </p>
          ) : (
            visible.map((item) => <NotificationRow key={item.id} item={item} />)
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
