import { ThemeToggle } from "@/components/ui/ThemeToggle";

const upcomingItems = ["Buscas salvas", "Exportações"];

export function Sidebar() {
  return (
    <aside className="hidden w-52 shrink-0 flex-col gap-1 border-r border-border bg-subtle p-3 md:flex">
      <div className="flex items-center gap-2 px-2 pb-4 pt-1">
        <span className="relative block h-[22px] w-[22px] shrink-0 rounded-[6px] bg-accent">
          <span className="absolute inset-[6px] rounded-[2px] border-[1.5px] border-white/90" />
        </span>
        <span
          translate="no"
          className="text-[14px] font-bold tracking-tight text-foreground"
        >
          LeadMiner
        </span>
      </div>

      <div className="flex items-center gap-2.5 rounded-[7px] bg-surface px-2.5 py-2 text-[13px] font-medium text-foreground shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Leads
      </div>

      {upcomingItems.map((item) => (
        <div
          key={item}
          className="flex items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-[13px] font-medium text-muted-2"
          aria-disabled="true"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-muted-2" />
          {item}
          <span className="ml-auto text-[10px] text-muted-2">em breve</span>
        </div>
      ))}

      <div className="mt-auto flex items-center justify-between border-t border-border px-2.5 pt-3">
        <span translate="no" className="text-[11.5px] text-muted-2">
          LeadMiner
        </span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
