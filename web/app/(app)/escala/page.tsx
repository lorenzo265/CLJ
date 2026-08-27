import { PageHeader } from "@/components/shell/page-header";
import { FiltroMeusTodos } from "@/components/shell/filtro-meus-todos";
import { AgendaList } from "@/components/escala/agenda-list";
import { getAtividades } from "@/lib/data/atividades";
import { getPessoas } from "@/lib/data/pessoas";
import { agruparPorPrazo, comPapel, filtrarMeus } from "@/lib/escala/agenda";
import { PESSOA_ATUAL_ID } from "@/lib/mock/current-user";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";

export default async function EscalaPage({ searchParams }: PageProps<"/escala">) {
  const { filtro } = await searchParams;
  const atual = filtro === "todos" ? "todos" : "meus";

  const [atividades, pessoas] = await Promise.all([
    getAtividades(DEPARTAMENTO_CULTURAL),
    getPessoas(DEPARTAMENTO_CULTURAL),
  ]);

  const comPapelItens = comPapel(atividades, PESSOA_ATUAL_ID);
  const itens = atual === "todos" ? comPapelItens : filtrarMeus(comPapelItens);
  const { hoje, estaSemana, depois } = agruparPorPrazo(itens);

  return (
    <>
      <PageHeader title="Escala" subtitle="Posts, tarefas e rodízio" />
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <FiltroMeusTodos base="/escala" atual={atual} />
        <AgendaList hoje={hoje} estaSemana={estaSemana} depois={depois} pessoas={pessoas} />
      </div>
    </>
  );
}
