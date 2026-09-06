import { Conta, estadoDaConta } from "@/components/fio/conta";
import { cn } from "@/lib/utils";
import type { DiaGrade } from "@/lib/calendario/mes";
import type { AtividadeComPapel, PapelNaAtividade } from "@/lib/escala/agenda";

/*
  A grade do mês. Sem estado e sem clique: quem lê aqui está procurando "que dias são meus",
  e a resposta é a conta preenchida (docs/decisoes-design.md §1) — por isso o dia não vira
  botão nem o título do compromisso disputa espaço com o número.
*/

const SEMANA = [
  { inicial: "D", curto: "DOM" },
  { inicial: "S", curto: "SEG" },
  { inicial: "T", curto: "TER" },
  { inicial: "Q", curto: "QUA" },
  { inicial: "Q", curto: "QUI" },
  { inicial: "S", curto: "SEX" },
  { inicial: "S", curto: "SÁB" },
];

/** Três contas cabem numa célula de 390px sem virar sopa de pontos. */
const MAX_CONTAS = 3;

/*
  No celular a célula tem ~38px úteis: a conta encolhe e abre mão do anel-auréola para as
  três caberem lado a lado. A leitura não se perde — continua cor + geometria (cheia = sua,
  contornada = suplência, hairline = departamento). O anel volta a partir de `sm`, onde sobra
  espaço para ele não encostar no vizinho.
*/
const CONTA_NA_CELULA = "max-sm:size-[7px] max-sm:shadow-none";

/** O que é seu vem primeiro: quando o dia lota, as contas cortadas são as do departamento. */
const PESO: Record<PapelNaAtividade, number> = { responsavel: 0, suplente: 1, nenhum: 2 };

export function MonthGrid({
  dias,
  itens,
  className,
}: {
  dias: DiaGrade[];
  /** Atividades já anotadas com o papel do viewer (`comPapel`) e já filtradas pela tela. */
  itens: AtividadeComPapel[];
  className?: string;
}) {
  const porDia = new Map<string, AtividadeComPapel[]>();
  for (const item of itens) {
    const lista = porDia.get(item.atividade.data);
    if (lista) lista.push(item);
    else porDia.set(item.atividade.data, [item]);
  }
  for (const lista of porDia.values()) lista.sort((a, b) => PESO[a.papel] - PESO[b.papel]);

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-panel", className)}>
      {/* No leitor de tela "D S T Q Q S S" é ruído: a célula já anuncia o dia e o que há nele. */}
      <div className="grid grid-cols-7 border-b border-border" aria-hidden>
        {SEMANA.map((dia, i) => (
          <div
            key={`${dia.curto}-${i}`}
            className="py-2 text-center font-mono text-[9.5px] font-semibold tracking-[0.08em] text-faint uppercase"
          >
            <span className="sm:hidden">{dia.inicial}</span>
            <span className="hidden sm:inline">{dia.curto}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {dias.map((dia, i) => {
          const doDia = porDia.get(dia.data) ?? [];
          const meus = doDia.filter((it) => it.papel !== "nenhum").length;

          return (
            <div
              key={dia.data}
              className={cn(
                "flex min-h-[54px] flex-col items-center gap-1 p-1.5",
                "sm:min-h-[84px] sm:items-start sm:gap-1.5 sm:p-2",
                i % 7 !== 6 && "border-r border-border-soft",
                i < dias.length - 7 && "border-b border-border-soft",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full font-mono text-[11.5px] tabular-nums",
                  dia.ehDoMesAtual ? "text-muted-foreground" : "text-faint",
                  dia.ehHoje && "bg-accent-soft font-bold text-accent-ink ring-1 ring-accent-hi/40",
                )}
              >
                {dia.diaDoMes}
              </span>

              {doDia.length > 0 && (
                <>
                  <span className="sr-only">{resumoDoDia(doDia.length, meus)}</span>
                  <span className="flex items-center gap-1 sm:gap-2" aria-hidden>
                    {doDia.slice(0, MAX_CONTAS).map((it) => (
                      <Conta
                        key={it.atividade.id}
                        estado={estadoDaConta(it.papel)}
                        className={CONTA_NA_CELULA}
                      />
                    ))}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * O que o leitor de tela ouve no lugar das contas, logo depois do número do dia — sem
 * repetir a data (o número já foi lido) e sem id nem nome de tabela.
 */
function resumoDoDia(total: number, meus: number): string {
  const compromissos = `${total} ${total === 1 ? "compromisso" : "compromissos"}`;
  if (meus === 0) return `${compromissos} do departamento`;
  return `${compromissos}, ${meus} ${meus === 1 ? "seu" : "seus"}`;
}
