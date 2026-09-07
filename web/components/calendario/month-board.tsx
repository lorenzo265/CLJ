"use client";

import { useOptimistic, useState, useTransition, type DragEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DialogoAtividade } from "@/components/gestao/atividades-manager";
import { remarcarAtividade } from "@/lib/actions/escala";
import { formatarDiaEMes, formatarHora, nomeCurto } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DiaGrade } from "@/lib/calendario/mes";
import type { Atividade, Funcao, Pessoa } from "@/lib/types";

/*
  O calendário de quem monta a escala.

  A grade de leitura (month-grid.tsx) responde "que dias são meus" e por isso é feita de
  contas: sem clique, sem estado. Esta responde outra pergunta — "onde faltam mãos e como
  arrumo isso" — e por isso o dia é um lugar onde se AGE: clicar cria ali, arrastar remarca.

  Não é a grade de horas do Notion Calendar, e a ausência é escolha. Lá a unidade é
  compromisso com duração, e as 24 faixas são a informação. Aqui a unidade é "um post que
  sai às 7h": sem duração, sem colisão, sem sala disputada — uma grade de horas gastaria a
  tela desenhando 23 faixas vazias. A unidade daqui é o DIA.

  No celular a mesma capacidade muda de gesto: as semanas viram lista de dias, e remarcar é
  o campo de data do formulário em vez do arrasto (decisoes-design.md §7.3 — a mesma
  informação e as mesmas ações nas duas densidades, nunca um recorte menor no telefone).
*/

const SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

/** Acima disso a célula vira "+N": quatro fichas já estouram a altura de uma semana. */
const MAX_FICHAS = 3;

type Remarcacao = { id: string; data: string };

const remarcar = (atividades: Atividade[], m: Remarcacao): Atividade[] =>
  atividades.map((a) => (a.id === m.id ? { ...a, data: m.data } : a));

// ————————————————————————————————————————————————————————————— a ficha

function Ficha({
  atividade,
  pessoas,
  arrastando,
  aoArrastar,
  aoAbrir,
}: {
  atividade: Atividade;
  pessoas: Map<string, Pessoa>;
  arrastando: boolean;
  aoArrastar: (id: string | null) => void;
  aoAbrir: () => void;
}) {
  const responsavel = atividade.responsavelId ? pessoas.get(atividade.responsavelId) : undefined;
  const furo = !atividade.responsavelId;

  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", atividade.id);
        e.dataTransfer.effectAllowed = "move";
        aoArrastar(atividade.id);
      }}
      onDragEnd={() => aoArrastar(null)}
      onClick={aoAbrir}
      className={cn(
        "flex w-full cursor-grab flex-col items-start gap-px rounded px-1.5 py-1 text-left outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
        furo ? "bg-warn-soft" : "bg-accent",
        arrastando && "opacity-40",
      )}
    >
      <span
        className={cn(
          "w-full truncate text-[11px] leading-tight font-semibold",
          furo ? "text-warn" : "text-accent-ink",
        )}
      >
        {atividade.hora && (
          <span className="font-mono font-normal">{formatarHora(atividade.hora)} </span>
        )}
        {atividade.titulo}
      </span>
      <span
        className={cn(
          "w-full truncate text-[10px] leading-tight",
          furo ? "font-bold text-warn" : "text-accent-ink/75",
        )}
      >
        {responsavel
          ? nomeCurto(responsavel.nome)
          : atividade.responsavelId
            ? "fora do departamento"
            : "sem ninguém"}
      </span>
    </button>
  );
}

// ————————————————————————————————————————————————————————————— o quadro do mês

export function MonthBoard({
  dias,
  atividades,
  pessoas,
  funcoes,
}: {
  dias: DiaGrade[];
  /** Já recortadas pela tela — este componente não filtra nada. */
  atividades: Atividade[];
  pessoas: Pessoa[];
  funcoes: Funcao[];
}) {
  const [lista, otimista] = useOptimistic(atividades, remarcar);
  const [, iniciar] = useTransition();
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<string | null>(null);
  const [criandoEm, setCriandoEm] = useState<string | null>(null);
  const [editando, setEditando] = useState<Atividade | null>(null);

  const pessoaPorId = new Map(pessoas.map((p) => [p.id, p]));

  const porDia = new Map<string, Atividade[]>();
  for (const a of lista) {
    const doDia = porDia.get(a.data);
    if (doDia) doDia.push(a);
    else porDia.set(a.data, [a]);
  }
  // Sem hora vai pro fim do dia: o que tem horário marcado é o que ordena a manhã.
  for (const doDia of porDia.values()) {
    doDia.sort((a, b) => (a.hora ?? "99:99").localeCompare(b.hora ?? "99:99"));
  }

  function soltarEm(data: string, e: DragEvent<HTMLElement>) {
    e.preventDefault();
    setAlvo(null);
    setArrastando(null);

    const id = e.dataTransfer.getData("text/plain");
    const atividade = lista.find((a) => a.id === id);
    if (!atividade || atividade.data === data) return;

    iniciar(async () => {
      otimista({ id, data });

      const fd = new FormData();
      fd.set("id", id);
      fd.set("data", data);
      const r = await remarcarAtividade({}, fd);

      if (r.erro) toast.error(r.erro);
      else toast.success(`Remarcada para ${formatarDiaEMes(data)}.`);
    });
  }

  const propsDeSolta = (data: string) => ({
    onDragOver: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move" as const;
      if (alvo !== data) setAlvo(data);
    },
    onDragLeave: (e: DragEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setAlvo(null);
    },
    onDrop: (e: DragEvent<HTMLElement>) => soltarEm(data, e),
  });

  const fichasDoDia = (data: string) =>
    (porDia.get(data) ?? []).map((atividade) => (
      <Ficha
        key={atividade.id}
        atividade={atividade}
        pessoas={pessoaPorId}
        arrastando={arrastando === atividade.id}
        aoArrastar={setArrastando}
        aoAbrir={() => setEditando(atividade)}
      />
    ));

  /** O "+" de cada dia. Sempre no DOM (não só no hover) — no toque não existe hover. */
  const botaoCriar = (data: string, rotuloLongo = false) => (
    <button
      type="button"
      onClick={() => setCriandoEm(data)}
      aria-label={`Criar atividade em ${formatarDiaEMes(data)}`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded text-faint outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        rotuloLongo ? "size-11 lg:size-9" : "size-5",
      )}
    >
      <Plus className={rotuloLongo ? "size-4" : "size-3"} aria-hidden />
    </button>
  );

  const doMes = dias.filter((d) => d.ehDoMesAtual);

  return (
    <>
      {/* A frase não pode prometer o arrasto onde ele não existe: no toque, remarcar é abrir. */}
      <p className="text-[12px] text-muted-foreground">
        Toque no <span className="font-semibold">+</span> de um dia para criar ali.
        <span className="hidden lg:inline">
          {" "}
          Arraste uma ficha para outro dia para remarcar — ou abra a ficha e mude a data.
        </span>
        <span className="lg:hidden"> Abra uma ficha para mudar a data dela.</span>
      </p>

      {/* Desktop: o mês como grade, e o arrasto é o gesto. */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-panel lg:block">
        <div className="grid grid-cols-7 border-b border-border" aria-hidden>
          {SEMANA.map((dia) => (
            <div
              key={dia}
              className="py-2 text-center font-mono text-[9.5px] font-semibold tracking-[0.08em] text-faint uppercase"
            >
              {dia}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {dias.map((dia, i) => {
            const doDia = porDia.get(dia.data) ?? [];
            return (
              <div
                key={dia.data}
                {...propsDeSolta(dia.data)}
                className={cn(
                  "group flex min-h-[112px] flex-col gap-1 p-1.5 transition-colors",
                  !dia.ehDoMesAtual && "bg-background/60",
                  i % 7 !== 6 && "border-r border-border-soft",
                  i < dias.length - 7 && "border-b border-border-soft",
                  alvo === dia.data && "bg-accent ring-1 ring-primary ring-inset",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full font-mono text-[11.5px] tabular-nums",
                      dia.ehDoMesAtual ? "text-muted-foreground" : "text-faint",
                      dia.ehHoje &&
                        "bg-accent-soft font-bold text-accent-ink ring-1 ring-accent-hi/40",
                    )}
                  >
                    {dia.diaDoMes}
                  </span>
                  {botaoCriar(dia.data)}
                </div>

                <div className="flex flex-col gap-1">
                  {fichasDoDia(dia.data).slice(0, MAX_FICHAS)}
                  {doDia.length > MAX_FICHAS && (
                    <span className="px-1.5 text-[10px] font-semibold text-muted-foreground">
                      +{doDia.length - MAX_FICHAS} neste dia
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/*
        Celular: a mesma capacidade, outro gesto. Só os dias do mês, e só os que têm algo —
        mais o "+" em cada um. Remarcar é o campo de data da ficha aberta.
      */}
      <ul className="flex flex-col gap-2 lg:hidden">
        {doMes.map((dia) => {
          const doDia = porDia.get(dia.data) ?? [];
          if (doDia.length === 0 && !dia.ehHoje) return null;

          return (
            <li
              key={dia.data}
              className={cn(
                "rounded-2xl border bg-panel p-3",
                dia.ehHoje ? "border-accent-hi/40 bg-accent-soft/40" : "border-border",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "font-mono text-[11px] font-semibold tracking-wide uppercase",
                    dia.ehHoje ? "text-accent-ink" : "text-muted-foreground",
                  )}
                >
                  {formatarDiaEMes(dia.data)}
                  {dia.ehHoje && " · hoje"}
                </p>
                {botaoCriar(dia.data, true)}
              </div>

              {doDia.length > 0 ? (
                <div className="mt-2 flex flex-col gap-1.5">{fichasDoDia(dia.data)}</div>
              ) : (
                <p className="mt-1 text-[12px] text-faint">Nada marcado.</p>
              )}
            </li>
          );
        })}
      </ul>

      <DialogoAtividade
        pessoas={pessoas}
        funcoes={funcoes}
        dataPadrao={criandoEm ?? ""}
        aberto={criandoEm !== null}
        aoFechar={() => setCriandoEm(null)}
      />
      <DialogoAtividade
        atividade={editando ?? undefined}
        pessoas={pessoas}
        funcoes={funcoes}
        dataPadrao={editando?.data ?? ""}
        aberto={editando !== null}
        aoFechar={() => setEditando(null)}
      />
    </>
  );
}
