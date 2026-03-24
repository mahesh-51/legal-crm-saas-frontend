"use client";

import { useField } from "formik";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
}

export function FormikSelectField({
  name,
  label,
  placeholder = "Select...",
  options,
  disabled,
  className,
}: FormikSelectFieldProps) {
  const [field, meta, helpers] = useField(name);

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
          className={className}
          aria-invalid={meta.touched && !!meta.error}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
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
