import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { shiftMonth } from "@/lib/dates";

interface Props {
  month: Date;
  onChange: (month: Date) => void;
}

export function MonthNav({ month, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(shiftMonth(month, -1))}
        aria-label="Previous month"
        className="inline-flex h-8 w-8 items-center justify-center rounded-sm border hover:bg-[var(--color-bg-elev)]"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange(new Date())}
        className="h-8 rounded-sm border px-2 text-xs hover:bg-[var(--color-bg-elev)]"
      >
        Today
      </button>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(month, 1))}
        aria-label="Next month"
        className="inline-flex h-8 w-8 items-center justify-center rounded-sm border hover:bg-[var(--color-bg-elev)]"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <span className="ml-2 text-sm font-medium tracking-tight">
        {format(month, "MMMM yyyy")}
      </span>
    </div>
  );
}
