import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { AtividadesManager, NovaAtividadeBotao } from "@/components/gestao/atividades-manager";
import { NovaSerieBotao, SeriesManager } from "@/components/gestao/series-manager";
import { QuadroEscala } from "@/components/gestao/quadro-escala";
import { rotuloStatus } from "@/components/fio/status-pill";
import { PageHeader } from "@/components/shell/page-header";
import { buttonVariants } from "@/components/ui/button";
import { exigirCoordenador } from "@/lib/auth/sessao";
import { formatarMesAno, formatarReferenciaMes, parseReferenciaMes } from "@/lib/calendario/mes";
import { getAtividades, getTrocasDoDepartamento } from "@/lib/data/atividades";
import { getFuncoes } from "@/lib/data/funcoes";
import { getPessoas } from "@/lib/data/pessoas";
import { getSeries } from "@/lib/data/series";
import { comPapel, ordenarCronologico } from "@/lib/escala/agenda";
import type { Agrupamento } from "@/lib/escala/quadro";
import { STATUS_ATIVIDADE } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { StatusAtividade } from "@/lib/types";

export const metadata: Metadata = { title: "Gestão de Escala · CLJ NSR" };

const TODAS = "todas";
const TODOS = "todos";
/** O recorte que o alerta de furo do painel abre: só o que ainda não tem quem faça. */
const SEM_RESPONSAVEL = "sem";

/*
  Três leituras do MESMO recorte — os filtros valem para as três.

  O padrão é o quadro por pessoa, e não a tabela, porque é a pergunta que quem coordena faz
  primeiro: "de quem é isso?". A tabela responde "o que existe", que é auditoria, e continua
  a um clique. Ver docs/sdd-implementacao.md §8.
*/
const VISTAS = [
  { chave: "pessoa", rotulo: "Por pessoa" },
  { chave: "status", rotulo: "Por status" },
  { chave: "tabela", rotulo: "Tabela" },
] as const;

type Vista = (typeof VISTAS)[number]["chave"];

/**
 * A tela onde a escala é montada. Os três filtros moram na querystring e são aplicados no
 * servidor: a página continua Server Component, o endereço filtrado é compartilhável com
 * outro coordenador, e o formulário funciona sem JavaScript — é um GET, não um estado.
 */
export default async function GestaoEscalaPage({ searchParams }: PageProps<"/coordenador/escala">) {
  const eu = await exigirCoordenador();
  const params = await searchParams;
  const texto = (valor: string | string[] | undefined) =>
    typeof valor === "string" ? valor : undefined;

  const [atividades, pessoas, funcoes, trocas, series] = await Promise.all([
    getAtividades(eu.departamentoId),
    getPessoas(eu.departamentoId),
    getFuncoes(eu.departamentoId),
    getTrocasDoDepartamento(eu.departamentoId),
    getSeries(eu.departamentoId),
  ]);

  const agora = new Date();
  const referencia = parseReferenciaMes(texto(params.mes), agora);
  const mesAtual = formatarReferenciaMes(referencia);

  // Filtro vindo da URL é entrada de usuário: só vale o que existe no departamento.
  const funcaoParam = texto(params.funcao);
  const funcaoAtual = funcoes.some((f) => f.id === funcaoParam) ? (funcaoParam as string) : TODAS;
  const statusParam = texto(params.status) ?? "";
  const statusAtual = (STATUS_ATIVIDADE as string[]).includes(statusParam)
    ? (statusParam as StatusAtividade)
    : TODOS;

  const soFuros = texto(params.responsavel) === SEM_RESPONSAVEL;
  const vistaParam = texto(params.vista);
  const vista: Vista = (VISTAS as readonly { chave: string }[]).some((v) => v.chave === vistaParam)
    ? (vistaParam as Vista)
    : "pessoa";

  const noRecorte = atividades.filter(
    (a) =>
      a.data.startsWith(mesAtual) &&
      (funcaoAtual === TODAS || a.funcaoId === funcaoAtual) &&
      (statusAtual === TODOS || a.status === statusAtual) &&
      (!soFuros || !a.responsavelId),
  );

  // A ordem cronológica é a mesma de toda tela de escala — vem do domínio, não daqui.
  const emOrdem = ordenarCronologico(comPapel(noRecorte, eu.id)).map((i) => i.atividade);
  const semResponsavel = emOrdem.filter((a) => !a.responsavelId).length;

  // O seletor de mês só oferece meses que existem: os que têm atividade, mais o mês atual.
  const meses = Array.from(
    new Set([
      ...atividades.map((a) => a.data.slice(0, 7)),
      formatarReferenciaMes(agora),
      mesAtual,
    ]),
  ).sort();

  const hojeISO = format(agora, "yyyy-MM-dd");
  // Criando enquanto se folheia outro mês, a data sugerida é o dia 1 dele — não hoje.
  const dataPadrao = hojeISO.startsWith(mesAtual) ? hojeISO : `${mesAtual}-01`;
  const filtrado =
    soFuros || funcaoAtual !== TODAS || statusAtual !== TODOS || mesAtual !== hojeISO.slice(0, 7);

  const mensagemVazia = soFuros
    ? "Nenhuma atividade sem responsável neste mês — está tudo com dono."
    : funcaoAtual === TODAS && statusAtual === TODOS
      ? `Nada marcado em ${formatarMesAno(referencia).toLowerCase()} por enquanto.`
      : "Nada neste recorte. Tente outro mês, função ou status.";

  return (
    <>
      <PageHeader title="Gestão de Escala" subtitle="Posts, tarefas, eventos e reuniões">
        <NovaSerieBotao pessoas={pessoas} funcoes={funcoes} dataPadrao={dataPadrao} />
        <NovaAtividadeBotao pessoas={pessoas} funcoes={funcoes} dataPadrao={dataPadrao} />
      </PageHeader>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 pb-10 lg:px-8 lg:pt-6">
        <form
          method="get"
          action="/coordenador/escala"
          className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-end"
        >
          <FiltroCampo
            id="filtro-mes"
            name="mes"
            rotulo="Mês"
            valor={mesAtual}
            opcoes={meses.map((m) => ({
              valor: m,
              rotulo: formatarMesAno(parseReferenciaMes(m, agora)),
            }))}
          />
          <FiltroCampo
            id="filtro-funcao"
            name="funcao"
            rotulo="Função"
            valor={funcaoAtual}
            opcoes={[
              { valor: TODAS, rotulo: "Todas" },
              ...funcoes.map((f) => ({ valor: f.id, rotulo: f.nome })),
            ]}
          />
          <FiltroCampo
            id="filtro-status"
            name="status"
            rotulo="Status"
            valor={statusAtual}
            opcoes={[
              { valor: TODOS, rotulo: "Todos" },
              ...STATUS_ATIVIDADE.map((s) => ({ valor: s, rotulo: rotuloStatus(s) })),
            ]}
          />
          {soFuros && <input type="hidden" name="responsavel" value={SEM_RESPONSAVEL} />}
          <input type="hidden" name="vista" value={vista} />
          <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
            <button
              type="submit"
              className={cn(buttonVariants({ variant: "outline" }), "px-5")}
            >
              Filtrar
            </button>
            {filtrado && (
              <Link
                href={`/coordenador/escala?vista=${vista}`}
                className="inline-flex min-h-11 items-center rounded text-[12.5px] text-muted-foreground underline underline-offset-2 outline-none hover:text-accent-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:min-h-0"
              >
                Voltar para este mês
              </Link>
            )}
          </div>
        </form>

        {/*
          Aviso é serviço, não cobrança (decisoes-design.md §7.4): a linha diz o tamanho do
          recorte e o que ainda está aberto nele, sem apontar culpado.
        */}
        <p className="text-[12.5px] text-muted-foreground">
          {emOrdem.length} {emOrdem.length === 1 ? "atividade" : "atividades"} em{" "}
          {formatarMesAno(referencia).toLowerCase()}
          {semResponsavel > 0 && !soFuros && (
            <>
              {" · "}
              <Link
                href={`/coordenador/escala?${new URLSearchParams({ mes: mesAtual, funcao: funcaoAtual, status: statusAtual, responsavel: SEM_RESPONSAVEL, vista })}`}
                className="font-semibold text-warn underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {semResponsavel} ainda sem responsável
              </Link>
            </>
          )}
          {soFuros && (
            <>
              {" · "}
              <span className="font-semibold text-warn">só as que estão sem responsável</span>
            </>
          )}
        </p>

        <SeletorDeVista
          vista={vista}
          base={{
            mes: mesAtual,
            funcao: funcaoAtual,
            status: statusAtual,
            ...(soFuros ? { responsavel: SEM_RESPONSAVEL } : {}),
          }}
        />

        {/*
          As séries vêm antes da tabela porque são o nível de cima: mexer no conjunto
          ("o João saiu, redistribui outubro") não deveria custar trinta edições de linha.
        */}
        <section aria-labelledby="titulo-series" className="flex flex-col gap-2.5">
          <h2 id="titulo-series" className="kicker">
            O que se repete
          </h2>
          <SeriesManager series={series} pessoas={pessoas} />
        </section>

        {vista === "tabela" ? (
          <AtividadesManager
            atividades={emOrdem}
            pessoas={pessoas}
            funcoes={funcoes}
            trocas={trocas}
            nomesDeSerie={Object.fromEntries(series.map(({ serie }) => [serie.id, serie.titulo]))}
            dataPadrao={dataPadrao}
            mensagemVazia={mensagemVazia}
          />
        ) : (
          <QuadroEscala
            atividades={emOrdem}
            pessoas={pessoas}
            funcoes={funcoes}
            agrupamento={vista as Agrupamento}
            mensagemVazia={mensagemVazia}
          />
        )}
      </div>
    </>
  );
}

/**
 * Trocar de leitura é navegação, não estado: são links, o endereço carrega a escolha, e
 * outro coordenador abre o mesmo recorte na mesma vista pelo link colado no grupo.
 */
function SeletorDeVista({ vista, base }: { vista: Vista; base: Record<string, string> }) {
  return (
    <nav aria-label="Como ver a escala" className="flex w-fit gap-1 rounded-xl bg-muted p-1">
      {VISTAS.map((v) => {
        const atual = v.chave === vista;
        return (
          <Link
            key={v.chave}
            href={`/coordenador/escala?${new URLSearchParams({ ...base, vista: v.chave })}`}
            aria-current={atual ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-lg px-3.5 text-[12.5px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:min-h-9",
              atual
                ? "bg-panel text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {v.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Um filtro = um <select> nativo dentro do <form method="get">. Sem JavaScript ele ainda
 * navega, e o rótulo é um <label> de verdade — o leitor de tela anuncia "Mês", não "campo".
 */
function FiltroCampo({
  id,
  name,
  rotulo,
  valor,
  opcoes,
}: {
  id: string;
  name: string;
  rotulo: string;
  valor: string;
  opcoes: { valor: string; rotulo: string }[];
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="kicker">
        {rotulo}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          defaultValue={valor}
          className="h-11 w-full appearance-none rounded-lg border border-border bg-panel pr-8 pl-3 text-[12.5px] font-semibold text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-auto lg:h-9"
        >
          {opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-faint"
          aria-hidden
        />
      </div>
    </div>
  );
}
