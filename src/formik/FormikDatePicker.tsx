"use client";

import { useField } from "formik";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";

interface FormikDatePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FormikDatePicker({
  name,
  label,
  placeholder = "Pick a date",
  disabled,
  className,
}: FormikDatePickerProps) {
  const [field, meta, helpers] = useField<string | undefined>(name);
  const dateValue = field.value ? new Date(field.value) : undefined;

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Popover>
        <PopoverTrigger>
          <Button
            variant="outline"
            disabled={disabled}
            className={`w-full justify-start text-left font-normal ${className}`}
            aria-invalid={meta.touched && !!meta.error}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? format(dateValue, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={(date) => helpers.setValue(date?.toISOString() ?? "")}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {meta.touched && meta.error && (
        <p className="text-sm text-destructive">{meta.error}</p>
      )}
    </div>
  );
}
