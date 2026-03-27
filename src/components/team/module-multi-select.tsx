"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ModuleMultiSelectProps {
  options: string[];
  value: string[];
  onChange: (nextValue: string[]) => void;
  disabled?: boolean;
}

function prettyModuleName(moduleName: string): string {
  return moduleName.replaceAll("-", " ");
}

export function ModuleMultiSelect({
  options,
  value,
  onChange,
  disabled = false,
}: ModuleMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => new Set(value), [value]);

  const toggleModule = (moduleName: string) => {
    if (selected.has(moduleName)) {
      onChange(value.filter((item) => item !== moduleName));
      return;
    }
    onChange([...value, moduleName]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-10 w-full justify-between whitespace-normal px-3 py-2"
              disabled={disabled}
            />
          }
        >
          <div className="flex flex-1 flex-wrap items-center gap-1.5 text-left">
            {value.length === 0 ? (
              <span className="text-sm text-muted-foreground">Select modules...</span>
            ) : (
              value.map((moduleName) => (
                <Badge key={moduleName} variant="secondary" className="uppercase">
                  {prettyModuleName(moduleName)}
                </Badge>
              ))
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[340px] max-w-[90vw] p-2">
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {options.map((moduleName) => {
              const checked = selected.has(moduleName);
              return (
                <button
                  key={moduleName}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm uppercase hover:bg-muted",
                    checked && "bg-muted"
                  )}
                  onClick={() => toggleModule(moduleName)}
                >
                  <span>{prettyModuleName(moduleName)}</span>
                  <Check className={cn("h-4 w-4", checked ? "opacity-100" : "opacity-0")} />
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
