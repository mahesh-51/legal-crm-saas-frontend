"use client";

import { useField } from "formik";
import { IsoDatePicker } from "@/components/ui/iso-date-picker";

interface FormikDatePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: string;
  maxDate?: string;
}

export function FormikDatePicker({
  name,
  label,
  placeholder = "Pick a date",
  disabled,
  className,
  minDate,
  maxDate,
}: FormikDatePickerProps) {
  const [field, meta, helpers] = useField<string | undefined>(name);

  return (
    <div className="space-y-2">
      <IsoDatePicker
        id={name}
        label={label}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        value={field.value ?? ""}
        onChange={(iso) => helpers.setValue(iso || undefined)}
        displayFormat="PPP"
        showFooterActions
        minDate={minDate}
        maxDate={maxDate}
      />
      {meta.touched && meta.error && (
        <p className="text-sm text-destructive">{meta.error}</p>
      )}
    </div>
  );
}
