"use client";

import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { useField } from "formik";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface FormikSelectFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon;
  /**
   * When the field value is an id not yet present in `options` (loading, or server-only row),
   * pass the label to show instead of the raw UUID in the trigger.
   */
  selectedDisplayLabel?: string;
}

function optionsIncludingSelection(
  options: SelectOption[],
  value: unknown,
  selectedDisplayLabel?: string
): SelectOption[] {
  if (value === undefined || value === null || value === "") return options;
  const v = String(value);
  if (options.some((o) => o.value === v)) return options;
  const label = selectedDisplayLabel?.trim();
  if (label) {
    return [...options, { value: v, label }];
  }
  return options;
}

/** Base UI Select keeps items out of the store until the list is open, so SelectValue falls back to the raw value; resolve labels ourselves. */
function resolveTriggerLabel(
  value: unknown,
  merged: SelectOption[],
  selectedDisplayLabel: string | undefined,
  placeholder: string
): string {
  if (value === undefined || value === null) {
    return placeholder;
  }
  const vs = String(value);
  const opt = merged.find((o) => o.value === vs);
  if (opt?.label != null && opt.label !== "") {
    return opt.label;
  }
  const fb = selectedDisplayLabel?.trim();
  if (fb) return fb;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vs)) {
    return "—";
  }
  return vs;
}

export function FormikSelectField({
  name,
  label,
  placeholder = "Select...",
  options,
  disabled,
  className,
  icon: Icon,
  selectedDisplayLabel,
}: FormikSelectFieldProps) {
  const [field, meta, helpers] = useField(name);

  const mergedOptions = useMemo(
    () => optionsIncludingSelection(options, field.value, selectedDisplayLabel),
    [options, field.value, selectedDisplayLabel]
  );

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Select
        value={field.value}
        onValueChange={(value) => helpers.setValue(value)}
        disabled={disabled}
      >
        <SelectTrigger
          id={name}
          className={cn(
            "w-full min-w-0 justify-between gap-2",
            Icon && "data-[size=default]:h-10",
            className
          )}
          aria-invalid={meta.touched && !!meta.error}
        >
          {Icon ? (
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden strokeWidth={1.75} />
          ) : null}
          <SelectValue placeholder={placeholder}>
            {(value) =>
              resolveTriggerLabel(value, mergedOptions, selectedDisplayLabel, placeholder)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {mergedOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {meta.touched && meta.error && (
        <p className="text-sm text-destructive">{meta.error}</p>
      )}
    </div>
  );
}
