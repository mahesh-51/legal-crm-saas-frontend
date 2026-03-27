"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { firmUsersService, type FirmUserListItem } from "@/lib/api/services/firm-users.service";
import { getErrorMessage } from "@/lib/api/error-handler";

const roleLabels: Record<string, string> = {
  firm: "Firm Admin",
  lawyer: "Lawyer",
  client: "Client",
  FIRM_ADMIN: "Firm Admin",
  LAWYER: "Lawyer",
  CLIENT: "Client",
  INDIVIDUAL: "Individual",
  SUPER_ADMIN: "Super Admin",
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function prettyModuleName(moduleName: string): string {
  return moduleName.replaceAll("-", " ");
}

function prettyStatus(value?: string): string {
  if (!value) return "—";
  return value.replaceAll("_", " ");
}

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params.userId as string;
  const firmId = useCurrentFirmId();

  const [member, setMember] = useState<FirmUserListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firmId) {
      setIsLoading(false);
      setError("Firm context is unavailable. Please refresh and try again.");
      return;
    }

    let cancelled = false;
    async function loadMember() {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await firmUsersService.list(firmId);
        const row = data.find((item) => item.userId === userId || item.user?.id === userId);
        if (!cancelled) {
          if (!row) {
            setError("Team member not found.");
            setMember(null);
            return;
          }
          setMember(row);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setMember(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadMember();
    return () => {
      cancelled = true;
    };
  }, [firmId, userId]);

  const user = useMemo(() => member?.user, [member]);
  const name = user?.name ?? member?.name ?? member?.email ?? "Unknown User";
  const email = user?.email ?? member?.email ?? "—";
  const role = member?.role ?? user?.role ?? "—";
  const status = prettyStatus(member?.status);
  const createdAt = formatDate(user?.createdAt ?? member?.createdAt ?? null);
  const acceptedAt = formatDate(member?.acceptedAt ?? null);
  const permissions = member?.modulePermissions ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member details"
        description="View profile, role, status, and module permissions."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/users"
              className={cn(buttonVariants({ variant: "outline", size: "default" }))}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Team
            </Link>
            <Link
              href={`/users/${userId}/permissions`}
              className={cn(buttonVariants({ variant: "default", size: "default" }))}
            >
              Edit permissions
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Loading member details...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && member ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
              <p className="mt-1 text-sm font-medium">{name}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="mt-1 text-sm font-medium">{email}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
              <div className="mt-1">
                <Badge variant="secondary">{roleLabels[role] ?? role}</Badge>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
              <p className="mt-1 text-sm font-medium uppercase">{status}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Joined</p>
              <p className="mt-1 text-sm font-medium">{createdAt}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Accepted at</p>
              <p className="mt-1 text-sm font-medium">{acceptedAt}</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-medium">Module permissions</p>
            {permissions.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No module-specific permissions assigned.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {permissions.map((item) => (
                  <div key={item.module} className="rounded-lg border p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {prettyModuleName(item.module)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.actions.map((action) => (
                        <Badge key={`${item.module}-${action}`} variant="outline" className="uppercase">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

