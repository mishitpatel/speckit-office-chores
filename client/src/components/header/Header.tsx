import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";

export function Header({ className }: { className?: string }): JSX.Element {
  const { theme, toggle } = useTheme();
  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <header
      className={cn(
        "flex h-12 items-center justify-between border-b px-4",
        "bg-[var(--color-bg)] text-[var(--color-fg)]",
        className,
      )}
    >
      <div className="text-sm font-medium tracking-tight">Office Chores</div>
      <button
        type="button"
        onClick={toggle}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        className="inline-flex h-8 w-8 items-center justify-center rounded-sm border hover:bg-[var(--color-bg-elev)]"
      >
        <Icon className="h-4 w-4" />
      </button>
    </header>
  );
}
