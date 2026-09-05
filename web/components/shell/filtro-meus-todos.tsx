import Link from "next/link";
import { cn } from "@/lib/utils";

/*
  O filtro Meus / Todos — da Escala e do Calendário.

  São dois links, não dois botões: o estado mora na querystring, então voltar, recarregar e
  mandar o endereço pra alguém continuam funcionando — e a tela que usa o filtro segue sendo
  Server Component, sem "use client" atravessando pra cima.

  O rótulo longo só cabe no desktop; no celular a mesma pílula diz "Todos". Um componente só
  para as duas densidades: quem consome escolhe apenas onde ele aparece.
*/

export type FiltroMeusTodosValor = "meus" | "todos";

const OPCOES: { valor: FiltroMeusTodosValor; rotulo: string; rotuloCurto?: string }[] = [
  { valor: "meus", rotulo: "Meus" },
  { valor: "todos", rotulo: "Todos do departamento", rotuloCurto: "Todos" },
];

export function FiltroMeusTodos({
  base,
  atual,
  extraParams,
  className,
}: {
  base: string;
  atual: FiltroMeusTodosValor;
  /** O que precisa sobreviver à troca de filtro — o mês do calendário, por exemplo. */
  extraParams?: Record<string, string>;
  className?: string;
}) {
  return (
    <nav aria-label="Filtro da lista" className={cn("flex items-center gap-2", className)}>
      {OPCOES.map((opcao) => {
        const ativo = opcao.valor === atual;
        const params = new URLSearchParams({ ...extraParams, filtro: opcao.valor });

        return (
          <Link
            key={opcao.valor}
            href={`${base}?${params.toString()}`}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              // 44px de alvo no celular; no desktop a pílula compacta do canvas.
              "inline-flex min-h-11 items-center rounded-full px-4 text-[12.5px] whitespace-nowrap lg:min-h-8",
              "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              ativo
                ? // primary-foreground é o branco do tema claro e continua legível no escuro,
                  // onde o azul sobe de luminosidade (globals.css, .dark).
                  "bg-primary font-bold text-primary-foreground"
                : "border border-border bg-panel font-semibold text-muted-foreground hover:text-accent-ink",
            )}
          >
            {opcao.rotuloCurto ? (
              <>
                <span className="lg:hidden">{opcao.rotuloCurto}</span>
                <span className="hidden lg:inline">{opcao.rotulo}</span>
              </>
            ) : (
              opcao.rotulo
            )}
          </Link>
        );
      })}
    </nav>
  );
}
