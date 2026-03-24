"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FormScreen } from "@/components/dashboard/form-screen";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { HearingForm } from "../_components/hearing-form";

function NewHearingContent() {
  const searchParams = useSearchParams();
  const matterId = searchParams.get("matterId") ?? undefined;

  return (
    <FormScreen
      backHref="/hearings"
      title="New hearing"
      description="Schedule a hearing with matter, dates, parties, and status."
      wide
    >
      <HearingForm mode="create" defaultMatterId={matterId} />
    </FormScreen>
  );
}

export default function NewHearingPage() {
  return (
    <Suspense fallback={<LoadingSkeleton type="form" />}>
      <NewHearingContent />
    </Suspense>
  );
}
