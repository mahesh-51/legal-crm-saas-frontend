"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { InviteMemberForm } from "@/components/team/invite-member-form";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function InviteUserPage() {
  const firmId = useCurrentFirmId();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invite Firm Member"
        description="Select role, modules, and allowed actions."
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
        <InviteMemberForm firmId={firmId} />
      </div>
    </div>
  );
}
