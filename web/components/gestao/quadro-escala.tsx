"use client";

import {
  useOptimistic,
  useState,
  useTransition,
  type DragEvent,
  type ReactNode,
} from "react";
import { ChevronDown, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { StatusPill, rotuloStatus } from "@/components/fio/status-pill";
import { mudarStatus, trocarResponsavel } from "@/lib/actions/escala";
import { rotuloTipo } from "@/lib/escala/frase";
import { formatarDataKicker, formatarHora, nomeCurto } from "@/lib/format";
import {
  SEM_NINGUEM,
  colunaAtual,
  colunasPorPessoa,
  colunasPorStatus,
  maiorColuna,
  movimentoAoSoltar,
  type Agrupamento,
} from "@/lib/escala/quadro";
import { STATUS_ATIVIDADE } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { Atividade, Funcao, Pessoa, StatusAtividade } from "@/lib/types";

export type { Agrupamento };

/*
  O quadro — a escala como superfície de DECISÃO, não de auditoria.

  Uma tabela responde "o que existe". Ela não responde as duas perguntas que quem coordena
  faz: "de quem é isso?" e "como divido?". Agrupar por pessoa responde a primeira (a coluna
  É a resposta, e o tamanho dela mostra o desequilíbrio sem ninguém contar); arrastar
  responde a segunda (atribuir passa de cinco atos — abrir diálogo, achar o campo, escolher,
  salvar, fechar — para um).

  O que foi tomado emprestado do Trello é o GESTO, não o pacote: `decisoes-estrutura.md` §2
  diz que isto não é ferramenta genérica de projetos, então não há lista livre, etiqueta,
  checklist nem comentário. E as colunas de status não foram inventadas — `ideia → rascunho
  → agendado → publicado` está no CHECK do banco desde a Fase 2.

  Arrastar é para quem tem mouse. Todo cartão carrega também um <select> nativo que faz a
  mesma coisa: é o caminho de teclado, de leitor de tela e do celular, onde arrastar entre
  colunas é hostil. Os dois chamam a mesma Server Action.
*/

type Mudanca =
  | { id: string; campo: "responsavel"; valor: string | null }
  | { id: string; campo: "status"; valor: StatusAtividade };

function aplicar(atividades: Atividade[], m: Mudanca): Atividade[] {
  return atividades.map((a) =>
    a.id !== m.id
      ? a
      : m.campo === "responsavel"
        ? { ...a, responsavelId: m.valor }
        : { ...a, status: m.valor },
  );
}

// ————————————————————————————————————————————————————————————— o cartão

function Cartao({
  atividade,
  funcao,
  linhaDeApoio,
  destinos,
  destinoAtual,
  arrastando,
  aoArrastar,
  aoSoltarNoNada,
  aoMover,
}: {
  atividade: Atividade;
  funcao?: Funcao;
  /** O dado que a coluna NÃO diz: em "por pessoa" é o status, em "por status" é quem faz. */
  linhaDeApoio: ReactNode;
  destinos: { valor: string; rotulo: string }[];
  destinoAtual: string;
  arrastando: boolean;
  aoArrastar: (id: string | null) => void;
  aoSoltarNoNada: () => void;
  aoMover: (valor: string) => void;
}) {
  return (
    <article
      draggable
      onDragStart={(e) => {
        // O texto no dataTransfer é o que torna o arrasto legítimo pro navegador; sem ele
        // o Firefox recusa a operação inteira.
        e.dataTransfer.setData("text/plain", atividade.id);
        e.dataTransfer.effectAllowed = "move";
        aoArrastar(atividade.id);
      }}
      onDragEnd={() => {
        aoArrastar(null);
        aoSoltarNoNada();
      }}
      className={cn(
        "flex cursor-grab flex-col gap-2 rounded-xl border border-border-soft bg-panel p-3 transition-opacity active:cursor-grabbing",
        arrastando && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[10.5px] font-semibold tracking-wide text-faint">
          {formatarDataKicker(atividade.data)}
          {atividade.hora && ` · ${formatarHora(atividade.hora)}`}
        </p>
        <GripVertical className="size-3.5 shrink-0 text-faint" aria-hidden />
      </div>

      <p className="text-[13px] leading-snug font-semibold text-foreground">{atividade.titulo}</p>

      <p className="text-[11.5px] text-muted-foreground">
        {rotuloTipo(atividade.tipo)}
        {funcao && ` · ${funcao.nome}`}
      </p>

      <div className="flex items-center justify-between gap-2">
        {linhaDeApoio}

        {/*
          O mesmo movimento do arrasto, por teclado. `aria-label` nomeia a atividade porque
          num quadro com trinta cartões "Mover" sozinho não diz qual.
        */}
        <span className="relative shrink-0">
          <select
            aria-label={`Mover “${atividade.titulo}” de ${formatarDataKicker(atividade.data)}`}
            value={destinoAtual}
            onChange={(e) => aoMover(e.target.value)}
            // 44px no toque, 32 no desktop: lá o alvo é o ponteiro, aqui é o polegar.
            className="h-11 max-w-[9rem] appearance-none rounded-lg border border-input bg-background pr-6 pl-2 text-[11.5px] text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 lg:h-8"
          >
            {destinos.map((d) => (
              <option key={d.valor} value={d.valor}>
                {d.rotulo}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2 text-faint"
            aria-hidden
          />
        </span>
      </div>
    </article>
  );
}

// ————————————————————————————————————————————————————————————— o quadro

export function QuadroEscala({
  atividades,
  pessoas,
  funcoes,
  agrupamento,
  mensagemVazia,
}: {
  atividades: Atividade[];
  pessoas: Pessoa[];
  funcoes: Funcao[];
  agrupamento: Agrupamento;
  mensagemVazia: string;
}) {
  const [lista, otimista] = useOptimistic(atividades, aplicar);
  const [, iniciar] = useTransition();
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<string | null>(null);

  const funcaoPorId = new Map(funcoes.map((f) => [f.id, f]));
  const pessoaPorId = new Map(pessoas.map((p) => [p.id, p]));

  const nome = (id: string | null) => {
    if (!id) return "Sem responsável";
    const p = pessoaPorId.get(id);
    return p ? nomeCurto(p.nome) : "Fora do departamento";
  };

  // Quem monta as colunas é lib/escala/quadro.ts — o componente só desenha.
  const colunas =
    agrupamento === "pessoa"
      ? colunasPorPessoa(lista, pessoas)
      : colunasPorStatus(lista).map((c) => ({ ...c, titulo: rotuloStatus(c.chave as StatusAtividade) }));

  const maior = maiorColuna(colunas);

  const destinos =
    agrupamento === "pessoa"
      ? [
          { valor: SEM_NINGUEM, rotulo: "Sem responsável" },
          ...pessoas
            .filter((p) => p.status === "ativo")
            .map((p) => ({ valor: p.id, rotulo: p.nome })),
        ]
      : STATUS_ATIVIDADE.map((s) => ({ valor: s, rotulo: rotuloStatus(s) }));

  /**
   * Um caminho só para as duas entradas (arrastar e escolher no select). A atualização
   * otimista faz o cartão mudar de coluna na hora; se o servidor recusar, o `revalidatePath`
   * da action devolve a verdade e o toast explica.
   */
  function mover(atividade: Atividade, destino: string) {
    const movimento = movimentoAoSoltar(atividade, destino, agrupamento);
    if (!movimento) return; // já está lá: arrasto que não sai do lugar não vira troca

    iniciar(async () => {
      otimista({ id: atividade.id, ...movimento } as Mudanca);

      const fd = new FormData();
      fd.set("id", atividade.id);

      if (movimento.campo === "responsavel") {
        fd.set("papel", "responsavel");
        fd.set("pessoaId", movimento.valor ?? "");
        const r = await trocarResponsavel({}, fd);
        if (r.erro) toast.error(r.erro);
        else {
          toast.success(
            movimento.valor ? `Agora é com ${nome(movimento.valor)}.` : "Ficou sem responsável.",
          );
        }
        return;
      }

      fd.set("status", movimento.valor);
      const r = await mudarStatus({}, fd);
      if (r.erro) toast.error(r.erro);
      else toast.success(`Marcada como ${rotuloStatus(movimento.valor).toLowerCase()}.`);
    });
  }

  function soltarEm(chave: string, e: DragEvent<HTMLElement>) {
    e.preventDefault();
    setAlvo(null);
    setArrastando(null);

    const id = e.dataTransfer.getData("text/plain");
    const atividade = lista.find((a) => a.id === id);
    if (atividade) mover(atividade, chave);
  }

  if (atividades.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-panel px-5 py-10 text-center text-[13.5px] text-muted-foreground">
        {mensagemVazia}
      </div>
    );
  }

  return (
    <>
      {/* A instrução tem de ser lida antes do quadro, não descoberta tentando arrastar. */}
      <p className="text-[12px] text-muted-foreground">
        Arraste um cartão para outra coluna, ou use o seletor dentro dele — dá no mesmo, e
        cada troca de responsável fica registrada.
      </p>

      {/*
        Rolagem horizontal DENTRO do quadro, nunca na página: no celular as colunas passam
        de lado, como no Trello, e o resto da tela fica parado.
      */}
      <div className="-mx-5 overflow-x-auto px-5 pb-2 lg:-mx-8 lg:px-8">
        <ul className="flex min-w-max items-start gap-3">
          {colunas.map((coluna) => (
            <li
              key={coluna.chave}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (alvo !== coluna.chave) setAlvo(coluna.chave);
              }}
              onDragLeave={(e) => {
                // Sair para um filho ainda é estar dentro — só o contêiner conta.
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setAlvo(null);
              }}
              onDrop={(e) => soltarEm(coluna.chave, e)}
              className={cn(
                "flex w-[16.5rem] shrink-0 flex-col gap-2.5 rounded-2xl border p-3 transition-colors",
                coluna.tom === "furo"
                  ? "border-warn/40 bg-warn-soft/40"
                  : "border-border bg-background",
                alvo === coluna.chave && "border-primary bg-accent",
              )}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3
                    className={cn(
                      "truncate text-[12.5px] font-bold",
                      coluna.tom === "furo" ? "text-warn" : "text-foreground",
                      coluna.tom === "apagado" && "text-muted-foreground",
                    )}
                  >
                    {coluna.titulo}
                    {coluna.tom === "apagado" && (
                      <span className="font-normal"> (fora do departamento)</span>
                    )}
                  </h3>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {coluna.itens.length}
                  </span>
                </div>

                {/*
                  A barra de carga é o ponto do agrupamento por pessoa: o desequilíbrio se vê
                  sem contar linha. Decorativa — o número ao lado já diz o mesmo.
                */}
                <span className="block h-1 rounded-full bg-border-soft" aria-hidden>
                  <span
                    className={cn(
                      "block h-1 rounded-full",
                      coluna.tom === "furo" ? "bg-warn" : "bg-primary",
                    )}
                    style={{ width: `${(coluna.itens.length / maior) * 100}%` }}
                  />
                </span>
              </div>

              {/*
                A coluna rola por dentro. Sem o teto, uma pessoa com trinta contas estica a
                página e o quadro deixa de ser um lugar de onde se vê o conjunto — que é a
                única razão de ele existir em vez da tabela.
              */}
              <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
                {coluna.itens.map((atividade) => (
                  <li key={atividade.id}>
                    <Cartao
                      atividade={atividade}
                      funcao={
                        atividade.funcaoId ? funcaoPorId.get(atividade.funcaoId) : undefined
                      }
                      linhaDeApoio={
                        agrupamento === "pessoa" ? (
                          <StatusPill status={atividade.status} />
                        ) : (
                          <span
                            className={cn(
                              "truncate text-[11.5px]",
                              atividade.responsavelId
                                ? "text-muted-foreground"
                                : "font-semibold text-warn",
                            )}
                          >
                            {nome(atividade.responsavelId)}
                          </span>
                        )
                      }
                      destinos={destinos}
                      destinoAtual={colunaAtual(atividade, agrupamento)}
                      arrastando={arrastando === atividade.id}
                      aoArrastar={setArrastando}
                      aoSoltarNoNada={() => setAlvo(null)}
                      aoMover={(valor) => mover(atividade, valor)}
                    />
                  </li>
                ))}
              </ul>

              {coluna.itens.length === 0 && (
                <p className="rounded-lg border border-dashed border-border-soft px-3 py-4 text-center text-[11.5px] text-faint">
                  {coluna.tom === "furo" ? "Nenhum furo aqui." : "Solte um cartão aqui."}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
