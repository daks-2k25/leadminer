import { Panel } from "@/components/ui/Panel";

interface LoadingStateProps {
  etapa: string | null;
  progresso: number;
}

export function LoadingState({ etapa, progresso }: LoadingStateProps) {
  const percentual = Math.min(100, Math.max(0, progresso));
  const linhas = Array.from({ length: 3 });

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-3 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent motion-reduce:animate-none" />
          <div className="flex flex-1 items-center justify-between gap-3">
            <span className="text-[13px] font-semibold text-foreground">
              {etapa ?? "Iniciando busca..."}
            </span>
            <span className="font-mono text-[12px] text-muted tabular-nums">
              {percentual}%
            </span>
          </div>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${percentual}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-border border-t border-border">
        {linhas.map((_, index) => (
          <div key={index} className="flex items-center gap-6 px-4 py-3">
            <div className="h-3.5 w-40 animate-pulse rounded bg-subtle motion-reduce:animate-none" />
            <div className="h-3.5 w-24 animate-pulse rounded bg-subtle motion-reduce:animate-none" />
            <div className="h-3.5 w-16 animate-pulse rounded bg-subtle motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </Panel>
  );
}
