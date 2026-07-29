import { SearchHistory } from "@/src/models/searchHistory";

function formatarData(iso: string) {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SearchHistoryItemProps = {
  item: SearchHistory;
  onRepetir: (item: SearchHistory) => void;
  onRemove: (id: number) => void;
};

export function SearchHistoryItem({ item, onRepetir, onRemove }: SearchHistoryItemProps) {
  const localizacao = [item.bairro, item.cidade].filter(Boolean).join(", ");
  const detalhes = [localizacao, item.categoria].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col gap-1 rounded-[6px] px-2 py-1.5 text-[12.5px] text-foreground transition-colors hover:bg-surface">
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0">
          <div className="truncate font-medium" title={item.termoBusca}>
            {item.termoBusca}
          </div>
          {detalhes && (
            <div className="truncate text-[11px] text-muted" title={detalhes}>
              {detalhes}
            </div>
          )}
        </div>
        <span className="shrink-0 rounded-[5px] bg-accent-soft px-1.5 py-0.5 text-[10.5px] font-bold text-accent">
          {item.quantidadeLeads}
        </span>
      </div>

      <div className="flex items-center justify-between gap-1.5">
        <span className="font-mono text-[10.5px] text-muted-2 tabular-nums">
          {item.criadoEm ? formatarData(item.criadoEm) : "—"}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onRepetir(item)}
            aria-label={`Executar novamente a busca ${item.termoBusca}`}
            title="Executar novamente"
            className="flex h-6 w-6 items-center justify-center rounded-[5px] text-muted-2 transition-colors hover:bg-accent-soft hover:text-accent"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => item.id !== undefined && onRemove(item.id)}
            aria-label={`Excluir histórico de ${item.termoBusca}`}
            title="Excluir"
            className="flex h-6 w-6 items-center justify-center rounded-[5px] text-muted-2 transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
