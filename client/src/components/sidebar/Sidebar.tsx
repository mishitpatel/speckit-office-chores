import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const COLLAPSED_KEY = "office-chores:sidebar-collapsed";

export function Sidebar({ children }: { children?: ReactNode }): JSX.Element {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r bg-[var(--color-bg-elev)] transition-[width] duration-150",
        collapsed ? "w-12" : "w-60",
      )}
    >
      <div className="flex h-12 items-center justify-between border-b px-3">
        {!collapsed && (
          <span className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
            Roster
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="inline-flex h-7 w-7 items-center justify-center rounded-sm border hover:bg-[var(--color-bg)]"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      {!collapsed && <div className="flex-1 overflow-y-auto p-2">{children}</div>}
    </aside>
  );
}
