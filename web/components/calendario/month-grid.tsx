import { cn } from "@/lib/utils";
import type { DiaGrade } from "@/lib/calendario/mes";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export interface ItemDoDia {
  titulo: string;
  mine: boolean;
}

export function MonthGrid({
  dias,
  itensPorDia,
}: {
  dias: DiaGrade[];
  itensPorDia: Map<string, ItemDoDia[]>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="p-2 text-center text-[11px] font-semibold text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dias.map((dia) => {
          const itens = itensPorDia.get(dia.data) ?? [];
          return (
            <div
              key={dia.data}
              className={cn(
                "min-h-[92px] border-r border-b p-1.5 last:border-r-0",
                !dia.ehDoMesAtual && "bg-muted/30"
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs",
                  dia.ehHoje && "bg-primary font-semibold text-primary-foreground",
                  !dia.ehDoMesAtual && "text-muted-foreground"
                )}
              >
                {dia.diaDoMes}
              </span>
              <div className="mt-1 flex flex-col gap-1">
                {itens.slice(0, 3).map((it, i) => (
                  <span
                    key={i}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-[10px] font-medium",
                      it.mine ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {it.titulo}
                  </span>
                ))}
                {itens.length > 3 && (
                  <span className="px-1 text-[10px] text-muted-foreground">+{itens.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
