"use client";

import { useEffect, useRef } from "react";
import {
  format,
  isBefore,
  isSameDay,
  parse,
  startOfDay,
} from "date-fns";
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

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export interface IsoDatetimeLocalPickerProps {
  /** `YYYY-MM-DDTHH:mm` (datetime-local) or empty */
  value: string;
  onChange: (local: string) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  /** Shown when no value is selected */
  placeholder?: string;
  showFooterActions?: boolean;
  /** Earliest selectable calendar day (`YYYY-MM-DD`) */
  minDate?: string;
  /** Latest selectable calendar day (`YYYY-MM-DD`) */
  maxDate?: string;
  /** When true, calendar and time cannot be before the current moment (local). */
  preventPast?: boolean;
}

function todayIsoDate(): string {
  const d = new Date();
  return format(d, "yyyy-MM-dd");
}

/** Prefer the later of two `YYYY-MM-DD` strings (or `b` if `a` is empty). */
function laterIsoDate(a: string | undefined, b: string): string {
  const ta = a?.trim();
  if (!ta) return b;
  try {
    const da = startOfDay(parse(ta, "yyyy-MM-dd", new Date()));
    const db = startOfDay(parse(b, "yyyy-MM-dd", new Date()));
    return isBefore(da, db) ? b : ta;
  } catch {
    return b;
  }
}

function parseLocalToDate(local: string): Date | undefined {
  const t = local?.trim();
  if (!t) return undefined;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

function toDatetimeLocalString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseIsoDateToLocal(iso: string): Date | undefined {
  if (!iso?.trim()) return undefined;
  try {
    return parse(iso.trim(), "yyyy-MM-dd", new Date());
  } catch {
    return undefined;
  }
}

function TimeColumn({
  values,
  selected,
  onSelect,
  ariaLabel,
  listRef,
  isValueDisabled,
}: {
  values: number[];
  selected: number | null;
  onSelect: (n: number) => void;
  ariaLabel: string;
  listRef: React.RefObject<HTMLDivElement | null>;
  isValueDisabled?: (v: number) => boolean;
}) {
  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={ariaLabel}
      className="max-h-48 w-12 shrink-0 overflow-y-auto overscroll-contain py-1"
    >
      {values.map((v) => {
        const disabled = isValueDisabled?.(v) ?? false;
        return (
          <button
            key={v}
            type="button"
            role="option"
            aria-selected={selected === v}
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-center rounded px-1 py-1 text-sm tabular-nums transition-colors hover:bg-muted",
              disabled && "cursor-not-allowed opacity-35 hover:bg-transparent",
              !disabled &&
                selected !== null &&
                selected === v &&
                "bg-primary font-medium text-primary-foreground hover:bg-primary"
            )}
            onClick={() => {
              if (!disabled) onSelect(v);
            }}
          >
            {String(v).padStart(2, "0")}
          </button>
        );
      })}
    </div>
  );
}

export function IsoDatetimeLocalPicker({
  value,
  onChange,
  label,
  id,
  placeholder = "dd-mm-yyyy --:--",
  disabled,
  className,
  triggerClassName,
  showFooterActions = true,
  minDate,
  maxDate,
  preventPast = false,
}: IsoDatetimeLocalPickerProps) {
  const dateValue = parseLocalToDate(value);
  const hasValue = Boolean(value?.trim());
  const hour = hasValue && dateValue ? dateValue.getHours() : null;
  const minute = hasValue && dateValue ? dateValue.getMinutes() : null;

  const effectiveMinDate = preventPast
    ? laterIsoDate(minDate, todayIsoDate())
    : minDate;
  const minD = parseIsoDateToLocal(effectiveMinDate ?? "");
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

  const now = new Date();

  function clampToNowIfNeeded(d: Date): Date {
    if (!preventPast) return d;
    return d.getTime() < now.getTime() ? new Date(now) : d;
  }

  function isHourDisabled(h: number): boolean {
    if (!preventPast || !dateValue) return false;
    if (!isSameDay(dateValue, now)) return false;
    return h < now.getHours();
  }

  function isMinuteDisabled(m: number): boolean {
    if (!preventPast || !dateValue) return false;
    if (!isSameDay(dateValue, now)) return false;
    const hh = hour ?? 0;
    if (hh > now.getHours()) return false;
    if (hh < now.getHours()) return true;
    return m < now.getMinutes();
  }

  const display =
    dateValue && format(dateValue, "dd-MM-yyyy HH:mm");

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasValue || hour === null || minute === null) return;
    const hb = hourRef.current?.querySelector(`[aria-selected="true"]`);
    const mb = minuteRef.current?.querySelector(`[aria-selected="true"]`);
    hb?.scrollIntoView({ block: "center" });
    mb?.scrollIntoView({ block: "center" });
  }, [hasValue, hour, minute, value]);

  function applyDateParts(next: Date) {
    onChange(toDatetimeLocalString(clampToNowIfNeeded(next)));
  }

  const setToday = () => {
    const t = new Date();
    let d = t;
    if (minD && isBefore(startOfDay(d), startOfDay(minD))) {
      d = new Date(minD);
      d.setHours(t.getHours(), t.getMinutes(), 0, 0);
    }
    if (maxD && isBefore(startOfDay(maxD), startOfDay(d))) {
      d = new Date(maxD);
      d.setHours(23, 59, 0, 0);
    }
    onChange(toDatetimeLocalString(clampToNowIfNeeded(d)));
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
              <span className={cn(!display && "text-muted-foreground")}>
                {display ?? placeholder}
              </span>
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row">
            <div className="flex flex-col">
              <Calendar
                mode="single"
                selected={dateValue}
                disabled={calendarDisabled}
                onSelect={(date) => {
                  if (!date) {
                    onChange("");
                    return;
                  }
                  const base = dateValue ?? new Date();
                  const next = new Date(date);
                  next.setHours(
                    dateValue ? base.getHours() : preventPast ? now.getHours() : 0,
                    dateValue ? base.getMinutes() : preventPast ? now.getMinutes() : 0,
                    0,
                    0
                  );
                  applyDateParts(next);
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
            </div>
            <div className="flex shrink-0 gap-0 border-t border-border/80 sm:border-t-0 sm:border-l">
              <TimeColumn
                listRef={hourRef}
                ariaLabel="Hour"
                values={HOURS}
                selected={hour}
                isValueDisabled={preventPast ? isHourDisabled : undefined}
                onSelect={(h) => {
                  const base = dateValue ?? new Date();
                  const next = new Date(base);
                  const mm = minute ?? 0;
                  next.setHours(h, mm, 0, 0);
                  applyDateParts(next);
                }}
              />
              <TimeColumn
                listRef={minuteRef}
                ariaLabel="Minute"
                values={MINUTES}
                selected={minute}
                isValueDisabled={preventPast ? isMinuteDisabled : undefined}
                onSelect={(m) => {
                  const base = dateValue ?? new Date();
                  const next = new Date(base);
                  const hh = hour ?? 0;
                  next.setHours(hh, m, 0, 0);
                  applyDateParts(next);
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
