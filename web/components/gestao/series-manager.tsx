"use client";

import { useActionState, useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Vazio } from "@/components/fio/tipografia";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { criarSerie, excluirSerie, redistribuirSerie } from "@/lib/actions/series";
import {
  MAX_DATAS_DA_SERIE,
  datasDaSerie,
  distribuirRodizio,
  resumoDaDivisao,
} from "@/lib/escala/serie";
import { rotuloTipo } from "@/lib/escala/frase";
import { formatarDataCurta, formatarDiaEMes, nomeCurto } from "@/lib/format";
import { DIAS_SEMANA, TIPOS_ATIVIDADE } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { EstadoForm } from "@/lib/actions/auth";
import type { DiaSemana, Funcao, Pessoa, Serie } from "@/lib/types";

/*
  A série: criar trinta atividades de uma vez e dividi-las entre quem faz.

  O ponto desta tela é a PRÉVIA. Ela chama exatamente as mesmas funções puras
  (lib/escala/serie.ts) que a Server Action vai chamar para gravar — não uma aproximação
  desenhada à parte. Quem coordena vê a divisão inteira antes de existir, e o que vê é o
  que fica. Ainda assim o servidor recalcula: o navegador manda a regra e o grupo, nunca a
  escala pronta (ver o comentário no topo de lib/actions/series.ts).
*/

const INICIAL: EstadoForm = {};

const ROTULO_DIA: Record<DiaSemana, string> = {
  seg: "Seg",
  ter: "Ter",
  qua: "Qua",
  qui: "Qui",
  sex: "Sex",
  sab: "Sáb",
  dom: "Dom",
};

const ATALHOS: { rotulo: string; dias: DiaSemana[] }[] = [
  { rotulo: "Todo dia", dias: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"] },
  { rotulo: "Seg a sex", dias: ["seg", "ter", "qua", "qui", "sex"] },
  { rotulo: "Fim de semana", dias: ["sab", "dom"] },
];

const SELECT =
  "h-11 w-full appearance-none rounded-lg border border-input bg-panel pr-9 pl-3 text-[14px] " +
  "outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 " +
  "focus-visible:ring-ring/50 lg:h-9 lg:text-[13px]";

function SelectNativo({
  id,
  name,
  defaultValue,
  children,
}: {
  id?: string;
  name: string;
  defaultValue?: string;
  children: ReactNode;
}) {
  return (
    <span className="relative block">
      <select id={id} name={name} defaultValue={defaultValue} className={SELECT}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-faint"
        aria-hidden
      />
    </span>
  );
}

function Campo({
  label,
  htmlFor,
  dica,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  dica?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {dica && <p className="text-[12px] text-muted-foreground">{dica}</p>}
    </div>
  );
}

function Erro({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;
  return (
    <p role="alert" className="rounded-lg bg-crit-soft px-3 py-2 text-[13px] text-crit">
      {mensagem}
    </p>
  );
}

// ————————————————————————————————————————————————————————————— escolher o grupo

/**
 * Quem entra no rodízio. Só gente ativa: escalar quem saiu do departamento seria criar
 * furo com nome. A disponibilidade declarada aparece ao lado do nome porque é ela que
 * explica, na prévia, por que fulano levou menos contas que sicrano.
 */
function EscolhaDoGrupo({
  pessoas,
  grupo,
  aoAlternar,
}: {
  pessoas: Pessoa[];
  grupo: Set<string>;
  aoAlternar: (id: string) => void;
}) {
  const ativas = pessoas.filter((p) => p.status === "ativo");

  if (ativas.length === 0) {
    return (
      <p className="text-[12.5px] text-muted-foreground">
        Ninguém ativo no departamento ainda — a série nasce inteira sem responsável, e você
        distribui depois.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {ativas.map((p) => {
        const dentro = grupo.has(p.id);
        return (
          <label
            key={p.id}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
              dentro ? "border-primary bg-accent" : "border-border-soft bg-background",
            )}
          >
            <input
              type="checkbox"
              checked={dentro}
              onChange={() => aoAlternar(p.id)}
              className="size-4 accent-primary"
            />
            <span className="min-w-0 flex-1 text-[13.5px] font-semibold text-foreground">
              {p.nome}
            </span>
            <span className="shrink-0 font-mono text-[11px] text-faint">
              {p.disponibilidade.dias.length === 0
                ? "sem restrição"
                : p.disponibilidade.dias.map((d) => ROTULO_DIA[d]).join(" ")}
            </span>
          </label>
        );
      })}
    </div>
  );
}

// ————————————————————————————————————————————————————————————— a prévia

/**
 * A divisão inteira, antes de existir. Duas leituras: quanto cada um leva (é onde o
 * desequilíbrio aparece) e o calendário data a data (é onde o furo aparece).
 */
function Previa({
  datas,
  grupo,
  pessoas,
  respeitarDisponibilidade,
}: {
  datas: string[];
  grupo: string[];
  pessoas: Pessoa[];
  respeitarDisponibilidade: boolean;
}) {
  const { alocacoes, resumo, semNada } = useMemo(() => {
    const candidatos = grupo
      .map((id) => pessoas.find((p) => p.id === id))
      .filter((p): p is Pessoa => Boolean(p))
      .map((p) => ({ id: p.id, dias: respeitarDisponibilidade ? p.disponibilidade.dias : [] }));

    const a = distribuirRodizio(datas, candidatos);
    const r = resumoDaDivisao(a);
    const contemplados = new Set(r.porPessoa.map((x) => x.pessoaId));

    return {
      alocacoes: a,
      resumo: r,
      // Quem foi marcado e não levou nada. Sem esta linha a pessoa some da prévia sem
      // explicação, e quem coordena marca a caixa outra vez achando que errou o clique.
      semNada: candidatos.filter((c) => !contemplados.has(c.id)).map((c) => c.id),
    };
  }, [datas, grupo, pessoas, respeitarDisponibilidade]);

  const nome = (id: string | null) => {
    if (!id) return "sem ninguém";
    const p = pessoas.find((x) => x.id === id);
    return p ? nomeCurto(p.nome) : "—";
  };

  if (datas.length === 0) {
    return (
      <div className="rounded-lg border border-border-soft bg-background p-3">
        <p className="kicker mb-1">Prévia</p>
        <p className="text-[12.5px] text-muted-foreground">
          Escolha os dias da semana e o período — a divisão aparece aqui antes de você salvar.
        </p>
      </div>
    );
  }

  const maior = Math.max(1, ...resumo.porPessoa.map((p) => p.total));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-soft bg-background p-3">
      <div>
        <p className="kicker mb-1">Prévia</p>
        <p className="text-[13px] leading-snug text-foreground">
          <strong className="font-semibold">{datas.length} atividades</strong>, de{" "}
          {formatarDiaEMes(datas[0])} a {formatarDiaEMes(datas[datas.length - 1])}.
        </p>
      </div>

      {resumo.porPessoa.length > 0 && (
        <ul className="flex flex-col gap-1">
          {resumo.porPessoa.map(({ pessoaId, total }) => (
            <li key={pessoaId} className="flex items-center gap-2">
              <span className="w-24 shrink-0 truncate text-[12.5px] text-foreground">
                {nome(pessoaId)}
              </span>
              <span
                className="h-2 rounded-full bg-primary"
                style={{ width: `${(total / maior) * 60}%` }}
                aria-hidden
              />
              <span className="font-mono text-[11.5px] text-muted-foreground">{total}</span>
            </li>
          ))}
        </ul>
      )}

      {semNada.length > 0 && (
        <p className="rounded bg-info-soft px-2.5 py-1.5 text-[12.5px] leading-snug text-info">
          {semNada.map((id) => nome(id)).join(", ")}{" "}
          {semNada.length === 1 ? "não pega" : "não pegam"} nenhuma data
          {respeitarDisponibilidade
            ? " — a disponibilidade declarada não alcança os dias desta série."
            : " — há menos datas do que gente no rodízio."}
        </p>
      )}

      {resumo.furos > 0 && (
        <p className="rounded bg-warn-soft px-2.5 py-1.5 text-[12.5px] text-warn">
          {resumo.furos} {resumo.furos === 1 ? "data fica" : "datas ficam"} sem ninguém
          {grupo.length === 0
            ? " — nenhuma pessoa no rodízio ainda."
            : respeitarDisponibilidade
              ? " — ninguém do grupo declarou estar disponível nesses dias."
              : "."}
        </p>
      )}

      {/* A lista data a data: é o que dá confiança de apertar o botão. */}
      <ul className="max-h-44 overflow-y-auto rounded border border-border-soft">
        {alocacoes.map((a) => (
          <li
            key={a.data}
            className="flex items-center justify-between gap-3 border-b border-border-soft px-2.5 py-1.5 text-[12.5px] last:border-b-0"
          >
            <span className="font-mono text-muted-foreground">{formatarDataCurta(a.data)}</span>
            <span className={a.pessoaId ? "text-foreground" : "font-semibold text-warn"}>
              {nome(a.pessoaId)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ————————————————————————————————————————————————————————————— criar

function FormSerie({
  pessoas,
  funcoes,
  dataPadrao,
  aoConcluir,
}: {
  pessoas: Pessoa[];
  funcoes: Funcao[];
  dataPadrao: string;
  aoConcluir: () => void;
}) {
  const [estado, acao, pendente] = useActionState(criarSerie, INICIAL);
  const id = useId();

  const [dias, setDias] = useState<Set<DiaSemana>>(new Set(["seg", "ter", "qua", "qui", "sex"]));
  const [inicio, setInicio] = useState(dataPadrao);
  const [fim, setFim] = useState(dataPadrao);
  const [grupo, setGrupo] = useState<Set<string>>(new Set());
  const [respeitar, setRespeitar] = useState(true);

  // `dias` e `grupo` são Sets trocados por inteiro a cada clique, então a identidade deles
  // já é a dependência certa — não precisa serializar nada para comparar.
  const diasEscolhidos = useMemo(() => DIAS_SEMANA.filter((d) => dias.has(d)), [dias]);
  const grupoEscolhido = useMemo(
    () => pessoas.filter((p) => grupo.has(p.id)).map((p) => p.id),
    [pessoas, grupo],
  );
  const datas = useMemo(
    () => datasDaSerie({ dias: diasEscolhidos, inicio, fim }),
    [diasEscolhidos, inicio, fim],
  );

  const demais = datas.length >= MAX_DATAS_DA_SERIE;

  useEffect(() => {
    if (!estado.ok) return;
    toast.success(estado.mensagem ?? "Série criada.");
    aoConcluir();
  }, [estado]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={acao} className="flex flex-col gap-4">
      {diasEscolhidos.map((d) => (
        <input key={d} type="hidden" name="dias" value={d} />
      ))}
      {grupoEscolhido.map((p) => (
        <input key={p} type="hidden" name="grupo" value={p} />
      ))}
      {respeitar && <input type="hidden" name="respeitarDisponibilidade" value="sim" />}

      <Campo
        label="Título"
        htmlFor={`${id}-titulo`}
        dica="O mesmo em todas as datas — é assim que a série se reconhece na escala."
      >
        <Input
          id={`${id}-titulo`}
          name="titulo"
          maxLength={160}
          placeholder="Terço Diário"
          required
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Tipo" htmlFor={`${id}-tipo`}>
          <SelectNativo id={`${id}-tipo`} name="tipo" defaultValue="post">
            {TIPOS_ATIVIDADE.map((t) => (
              <option key={t} value={t}>
                {rotuloTipo(t)}
              </option>
            ))}
          </SelectNativo>
        </Campo>

        <Campo label="Função" htmlFor={`${id}-funcao`}>
          <SelectNativo id={`${id}-funcao`} name="funcaoId" defaultValue="">
            <option value="">Sem função definida</option>
            {funcoes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </SelectNativo>
        </Campo>

        <Campo label="Começa em" htmlFor={`${id}-inicio`}>
          <Input
            id={`${id}-inicio`}
            name="inicio"
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            required
          />
        </Campo>

        <Campo label="Vai até" htmlFor={`${id}-fim`} dica="Inclusive — o último dia também conta.">
          <Input
            id={`${id}-fim`}
            name="fim"
            type="date"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            required
          />
        </Campo>

        <Campo
          label="Hora"
          htmlFor={`${id}-hora`}
          dica="Opcional — vale para todas as datas da série."
          className="sm:col-span-2"
        >
          <Input id={`${id}-hora`} name="hora" type="time" />
        </Campo>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-[13px] font-semibold text-foreground">
          Em que dias acontece
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {DIAS_SEMANA.map((d) => {
            const marcado = dias.has(d);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={marcado}
                onClick={() =>
                  setDias((atual) => {
                    const proximo = new Set(atual);
                    if (proximo.has(d)) proximo.delete(d);
                    else proximo.add(d);
                    return proximo;
                  })
                }
                className={cn(
                  "min-h-11 min-w-11 rounded-lg border px-3 text-[12.5px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:min-h-9",
                  marcado
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-panel text-muted-foreground hover:text-foreground",
                )}
              >
                {ROTULO_DIA[d]}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3">
          {ATALHOS.map((a) => (
            <button
              key={a.rotulo}
              type="button"
              onClick={() => setDias(new Set(a.dias))}
              className="rounded text-[12px] text-muted-foreground underline underline-offset-2 outline-none hover:text-accent-ink focus-visible:ring-2 focus-visible:ring-ring"
            >
              {a.rotulo}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-[13px] font-semibold text-foreground">
          Quem entra no rodízio
        </legend>
        <EscolhaDoGrupo
          pessoas={pessoas}
          grupo={grupo}
          aoAlternar={(pid) =>
            setGrupo((atual) => {
              const proximo = new Set(atual);
              if (proximo.has(pid)) proximo.delete(pid);
              else proximo.add(pid);
              return proximo;
            })
          }
        />
        <label className="mt-1 flex min-h-11 cursor-pointer items-center gap-2.5 lg:min-h-0">
          <input
            type="checkbox"
            checked={respeitar}
            onChange={(e) => setRespeitar(e.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="text-[12.5px] text-muted-foreground">
            Respeitar a disponibilidade que cada um declarou
          </span>
        </label>
      </fieldset>

      <Previa
        datas={datas}
        grupo={grupoEscolhido}
        pessoas={pessoas}
        respeitarDisponibilidade={respeitar}
      />

      {demais && (
        <p role="alert" className="rounded-lg bg-warn-soft px-3 py-2 text-[13px] text-warn">
          O período escolhido passa de {MAX_DATAS_DA_SERIE} datas. Encurte — dá para criar
          outra série depois.
        </p>
      )}

      <Erro mensagem={estado.erro} />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
        <Button type="submit" disabled={pendente || datas.length === 0 || demais}>
          {pendente
            ? "Criando…"
            : datas.length === 0
              ? "Criar série"
              : `Criar ${datas.length} atividades`}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function NovaSerieBotao({
  pessoas,
  funcoes,
  dataPadrao,
}: {
  pessoas: Pessoa[];
  funcoes: Funcao[];
  dataPadrao: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setAberto(true)}>
        <Repeat aria-hidden />
        Nova série
      </Button>

      <Dialog disablePointerDismissal open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova série</DialogTitle>
            <DialogDescription>
              Uma coisa que se repete — o terço de todo dia, o post de todo sábado. Você
              descreve a regra uma vez e o app cria e divide todas as datas.
            </DialogDescription>
          </DialogHeader>
          {/* `key` remonta o formulário a cada abertura: nada da série anterior sobra. */}
          <FormSerie
            key={String(aberto)}
            pessoas={pessoas}
            funcoes={funcoes}
            dataPadrao={dataPadrao}
            aoConcluir={() => setAberto(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// ————————————————————————————————————————————————————————————— redistribuir e desfazer

function FormRedistribuir({
  serie,
  pessoas,
  aoConcluir,
}: {
  serie: Serie;
  pessoas: Pessoa[];
  aoConcluir: () => void;
}) {
  const [estado, acao, pendente] = useActionState(redistribuirSerie, INICIAL);
  const [grupo, setGrupo] = useState<Set<string>>(new Set());
  const [respeitar, setRespeitar] = useState(true);
  const id = useId();

  useEffect(() => {
    if (!estado.ok) return;
    toast.success(estado.mensagem ?? "Série redistribuída.");
    aoConcluir();
  }, [estado]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="serieId" value={serie.id} />
      {pessoas
        .filter((p) => grupo.has(p.id))
        .map((p) => (
          <input key={p.id} type="hidden" name="grupo" value={p.id} />
        ))}
      {respeitar && <input type="hidden" name="respeitarDisponibilidade" value="sim" />}

      <p className="rounded-lg bg-info-soft px-3 py-2 text-[12.5px] leading-snug text-info">
        Só o que ainda está por vir muda de mãos. O que já foi publicado fica como está, e
        cada troca entra no histórico da atividade.
      </p>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-[13px] font-semibold text-foreground">
          Quem passa a dividir
        </legend>
        <EscolhaDoGrupo
          pessoas={pessoas}
          grupo={grupo}
          aoAlternar={(pid) =>
            setGrupo((atual) => {
              const proximo = new Set(atual);
              if (proximo.has(pid)) proximo.delete(pid);
              else proximo.add(pid);
              return proximo;
            })
          }
        />
        <label className="mt-1 flex min-h-11 cursor-pointer items-center gap-2.5 lg:min-h-0">
          <input
            type="checkbox"
            checked={respeitar}
            onChange={(e) => setRespeitar(e.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="text-[12.5px] text-muted-foreground">
            Respeitar a disponibilidade que cada um declarou
          </span>
        </label>
      </fieldset>

      <Campo
        label="Motivo (opcional)"
        htmlFor={`${id}-motivo`}
        dica="Vai junto de cada troca registrada."
      >
        <Input
          id={`${id}-motivo`}
          name="motivo"
          maxLength={200}
          placeholder="O João saiu do departamento"
        />
      </Campo>

      <Erro mensagem={estado.erro} />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
        <Button type="submit" disabled={pendente}>
          {pendente ? "Redistribuindo…" : "Redistribuir"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FormDesfazer({ serie, aoConcluir }: { serie: Serie; aoConcluir: () => void }) {
  const [estado, acao, pendente] = useActionState(excluirSerie, INICIAL);

  useEffect(() => {
    if (!estado.ok) return;
    toast.success(estado.mensagem ?? "Série desfeita.");
    aoConcluir();
  }, [estado]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="serieId" value={serie.id} />
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        Isso apaga as atividades de <strong className="text-foreground">{serie.titulo}</strong>{" "}
        que ainda estão por vir. O que já foi publicado continua na escala e no histórico —
        só deixa de pertencer à série.
      </p>

      <Erro mensagem={estado.erro} />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
        <Button type="submit" variant="destructive" disabled={pendente}>
          {pendente ? "Desfazendo…" : "Desfazer a série"}
        </Button>
      </DialogFooter>
    </form>
  );
}

type FocoSerie = { modo: "redistribuir" | "desfazer"; serie: Serie };

/** A lista das séries que existem — o lugar de mexer no conjunto em vez de linha a linha. */
export function SeriesManager({
  series,
  pessoas,
}: {
  series: { serie: Serie; atividades: number }[];
  pessoas: Pessoa[];
}) {
  const [foco, setFoco] = useState<FocoSerie | null>(null);

  if (series.length === 0) {
    return (
      <Vazio>
        Nenhuma série ainda. Uma série é o que se repete — o terço de todo dia, o post de
        todo sábado: você descreve a regra uma vez e o app cria e divide todas as datas.
      </Vazio>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {series.map(({ serie, atividades }) => (
          <li
            key={serie.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border-soft bg-panel px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-foreground">{serie.titulo}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                <span className="font-mono">
                  {serie.dias.map((d) => ROTULO_DIA[d]).join(" · ")}
                </span>
                {" — "}
                {formatarDiaEMes(serie.inicio)} a {formatarDiaEMes(serie.fim)} ·{" "}
                {atividades} {atividades === 1 ? "atividade" : "atividades"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11 lg:h-9"
                onClick={() => setFoco({ modo: "redistribuir", serie })}
              >
                <Repeat aria-hidden />
                Redistribuir
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Desfazer a série ${serie.titulo}`}
                onClick={() => setFoco({ modo: "desfazer", serie })}
              >
                <Trash2 aria-hidden />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog
        disablePointerDismissal
        open={foco !== null}
        onOpenChange={(aberto) => !aberto && setFoco(null)}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          {foco?.modo === "redistribuir" && (
            <>
              <DialogHeader>
                <DialogTitle>Redistribuir “{foco.serie.titulo}”</DialogTitle>
                <DialogDescription>
                  Divide de novo o que ainda está por vir, equilibrando entre quem você
                  escolher.
                </DialogDescription>
              </DialogHeader>
              <FormRedistribuir
                serie={foco.serie}
                pessoas={pessoas}
                aoConcluir={() => setFoco(null)}
              />
            </>
          )}
          {foco?.modo === "desfazer" && (
            <>
              <DialogHeader>
                <DialogTitle>Desfazer a série?</DialogTitle>
                <DialogDescription>Isto não dá para voltar atrás.</DialogDescription>
              </DialogHeader>
              <FormDesfazer serie={foco.serie} aoConcluir={() => setFoco(null)} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
