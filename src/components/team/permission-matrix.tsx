"use client";

import type { ModuleActionItem, ModulePermissionSelection } from "@/types";

interface PermissionMatrixProps {
  catalog: ModuleActionItem[];
  value: ModulePermissionSelection[];
  onChange: (nextValue: ModulePermissionSelection[]) => void;
  disabled?: boolean;
}

function hasAction(
  value: ModulePermissionSelection[],
  moduleName: string,
  actionName: string
): boolean {
  return (
    value.find((row) => row.module === moduleName)?.actions.includes(actionName) ?? false
  );
}

function setAction(
  value: ModulePermissionSelection[],
  moduleName: string,
  actionName: string,
  checked: boolean
): ModulePermissionSelection[] {
  const current = value.find((row) => row.module === moduleName);
  const currentActions = current?.actions ?? [];
  const nextActions = checked
    ? Array.from(new Set([...currentActions, actionName]))
    : currentActions.filter((action) => action !== actionName);

  const withoutModule = value.filter((row) => row.module !== moduleName);
  if (nextActions.length === 0) {
    return withoutModule;
  }

  return [...withoutModule, { module: moduleName, actions: nextActions }];
}

function allModuleActionsSelected(
  value: ModulePermissionSelection[],
  moduleName: string,
  actions: string[]
): boolean {
  if (actions.length === 0) return false;
  return actions.every((action) => hasAction(value, moduleName, action));
}

export function PermissionMatrix({
  catalog,
  value,
  onChange,
  disabled = false,
}: PermissionMatrixProps) {
  if (catalog.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        No module permissions available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {catalog.map((moduleItem) => {
        const moduleSelected = allModuleActionsSelected(
          value,
          moduleItem.module,
          moduleItem.actions
        );

        return (
          <div key={moduleItem.module} className="rounded-lg border p-3">
            <div className="mb-3 flex items-center gap-2">
              <input
                id={`module-${moduleItem.module}`}
                type="checkbox"
                checked={moduleSelected}
                disabled={disabled}
                onChange={(event) => {
                  const checked = event.target.checked;
                  let nextValue = value.filter((row) => row.module !== moduleItem.module);
                  if (checked && moduleItem.actions.length > 0) {
                    nextValue = [
                      ...nextValue,
                      { module: moduleItem.module, actions: [...moduleItem.actions] },
                    ];
                  }
                  onChange(nextValue);
                }}
                className="h-4 w-4 rounded border-input"
              />
              <label
                htmlFor={`module-${moduleItem.module}`}
                className="text-sm font-medium uppercase tracking-wide"
              >
                {moduleItem.module.replaceAll("-", " ")}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {moduleItem.actions.map((action) => (
                <label
                  key={`${moduleItem.module}-${action}`}
                  className="flex items-center gap-2 rounded-md border p-2 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={hasAction(value, moduleItem.module, action)}
                    disabled={disabled}
                    onChange={(event) =>
                      onChange(
                        setAction(value, moduleItem.module, action, event.target.checked)
                      )
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="uppercase">{action}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
