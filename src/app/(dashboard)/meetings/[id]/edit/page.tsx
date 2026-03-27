"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormScreen } from "@/components/dashboard/form-screen";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { meetingsService, type Meeting } from "@/lib/api/services/meetings.service";
import { MeetingForm } from "../../_components/meeting-form";

export default function EditMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const firmId = useCurrentFirmId();
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    let cancelled = false;
    meetingsService
      .getById(id)
      .then(({ data }) => {
        if (!cancelled) setMeeting(data);
      })
      .catch(() => {
        toast.error("Could not load meeting");
        router.replace("/meetings");
      });
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (!meeting) {
    return <LoadingSkeleton type="form" />;
  }

  return (
    <FormScreen
      backHref="/meetings"
      title="Edit meeting"
      description="Update time, link, status, and associations."
      wide
    >
      <MeetingForm
        mode="edit"
        firmId={firmId}
        meeting={meeting}
        onSuccess={() => router.push("/meetings")}
        onCancel={() => router.push("/meetings")}
      />
    </FormScreen>
  );
}
