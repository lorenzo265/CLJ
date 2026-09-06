import { cn } from "@/lib/utils";
import type { PapelNaAtividade } from "@/lib/escala/agenda";

/*
  A conta — o átomo da identidade (docs/decisoes-design.md §3b).
  Quatro estados, todos flat: a conta lê pela geometria no fio, nunca por volume.
*/

export type EstadoConta = "inativa" | "sua" | "suplente" | "festa";

const CLASSE: Record<EstadoConta, string> = {
  inativa: "conta",
  sua: "conta conta-sua",
  suplente: "conta conta-suplente",
  festa: "conta conta-festa",
};

const ROTULO: Record<EstadoConta, string> = {
  inativa: "do departamento",
  sua: "sua conta",
  suplente: "sua suplência",
  festa: "concluída",
};

export function Conta({
  estado = "inativa",
  className,
  rotulada = false,
}: {
  estado?: EstadoConta;
  className?: string;
  /** Anuncia o significado no leitor de tela. Fora de listas onde a frase já diz o papel. */
  rotulada?: boolean;
}) {
  return (
    <span
      className={cn(CLASSE[estado], className)}
      aria-hidden={rotulada ? undefined : true}
      aria-label={rotulada ? ROTULO[estado] : undefined}
      role={rotulada ? "img" : undefined}
    />
  );
}

/** O papel do viewer numa atividade vira estado de conta — a tradução mora num lugar só. */
export function estadoDaConta(papel: PapelNaAtividade): EstadoConta {
  if (papel === "responsavel") return "sua";
  if (papel === "suplente") return "suplente";
  return "inativa";
}

/** As três Ave-Marias — separador de grupos no fio. Decoração estrutural, nunca conteúdo. */
export function AveMarias({ className }: { className?: string }) {
  return (
    <span className={cn("relative z-10 flex flex-col gap-1 py-2 pl-[3.5px]", className)} aria-hidden>
      <i className="block size-[5px] rounded-full bg-faint/60" />
      <i className="block size-[5px] rounded-full bg-faint/60" />
      <i className="block size-[5px] rounded-full bg-faint/60" />
    </span>
  );
}

/**
 * A dezena da semana: uma conta por compromisso seu, preenchida quando já foi passada.
 * "Sempre com perdão" (decisoes-design.md §8) — a dezena incompleta não pune, só informa.
 */
export function Dezena({
  total,
  passadas,
  className,
}: {
  total: number;
  passadas: number;
  className?: string;
}) {
  if (total === 0) return null;
  const completa = passadas >= total;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <Conta key={i} estado={i < passadas ? (completa ? "festa" : "sua") : "inativa"} />
        ))}
      </span>
      <span className={cn("ml-1 text-xs", completa ? "text-gold-ink" : "text-muted-foreground")}>
        {completa
          ? "dezena completa ✓"
          : `${passadas} de ${total} ${total === 1 ? "conta" : "contas"}`}
      </span>
    </div>
  );
}
