"use client";

import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { EditMemberPermissionsForm } from "@/components/team/edit-member-permissions-form";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function EditUserPermissionsPage() {
  const params = useParams();
  const userId = params.userId as string;
  const firmId = useCurrentFirmId();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Member Permissions"
        description="Update module access and allowed actions."
        action={
          <Link
            href="/users"
            className={cn(buttonVariants({ variant: "outline", size: "default" }))}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Link>
        }
      />

      <div className="max-w-4xl rounded-xl border bg-card p-6">
        <EditMemberPermissionsForm firmId={firmId} userId={userId} />
      </div>
    </div>
  );
}

