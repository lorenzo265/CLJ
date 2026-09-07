import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MonthBoard } from "@/components/calendario/month-board";
import { MonthGrid } from "@/components/calendario/month-grid";
import { CargaDoMesFaixa } from "@/components/calendario/carga-do-mes";
import { LegendaContas } from "@/components/escala/linha-atividade";
import { Kicker, Vazio } from "@/components/fio/tipografia";
import { FiltroMeusTodos } from "@/components/shell/filtro-meus-todos";
import { PageHeader } from "@/components/shell/page-header";
import { buttonVariants } from "@/components/ui/button";
import { exigirPessoa } from "@/lib/auth/sessao";
import {
  formatarMesAno,
  formatarMesAnoCurto,
  formatarReferenciaMes,
  getGradeDoMes,
  mesAnterior,
  mesSeguinte,
  parseReferenciaMes,
} from "@/lib/calendario/mes";
import { getAtividades } from "@/lib/data/atividades";
import { getFuncoes } from "@/lib/data/funcoes";
import { getPessoas } from "@/lib/data/pessoas";
import { cargaDoMes } from "@/lib/calendario/carga";
import { comPapel, filtrarMeus, ordenarCronologico } from "@/lib/escala/agenda";
import { contextoDaAtividade, fraseDaAtividade, rotuloTipo } from "@/lib/escala/frase";
import { formatarDataKicker } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AtividadeComPapel } from "@/lib/escala/agenda";
import type { Pessoa } from "@/lib/types";

export const metadata: Metadata = { title: "Calendário · CLJ NSR" };

/** Quantos compromissos a coluna "Próximos" carrega antes de virar lista. */
const PROXIMOS = 3;

/**
 * O mês inteiro de uma olhada: dia com compromisso seu é conta preenchida, dia do
 * departamento é conta neutra (docs/decisoes-design.md §1). O mês e o filtro moram na
 * querystring — a tela continua Server Component e o link do mês é compartilhável.
 */
export default async function CalendarioPage({ searchParams }: PageProps<"/calendario">) {
  const eu = await exigirPessoa();
  const { mes, filtro } = await searchParams;

  const agora = new Date();
  // Ao contrário da Escala, aqui o padrão é "todos": a leitura do calendário É o contraste
  // entre a conta cheia (sua) e a neutra (do departamento) — abrir filtrado apagaria metade.
  const atual = filtro === "meus" ? "meus" : "todos";
  const referencia = parseReferenciaMes(typeof mes === "string" ? mes : undefined, agora);
  const mesAtual = formatarReferenciaMes(referencia);

  /*
    Duas leituras da mesma tela. Quem participa lê: o mês responde "que dias são meus", e a
    conta preenchida é a resposta. Quem coordena também MONTA: `?modo=montar` troca as contas
    por fichas que se arrastam. Ver docs/sdd-implementacao.md §8, Fase 10.

    Só a coordenação vê o modo — e só ela consegue usá-lo: as Server Actions por trás exigem
    coordenador, então esconder o botão é conveniência, não é a trava.
  */
  const coordena = eu.papelSistema === "coordenador";
  const montando = coordena && (await searchParams).modo === "montar";

  const [atividades, pessoas, funcoes] = await Promise.all([
    getAtividades(eu.departamentoId),
    getPessoas(eu.departamentoId),
    coordena ? getFuncoes(eu.departamentoId) : Promise.resolve([]),
  ]);

  const doDepartamento = comPapel(atividades, eu.id);
  const itens = atual === "meus" ? filtrarMeus(doDepartamento) : doDepartamento;
  const pessoaPorId = new Map(pessoas.map((p) => [p.id, p]));

  // "Próximos" obedece o mesmo filtro da grade e ignora o mês visitado: é o que vem pela
  // frente a partir de hoje, mesmo quando a pessoa está folheando dezembro.
  const hojeISO = format(agora, "yyyy-MM-dd");
  const proximos = ordenarCronologico(itens.filter((i) => i.atividade.data >= hojeISO)).slice(
    0,
    PROXIMOS,
  );

  const hrefMes = (ref: Date) =>
    `/calendario?${new URLSearchParams({
      mes: formatarReferenciaMes(ref),
      filtro: atual,
      ...(montando ? { modo: "montar" } : {}),
    })}`;

  const setaClasse = cn(buttonVariants({ variant: "outline", size: "icon" }), "text-muted-foreground");

  return (
    <>
      <PageHeader title="Calendário">
        <nav className="flex items-center gap-1" aria-label="Navegação de mês">
          <Link href={hrefMes(mesAnterior(referencia))} aria-label="Mês anterior" className={setaClasse}>
            <ChevronLeft />
          </Link>
          <span aria-live="polite" aria-atomic="true" className="w-[104px] text-center sm:w-[132px]">
            <span className="font-mono text-[12px] font-semibold tabular-nums sm:hidden">
              {formatarMesAnoCurto(referencia)}
            </span>
            <span className="hidden text-[13.5px] font-semibold sm:inline">
              {formatarMesAno(referencia)}
            </span>
          </span>
          <Link href={hrefMes(mesSeguinte(referencia))} aria-label="Próximo mês" className={setaClasse}>
            <ChevronRight />
          </Link>
        </nav>
      </PageHeader>

      <div className="mx-auto w-full max-w-5xl px-5 pb-10 lg:px-8 lg:pt-6">
        {/*
          A coluna dos "Próximos" só abre em xl: entre lg e xl o fio já ocupa 260px, e
          espremer a grade em ~430px faria as contas do dia encostarem umas nas outras.
        */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {coordena && (
              <nav aria-label="Como usar o calendário" className="flex w-fit gap-1 rounded-xl bg-muted p-1">
                {[
                  { chave: "", rotulo: "Ver o mês" },
                  { chave: "montar", rotulo: "Montar a escala" },
                ].map((m) => {
                  const ativo = (montando ? "montar" : "") === m.chave;
                  return (
                    <Link
                      key={m.rotulo}
                      href={`/calendario?${new URLSearchParams({
                        mes: mesAtual,
                        filtro: atual,
                        ...(m.chave ? { modo: m.chave } : {}),
                      })}`}
                      aria-current={ativo ? "page" : undefined}
                      className={cn(
                        "inline-flex min-h-11 items-center rounded-lg px-3.5 text-[12.5px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:min-h-9",
                        ativo
                          ? "bg-panel text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {m.rotulo}
                    </Link>
                  );
                })}
              </nav>
            )}

            {montando ? (
              <>
                <MonthBoard
                  dias={getGradeDoMes(referencia, agora)}
                  atividades={atividades}
                  pessoas={pessoas}
                  funcoes={funcoes}
                />
                <CargaDoMesFaixa carga={cargaDoMes(atividades, pessoas, mesAtual)} />
              </>
            ) : (
              <>
                <FiltroMeusTodos
                  base="/calendario"
                  atual={atual}
                  extraParams={{ mes: mesAtual }}
                />
                <MonthGrid dias={getGradeDoMes(referencia, agora)} itens={itens} />
                {atual === "todos" && <LegendaContas />}
              </>
            )}
          </div>

          <section
            className={cn(
              "flex w-full flex-col gap-2.5 xl:w-[250px] xl:shrink-0",
              // Montando, a grade precisa da largura toda — e "Próximos" é leitura pessoal.
              montando && "hidden",
            )}
          >
            <Kicker>Próximos</Kicker>
            {proximos.length === 0 ? (
              <Vazio>
                {atual === "meus"
                  ? "Nada seu pela frente por enquanto."
                  : "Nada agendado pela frente por enquanto."}
              </Vazio>
            ) : (
              proximos.map((item) => (
                <CartaoProximo
                  key={item.atividade.id}
                  item={item}
                  pessoaPorId={pessoaPorId}
                  agora={agora}
                />
              ))
            )}
          </section>
        </div>
      </div>
    </>
  );
}

/**
 * O cartão azul é só do que é seu — um destaque por tela (decisoes-design.md §7.5).
 * Nele a frase vem inteira, para a pessoa não precisar abrir a escala pra saber o resto.
 */
function CartaoProximo({
  item,
  pessoaPorId,
  agora,
}: {
  item: AtividadeComPapel;
  pessoaPorId: Map<string, Pessoa>;
  agora: Date;
}) {
  const { atividade, papel } = item;
  const meu = papel !== "nenhum";
  const elenco = {
    responsavel: atividade.responsavelId ? pessoaPorId.get(atividade.responsavelId) : undefined,
    suplente: atividade.suplenteId ? pessoaPorId.get(atividade.suplenteId) : undefined,
  };

  return (
    <article
      className={cn(
        "rounded-xl border p-3.5",
        meu ? "border-accent-soft bg-accent-soft" : "border-border bg-panel",
      )}
    >
      <p
        className={cn(
          "font-mono text-[10.5px] font-semibold tracking-wide tabular-nums uppercase",
          meu ? "text-accent-ink" : "text-muted-foreground",
        )}
      >
        {formatarDataKicker(atividade.data)} · {rotuloTipo(atividade.tipo)}
      </p>
      <p
        className={cn(
          "mt-1 text-[14px] leading-snug",
          meu ? "font-bold text-accent-ink" : "font-semibold",
        )}
      >
        {atividade.titulo}
      </p>
      <p className={cn("mt-1 text-[12.5px]", meu ? "text-accent-ink/85" : "text-muted-foreground")}>
        {meu
          ? fraseDaAtividade(atividade, papel, elenco, agora)
          : contextoDaAtividade(papel, elenco)}
      </p>
    </article>
  );
}
