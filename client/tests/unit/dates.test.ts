import { describe, expect, it } from "vitest";
import { formatYmd, isInMonth, isToday, monthMatrix, shiftMonth } from "@/lib/dates";

describe("dates helpers", () => {
  it("formatYmd produces YYYY-MM-DD", () => {
    expect(formatYmd(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("monthMatrix returns 42 days starting on a Sunday", () => {
    const days = monthMatrix(new Date(2026, 3, 15));
    expect(days).toHaveLength(42);
    expect(days[0]!.getDay()).toBe(0);
  });

  it("monthMatrix covers every day in the target month", () => {
    const month = new Date(2026, 4, 1);
    const days = monthMatrix(month);
    const inMonth = days.filter((d) => isInMonth(d, month));
    expect(inMonth.length).toBe(31);
  });

  it("isToday is true only for today", () => {
    const today = new Date(2026, 5, 1);
    expect(isToday(new Date(2026, 5, 1), today)).toBe(true);
    expect(isToday(new Date(2026, 5, 2), today)).toBe(false);
  });

  it("shiftMonth moves by N months", () => {
    expect(shiftMonth(new Date(2026, 0, 15), 1).getMonth()).toBe(1);
    expect(shiftMonth(new Date(2026, 0, 15), -1).getMonth()).toBe(11);
  });
});
