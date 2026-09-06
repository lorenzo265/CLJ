"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatusReuniao } from "@/components/fio/status-pill";
import { Kicker } from "@/components/fio/tipografia";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { salvarAtividade } from "@/lib/actions/escala";
import { alternarPresenca, salvarReuniao } from "@/lib/actions/reunioes";
import { formatarDataLonga, formatarHora, nomeCurto } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EstadoForm } from "@/lib/actions/auth";
import type { ReuniaoCompleta } from "@/lib/data/reunioes";
import type { Pessoa } from "@/lib/types";

const INICIAL: EstadoForm = {};

/*
  A mesa de trabalho da reunião: o que vai ser conversado, o que ficou decidido, o que
  sobrou pra fazer e quem esteve lá. A lista das reuniões fica na página (são links, e
  link não precisa de JavaScript) — aqui mora só o que é edição.
*/

// Chave estável por linha das listas. Com o índice como key, remover a 2ª de três faria a
// 3ª herdar o foco e a caixa da anterior enquanto o React reconcilia.
let sequencia = 0;
function novaChave(): number {
  sequencia += 1;
  return sequencia;
}

interface LinhaTexto {
  uid: number;
  texto: string;
}

interface LinhaAcao {
  uid: number;
  acao: string;
  responsavelId: string;
  prazo: string;
}

/**
 * Marcar uma reunião é criar uma atividade do tipo — a extensão de pauta/decisões nasce
 * junto, pela própria action. Fica exportado para o botão viver no cabeçalho da página.
 */
export function NovaReuniaoBotao({ className }: { className?: string }) {
  const [aberto, setAberto] = useState(false);
  // Muda a cada abertura e serve de `key`: remontar o formulário é o que zera o erro
  // antigo e os campos preenchidos na tentativa anterior.
  const [n, setN] = useState(0);

  return (
    <>
      <Button
        type="button"
        className={className}
        onClick={() => {
          setN((v) => v + 1);
          setAberto(true);
        }}
      >
        <Plus aria-hidden />
        Nova reunião
      </Button>

      <Dialog disablePointerDismissal open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <FormularioReuniao key={n} aoFechar={() => setAberto(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * A reunião aberta. O cartão é um só, mas são três escritas independentes:
 * os dados (diálogo), a ata (o formulário grande) e a presença (um alternador por pessoa) —
 * formulário não aninha em formulário, e cada uma tem o seu ritmo.
 */
export function EditorReuniao({
  reuniao,
  pessoas,
  realizada,
  className,
}: {
  reuniao: ReuniaoCompleta;
  pessoas: Pessoa[];
  /** Vem calculado do servidor: `reuniaoRealizada` mora em lib/data, que é server-only. */
  realizada: boolean;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [n, setN] = useState(0);
  const { atividade } = reuniao;

  const quando = [formatarDataLonga(atividade.data), formatarHora(atividade.hora)]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={cn("min-w-0 rounded-2xl border border-border bg-panel p-5 sm:p-6", className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-serif text-lg leading-tight font-bold">{atividade.titulo}</h2>
          <p className="mt-1 text-[12.5px] text-muted-foreground">{quando}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <StatusReuniao realizada={realizada} />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setN((v) => v + 1);
              setAberto(true);
            }}
          >
            <Pencil aria-hidden />
            Editar dados
          </Button>
        </div>
      </header>

      <FormularioDaAta reuniao={reuniao} pessoas={pessoas} />

      <Presenca reuniao={reuniao} pessoas={pessoas} realizada={realizada} />

      <Dialog disablePointerDismissal open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <FormularioReuniao
            key={n}
            reuniao={reuniao}
            realizada={realizada}
            aoFechar={() => setAberto(false)}
          />
        </DialogContent>
      </Dialog>
    </article>
  );
}

/**
 * Criar e editar dividem o mesmo formulário: a diferença é o `id` escondido, que é o que
 * a action usa para decidir entre marcar uma reunião nova e mexer numa que já existe.
 */
function FormularioReuniao({
  reuniao,
  realizada = false,
  aoFechar,
}: {
  reuniao?: ReuniaoCompleta;
  realizada?: boolean;
  aoFechar: () => void;
}) {
  const [estado, acao, pendente] = useActionState(salvarAtividade, INICIAL);
  const campo = useId();
  const atividade = reuniao?.atividade;
  const editando = atividade !== undefined;

  // useActionState devolve um objeto novo a cada envio — comparar por identidade fecha o
  // diálogo uma vez só, mesmo com o pai re-renderizando e trocando o `aoFechar`.
  const tratado = useRef<EstadoForm>(INICIAL);
  useEffect(() => {
    if (estado === tratado.current || !estado.ok) return;
    tratado.current = estado;
    toast.success(editando ? "Data e hora atualizadas." : "Reunião marcada.");
    aoFechar();
  }, [estado, editando, aoFechar]);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="tipo" value="reuniao" />

      {atividade ? (
        <>
          <input type="hidden" name="id" value={atividade.id} />
          {/*
            salvarAtividade regrava a atividade inteira: o que não vier no formulário volta
            nulo. Estes campos não se editam aqui, então viajam de ida e volta — mudar o
            horário de uma reunião não pode apagar a função nem quem responde por ela.
          */}
          <input type="hidden" name="funcaoId" value={atividade.funcaoId ?? ""} />
          <input type="hidden" name="responsavelId" value={atividade.responsavelId ?? ""} />
          <input type="hidden" name="suplenteId" value={atividade.suplenteId ?? ""} />
          <input type="hidden" name="linkMidia" value={atividade.linkMidia ?? ""} />
        </>
      ) : (
        <input type="hidden" name="status" value="agendado" />
      )}

      <DialogHeader>
        <DialogTitle>{editando ? "Editar reunião" : "Nova reunião"}</DialogTitle>
        <DialogDescription>
          {editando
            ? "Mudou o dia ou a hora? Quem participa vê a data nova na mesma hora."
            : "Marque o dia e a hora. A pauta você monta em seguida, na própria reunião."}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${campo}-titulo`}>Título</Label>
          <Input
            id={`${campo}-titulo`}
            name="titulo"
            defaultValue={atividade?.titulo ?? ""}
            placeholder="Reunião quinzenal"
            maxLength={160}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${campo}-data`}>Data</Label>
            <Input
              id={`${campo}-data`}
              name="data"
              type="date"
              defaultValue={atividade?.data ?? ""}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${campo}-hora`}>
              Hora
              <span className="text-xs font-normal text-muted-foreground">opcional</span>
            </Label>
            <Input
              id={`${campo}-hora`}
              name="hora"
              type="time"
              defaultValue={atividade?.hora ?? ""}
            />
          </div>
        </div>

        {/* Reunião tem dois estados só. É aqui que ela vira "Realizada" para o departamento. */}
        {editando && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${campo}-status`}>Situação</Label>
            <CampoSelect
              id={`${campo}-status`}
              name="status"
              defaultValue={realizada ? "concluido" : "agendado"}
            >
              <option value="agendado">Agendada</option>
              <option value="concluido">Realizada</option>
            </CampoSelect>
          </div>
        )}
      </div>

      {estado.erro && <Erro>{estado.erro}</Erro>}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={aoFechar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : editando ? "Salvar dados" : "Marcar reunião"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * A ata inteira num envio só: pauta, decisões e follow-up saem juntos porque a action
 * substitui as três listas de uma vez — salvar por bloco daria três oportunidades de
 * gravar meia reunião.
 */
function FormularioDaAta({ reuniao, pessoas }: { reuniao: ReuniaoCompleta; pessoas: Pessoa[] }) {
  const [estado, acao, pendente] = useActionState(salvarReuniao, INICIAL);

  const [pauta, setPauta] = useState<LinhaTexto[]>(() =>
    reuniao.pauta.map((texto) => ({ uid: novaChave(), texto })),
  );
  const [decisoes, setDecisoes] = useState<LinhaTexto[]>(() =>
    reuniao.decisoes.map((texto) => ({ uid: novaChave(), texto })),
  );
  const [followUp, setFollowUp] = useState<LinhaAcao[]>(() =>
    reuniao.followUp.map((item) => ({
      uid: novaChave(),
      acao: item.acao,
      responsavelId: item.responsavelId ?? "",
      prazo: item.prazo,
    })),
  );

  const tratado = useRef<EstadoForm>(INICIAL);
  useEffect(() => {
    if (estado === tratado.current || !estado.ok) return;
    tratado.current = estado;
    toast.success("Ata salva.");
  }, [estado]);

  // Quem já carrega um encaminhamento continua na lista mesmo depois de inativado —
  // senão o <select> cairia na primeira opção e trocaria o responsável sem ninguém pedir.
  const comprometidos = new Set(
    reuniao.followUp.map((i) => i.responsavelId).filter((id): id is string => Boolean(id)),
  );
  const candidatos = pessoas.filter((p) => p.status === "ativo" || comprometidos.has(p.id));

  return (
    <form action={acao} className="mt-6 flex flex-col gap-6">
      <input type="hidden" name="atividadeId" value={reuniao.atividadeId} />

      <section>
        <Kicker className="mb-2.5">Pauta (perguntas)</Kicker>

        {pauta.length === 0 ? (
          <Sereno>Sem perguntas ainda — cada uma aparece numerada para quem participa.</Sereno>
        ) : (
          <ol className="flex flex-col gap-2">
            {pauta.map((linha, i) => (
              <li key={linha.uid} className="flex items-center gap-2.5">
                <span className="w-5 shrink-0 text-right text-[13px] font-bold text-accent-ink tabular-nums">
                  {i + 1}.
                </span>
                <Input
                  name="pauta"
                  aria-label={`Pergunta ${i + 1}`}
                  placeholder="O que precisa ser conversado?"
                  maxLength={300}
                  value={linha.texto}
                  onChange={(e) =>
                    setPauta((atual) =>
                      atual.map((l) => (l.uid === linha.uid ? { ...l, texto: e.target.value } : l)),
                    )
                  }
                />
                <BotaoRemover
                  rotulo={`Remover a pergunta ${i + 1}`}
                  onClick={() => setPauta((atual) => atual.filter((l) => l.uid !== linha.uid))}
                />
              </li>
            ))}
          </ol>
        )}

        <BotaoAdicionar
          onClick={() => setPauta((atual) => [...atual, { uid: novaChave(), texto: "" }])}
        >
          Adicionar pergunta
        </BotaoAdicionar>
      </section>

      <section>
        <Kicker className="mb-2.5">Decisões</Kicker>

        {decisoes.length === 0 ? (
          <Sereno>O que a reunião decidir entra aqui — uma decisão por linha.</Sereno>
        ) : (
          <ul className="flex flex-col gap-2">
            {decisoes.map((linha, i) => (
              <li key={linha.uid} className="flex items-center gap-2.5">
                <span className="w-5 shrink-0 text-right text-[13px] font-bold text-accent-ink">
                  —
                </span>
                <Input
                  name="decisoes"
                  aria-label={`Decisão ${i + 1}`}
                  placeholder="O que ficou decidido"
                  maxLength={300}
                  value={linha.texto}
                  onChange={(e) =>
                    setDecisoes((atual) =>
                      atual.map((l) => (l.uid === linha.uid ? { ...l, texto: e.target.value } : l)),
                    )
                  }
                />
                <BotaoRemover
                  rotulo={`Remover a decisão ${i + 1}`}
                  onClick={() => setDecisoes((atual) => atual.filter((l) => l.uid !== linha.uid))}
                />
              </li>
            ))}
          </ul>
        )}

        <BotaoAdicionar
          onClick={() => setDecisoes((atual) => [...atual, { uid: novaChave(), texto: "" }])}
        >
          Adicionar decisão
        </BotaoAdicionar>
      </section>

      <section>
        <Kicker className="mb-2.5">Follow-up</Kicker>

        {followUp.length === 0 ? (
          <Sereno>Nenhum encaminhamento ainda — ação, quem faz e até quando.</Sereno>
        ) : (
          <>
            {/* Os rótulos das colunas só no desktop: no celular cada linha vira um cartão. */}
            <div className={cn(GRADE_FU, "mb-1.5 hidden sm:grid")} aria-hidden>
              <Kicker>Ação</Kicker>
              <Kicker>Responsável</Kicker>
              <Kicker>Prazo</Kicker>
              <span />
            </div>

            <ul className="flex flex-col gap-2.5 sm:gap-2">
              {followUp.map((linha, i) => (
                <li
                  key={linha.uid}
                  className="rounded-lg border border-border-soft p-2.5 sm:border-0 sm:p-0"
                >
                  <div className={GRADE_FU}>
                    <Input
                      name="fuAcao"
                      aria-label={`Ação ${i + 1}`}
                      placeholder="O que precisa ser feito"
                      maxLength={300}
                      value={linha.acao}
                      onChange={(e) =>
                        setFollowUp((atual) =>
                          atual.map((l) =>
                            l.uid === linha.uid ? { ...l, acao: e.target.value } : l,
                          ),
                        )
                      }
                    />
                    <CampoSelect
                      name="fuResponsavel"
                      aria-label={`Responsável pela ação ${i + 1}`}
                      value={linha.responsavelId}
                      onChange={(e) =>
                        setFollowUp((atual) =>
                          atual.map((l) =>
                            l.uid === linha.uid ? { ...l, responsavelId: e.target.value } : l,
                          ),
                        )
                      }
                    >
                      <option value="">A combinar</option>
                      {candidatos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {nomeCurto(p.nome)}
                        </option>
                      ))}
                    </CampoSelect>
                    <Input
                      name="fuPrazo"
                      type="date"
                      aria-label={`Prazo da ação ${i + 1}`}
                      value={linha.prazo}
                      onChange={(e) =>
                        setFollowUp((atual) =>
                          atual.map((l) =>
                            l.uid === linha.uid ? { ...l, prazo: e.target.value } : l,
                          ),
                        )
                      }
                    />
                    {/*
                      Ação, responsável e prazo viajam como três listas paralelas: a i-ésima
                      ação casa com o i-ésimo responsável. Por isso a linha sai inteira.
                    */}
                    <BotaoRemover
                      rotulo={`Remover o encaminhamento ${i + 1}`}
                      className="justify-self-end"
                      onClick={() =>
                        setFollowUp((atual) => atual.filter((l) => l.uid !== linha.uid))
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <BotaoAdicionar
          onClick={() =>
            setFollowUp((atual) => [
              ...atual,
              { uid: novaChave(), acao: "", responsavelId: "", prazo: "" },
            ])
          }
        >
          Adicionar item
        </BotaoAdicionar>
      </section>

      {estado.erro && <Erro>{estado.erro}</Erro>}

      <div className="flex justify-end border-t border-border-soft pt-4">
        <Button type="submit" disabled={pendente} className="w-full sm:w-auto">
          {pendente ? "Salvando…" : "Salvar ata"}
        </Button>
      </div>
    </form>
  );
}

/** As quatro colunas do follow-up, iguais no cabeçalho e nas linhas. */
const GRADE_FU = "grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_9.5rem_auto] sm:items-center";

/**
 * Presença — fora do formulário da ata de propósito: cada alternador é um envio só seu,
 * e formulário não aninha em formulário.
 */
function Presenca({
  reuniao,
  pessoas,
  realizada,
}: {
  reuniao: ReuniaoCompleta;
  pessoas: Pessoa[];
  realizada: boolean;
}) {
  const presentes = new Set(reuniao.presentes);
  // Quem foi inativado depois da reunião continua na lista se esteve lá: o registro do
  // que aconteceu não some porque a pessoa saiu do departamento.
  const elegiveis = pessoas.filter((p) => p.status === "ativo" || presentes.has(p.id));

  return (
    <section className="mt-7 border-t border-border-soft pt-5">
      <Kicker className="mb-1">Presença</Kicker>
      <p className="mb-3 text-[12.5px] text-muted-foreground">
        {elegiveis.length === 0
          ? "Ninguém ativo no departamento ainda."
          : realizada
            ? `${presentes.size} de ${elegiveis.length} estiveram na reunião.`
            : `${presentes.size} de ${elegiveis.length} confirmaram até agora — você pode marcar por quem avisou fora do app.`}
      </p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {elegiveis.map((pessoa) => (
          <li key={pessoa.id}>
            <AlternadorPresenca
              atividadeId={reuniao.atividadeId}
              pessoa={pessoa}
              presente={presentes.has(pessoa.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * O estado de verdade é o do servidor (`presente`, que volta pela revalidação): o botão
 * não guarda cópia local, então o rótulo nunca diverge do que está gravado.
 */
function AlternadorPresenca({
  atividadeId,
  pessoa,
  presente,
}: {
  atividadeId: string;
  pessoa: Pessoa;
  presente: boolean;
}) {
  const [estado, acao, pendente] = useActionState(alternarPresenca, INICIAL);

  const tratado = useRef<EstadoForm>(INICIAL);
  useEffect(() => {
    if (estado === tratado.current || !estado.ok) return;
    tratado.current = estado;
    toast.success(
      presente
        ? `${nomeCurto(pessoa.nome)} está na presença.`
        : `${nomeCurto(pessoa.nome)} saiu da presença.`,
    );
  }, [estado, presente, pessoa.nome]);

  return (
    <form action={acao}>
      <input type="hidden" name="atividadeId" value={atividadeId} />
      <input type="hidden" name="pessoaId" value={pessoa.id} />
      {/* Alternador: manda sempre o oposto do que está valendo agora. */}
      <input type="hidden" name="presente" value={presente ? "0" : "1"} />

      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-lg border px-3 py-2",
          presente ? "border-accent-soft bg-accent-soft" : "border-border-soft bg-background",
        )}
      >
        <span
          className={cn(
            "min-w-0 truncate text-[13.5px]",
            presente ? "font-semibold text-accent-ink" : "text-foreground",
          )}
        >
          {pessoa.nome}
        </span>
        <Button
          type="submit"
          size="sm"
          variant={presente ? "default" : "outline"}
          disabled={pendente}
          aria-label={
            presente
              ? `Presente ✓ — tirar ${pessoa.nome} da presença`
              : `Marcar presença de ${pessoa.nome}`
          }
          className="min-h-11 shrink-0 lg:min-h-8"
        >
          {pendente ? "…" : presente ? "Presente ✓" : "Marcar"}
        </Button>
      </div>

      {estado.erro && <Erro className="mt-1.5">{estado.erro}</Erro>}
    </form>
  );
}

/**
 * `<select>` nativo, e não o do shadcn, no follow-up: as três listas casam por índice, e o
 * nativo sempre envia um valor — inclusive o vazio — mantendo o alinhamento das linhas.
 */
function CampoSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      data-slot="select-nativo"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-input bg-panel px-2.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 lg:h-9 dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
}

/** O botão pontilhado do canvas: adicionar é convite, não ação principal. */
function BotaoAdicionar({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="mt-2.5 min-h-11 border-dashed text-muted-foreground lg:min-h-8"
    >
      <Plus aria-hidden />
      {children}
    </Button>
  );
}

function BotaoRemover({
  rotulo,
  onClick,
  className,
}: {
  rotulo: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={rotulo}
      onClick={onClick}
      className={cn("shrink-0", className)}
    >
      <Trash2 className="size-4" aria-hidden />
    </Button>
  );
}

function Sereno({ children }: { children: ReactNode }) {
  return <p className="text-[13px] text-muted-foreground">{children}</p>;
}

function Erro({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="alert"
      className={cn("rounded-lg bg-crit-soft px-3 py-2 text-[13px] text-crit", className)}
    >
      {children}
    </p>
  );
}
