"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LinhaAtividade } from "@/components/escala/linha-atividade";
import { Kicker, Vazio } from "@/components/fio/tipografia";
import type { AtividadeComPapel } from "@/lib/escala/agenda";
import type { Pessoa } from "@/lib/types";

/** A lista da Opção A. As linhas entram em stagger — a segunda assinatura de motion. */
function Grupo({
  titulo,
  itens,
  mostrarData,
  pessoaPorId,
}: {
  titulo: string;
  itens: AtividadeComPapel[];
  mostrarData: boolean;
  pessoaPorId: Map<string, Pessoa>;
}) {
  const lista = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!lista.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(lista.current.children, {
        opacity: 0,
        y: 6,
        duration: 0.24,
        ease: "power3.out",
        stagger: 0.035,
      });
    },
    { scope: lista, dependencies: [itens.length] },
  );

  if (itens.length === 0) return null;

  return (
    <section className="mt-6 first:mt-0">
      <Kicker className="mb-1">{titulo}</Kicker>
      <div ref={lista}>
        {itens.map((it) => (
          <LinhaAtividade
            key={it.atividade.id}
            item={it}
            mostrarData={mostrarData}
            responsavel={
              it.atividade.responsavelId
                ? pessoaPorId.get(it.atividade.responsavelId)
                : undefined
            }
            suplente={
              it.atividade.suplenteId ? pessoaPorId.get(it.atividade.suplenteId) : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}

export function AgendaList({
  hoje,
  estaSemana,
  depois,
  pessoas,
  tituloHoje,
}: {
  hoje: AtividadeComPapel[];
  estaSemana: AtividadeComPapel[];
  depois: AtividadeComPapel[];
  pessoas: Pessoa[];
  tituloHoje: string;
}) {
  const pessoaPorId = new Map(pessoas.map((p) => [p.id, p]));

  if (hoje.length === 0 && estaSemana.length === 0 && depois.length === 0) {
    return <Vazio>Nada por aqui — sem atividades no radar por enquanto.</Vazio>;
  }

  return (
    <div>
      <Grupo titulo={tituloHoje} itens={hoje} mostrarData={false} pessoaPorId={pessoaPorId} />
      <Grupo titulo="Esta semana" itens={estaSemana} mostrarData pessoaPorId={pessoaPorId} />
      <Grupo titulo="Depois" itens={depois} mostrarData pessoaPorId={pessoaPorId} />
    </div>
  );
}
