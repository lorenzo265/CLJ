import { cn } from "@/lib/utils";
import type { StatusAtividade } from "@/lib/types";

/*
  Status — sempre cor + palavra, nunca cor sozinha (docs/decisoes-design.md §3).
  "Publicado" é o único que usa o dourado: é o carimbo de celebração, o fim da conta.
*/

const TOM: Record<StatusAtividade, { label: string; classe: string }> = {
  ideia: { label: "Ideia", classe: "bg-border-soft text-muted-foreground" },
  rascunho: { label: "Rascunho", classe: "bg-warn-soft text-warn" },
  agendado: { label: "Agendado", classe: "bg-info-soft text-info" },
  publicado: { label: "Publicado", classe: "bg-gold-soft text-gold-ink" },
  concluido: { label: "Concluído", classe: "bg-ok-soft text-ok" },
};

export function StatusPill({
  status,
  className,
}: {
  status: StatusAtividade;
  className?: string;
}) {
  const { label, classe } = TOM[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-[3px] text-[10.5px] font-bold",
        classe,
        className,
      )}
    >
      {label}
    </span>
  );
}

export function rotuloStatus(status: StatusAtividade): string {
  return TOM[status].label;
}

/** Reuniões têm dois estados só — Agendada → Realizada (decisoes-estrutura.md §5). */
export function StatusReuniao({ realizada }: { realizada: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-[3px] text-[10.5px] font-bold",
        realizada ? "bg-ok-soft text-ok" : "bg-info-soft text-info",
      )}
    >
      {realizada ? "Realizada" : "Agendada"}
    </span>
  );
}
