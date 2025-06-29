
"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  currentRange?: DateRange;
  onRangeChange: (range: DateRange | undefined) => void;
  maxDays?: number;
}

export function DateRangePicker({
  className,
  currentRange,
  onRangeChange,
  maxDays = 365, // Default max range of 1 year
}: DateRangePickerProps) {
  const [range, setRange] = React.useState<DateRange | undefined>(currentRange);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setRange(currentRange);
  }, [currentRange]);

  const handleSelect = (selectedRange: DateRange | undefined) => {
    setRange(selectedRange);
    if (selectedRange?.from && selectedRange?.to) {
      onRangeChange(selectedRange);
      setIsOpen(false); 
    } else if (!selectedRange?.from && !selectedRange?.to) { // Handle clearing the range
      onRangeChange(undefined);
    }
  };
  

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !range && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, "LLL dd, y", { locale: es })} -{" "}
                  {format(range.to, "LLL dd, y", { locale: es })}
                </>
              ) : (
                format(range.from, "LLL dd, y", { locale: es })
              )
            ) : (
              <span>Seleccione un rango</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={es}
            disabled={(date) => date > new Date() || date < new Date("2000-01-01")} // Example past disabled
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
