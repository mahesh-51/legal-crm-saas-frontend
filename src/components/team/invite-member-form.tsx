"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Form, Formik } from "formik";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormikInputField, FormikSelectField } from "@/formik";
import { invitesService } from "@/lib/api/services";
import { getErrorMessage } from "@/lib/api/error-handler";
import { inviteMemberSchema, type InviteMemberFormValues } from "@/lib/validation/invite-member";
import type { ModuleActionItem } from "@/types";
import { ModuleMultiSelect } from "@/components/team/module-multi-select";

interface InviteMemberFormProps {
  firmId: string | null;
  onSuccess?: () => void;
}

function normalizePermissions(values: InviteMemberFormValues) {
  if (values.role === "FIRM_ADMIN") return undefined;
  return values.modulePermissions.filter((item) => item.actions.length > 0);
}

function extractBackendErrors(error: unknown): string[] {
  const axiosError = error as AxiosError<{
    message?: string;
    errors?: Record<string, string[] | string>;
  }>;
  const fieldErrors = axiosError.response?.data?.errors;
  if (!fieldErrors || typeof fieldErrors !== "object") return [];

  const lines: string[] = [];
  for (const [field, details] of Object.entries(fieldErrors)) {
    if (Array.isArray(details)) {
      for (const detail of details) {
        lines.push(`${field}: ${detail}`);
      }
      continue;
    }
    if (typeof details === "string") {
      lines.push(`${field}: ${details}`);
    }
  }
  return lines;
}

export function InviteMemberForm({ firmId, onSuccess }: InviteMemberFormProps) {
  const [catalog, setCatalog] = useState<ModuleActionItem[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [backendDetails, setBackendDetails] = useState<string[]>([]);

  const loadCatalog = async () => {
    setIsCatalogLoading(true);
    setCatalogError(null);
    try {
      const { data } = await invitesService.getModulesActions();
      setCatalog(data);
    } catch (error) {
      setCatalogError(getErrorMessage(error));
    } finally {
      setIsCatalogLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalog();
  }, []);

  const selectedModules = (values: InviteMemberFormValues): string[] =>
    values.modulePermissions.map((permission) => permission.module);

  const updateSelectedModules = (
    selectedModuleNames: string[],
    currentValues: InviteMemberFormValues
  ) => {
    const nextPermissions = selectedModuleNames.map((moduleName) => {
      const existing = currentValues.modulePermissions.find(
        (permission) => permission.module === moduleName
      );
      return { module: moduleName, actions: existing?.actions ?? [] };
    });
    return nextPermissions;
  };

  const toggleAction = (
    currentValues: InviteMemberFormValues,
    moduleName: string,
    actionName: string,
    checked: boolean
  ) => {
    const existing = currentValues.modulePermissions.find(
      (permission) => permission.module === moduleName
    );
    const existingActions = existing?.actions ?? [];
    const nextActions = checked
      ? Array.from(new Set([...existingActions, actionName]))
      : existingActions.filter((action) => action !== actionName);

    return currentValues.modulePermissions.map((permission) =>
      permission.module === moduleName
        ? {
            ...permission,
            actions: nextActions,
          }
        : permission
    );
  };

  return (
    <Formik<InviteMemberFormValues>
      initialValues={{
        email: "",
        role: "LAWYER",
        modulePermissions: [],
      }}
      validationSchema={inviteMemberSchema}
      onSubmit={async (values, helpers) => {
        if (!firmId) {
          setSubmitError("Firm context is unavailable. Please refresh and try again.");
          return;
        }

        setSubmitError(null);
        setBackendDetails([]);

        try {
          await invitesService.inviteFirmUser(firmId, {
            email: values.email,
            role: values.role,
            modulePermissions: normalizePermissions(values),
          });
          toast.success("Invite sent successfully.");
          helpers.resetForm();
          onSuccess?.();
        } catch (error) {
          const message = getErrorMessage(error);
          const details = extractBackendErrors(error);
          setSubmitError(message);
          setBackendDetails(details);
        }
      }}
    >
      {({ values, setFieldValue, isSubmitting, errors, touched }) => (
        <Form className="space-y-4">
          <FormikInputField
            name="email"
            label="Email"
            type="email"
            placeholder="lawyer@firm.com"
            disabled={isSubmitting}
          />

          <FormikSelectField
            name="role"
            label="Role"
            options={[
              { value: "FIRM_ADMIN", label: "Firm Admin" },
              { value: "LAWYER", label: "Lawyer" },
            ]}
            disabled={isSubmitting}
          />

          {values.role === "FIRM_ADMIN" ? (
            <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              Full access will be granted by default.
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
                <p className="text-sm text-destructive">
                  Failed to load module catalog: {catalogError}
                </p>
                <Button type="button" variant="outline" onClick={() => void loadCatalog()}>
                  Retry
                </Button>
              </div>
            ) : null}

            {!isCatalogLoading && !catalogError ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Modules (multi-select)
                  </label>
                  <ModuleMultiSelect
                    options={catalog.map((item) => item.module)}
                    disabled={isSubmitting || values.role === "FIRM_ADMIN"}
                    value={selectedModules(values)}
                    onChange={(selected) => {
                      setFieldValue(
                        "modulePermissions",
                        updateSelectedModules(selected, values)
                      );
                    }}
                  />
                </div>

                {values.role !== "FIRM_ADMIN" &&
                  values.modulePermissions.map((permission) => {
                    const moduleItem = catalog.find(
                      (item) => item.module === permission.module
                    );
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
                                    setFieldValue(
                                      "modulePermissions",
                                      toggleAction(
                                        values,
                                        permission.module,
                                        action,
                                        event.target.checked
                                      )
                                    )
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

            {touched.modulePermissions && errors.modulePermissions ? (
              <p className="text-sm text-destructive">{String(errors.modulePermissions)}</p>
            ) : null}
          </div>

          {submitError ? (
            <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">{submitError}</p>
              {backendDetails.map((detail) => (
                <p key={detail} className="text-xs text-destructive/90">
                  - {detail}
                </p>
              ))}
            </div>
          ) : null}

          <Button type="submit" disabled={isSubmitting || isCatalogLoading || !!catalogError}>
            {isSubmitting ? "Sending invite..." : "Send invite"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
