import { Header } from "@/components/header/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";

export function App(): JSX.Element {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar>
          <p className="text-xs text-[var(--color-fg-muted)]">
            Roster will appear here. Calendar coming next.
          </p>
        </Sidebar>
        <main className="flex-1 overflow-auto p-6">
          <p className="text-sm text-[var(--color-fg-muted)]">
            Calendar surface placeholder — wired up in User Story 1.
          </p>
        </main>
      </div>
    </div>
  );
}
