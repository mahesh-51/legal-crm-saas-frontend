"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormScreen } from "@/components/dashboard/form-screen";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { tasksService, type Task } from "@/lib/api/services/tasks.service";
import { getErrorMessage } from "@/lib/api/error-handler";
import { TaskForm } from "../../_components/task-form";

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const firmId = useCurrentFirmId();
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    let cancelled = false;
    tasksService
      .getById(id)
      .then(({ data }) => {
        if (!cancelled) setTask(data);
      })
      .catch(() => {
        toast.error("Could not load task");
        router.replace("/tasks");
      });
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (!task) {
    return <LoadingSkeleton type="form" />;
  }

  return (
    <FormScreen
      backHref="/tasks"
      title="Edit task"
      description="Update title, status, due dates, assignment, and links."
      wide
    >
      <TaskForm
        mode="edit"
        firmId={firmId}
        task={task}
        onSuccess={() => router.push("/tasks")}
        onCancel={() => router.push("/tasks")}
      />
    </FormScreen>
  );
}
