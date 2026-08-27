"use client";

import { motion } from "framer-motion";
import { AgendaRow } from "@/components/escala/agenda-row";
import type { AtividadeComPapel } from "@/lib/escala/agenda";
import type { Pessoa } from "@/lib/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const linha = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
};

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
  if (itens.length === 0) return null;

  return (
    <div>
      <h2 className="mt-6 mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase first:mt-0">
        {titulo}
      </h2>
      <motion.div variants={container} initial="hidden" animate="show">
        {itens.map((it) => (
          <motion.div key={it.atividade.id} variants={linha}>
            <AgendaRow
              item={it}
              mostrarData={mostrarData}
              responsavel={pessoaPorId.get(it.atividade.responsavelId)}
              suplente={it.atividade.suplenteId ? pessoaPorId.get(it.atividade.suplenteId) : undefined}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export function AgendaList({
  hoje,
  estaSemana,
  depois,
  pessoas,
}: {
  hoje: AtividadeComPapel[];
  estaSemana: AtividadeComPapel[];
  depois: AtividadeComPapel[];
  pessoas: Pessoa[];
}) {
  const pessoaPorId = new Map(pessoas.map((p) => [p.id, p]));
  const vazio = hoje.length === 0 && estaSemana.length === 0 && depois.length === 0;

  if (vazio) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Nada por aqui — sem atividades no radar por enquanto.
      </p>
    );
  }

  return (
    <div>
      <Grupo titulo="Hoje" itens={hoje} mostrarData={false} pessoaPorId={pessoaPorId} />
      <Grupo titulo="Esta semana" itens={estaSemana} mostrarData pessoaPorId={pessoaPorId} />
      <Grupo titulo="Depois" itens={depois} mostrarData pessoaPorId={pessoaPorId} />
    </div>
  );
}
