"use client";

import { format, isBefore, parse, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type IsoDatePickerDisplayFormat = "PPP" | "dd-MM-yyyy";

export interface IsoDatePickerProps {
  /** `YYYY-MM-DD` or empty string when cleared */
  value: string;
  onChange: (isoDate: string) => void;
  label?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Button / popover trigger layout */
  triggerClassName?: string;
  /** How to show the selected date in the trigger (default matches add-listing form: `PPP`) */
  displayFormat?: IsoDatePickerDisplayFormat;
  /** Show Clear + Today actions in the popover (matches common calendar UX) */
  showFooterActions?: boolean;
  /** Earliest selectable day (`YYYY-MM-DD`); days before this are disabled in the calendar. */
  minDate?: string;
  /** Latest selectable day (`YYYY-MM-DD`); days after this are disabled in the calendar. */
  maxDate?: string;
}

function parseIsoDateToLocal(iso: string): Date | undefined {
  if (!iso?.trim()) return undefined;
  try {
    return parse(iso.trim(), "yyyy-MM-dd", new Date());
  } catch {
    return undefined;
  }
}

export function IsoDatePicker({
  value,
  onChange,
  label,
  id,
  placeholder = "Pick a date",
  disabled,
  className,
  triggerClassName,
  displayFormat = "PPP",
  showFooterActions = true,
  minDate,
  maxDate,
}: IsoDatePickerProps) {
  const dateValue = parseIsoDateToLocal(value);
  const minD = parseIsoDateToLocal(minDate ?? "");
  const maxD = parseIsoDateToLocal(maxDate ?? "");

  const calendarDisabled =
    minD || maxD
      ? (day: Date) => {
          const d = startOfDay(day);
          if (minD && isBefore(d, startOfDay(minD))) return true;
          if (maxD && isBefore(startOfDay(maxD), d)) return true;
          return false;
        }
      : undefined;
  const display =
    dateValue &&
    (displayFormat === "dd-MM-yyyy"
      ? format(dateValue, "dd-MM-yyyy")
      : format(dateValue, "PPP"));

  const setToday = () => {
    const t = new Date();
    let d = startOfDay(t);
    if (minD && isBefore(d, startOfDay(minD))) {
      onChange(format(minD, "yyyy-MM-dd"));
      return;
    }
    if (maxD && isBefore(startOfDay(maxD), d)) {
      onChange(format(maxD, "yyyy-MM-dd"));
      return;
    }
    onChange(format(t, "yyyy-MM-dd"));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      ) : null}
      <Popover>
        <PopoverTrigger
          disabled={disabled}
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className={cn(
                "h-10 w-full min-w-[12rem] justify-start text-left font-normal",
                triggerClassName
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              {display ?? placeholder}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            disabled={calendarDisabled}
            onSelect={(date) => {
              if (!date) {
                onChange("");
                return;
              }
              onChange(format(date, "yyyy-MM-dd"));
            }}
            initialFocus
          />
          {showFooterActions ? (
            <div className="flex items-center justify-between gap-2 border-t border-border/80 px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-primary"
                onClick={() => onChange("")}
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-primary"
                onClick={setToday}
              >
                Today
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}
