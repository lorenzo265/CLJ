import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
  As três camadas de toda tela de participante (docs/decisoes-design.md §6):
  manchete (uma coisa) → sinal (2–4 itens) → detalhe (recolhido, sob demanda).
*/

/** Micro-rótulo em mono, caixa alta — seções, datas, "sua próxima conta". */
export function Kicker({
  children,
  className,
  tom = "faint",
}: {
  children: ReactNode;
  className?: string;
  tom?: "faint" | "ink";
}) {
  return (
    <span className={cn("kicker block", tom === "ink" && "text-accent-ink", className)}>
      {children}
    </span>
  );
}

/** Título de seção — o "sinal" da hierarquia. */
export function TituloSecao({
  children,
  className,
  acao,
}: {
  children: ReactNode;
  className?: string;
  acao?: ReactNode;
}) {
  return (
    <div className={cn("mb-2.5 flex items-baseline justify-between gap-3", className)}>
      <Kicker>{children}</Kicker>
      {acao}
    </div>
  );
}

/**
 * A manchete: o cartão azul que responde "o que é meu e quando" antes de qualquer rolagem.
 * Um por tela — se houver dois, um deles não é manchete.
 */
export function Manchete({
  kicker,
  titulo,
  frase,
  acao,
  className,
}: {
  kicker: string;
  titulo: string;
  /** Situação → o que é seu → um próximo passo, nessa ordem, em 2ª pessoa. */
  frase: string;
  acao?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-accent-soft p-5 sm:p-6", className)}>
      <Kicker tom="ink">{kicker}</Kicker>
      <h2 className="mt-2 font-serif text-2xl leading-tight font-bold text-accent-ink">{titulo}</h2>
      <p className="mt-2 text-sm text-accent-ink/85">{frase}</p>
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}

/**
 * O oposto sereno da manchete: nada seu no radar. Nunca cobra, nunca pede ação.
 * "A dezena incompleta não pune" (decisoes-design.md §8).
 */
export function SemanaEmDia({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-soft bg-panel px-5 py-8 text-center sm:px-6",
        className,
      )}
    >
      <p className="font-serif text-xl font-bold">Semana em dia ✓</p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Nada seu no radar por enquanto. A gente te avisa quando chegar a sua vez.
      </p>
    </div>
  );
}

/** Vazio de lista — sereno, uma linha, sem ilustração e sem culpa. */
export function Vazio({ children }: { children: ReactNode }) {
  return <p className="py-12 text-center text-sm text-muted-foreground">{children}</p>;
}
