"use client";

import { useRef, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { MarcaCompleta } from "@/components/marca/marca-aureola";
import { AveMarias } from "@/components/fio/conta";
import { ContaUsuario } from "@/components/shell/conta-usuario";
import { COORDENACAO, MEU_ESPACO, estaAtivo, type Destino } from "@/components/shell/navegacao";
import { cn } from "@/lib/utils";
import type { PapelSistema } from "@/lib/types";

/*
  O menu É o fio (docs/decisoes-design.md §1): o cordão sobe da marca e atravessa a
  navegação, cada item é uma conta do Pai-Nosso, e as três Ave-Marias separam
  "Meu espaço" de "Coordenação".

  A assinatura de motion vive aqui: navegar = passar as contas (§5).
*/

type Linha =
  | { tipo: "titulo"; texto: string }
  | { tipo: "separador" }
  | { tipo: "conta"; destino: Destino };

/** O fio, de cima a baixo: títulos, as contas e as três Ave-Marias que separam os grupos. */
function montarLinhas(papel: PapelSistema): Linha[] {
  const linhas: Linha[] = [{ tipo: "titulo", texto: "Meu espaço" }];

  for (const destino of MEU_ESPACO) linhas.push({ tipo: "conta", destino });

  if (papel === "coordenador") {
    linhas.push({ tipo: "separador" }, { tipo: "titulo", texto: "Coordenação" });
    for (const destino of COORDENACAO) linhas.push({ tipo: "conta", destino });
  }

  return linhas;
}

function reduzido(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function AppSidebar({
  nome,
  papelSistema,
  className,
}: {
  nome: string;
  papelSistema: PapelSistema;
  className?: string;
}) {
  const pathname = usePathname();
  const raiz = useRef<HTMLElement>(null);

  const { contextSafe } = useGSAP({ scope: raiz });

  /**
   * Passar a conta: a onda sai da conta tocada e percorre o fio, e a conta de destino
   * assenta preenchendo-se. Em `prefers-reduced-motion` sobra só a troca de cor do CSS.
   *
   * As contas são encontradas no DOM a partir do link clicado, e não guardadas num array de
   * refs: a ordem no documento já é a ordem no fio, que é exatamente o que o stagger precisa.
   */
  const passarAsContas = contextSafe((evento: MouseEvent<HTMLAnchorElement>) => {
    if (reduzido()) return;

    const nav = evento.currentTarget.closest("nav");
    const alvos = nav ? Array.from(nav.querySelectorAll<HTMLSpanElement>("[data-conta]")) : [];
    const indice = alvos.indexOf(evento.currentTarget.querySelector("[data-conta]")!);
    if (alvos.length === 0 || indice < 0) return;

    gsap
      .timeline()
      .to(alvos, {
        x: 4,
        duration: 0.1,
        ease: "power2.out",
        stagger: { each: 0.035, from: indice },
      })
      .to(
        alvos,
        { x: 0, duration: 0.24, ease: "power3.out", stagger: { each: 0.035, from: indice } },
        "<0.06",
      );

    gsap.fromTo(alvos[indice], { scale: 1.4 }, { scale: 1, duration: 0.32, ease: "power3.out" });

    // Confirmação tátil no celular — o mesmo gesto de passar a conta na mão.
    navigator.vibrate?.(8);
  });

  return (
    <aside
      ref={raiz}
      className={cn(
        "w-[260px] shrink-0 flex-col gap-5 border-r border-border bg-panel px-4 py-5",
        className,
      )}
    >
      <Link
        href="/hoje"
        className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MarcaCompleta />
      </Link>

      <nav aria-label="Navegação principal" className="fio relative flex min-h-0 flex-1 flex-col">
        {montarLinhas(papelSistema).map((linha, i) => {
          if (linha.tipo === "titulo") {
            return (
              <span key={`t${i}`} className="kicker mt-1 mb-1.5 ml-7 block">
                {linha.texto}
              </span>
            );
          }
          if (linha.tipo === "separador") return <AveMarias key={`s${i}`} />;

          const { destino } = linha;
          const ativo = estaAtivo(destino.href, pathname);

          return (
            <Link
              key={destino.href}
              href={destino.href}
              aria-current={ativo ? "page" : undefined}
              onClick={passarAsContas}
              className={cn(
                "group relative flex items-center gap-3.5 rounded-md py-2 pr-2 text-[13.5px] font-medium",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                ativo ? "font-bold text-accent-ink" : "text-foreground hover:text-accent-ink",
              )}
            >
              <span data-conta className={cn("conta z-10", ativo && "conta-sua")} aria-hidden />
              <span>{destino.label}</span>
            </Link>
          );
        })}
      </nav>

      <ContaUsuario nome={nome} papelSistema={papelSistema} />
    </aside>
  );
}
