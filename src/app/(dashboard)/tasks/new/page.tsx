"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormScreen } from "@/components/dashboard/form-screen";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { TaskForm } from "../_components/task-form";

function NewTaskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firmId = useCurrentFirmId();
  const matterId = searchParams.get("matterId") ?? undefined;
  const clientId = searchParams.get("clientId") ?? undefined;
  const dailyListingId = searchParams.get("dailyListingId") ?? undefined;

  return (
    <FormScreen
      backHref="/tasks"
      title="New task"
      description="Add a task or follow-up; link it to a matter, client, or diary row if needed."
      wide
    >
      <TaskForm
        mode="create"
        firmId={firmId}
        defaultMatterId={matterId}
        defaultClientId={clientId}
        defaultDailyListingId={dailyListingId}
        onSuccess={() => router.push("/tasks")}
        onCancel={() => router.push("/tasks")}
      />
    </FormScreen>
  );
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={<LoadingSkeleton type="form" />}>
      <NewTaskContent />
    </Suspense>
  );
}
