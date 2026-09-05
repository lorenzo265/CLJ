import { cn } from "@/lib/utils";

/*
  Marca — direção A, "A Auréola" (docs/sdd-implementacao.md §1.2).
  Nove contas fechando a dezena em círculo, a cruz descendo do sul: lê ao mesmo tempo como
  dezena do terço e como auréola/coroa de Nossa Senhora. Uma cor só, geometria pura.

  Trocar a direção da marca (B — Rosa, C — Monograma) é reescrever ESTE arquivo; nada mais
  no app desenha a marca.
*/

/*
  Dez posições a 36° num raio de 42 — a posição do sul fica vazia, é onde a cruz fecha a
  dezena. Começa no topo e anda no sentido do relógio, que é a ordem em que as contas acendem.
*/
const CONTAS = [-90, -54, -18, 18, 54, 126, 162, 198, 234].map((graus) => {
  const rad = (graus * Math.PI) / 180;
  return {
    cx: +(60 + 42 * Math.cos(rad)).toFixed(1),
    cy: +(60 + 42 * Math.sin(rad)).toFixed(1),
  };
});

/** Variante de 5 contas, traço grosso — é ela que sobrevive a 16px (favicon, avatar). */
const CONTAS_SIMPLES = [
  { cx: 60, cy: 18 },
  { cx: 96, cy: 42 },
  { cx: 96, cy: 82 },
  { cx: 24, cy: 82 },
  { cx: 24, cy: 42 },
];

export function MarcaAureola({
  className,
  simples = false,
  acesas,
  title = "CLJ NSR",
}: {
  className?: string;
  /** Variante de favicon: 5 contas, traço grosso. */
  simples?: boolean;
  /**
   * Quantas contas acendem, do topo em diante. A marca vira sistema: no app ela pode
   * refletir o progresso da semana. Ausente = todas acesas (uso normal como logotipo).
   */
  acesas?: number;
  title?: string;
}) {
  const contas = simples ? CONTAS_SIMPLES : CONTAS;
  const raio = simples ? 11 : 6;
  const traco = simples ? 11 : 5.5;

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      role="img"
      aria-label={title}
      className={cn("text-primary", className)}
    >
      {contas.map((c, i) => (
        <circle
          key={i}
          cx={c.cx}
          cy={c.cy}
          r={raio}
          fill="currentColor"
          opacity={acesas === undefined || i < acesas ? 1 : 0.22}
        />
      ))}
      <g stroke="currentColor" strokeWidth={traco} strokeLinecap="round">
        {simples ? (
          <>
            <line x1="60" y1="88" x2="60" y2="114" />
            <line x1="49" y1="99" x2="71" y2="99" />
          </>
        ) : (
          <>
            <line x1="60" y1="94" x2="60" y2="112" />
            <line x1="51" y1="100.5" x2="69" y2="100.5" />
          </>
        )}
      </g>
    </svg>
  );
}

/** A marca com o nome ao lado — cabeçalho do sidebar e do login. */
export function MarcaCompleta({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <MarcaAureola className="size-8 shrink-0" />
      <div className="min-w-0">
        <div className="font-serif text-[17px] leading-tight font-bold">CLJ NSR</div>
        <div className="truncate text-[11px] text-muted-foreground">Departamento Cultural</div>
      </div>
    </div>
  );
}
