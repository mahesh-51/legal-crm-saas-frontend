"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormScreen } from "@/components/dashboard/form-screen";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { MeetingForm } from "../_components/meeting-form";

function NewMeetingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firmId = useCurrentFirmId();
  const matterId = searchParams.get("matterId") ?? undefined;
  const clientId = searchParams.get("clientId") ?? undefined;
  const dailyListingId = searchParams.get("dailyListingId") ?? undefined;

  return (
    <FormScreen
      backHref="/meetings"
      title="Schedule meeting"
      description="Set time, optional video link, and links to matter or client."
      wide
    >
      <MeetingForm
        mode="create"
        firmId={firmId}
        defaultMatterId={matterId}
        defaultClientId={clientId}
        defaultDailyListingId={dailyListingId}
        onSuccess={() => router.push("/meetings")}
        onCancel={() => router.push("/meetings")}
      />
    </FormScreen>
  );
}

export default function NewMeetingPage() {
  return (
    <Suspense fallback={<LoadingSkeleton type="form" />}>
      <NewMeetingContent />
    </Suspense>
  );
}
