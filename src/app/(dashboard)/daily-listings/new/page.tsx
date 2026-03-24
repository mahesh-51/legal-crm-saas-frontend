"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FormScreen } from "@/components/dashboard/form-screen";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { DailyListingForm } from "../_components/daily-listing-form";

function NewDailyListingContent() {
  const searchParams = useSearchParams();
  const matterId = searchParams.get("matterId") ?? undefined;

  return (
    <FormScreen
      backHref="/daily-listings"
      title="New daily listing"
      description="Add a court diary row with clients, parties, dates, and status."
      wide
    >
      <DailyListingForm mode="create" defaultMatterId={matterId} />
    </FormScreen>
  );
}

export default function NewDailyListingPage() {
  return (
    <Suspense fallback={<LoadingSkeleton type="form" />}>
      <NewDailyListingContent />
    </Suspense>
  );
}
