import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { HearingsList } from "./hearings-list";

export default function HearingsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton type="table" />}>
      <HearingsList />
    </Suspense>
  );
}
