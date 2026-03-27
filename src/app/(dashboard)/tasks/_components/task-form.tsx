"use client";

import { useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import { toast } from "sonner";
import { FormSection } from "@/components/dashboard/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IsoDatetimeLocalPicker } from "@/components/ui/iso-datetime-local-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientsService } from "@/lib/api/services/clients.service";
import { dailyListingsService } from "@/lib/api/services/daily-listings.service";
import { firmUsersService } from "@/lib/api/services/firm-users.service";
import { mattersService } from "@/lib/api/services/matters.service";
import {
  tasksService,
  type CreateTaskDto,
  type Task,
  type TaskKind,
  type TaskStatus,
} from "@/lib/api/services/tasks.service";
import {
  datetimeLocalToIso,
  isPastDatetimeLocal,
  isoToDatetimeLocal,
} from "@/lib/datetime-local";
import { getErrorMessage } from "@/lib/api/error-handler";
import { nativeSelectClassName } from "@/lib/native-select";
import type { Client, DailyListing, Matter, User } from "@/types";

const selectClass = nativeSelectClassName("lg");

const KIND_OPTIONS: { value: TaskKind; label: string }[] = [
  { value: "task", label: "Task" },
  { value: "follow_up", label: "Follow-up" },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

export interface TaskFormProps {
  mode: "create" | "edit";
  firmId: string | null;
  task?: Task;
  defaultMatterId?: string;
  defaultClientId?: string;
  defaultDailyListingId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({
  mode,
  firmId,
  task,
  defaultMatterId,
  defaultClientId,
  defaultDailyListingId,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [listings, setListings] = useState<DailyListing[]>([]);
  const [firmUsers, setFirmUsers] = useState<User[]>([]);

  const [title, setTitle] = useState(task?.title ?? "");
  const [kind, setKind] = useState<TaskKind>(task?.kind ?? "task");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "pending");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueLocal, setDueLocal] = useState(isoToDatetimeLocal(task?.dueAt));
  const [reminderLocal, setReminderLocal] = useState(
    isoToDatetimeLocal(task?.reminderAt)
  );
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? "");
  const [matterId, setMatterId] = useState(
    task?.matterId ?? defaultMatterId ?? ""
  );
  const [clientId, setClientId] = useState(task?.clientId ?? defaultClientId ?? "");
  const [dailyListingId, setDailyListingId] = useState(
    task?.dailyListingId ?? defaultDailyListingId ?? ""
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!firmId) {
      setMatters([]);
      setClients([]);
      setListings([]);
      return;
    }
    let cancelled = false;
    Promise.all([
      mattersService.list({ firmId }),
      clientsService.list(firmId),
      dailyListingsService.list({ page: 1, limit: 100 }),
    ])
      .then(([mr, cr, lr]) => {
        if (cancelled) return;
        setMatters(mr.data);
        setClients(cr.data);
        setListings(lr.data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load link options");
      });
    return () => {
      cancelled = true;
    };
  }, [firmId]);

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

  async function submit() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (dueLocal.trim() && isPastDatetimeLocal(dueLocal)) {
      toast.error("Due date and time cannot be in the past");
      return;
    }
    if (reminderLocal.trim() && isPastDatetimeLocal(reminderLocal)) {
      toast.error("Reminder date and time cannot be in the past");
      return;
    }

    const payload: CreateTaskDto = {
      title: title.trim(),
      kind,
      status,
      description: description.trim() || undefined,
      dueAt: dueLocal ? datetimeLocalToIso(dueLocal) : undefined,
      reminderAt: reminderLocal ? datetimeLocalToIso(reminderLocal) : undefined,
      assigneeId: assigneeId || undefined,
      matterId: matterId || undefined,
      clientId: clientId || undefined,
      dailyListingId: dailyListingId || undefined,
    };

    setSaving(true);
    try {
      if (mode === "edit" && task) {
        await tasksService.update(task.id, {
          ...payload,
          matterId: matterId || null,
          clientId: clientId || null,
          dailyListingId: dailyListingId || null,
          description: payload.description ?? null,
        });
        toast.success("Task updated");
      } else {
        await tasksService.create(firmId, payload);
        toast.success("Task created");
      }
      onSuccess();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  function matterLabel(m: Matter): string {
    const n = m.matterName?.trim();
    if (n) return n;
    return m.id.slice(0, 8) + "…";
  }

  return (
    <div className="space-y-6">
      <FormSection
        icon={ListChecks}
        title="Task details"
        description="Optional links help relate this item to a matter, client, or diary row."
      >
        <div className="min-w-0 space-y-4 md:col-span-12">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-kind">Kind</Label>
              <select
                id="task-kind"
                className={selectClass}
                value={kind}
                onChange={(e) => setKind(e.target.value as TaskKind)}
              >
                {KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <select
                id="task-status"
                className={selectClass}
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Notes (optional)"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <IsoDatetimeLocalPicker
              id="task-due"
              label="Due"
              value={dueLocal}
              onChange={setDueLocal}
              placeholder="No due date"
              showFooterActions
              preventPast
            />
            <IsoDatetimeLocalPicker
              id="task-reminder"
              label="Reminder"
              value={reminderLocal}
              onChange={setReminderLocal}
              placeholder="No reminder"
              showFooterActions
              preventPast
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-assignee">Assignee</Label>
            <select
              id="task-assignee"
              className={selectClass}
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {firmUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name?.trim() || u.email || u.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="task-matter">Matter</Label>
              <select
                id="task-matter"
                className={selectClass}
                value={matterId}
                onChange={(e) => setMatterId(e.target.value)}
                disabled={!firmId}
              >
                <option value="">None</option>
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {matterLabel(m)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="task-client">Client</Label>
              <select
                id="task-client"
                className={selectClass}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={!firmId}
              >
                <option value="">None</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="task-dl">Daily listing</Label>
              <select
                id="task-dl"
                className={selectClass}
                value={dailyListingId}
                onChange={(e) => setDailyListingId(e.target.value)}
                disabled={!firmId}
              >
                <option value="">None</option>
                {listings.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.caseNo?.trim() || d.id.slice(0, 8) + "…"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </FormSection>
      <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-border/80 bg-muted/30 p-4 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="button" onClick={() => void submit()} disabled={saving}>
          {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Create"}
        </Button>
      </div>
    </div>
  );
}
