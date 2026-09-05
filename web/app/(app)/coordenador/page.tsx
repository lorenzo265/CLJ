import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Bookmark, ClipboardList, ListChecks, TriangleAlert, Users } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Kicker } from "@/components/fio/tipografia";
import { exigirCoordenador } from "@/lib/auth/sessao";
import { getResumoPainel } from "@/lib/data/dashboard";
import { formatarDataCurta, formatarDataKicker } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Painel · CLJ NSR" };

const GERENCIAR: { href: string; titulo: string; descricao: string; icone: LucideIcon }[] = [
  {
    href: "/coordenador/funcoes",
    titulo: "Funções",
    descricao: "Catálogo de papéis do departamento",
    icone: Bookmark,
  },
  {
    href: "/coordenador/escala",
    titulo: "Escala",
    descricao: "Posts, tarefas e rodízio",
    icone: ListChecks,
  },
  {
    href: "/coordenador/reunioes",
    titulo: "Reuniões",
    descricao: "Pauta, decisões e follow-up",
    icone: ClipboardList,
  },
  {
    href: "/coordenador/participantes",
    titulo: "Participantes",
    descricao: "Cadastros e convites",
    icone: Users,
  },
];

/** No máximo quatro furos listados: a faixa é um aviso, a escala é a lista. */
const FUROS_LISTADOS = 4;

/**
 * O painel: quatro números, o que urge e por onde se gerencia — nessa ordem.
 * É a única tela onde o coordenador chega sem saber o que procura, então ela não pergunta
 * nada: diz o estado do departamento e abre a porta certa.
 */
export default async function PainelPage() {
  const eu = await exigirCoordenador();
  const resumo = await getResumoPainel(eu.departamentoId);

  const emFuro = [...resumo.atividadesEmFuro].sort((a, b) => a.data.localeCompare(b.data));
  const temFuro = resumo.furosEstaSemana > 0;

  return (
    <>
      <PageHeader title="Painel do coordenador" subtitle="Departamento Cultural" />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 pb-10 lg:px-8 lg:pt-6">
        {/* Duas colunas no celular, quatro no desktop — a mesma leitura, duas densidades. */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <Numero rotulo="Participantes ativos" valor={resumo.participantesAtivos} />
          <Numero rotulo="Sem responsável" valor={resumo.semResponsavel} />
          <Numero
            rotulo="Próxima reunião"
            valor={
              resumo.proximaReuniaoData ? formatarDataCurta(resumo.proximaReuniaoData) : "—"
            }
          />
          {/* O único número que muda de cor: é o que pede ação nesta semana. */}
          <Numero rotulo="Furos essa semana" valor={resumo.furosEstaSemana} alerta={temFuro} />
        </div>

        {temFuro && (
          <Link
            href="/coordenador/escala"
            className="block rounded-xl border border-warn/20 bg-warn-soft px-4 py-3.5 outline-none transition-colors hover:border-warn/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-px size-5 shrink-0 text-warn" aria-hidden />
              <div className="min-w-0">
                {/*
                  Aviso é serviço, não cobrança (decisoes-design.md §7.4): a frase diz o que
                  está aberto e qual é o próximo passo, sem apontar culpado.
                */}
                <p className="text-[13.5px] text-warn">
                  <strong className="font-bold">
                    {resumo.furosEstaSemana}{" "}
                    {resumo.furosEstaSemana === 1 ? "atividade" : "atividades"}
                  </strong>{" "}
                  dos próximos sete dias{" "}
                  {resumo.furosEstaSemana === 1 ? "ainda está" : "ainda estão"} sem responsável.
                  Abra a escala para escolher quem assume.
                </p>

                <ul className="mt-2.5 flex flex-col gap-1">
                  {emFuro.slice(0, FUROS_LISTADOS).map((a) => (
                    <li
                      key={a.id}
                      className="flex items-baseline justify-between gap-3 text-[12.5px] text-warn/85"
                    >
                      <span className="truncate font-semibold">{a.titulo}</span>
                      <span className="shrink-0 font-mono text-[11px]">
                        {formatarDataKicker(a.data)}
                      </span>
                    </li>
                  ))}
                  {emFuro.length > FUROS_LISTADOS && (
                    <li className="text-[12.5px] text-warn/85">
                      e mais {emFuro.length - FUROS_LISTADOS} na escala
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Link>
        )}

        <section>
          <Kicker className="mb-3">Gerenciar</Kicker>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {GERENCIAR.map(({ href, titulo, descricao, icone: Icone }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col gap-2.5 rounded-xl border border-border bg-panel p-4 outline-none transition-colors hover:border-accent-hi/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                  <Icone className="size-[18px]" aria-hidden />
                </span>
                <span>
                  <span className="block text-[14px] font-bold">{titulo}</span>
                  <span className="mt-0.5 block text-[12px] text-muted-foreground">
                    {descricao}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

/** O número em serifada: no canvas o Painel é a única tela onde o dado é a manchete. */
function Numero({
  rotulo,
  valor,
  alerta = false,
}: {
  rotulo: string;
  valor: number | string;
  alerta?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <p className="text-[12px] font-semibold text-muted-foreground">{rotulo}</p>
      <p
        className={cn(
          "mt-1.5 font-serif text-[26px] leading-none font-bold tabular-nums",
          alerta && "text-warn",
        )}
      >
        {valor}
      </p>
    </div>
  );
}
