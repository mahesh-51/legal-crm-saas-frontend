"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IsoDatetimeLocalPicker } from "@/components/ui/iso-datetime-local-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { nativeSelectClassName } from "@/lib/native-select";
import {
  datetimeLocalToIso,
  isPastDatetimeLocal,
  isoToDatetimeLocal,
  isHttpsUrl,
} from "@/lib/datetime-local";
import { firmUsersService } from "@/lib/api/services/firm-users.service";
import {
  meetingsService,
  type CreateMeetingDto,
  type Meeting,
  type MeetingLinkProvider,
  type MeetingStatus,
} from "@/lib/api/services/meetings.service";
import {
  tasksService,
  type CreateTaskDto,
  type Task,
  type TaskKind,
  type TaskStatus,
} from "@/lib/api/services/tasks.service";
import type { User } from "@/types";

const TASK_KIND_OPTIONS: { value: TaskKind | ""; label: string }[] = [
  { value: "", label: "All kinds" },
  { value: "task", label: "Task" },
  { value: "follow_up", label: "Follow-up" },
];

const TASK_STATUS_OPTIONS: { value: TaskStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

const MEETING_STATUS_OPTIONS: { value: MeetingStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PROVIDER_OPTIONS: { value: MeetingLinkProvider; label: string }[] = [
  { value: "google_meet", label: "Google Meet" },
  { value: "microsoft_teams", label: "Microsoft Teams" },
  { value: "zoom", label: "Zoom" },
  { value: "other", label: "Other" },
];

const selectClass = nativeSelectClassName("sm");

function providerLabel(p: MeetingLinkProvider | null | undefined): string {
  if (!p) return "Link";
  return PROVIDER_OPTIONS.find((x) => x.value === p)?.label ?? p;
}

function taskStatusBadgeVariant(
  s: TaskStatus
): "default" | "secondary" | "outline" | "destructive" {
  if (s === "done") return "secondary";
  if (s === "cancelled") return "outline";
  return "default";
}

export interface LinkedTasksMeetingsPanelProps {
  firmId: string | null;
  matterId?: string;
  clientId?: string;
  dailyListingId?: string;
  /** When true, hide create/update/delete (e.g. client portal). */
  readOnly?: boolean;
}

export function LinkedTasksMeetingsPanel({
  firmId,
  matterId,
  clientId,
  dailyListingId,
  readOnly = false,
}: LinkedTasksMeetingsPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [firmUsers, setFirmUsers] = useState<User[]>([]);

  const [taskKindFilter, setTaskKindFilter] = useState<TaskKind | "">("");
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | "">("");
  const [meetingStatusFilter, setMeetingStatusFilter] =
    useState<MeetingStatus | "">("");

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskKind, setTaskKind] = useState<TaskKind>("task");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("pending");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueLocal, setTaskDueLocal] = useState("");
  const [taskReminderLocal, setTaskReminderLocal] = useState("");
  const [taskAssigneeId, setTaskAssigneeId] = useState("");

  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [meetingStartLocal, setMeetingStartLocal] = useState("");
  const [meetingEndLocal, setMeetingEndLocal] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingProvider, setMeetingProvider] =
    useState<MeetingLinkProvider>("other");
  const [shareLinkWithClient, setShareLinkWithClient] = useState(true);
  const [meetingReminderLocal, setMeetingReminderLocal] = useState("");
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus>("scheduled");

  const [saving, setSaving] = useState(false);

  const linkPresent = Boolean(matterId || clientId || dailyListingId);

  const listParams = useMemo(
    () => ({
      firmId,
      matterId,
      clientId,
      dailyListingId,
    }),
    [firmId, matterId, clientId, dailyListingId]
  );

  const load = useCallback(async () => {
    if (!linkPresent) return;
    setLoading(true);
    try {
      const [tr, mr] = await Promise.all([
        tasksService.list({
          ...listParams,
          kind: taskKindFilter || undefined,
          status: taskStatusFilter || undefined,
        }),
        meetingsService.list({
          ...listParams,
          status: meetingStatusFilter || undefined,
        }),
      ]);
      setTasks(tr.data);
      setMeetings(mr.data);
    } catch {
      toast.error("Could not load tasks or meetings");
    } finally {
      setLoading(false);
    }
  }, [
    linkPresent,
    listParams,
    taskKindFilter,
    taskStatusFilter,
    meetingStatusFilter,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!firmId) {
      setFirmUsers([]);
      return;
    }
    let cancelled = false;
    firmUsersService
      .list(firmId)
      .then(({ data }) => {
        if (!cancelled) setFirmUsers(data);
      })
      .catch(() => {
        if (!cancelled) setFirmUsers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [firmId]);

  function openNewTask() {
    setEditingTask(null);
    setTaskTitle("");
    setTaskKind("task");
    setTaskStatus("pending");
    setTaskDescription("");
    setTaskDueLocal("");
    setTaskReminderLocal("");
    setTaskAssigneeId("");
    setTaskDialogOpen(true);
  }

  function openEditTask(t: Task) {
    setEditingTask(t);
    setTaskTitle(t.title);
    setTaskKind(t.kind);
    setTaskStatus(t.status);
    setTaskDescription(t.description ?? "");
    setTaskDueLocal(isoToDatetimeLocal(t.dueAt));
    setTaskReminderLocal(isoToDatetimeLocal(t.reminderAt));
    setTaskAssigneeId(t.assigneeId ?? "");
    setTaskDialogOpen(true);
  }

  function openNewMeeting() {
    setEditingMeeting(null);
    setMeetingTitle("");
    setMeetingDescription("");
    setMeetingStartLocal("");
    setMeetingEndLocal("");
    setMeetingLocation("");
    setMeetingUrl("");
    setMeetingProvider("other");
    setShareLinkWithClient(true);
    setMeetingReminderLocal("");
    setMeetingStatus("scheduled");
    setMeetingDialogOpen(true);
  }

  function openEditMeeting(m: Meeting) {
    setEditingMeeting(m);
    setMeetingTitle(m.title ?? "");
    setMeetingDescription(m.description ?? "");
    setMeetingStartLocal(isoToDatetimeLocal(m.startAt));
    setMeetingEndLocal(isoToDatetimeLocal(m.endAt));
    setMeetingLocation(m.location ?? "");
    setMeetingUrl(m.meetingUrl ?? "");
    setMeetingProvider(m.meetingLinkProvider ?? "other");
    setShareLinkWithClient(m.shareLinkWithClient !== false);
    setMeetingReminderLocal(isoToDatetimeLocal(m.reminderAt));
    setMeetingStatus(m.status);
    setMeetingDialogOpen(true);
  }

  async function submitTask() {
    if (!taskTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!linkPresent) {
      toast.error("Link a matter, client, or diary row");
      return;
    }
    if (isPastDatetimeLocal(taskDueLocal)) {
      toast.error("Due date and time cannot be in the past");
      return;
    }
    if (isPastDatetimeLocal(taskReminderLocal)) {
      toast.error("Reminder date and time cannot be in the past");
      return;
    }
    setSaving(true);
    try {
      const base: CreateTaskDto = {
        title: taskTitle.trim(),
        matterId,
        clientId,
        dailyListingId,
        kind: taskKind,
        status: taskStatus,
        description: taskDescription.trim() || undefined,
        dueAt: taskDueLocal ? datetimeLocalToIso(taskDueLocal) : undefined,
        reminderAt: taskReminderLocal
          ? datetimeLocalToIso(taskReminderLocal)
          : undefined,
        assigneeId: taskAssigneeId || undefined,
      };
      if (editingTask) {
        await tasksService.update(editingTask.id, base);
        toast.success("Task updated");
      } else {
        await tasksService.create(firmId, base);
        toast.success("Task created");
      }
      setTaskDialogOpen(false);
      await load();
    } catch (e: unknown) {
      toast.error(
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Failed to save task"
      );
    } finally {
      setSaving(false);
    }
  }

  async function submitMeeting() {
    if (!meetingTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!meetingStartLocal.trim()) {
      toast.error("Start time is required");
      return;
    }
    if (isPastDatetimeLocal(meetingStartLocal)) {
      toast.error("Start date and time cannot be in the past");
      return;
    }
    if (meetingEndLocal.trim() && isPastDatetimeLocal(meetingEndLocal)) {
      toast.error("End date and time cannot be in the past");
      return;
    }
    if (meetingReminderLocal.trim() && isPastDatetimeLocal(meetingReminderLocal)) {
      toast.error("Reminder date and time cannot be in the past");
      return;
    }
    if (!linkPresent) {
      toast.error("Link a matter, client, or diary row");
      return;
    }
    const url = meetingUrl.trim();
    if (url && !isHttpsUrl(url)) {
      toast.error("Meeting link must be a valid https:// URL");
      return;
    }
    setSaving(true);
    try {
      const base: CreateMeetingDto = {
        title: meetingTitle.trim(),
        startAt: datetimeLocalToIso(meetingStartLocal),
        description: meetingDescription.trim() || undefined,
        matterId,
        clientId,
        dailyListingId,
        location: meetingLocation.trim() || undefined,
        meetingUrl: url || undefined,
        meetingLinkProvider: url ? meetingProvider : undefined,
        shareLinkWithClient,
        endAt: meetingEndLocal ? datetimeLocalToIso(meetingEndLocal) : undefined,
        reminderAt: meetingReminderLocal
          ? datetimeLocalToIso(meetingReminderLocal)
          : undefined,
        status: meetingStatus,
      };
      if (editingMeeting) {
        await meetingsService.update(editingMeeting.id, {
          title: base.title,
          startAt: base.startAt,
          description: base.description,
          matterId: base.matterId,
          clientId: base.clientId,
          dailyListingId: base.dailyListingId,
          location: base.location,
          meetingUrl: base.meetingUrl,
          meetingLinkProvider: base.meetingLinkProvider,
          shareLinkWithClient: base.shareLinkWithClient,
          endAt: base.endAt,
          reminderAt: base.reminderAt,
          status: meetingStatus,
        });
        toast.success("Meeting updated");
      } else {
        await meetingsService.create(firmId, base);
        toast.success("Meeting scheduled");
      }
      setMeetingDialogOpen(false);
      await load();
    } catch (e: unknown) {
      toast.error(
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Failed to save meeting"
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeTask(id: string) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await tasksService.delete(id);
      toast.success("Task deleted");
      await load();
    } catch {
      toast.error("Could not delete task");
    }
  }

  async function removeMeeting(id: string) {
    if (!window.confirm("Delete this meeting?")) return;
    try {
      await meetingsService.delete(id);
      toast.success("Meeting deleted");
      await load();
    } catch {
      toast.error("Could not delete meeting");
    }
  }

  const sortedTasks = useMemo(() => {
    const copy = [...tasks];
    copy.sort((a, b) => {
      if (!a.dueAt && !b.dueAt) return 0;
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });
    return copy;
  }, [tasks]);

  const sortedMeetings = useMemo(() => {
    const copy = [...meetings];
    copy.sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
    return copy;
  }, [meetings]);

  if (!linkPresent) return null;

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/95 shadow-sm ring-1 ring-black/[0.03]">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/12 p-2.5 text-primary ring-1 ring-primary/15">
                <ListChecks className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <CardTitle className="font-heading text-lg">Tasks</CardTitle>
                <CardDescription>
                  Work items and follow-ups for this record
                </CardDescription>
              </div>
            </div>
            {!readOnly && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={openNewTask}
              >
                <Plus className="h-4 w-4" />
                Add task
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <select
              className={cn(selectClass, "max-w-[11rem]")}
              value={taskKindFilter}
              onChange={(e) =>
                setTaskKindFilter((e.target.value || "") as TaskKind | "")
              }
            >
              {TASK_KIND_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className={cn(selectClass, "max-w-[11rem]")}
              value={taskStatusFilter}
              onChange={(e) =>
                setTaskStatusFilter((e.target.value || "") as TaskStatus | "")
              }
            >
              {TASK_STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : sortedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet.</p>
          ) : (
            <ul className="space-y-2">
              {sortedTasks.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/10 px-3 py-2 text-sm"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{t.title}</span>
                      {t.kind === "follow_up" && (
                        <Badge variant="secondary" className="text-[0.65rem]">
                          Follow-up
                        </Badge>
                      )}
                      <Badge
                        variant={taskStatusBadgeVariant(t.status)}
                        className="font-normal capitalize"
                      >
                        {t.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.dueAt
                        ? `Due ${format(new Date(t.dueAt), "PPp")}`
                        : "No due date"}
                      {t.reminderAt
                        ? ` · Reminder ${format(new Date(t.reminderAt), "PPp")}`
                        : ""}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Edit task"
                        onClick={() => openEditTask(t)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        aria-label="Delete task"
                        onClick={() => void removeTask(t.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/95 shadow-sm ring-1 ring-black/[0.03]">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/12 p-2.5 text-primary ring-1 ring-primary/15">
                <Calendar className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <CardTitle className="font-heading text-lg">Meetings</CardTitle>
                <CardDescription>
                  Hearings, consults, and video calls linked here
                </CardDescription>
              </div>
            </div>
            {!readOnly && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={openNewMeeting}
              >
                <Plus className="h-4 w-4" />
                Add meeting
              </Button>
            )}
          </div>
          <div className="pt-2">
            <select
              className={cn(selectClass, "max-w-[11rem]")}
              value={meetingStatusFilter}
              onChange={(e) =>
                setMeetingStatusFilter(
                  (e.target.value || "") as MeetingStatus | ""
                )
              }
            >
              {MEETING_STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : sortedMeetings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No meetings yet.</p>
          ) : (
            <ul className="space-y-2">
              {sortedMeetings.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/10 px-3 py-2 text-sm"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {m.title?.trim() || "Meeting"}
                      </span>
                      <Badge variant="outline" className="font-normal capitalize">
                        {m.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(m.startAt), "PPp")}
                      {m.location ? ` · ${m.location}` : ""}
                    </div>
                    {m.meetingUrl && (
                      <a
                        href={m.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join ({providerLabel(m.meetingLinkProvider ?? "other")})
                      </a>
                    )}
                  </div>
                  {!readOnly && (
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Edit meeting"
                        onClick={() => openEditMeeting(m)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        aria-label="Delete meeting"
                        onClick={() => void removeMeeting(m.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-lg" showCloseButton={!saving}>
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit task" : "New task"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Kind</Label>
                <select
                  className={selectClass}
                  value={taskKind}
                  onChange={(e) => setTaskKind(e.target.value as TaskKind)}
                >
                  <option value="task">Task</option>
                  <option value="follow_up">Follow-up</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className={selectClass}
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-desc">Description (optional)</Label>
              <Textarea
                id="task-desc"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <IsoDatetimeLocalPicker
                id="task-due"
                label="Due (optional)"
                value={taskDueLocal}
                onChange={setTaskDueLocal}
                preventPast
              />
              <IsoDatetimeLocalPicker
                id="task-rem"
                label="Reminder (optional)"
                value={taskReminderLocal}
                onChange={setTaskReminderLocal}
                preventPast
              />
            </div>
            {firmId && firmUsers.length > 0 && (
              <div className="space-y-2">
                <Label>Assignee (optional)</Label>
                <select
                  className={selectClass}
                  value={taskAssigneeId}
                  onChange={(e) => setTaskAssigneeId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {firmUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTaskDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void submitTask()} disabled={saving}>
              {saving ? "Saving…" : editingTask ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent className="sm:max-w-lg" showCloseButton={!saving}>
          <DialogHeader>
            <DialogTitle>
              {editingMeeting ? "Edit meeting" : "Schedule meeting"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[min(70vh,560px)] gap-3 overflow-y-auto py-3 pr-1">
            <div className="space-y-2">
              <Label htmlFor="mt-title">Title</Label>
              <Input
                id="mt-title"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="e.g. Client call — discovery"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mt-desc">Description (optional)</Label>
              <Textarea
                id="mt-desc"
                value={meetingDescription}
                onChange={(e) => setMeetingDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <IsoDatetimeLocalPicker
                id="mt-start"
                label="Start *"
                value={meetingStartLocal}
                onChange={setMeetingStartLocal}
                preventPast
              />
              <IsoDatetimeLocalPicker
                id="mt-end"
                label="End (optional)"
                value={meetingEndLocal}
                onChange={setMeetingEndLocal}
                preventPast
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mt-loc">Location (optional)</Label>
              <Input
                id="mt-loc"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                placeholder="Room, court, address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mt-url">Video join URL (optional)</Label>
              <Input
                id="mt-url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Link provider</Label>
                <select
                  className={selectClass}
                  value={meetingProvider}
                  onChange={(e) =>
                    setMeetingProvider(e.target.value as MeetingLinkProvider)
                  }
                >
                  {PROVIDER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <IsoDatetimeLocalPicker
                id="mt-rem"
                label="Reminder (optional)"
                value={meetingReminderLocal}
                onChange={setMeetingReminderLocal}
                preventPast
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="mt-share"
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={shareLinkWithClient}
                onChange={(e) => setShareLinkWithClient(e.target.checked)}
              />
              <Label htmlFor="mt-share" className="font-normal">
                Share join link with client on the portal
              </Label>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className={selectClass}
                value={meetingStatus}
                onChange={(e) =>
                  setMeetingStatus(e.target.value as MeetingStatus)
                }
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMeetingDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void submitMeeting()} disabled={saving}>
              {saving ? "Saving…" : editingMeeting ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
