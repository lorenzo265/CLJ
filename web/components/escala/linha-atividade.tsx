import { Conta, estadoDaConta } from "@/components/fio/conta";
import { StatusPill } from "@/components/fio/status-pill";
import { contextoDaAtividade, rotuloTipo } from "@/lib/escala/frase";
import { formatarDataKicker } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AtividadeComPapel } from "@/lib/escala/agenda";
import type { Pessoa } from "@/lib/types";

/**
 * A linha da escala — a mesma no celular e no desktop, na tela Hoje e na Escala.
 * A conta à esquerda diz o papel antes de qualquer leitura; a frase diz o resto.
 */
export function LinhaAtividade({
  item,
  responsavel,
  suplente,
  mostrarData = true,
  className,
}: {
  item: AtividadeComPapel;
  responsavel?: Pessoa;
  suplente?: Pessoa;
  mostrarData?: boolean;
  className?: string;
}) {
  const { atividade, papel } = item;
  const meu = papel !== "nenhum";

  return (
    <div
      className={cn(
        "flex items-start gap-3.5 border-b border-border-soft py-3.5 last:border-b-0",
        className,
      )}
    >
      <Conta estado={estadoDaConta(papel)} className="mt-1.5" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-[14.5px] font-bold", !meu && "font-semibold text-muted-foreground")}>
            {atividade.titulo}
          </span>
          <span className="rounded bg-border-soft px-1.5 py-px text-[10px] font-bold tracking-wide text-faint uppercase">
            {rotuloTipo(atividade.tipo)}
          </span>
        </div>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
          {contextoDaAtividade(papel, { responsavel, suplente })}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {mostrarData && (
          <span className="font-mono text-[11px] font-medium text-faint">
            {formatarDataKicker(atividade.data)}
          </span>
        )}
        <StatusPill status={atividade.status} />
      </div>
    </div>
  );
}

/** A legenda das contas — só onde a lista mistura os três estados. */
export function LegendaContas({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground", className)}>
      <span className="flex items-center gap-1.5">
        <Conta estado="sua" /> sua conta
      </span>
      <span className="flex items-center gap-1.5">
        <Conta estado="suplente" /> suplência
      </span>
      <span className="flex items-center gap-1.5">
        <Conta estado="inativa" /> equipe
      </span>
    </div>
  );
}
