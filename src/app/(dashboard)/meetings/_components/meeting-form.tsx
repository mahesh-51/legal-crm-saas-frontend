"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";
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
  meetingsService,
  type CreateMeetingDto,
  type Meeting,
  type MeetingLinkProvider,
  type MeetingStatus,
} from "@/lib/api/services/meetings.service";
import {
  datetimeLocalToIso,
  isHttpsUrl,
  isPastDatetimeLocal,
  isoToDatetimeLocal,
} from "@/lib/datetime-local";
import { getErrorMessage } from "@/lib/api/error-handler";
import { nativeSelectClassName } from "@/lib/native-select";
import type { Client, DailyListing, Matter, User } from "@/types";

const selectClass = nativeSelectClassName("lg");

const PROVIDER_OPTIONS: { value: MeetingLinkProvider; label: string }[] = [
  { value: "google_meet", label: "Google Meet" },
  { value: "microsoft_teams", label: "Microsoft Teams" },
  { value: "zoom", label: "Zoom" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS: { value: MeetingStatus; label: string }[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export interface MeetingFormProps {
  mode: "create" | "edit";
  firmId: string | null;
  meeting?: Meeting;
  defaultMatterId?: string;
  defaultClientId?: string;
  defaultDailyListingId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MeetingForm({
  mode,
  firmId,
  meeting,
  defaultMatterId,
  defaultClientId,
  defaultDailyListingId,
  onSuccess,
  onCancel,
}: MeetingFormProps) {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [listings, setListings] = useState<DailyListing[]>([]);
  const [firmUsers, setFirmUsers] = useState<User[]>([]);

  const [title, setTitle] = useState(meeting?.title ?? "");
  const [description, setDescription] = useState(meeting?.description ?? "");
  const [startLocal, setStartLocal] = useState(isoToDatetimeLocal(meeting?.startAt));
  const [endLocal, setEndLocal] = useState(isoToDatetimeLocal(meeting?.endAt));
  const [location, setLocation] = useState(meeting?.location ?? "");
  const [meetingUrl, setMeetingUrl] = useState(meeting?.meetingUrl ?? "");
  const [provider, setProvider] = useState<MeetingLinkProvider>(
    meeting?.meetingLinkProvider ?? "other"
  );
  const [shareLinkWithClient, setShareLinkWithClient] = useState(
    meeting?.shareLinkWithClient !== false
  );
  const [reminderLocal, setReminderLocal] = useState(
    isoToDatetimeLocal(meeting?.reminderAt)
  );
  const [status, setStatus] = useState<MeetingStatus>(
    meeting?.status ?? "scheduled"
  );
  const [organizerId, setOrganizerId] = useState(meeting?.organizerId ?? "");
  const [matterId, setMatterId] = useState(
    meeting?.matterId ?? defaultMatterId ?? ""
  );
  const [clientId, setClientId] = useState(
    meeting?.clientId ?? defaultClientId ?? ""
  );
  const [dailyListingId, setDailyListingId] = useState(
    meeting?.dailyListingId ?? defaultDailyListingId ?? ""
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

  function matterLabel(m: Matter): string {
    const n = m.matterName?.trim();
    if (n) return n;
    return m.id.slice(0, 8) + "…";
  }

  async function submit() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!startLocal.trim()) {
      toast.error("Start time is required");
      return;
    }
    if (isPastDatetimeLocal(startLocal)) {
      toast.error("Start date and time cannot be in the past");
      return;
    }
    if (endLocal.trim() && isPastDatetimeLocal(endLocal)) {
      toast.error("End date and time cannot be in the past");
      return;
    }
    if (reminderLocal.trim() && isPastDatetimeLocal(reminderLocal)) {
      toast.error("Reminder date and time cannot be in the past");
      return;
    }
    const url = meetingUrl.trim();
    if (url && !isHttpsUrl(url)) {
      toast.error("Meeting link must be a valid https:// URL");
      return;
    }

    const base: CreateMeetingDto = {
      title: title.trim(),
      startAt: datetimeLocalToIso(startLocal),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      meetingUrl: url || undefined,
      meetingLinkProvider: url ? provider : undefined,
      shareLinkWithClient,
      endAt: endLocal ? datetimeLocalToIso(endLocal) : undefined,
      reminderAt: reminderLocal ? datetimeLocalToIso(reminderLocal) : undefined,
      status,
      matterId: matterId || undefined,
      clientId: clientId || undefined,
      dailyListingId: dailyListingId || undefined,
      organizerId: organizerId || undefined,
    };

    setSaving(true);
    try {
      if (mode === "edit" && meeting) {
        await meetingsService.update(meeting.id, {
          title: base.title,
          startAt: base.startAt,
          description: base.description ?? null,
          location: base.location ?? null,
          meetingUrl: base.meetingUrl ?? null,
          meetingLinkProvider: base.meetingLinkProvider ?? null,
          shareLinkWithClient: base.shareLinkWithClient,
          endAt: base.endAt ?? null,
          reminderAt: base.reminderAt ?? null,
          status: base.status,
          matterId: matterId || null,
          clientId: clientId || null,
          dailyListingId: dailyListingId || null,
          organizerId: organizerId || null,
        });
        toast.success("Meeting updated");
      } else {
        await meetingsService.create(firmId, base);
        toast.success("Meeting scheduled");
      }
      onSuccess();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <FormSection
        icon={Video}
        title="Meeting"
        description="Schedule a time, optional video link, and links to matter or client."
      >
        <div className="min-w-0 space-y-4 md:col-span-12">
          <div className="space-y-2">
            <Label htmlFor="meet-title">Title</Label>
            <Input
              id="meet-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting subject"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meet-desc">Description</Label>
            <Textarea
              id="meet-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Agenda or notes (optional)"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <IsoDatetimeLocalPicker
              id="meet-start"
              label="Start"
              value={startLocal}
              onChange={setStartLocal}
              placeholder="Pick start"
              showFooterActions
              preventPast
            />
            <IsoDatetimeLocalPicker
              id="meet-end"
              label="End"
              value={endLocal}
              onChange={setEndLocal}
              placeholder="No end time"
              showFooterActions
              preventPast
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meet-loc">Location</Label>
            <Input
              id="meet-loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room or address (optional)"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meet-url">Meeting URL</Label>
              <Input
                id="meet-url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://…"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meet-provider">Link provider</Label>
              <select
                id="meet-provider"
                className={selectClass}
                value={provider}
                onChange={(e) =>
                  setProvider(e.target.value as MeetingLinkProvider)
                }
              >
                {PROVIDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input"
              checked={shareLinkWithClient}
              onChange={(e) => setShareLinkWithClient(e.target.checked)}
            />
            Share link with client
          </label>
          <IsoDatetimeLocalPicker
            id="meet-reminder"
            label="Reminder"
            value={reminderLocal}
            onChange={setReminderLocal}
            placeholder="No reminder"
            showFooterActions
            preventPast
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meet-status">Status</Label>
              <select
                id="meet-status"
                className={selectClass}
                value={status}
                onChange={(e) => setStatus(e.target.value as MeetingStatus)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meet-organizer">Organizer</Label>
              <select
                id="meet-organizer"
                className={selectClass}
                value={organizerId}
                onChange={(e) => setOrganizerId(e.target.value)}
              >
                <option value="">None</option>
                {firmUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name?.trim() || u.email || u.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="meet-matter">Matter</Label>
              <select
                id="meet-matter"
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
              <Label htmlFor="meet-client">Client</Label>
              <select
                id="meet-client"
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
              <Label htmlFor="meet-dl">Daily listing</Label>
              <select
                id="meet-dl"
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
          {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Schedule"}
        </Button>
      </div>
    </div>
  );
}
