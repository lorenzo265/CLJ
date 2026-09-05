import type { Metadata } from "next";
import { format } from "date-fns";
import { PageHeader } from "@/components/shell/page-header";
import { FiltroMeusTodos } from "@/components/shell/filtro-meus-todos";
import { AgendaList } from "@/components/escala/agenda-list";
import { LegendaContas } from "@/components/escala/linha-atividade";
import { agruparPorPrazo, comPapel, filtrarMeus } from "@/lib/escala/agenda";
import { getAtividades } from "@/lib/data/atividades";
import { getPessoas } from "@/lib/data/pessoas";
import { exigirPessoa } from "@/lib/auth/sessao";
import { formatarDiaEMes } from "@/lib/format";

export const metadata: Metadata = { title: "Escala · CLJ NSR" };

/**
 * A escala na direção Opção A (docs/sdd-implementacao.md §1.1): Hoje · Esta semana · Depois,
 * numa janela rolante de 7 dias. A tela Hoje responde "tenho algo?"; esta responde "o que vem".
 *
 * O filtro é a mesma pílula nos dois lugares: no desktop ele mora na barra do cabeçalho —
 * é a única ação da tela —, no celular desce pro corpo, logo acima da lista, na zona do
 * polegar. Os dois artboards pedem posições diferentes para o mesmo controle, e o slot de
 * ação do PageHeader não tem como quebrar linha sozinho no celular sem conta de viewport.
 */
export default async function EscalaPage({ searchParams }: PageProps<"/escala">) {
  const eu = await exigirPessoa();
  const { filtro } = await searchParams;
  const atual = filtro === "todos" ? "todos" : "meus";

  const agora = new Date();
  // Data local, não UTC: perto da meia-noite o relógio daqui e o de Greenwich discordam,
  // e agruparPorPrazo() decide o que é "hoje" pelo relógio de quem está lendo.
  const hojeISO = format(agora, "yyyy-MM-dd");

  const [atividades, pessoas] = await Promise.all([
    getAtividades(eu.departamentoId),
    getPessoas(eu.departamentoId),
  ]);

  const doDepartamentoTodo = comPapel(atividades, eu.id);
  const itens = atual === "todos" ? doDepartamentoTodo : filtrarMeus(doDepartamentoTodo);
  const { hoje, estaSemana, depois } = agruparPorPrazo(itens, agora);

  const propsDoFiltro = { base: "/escala", atual } as const;

  return (
    <>
      <PageHeader title="Escala" subtitle="Posts, tarefas e rodízio">
        <FiltroMeusTodos {...propsDoFiltro} className="hidden lg:flex" />
      </PageHeader>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-5 pb-10 lg:px-8 lg:pt-6">
        <FiltroMeusTodos {...propsDoFiltro} className="lg:hidden" />

        <AgendaList
          hoje={hoje}
          estaSemana={estaSemana}
          depois={depois}
          pessoas={pessoas}
          tituloHoje={`Hoje · ${formatarDiaEMes(hojeISO)}`}
        />

        {/* A legenda só serve onde os três estados de conta aparecem juntos. */}
        {atual === "todos" && <LegendaContas className="mt-2" />}
      </div>
    </>
  );
}
