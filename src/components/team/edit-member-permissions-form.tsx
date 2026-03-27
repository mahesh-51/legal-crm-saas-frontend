"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModuleMultiSelect } from "@/components/team/module-multi-select";
import { getErrorMessage } from "@/lib/api/error-handler";
import { firmUsersService } from "@/lib/api/services/firm-users.service";
import { invitesService } from "@/lib/api/services/invites.service";
import type { ModuleActionItem, ModulePermissionSelection } from "@/types";

interface EditMemberPermissionsFormProps {
  firmId: string | null;
  userId: string;
}

interface MemberDetails {
  userId: string;
  name: string;
  email: string;
  role: string;
  modulePermissions: ModulePermissionSelection[];
}

export function EditMemberPermissionsForm({ firmId, userId }: EditMemberPermissionsFormProps) {
  const router = useRouter();
  const [catalog, setCatalog] = useState<ModuleActionItem[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [member, setMember] = useState<MemberDetails | null>(null);
  const [isMemberLoading, setIsMemberLoading] = useState(true);
  const [memberError, setMemberError] = useState<string | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modulePermissions, setModulePermissions] = useState<ModulePermissionSelection[]>([]);

  const isFirmAdmin = member?.role === "FIRM_ADMIN";

  useEffect(() => {
    if (!firmId) {
      setIsMemberLoading(false);
      setMemberError("Firm context is unavailable. Please refresh and try again.");
      return;
    }

    let cancelled = false;
    async function loadMember() {
      setIsMemberLoading(true);
      setMemberError(null);
      try {
        const { data } = await firmUsersService.list(firmId);
        const row = data.find((item) => item.userId === userId || item.user?.id === userId);
        if (!row) {
          if (!cancelled) setMemberError("Team member not found.");
          return;
        }
        const details: MemberDetails = {
          userId: row.userId,
          name: row.user?.name ?? row.name ?? row.email ?? "Unknown User",
          email: row.user?.email ?? row.email ?? "",
          role: row.role ?? row.user?.role ?? "LAWYER",
          modulePermissions: row.modulePermissions ?? [],
        };
        if (!cancelled) {
          setMember(details);
          setModulePermissions(details.modulePermissions);
        }
      } catch (error) {
        if (!cancelled) setMemberError(getErrorMessage(error));
      } finally {
        if (!cancelled) setIsMemberLoading(false);
      }
    }

    void loadMember();
    return () => {
      cancelled = true;
    };
  }, [firmId, userId]);

  useEffect(() => {
    let cancelled = false;
    async function loadCatalog() {
      setIsCatalogLoading(true);
      setCatalogError(null);
      try {
        const { data } = await invitesService.getModulesActions();
        if (!cancelled) setCatalog(data);
      } catch (error) {
        if (!cancelled) setCatalogError(getErrorMessage(error));
      } finally {
        if (!cancelled) setIsCatalogLoading(false);
      }
    }

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedModules = useMemo(
    () => modulePermissions.map((permission) => permission.module),
    [modulePermissions]
  );

  const updateSelectedModules = (selectedModuleNames: string[]) => {
    const nextPermissions = selectedModuleNames.map((moduleName) => {
      const existing = modulePermissions.find((permission) => permission.module === moduleName);
      return { module: moduleName, actions: existing?.actions ?? [] };
    });
    setModulePermissions(nextPermissions);
  };

  const toggleAction = (moduleName: string, actionName: string, checked: boolean) => {
    const existing = modulePermissions.find((permission) => permission.module === moduleName);
    const existingActions = existing?.actions ?? [];
    const nextActions = checked
      ? Array.from(new Set([...existingActions, actionName]))
      : existingActions.filter((action) => action !== actionName);

    setModulePermissions((current) =>
      current.map((permission) =>
        permission.module === moduleName ? { ...permission, actions: nextActions } : permission
      )
    );
  };

  const submit = async () => {
    if (!firmId || !member || isFirmAdmin) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await firmUsersService.updateModulePermissions(firmId, member.userId, {
        modulePermissions: modulePermissions.filter((item) => item.actions.length > 0),
      });
      toast.success("Permissions updated successfully.");
      router.push("/users");
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isMemberLoading) {
    return <div className="rounded-md border p-4 text-sm text-muted-foreground">Loading member...</div>;
  }

  if (memberError) {
    return (
      <div className="space-y-3 rounded-md border border-destructive/40 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{memberError}</p>
        <Button type="button" variant="outline" onClick={() => router.push("/users")}>
          Back to Team
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="text-xs uppercase text-muted-foreground">Name</p>
          <p className="mt-1 text-sm font-medium">{member?.name}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs uppercase text-muted-foreground">Email</p>
          <p className="mt-1 text-sm font-medium">{member?.email || "—"}</p>
        </div>
      </div>

      {isFirmAdmin ? (
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          Firm Admin has full access by default. Module permissions are not editable.
        </p>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium">Module and action permissions</p>

        {isCatalogLoading ? (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            Loading module permissions...
          </div>
        ) : null}

        {!isCatalogLoading && catalogError ? (
          <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">Failed to load module catalog: {catalogError}</p>
          </div>
        ) : null}

        {!isCatalogLoading && !catalogError && !isFirmAdmin ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Modules (multi-select)</label>
              <ModuleMultiSelect
                options={catalog.map((item) => item.module)}
                disabled={isSubmitting}
                value={selectedModules}
                onChange={updateSelectedModules}
              />
            </div>

            {modulePermissions.map((permission) => {
              const moduleItem = catalog.find((item) => item.module === permission.module);
              if (!moduleItem) return null;
              return (
                <div key={permission.module} className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium uppercase">
                    {permission.module.replaceAll("-", " ")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {moduleItem.actions.map((action) => {
                      const actionChecked = permission.actions.includes(action);
                      return (
                        <label
                          key={`${permission.module}-${action}`}
                          className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs uppercase"
                        >
                          <input
                            type="checkbox"
                            checked={actionChecked}
                            disabled={isSubmitting}
                            onChange={(event) =>
                              toggleAction(permission.module, action, event.target.checked)
                            }
                            className="h-4 w-4 rounded border-input"
                          />
                          {action}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {submitError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
          <p className="text-sm text-destructive">{submitError}</p>
        </div>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/users")}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={isSubmitting || isCatalogLoading || !!catalogError || isFirmAdmin}
        >
          {isSubmitting ? "Saving..." : "Save permissions"}
        </Button>
      </div>
    </div>
  );
}

