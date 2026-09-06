"use client";

import { useActionState, useEffect, useId, useState, type ReactNode } from "react";
import { ChevronDown, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatusPill, rotuloStatus } from "@/components/fio/status-pill";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  excluirAtividade,
  mudarStatus,
  salvarAtividade,
  trocarResponsavel,
} from "@/lib/actions/escala";
import { rotuloTipo } from "@/lib/escala/frase";
import { formatarDataCurta, formatarHora, nomeCurto } from "@/lib/format";
import { STATUS_ATIVIDADE, TIPOS_ATIVIDADE } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { EstadoForm } from "@/lib/actions/auth";
import type { Atividade, Funcao, Pessoa, Troca } from "@/lib/types";

/*
  A escala do lado de quem monta. Duas densidades, uma identidade (decisoes-design.md §7.3):
  tabela no desktop, um cartão por atividade no celular — a mesma informação e a mesma ordem
  nos dois, nunca um recorte menor para quem está no telefone.

  A troca de responsável é a operação que a plataforma existe para tirar da conversa privada,
  então ela não fica escondida num menu: o próprio nome na linha é o botão que abre a troca.
*/

const INICIAL: EstadoForm = {};

type PapelTroca = "responsavel" | "suplente";

type Foco =
  | { modo: "editar"; atividade: Atividade }
  | { modo: "excluir"; atividade: Atividade }
  | { modo: "trocar"; atividade: Atividade; papel: PapelTroca };

const ROTULO_PAPEL: Record<PapelTroca, string> = {
  responsavel: "responsável",
  suplente: "suplente",
};

// ————————————————————————————————————————————————————————————— campos

const SELECT =
  "h-11 w-full appearance-none rounded-lg border border-input bg-panel pr-9 pl-3 text-[14px] " +
  "outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 " +
  "focus-visible:ring-ring/50 lg:h-9 lg:text-[13px]";

/**
 * Select nativo, não o do shadcn: aqui ele vive dentro de um <form> que envia para uma
 * Server Action, e o valor precisa chegar no FormData sem depender de estado em React.
 */
function SelectNativo({
  id,
  name,
  defaultValue,
  value,
  onChange,
  children,
}: {
  id?: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (valor: string) => void;
  children: ReactNode;
}) {
  return (
    <span className="relative block">
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={SELECT}
      >
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

/**
 * Quem foi inativado sai da lista de escolha, mas continua listado enquanto for a pessoa
 * daquela linha — senão salvar sem tocar no campo trocaria o responsável sem ninguém pedir.
 */
function opcoesPessoa(pessoas: Pessoa[], selecionadoId: string | null) {
  return pessoas
    .filter((p) => p.status === "ativo" || p.id === selecionadoId)
    .map((p) => (
      <option key={p.id} value={p.id}>
        {p.nome}
        {p.status === "inativo" ? " (fora do departamento)" : ""}
      </option>
    ));
}

// ————————————————————————————————————————————————————————————— formulários

/** Criar e editar são o mesmo formulário: o que muda é o `id` viajando vazio ou preenchido. */
function FormAtividade({
  atividade,
  pessoas,
  funcoes,
  dataPadrao,
  aoConcluir,
}: {
  atividade?: Atividade;
  pessoas: Pessoa[];
  funcoes: Funcao[];
  dataPadrao: string;
  aoConcluir: () => void;
}) {
  const [estado, acao, pendente] = useActionState(salvarAtividade, INICIAL);
  const id = useId();

  // A action devolve um objeto novo a cada envio, então o toast toca uma vez por salvamento.
  useEffect(() => {
    if (!estado.ok) return;
    toast.success(atividade ? "Atividade atualizada." : "Atividade na escala.");
    aoConcluir();
  }, [estado]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={atividade?.id ?? ""} />

      <Campo label="Título" htmlFor={`${id}-titulo`}>
        <Input
          id={`${id}-titulo`}
          name="titulo"
          defaultValue={atividade?.titulo ?? ""}
          maxLength={160}
          placeholder="Post — Terço Diário"
          required
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Tipo" htmlFor={`${id}-tipo`}>
          <SelectNativo id={`${id}-tipo`} name="tipo" defaultValue={atividade?.tipo ?? "post"}>
            {TIPOS_ATIVIDADE.map((t) => (
              <option key={t} value={t}>
                {rotuloTipo(t)}
              </option>
            ))}
          </SelectNativo>
        </Campo>

        <Campo label="Função" htmlFor={`${id}-funcao`}>
          <SelectNativo
            id={`${id}-funcao`}
            name="funcaoId"
            defaultValue={atividade?.funcaoId ?? ""}
          >
            <option value="">Sem função definida</option>
            {funcoes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </SelectNativo>
        </Campo>

        <Campo label="Data" htmlFor={`${id}-data`}>
          <Input
            id={`${id}-data`}
            name="data"
            type="date"
            defaultValue={atividade?.data ?? dataPadrao}
            required
          />
        </Campo>

        <Campo
          label="Hora"
          htmlFor={`${id}-hora`}
          dica="Opcional — quando existe, entra no aviso de quem responde."
        >
          <Input id={`${id}-hora`} name="hora" type="time" defaultValue={atividade?.hora ?? ""} />
        </Campo>

        <Campo label="Responsável" htmlFor={`${id}-responsavel`}>
          <SelectNativo
            id={`${id}-responsavel`}
            name="responsavelId"
            defaultValue={atividade?.responsavelId ?? ""}
          >
            <option value="">Ainda sem responsável</option>
            {opcoesPessoa(pessoas, atividade?.responsavelId ?? null)}
          </SelectNativo>
        </Campo>

        <Campo label="Suplente" htmlFor={`${id}-suplente`}>
          <SelectNativo
            id={`${id}-suplente`}
            name="suplenteId"
            defaultValue={atividade?.suplenteId ?? ""}
          >
            <option value="">Sem suplente</option>
            {opcoesPessoa(pessoas, atividade?.suplenteId ?? null)}
          </SelectNativo>
        </Campo>

        <Campo label="Status" htmlFor={`${id}-status`}>
          <SelectNativo id={`${id}-status`} name="status" defaultValue={atividade?.status ?? "ideia"}>
            {STATUS_ATIVIDADE.map((s) => (
              <option key={s} value={s}>
                {rotuloStatus(s)}
              </option>
            ))}
          </SelectNativo>
        </Campo>

        <Campo
          label="Link de mídia"
          htmlFor={`${id}-midia`}
          dica="Onde a arte mora — Canva, Drive, a pasta que o departamento já usa."
          className="sm:col-span-2"
        >
          <Input
            id={`${id}-midia`}
            name="linkMidia"
            type="url"
            inputMode="url"
            defaultValue={atividade?.linkMidia ?? ""}
            placeholder="https://"
          />
        </Campo>
      </div>

      <Erro mensagem={estado.erro} />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * O coração da tela. A troca passa por aqui — e não pelo formulário de edição — porque é a
 * única alteração que a plataforma guarda com motivo: quem saiu, quem entrou e por quê.
 */
function FormTroca({
  atividade,
  pessoas,
  papelInicial,
  historico,
  aoConcluir,
}: {
  atividade: Atividade;
  pessoas: Pessoa[];
  papelInicial: PapelTroca;
  /** O que já foi trocado nesta atividade, do mais recente ao mais antigo. */
  historico: Troca[];
  aoConcluir: () => void;
}) {
  const [estado, acao, pendente] = useActionState(trocarResponsavel, INICIAL);
  const [papel, setPapel] = useState<PapelTroca>(papelInicial);
  const id = useId();

  const atualId = papel === "responsavel" ? atividade.responsavelId : atividade.suplenteId;
  const atual = atualId ? pessoas.find((p) => p.id === atualId) : undefined;

  useEffect(() => {
    if (!estado.ok) return;
    toast.success("Troca registrada.");
    aoConcluir();
  }, [estado]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={atividade.id} />

      <Campo label="Papel" htmlFor={`${id}-papel`}>
        <SelectNativo
          id={`${id}-papel`}
          name="papel"
          value={papel}
          onChange={(v) => setPapel(v === "suplente" ? "suplente" : "responsavel")}
        >
          <option value="responsavel">Responsável</option>
          <option value="suplente">Suplente</option>
        </SelectNativo>
      </Campo>

      <Campo
        label="Quem assume"
        htmlFor={`${id}-pessoa`}
        dica={
          atual
            ? `Hoje quem responde é ${nomeCurto(atual.nome)}`
            : `Ninguém está como ${ROTULO_PAPEL[papel]} nesta atividade.`
        }
      >
        {/* `key` no papel: trocar de papel recarrega o campo com quem está lá hoje. */}
        <SelectNativo key={papel} id={`${id}-pessoa`} name="pessoaId" defaultValue={atualId ?? ""}>
          <option value="">Deixar sem ninguém por enquanto</option>
          {opcoesPessoa(pessoas, atualId)}
        </SelectNativo>
      </Campo>

      <Campo
        label="Motivo (opcional)"
        htmlFor={`${id}-motivo`}
        dica="Fica registrado na plataforma — ninguém precisa lembrar de contar depois."
      >
        <Input
          id={`${id}-motivo`}
          name="motivo"
          maxLength={200}
          placeholder="Viagem, prova, imprevisto…"
        />
      </Campo>

      <Erro mensagem={estado.erro} />

      <Historico trocas={historico} pessoas={pessoas} />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
        <Button type="submit" disabled={pendente}>
          {pendente ? "Trocando…" : "Confirmar troca"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * O registro que a plataforma existe para guardar (decisoes-estrutura.md §5): sem isto, a
 * troca fica gravada num banco que ninguém abre, e a memória volta pra conversa privada.
 */
function Historico({ trocas, pessoas }: { trocas: Troca[]; pessoas: Pessoa[] }) {
  if (trocas.length === 0) return null;

  const nome = (id: string | null) => {
    if (!id) return "ninguém";
    const p = pessoas.find((x) => x.id === id);
    return p ? nomeCurto(p.nome) : "alguém que saiu";
  };

  return (
    <div className="rounded-lg border border-border-soft bg-background p-3">
      <p className="kicker mb-2">O que já mudou aqui</p>
      <ul className="flex flex-col gap-1.5">
        {trocas.map((t) => (
          <li key={t.id} className="text-[12.5px] leading-snug text-muted-foreground">
            <span className="font-semibold text-foreground">
              {ROTULO_PAPEL[t.papel]}: {nome(t.dePessoaId)} → {nome(t.paraPessoaId)}
            </span>{" "}
            · <span className="font-mono">{formatarDataCurta(t.criadoEm.slice(0, 10))}</span>
            {t.motivo && <> · “{t.motivo}”</>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormExcluir({
  atividade,
  aoConcluir,
}: {
  atividade: Atividade;
  aoConcluir: () => void;
}) {
  const [estado, acao, pendente] = useActionState(excluirAtividade, INICIAL);

  useEffect(() => {
    if (!estado.ok) return;
    toast.success("Atividade excluída.");
    aoConcluir();
  }, [estado]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={atividade.id} />
      <p className="text-[13.5px] text-muted-foreground">
        Ela sai da escala de todo mundo, junto com o histórico de troca dela. Não dá para
        desfazer.
      </p>
      <Erro mensagem={estado.erro} />
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Manter</DialogClose>
        <Button type="submit" variant="destructive" disabled={pendente}>
          {pendente ? "Excluindo…" : "Excluir"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ————————————————————————————————————————————————————————————— peças da linha

/**
 * Status é cor + palavra (decisoes-design.md §3) — e aqui também é o botão que muda.
 * O popover abre num portal, fora do <form> no DOM: os botões se ligam ao formulário pelo
 * atributo `form`, que é o que faz o envio e o `name`/`value` do botão chegarem na action.
 */
function StatusRapido({ atividade }: { atividade: Atividade }) {
  const [estado, acao, pendente] = useActionState(mudarStatus, INICIAL);
  const [aberto, setAberto] = useState(false);
  const formId = useId();

  useEffect(() => {
    if (estado.ok) toast.success("Status atualizado.");
  }, [estado]);

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <form id={formId} action={acao} hidden>
        <input type="hidden" name="id" value={atividade.id} />
      </form>

      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label={`Status: ${rotuloStatus(atividade.status)}. Mudar status`}
              className="inline-flex min-h-11 items-center gap-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:min-h-0"
            />
          }
        >
          <StatusPill status={atividade.status} />
          <ChevronDown className="size-3 text-faint" aria-hidden />
        </PopoverTrigger>

        <PopoverContent className="w-52 gap-0.5 p-1.5">
          <span className="kicker px-1.5 pb-1">Mudar status</span>
          {STATUS_ATIVIDADE.map((s) => (
            <button
              key={s}
              type="submit"
              form={formId}
              name="status"
              value={s}
              disabled={pendente}
              onClick={(e) => {
                // Envia antes de fechar: o popover some do DOM no mesmo clique, e o botão
                // precisa existir na hora do envio para ser o `submitter` (o name/value).
                e.preventDefault();
                e.currentTarget.form?.requestSubmit(e.currentTarget);
                setAberto(false);
              }}
              className="flex min-h-11 items-center gap-2 rounded-md px-1.5 text-left transition-colors hover:bg-accent disabled:opacity-50 lg:min-h-9"
            >
              <StatusPill status={s} />
              {s === atividade.status && (
                <span className="text-[11px] text-muted-foreground">atual</span>
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <Erro mensagem={estado.erro} />
    </div>
  );
}

/** O nome na linha é o botão da troca. Vazio nunca fica em branco: fica "Definir". */
function BotaoElenco({
  pessoa,
  papel,
  titulo,
  aoClicar,
}: {
  pessoa?: Pessoa;
  papel: PapelTroca;
  titulo: string;
  aoClicar: () => void;
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-label={`${pessoa ? "Trocar" : "Definir"} ${ROTULO_PAPEL[papel]} de ${titulo}`}
      className={cn(
        "inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-md border border-border bg-panel px-2 py-1 text-[12.5px] transition-colors outline-none hover:border-accent-hi/60 hover:text-accent-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:min-h-8",
        !pessoa && "text-faint",
      )}
    >
      <span className="truncate">{pessoa ? nomeCurto(pessoa.nome) : "Definir"}</span>
      <ChevronDown className="size-3 shrink-0 text-faint" aria-hidden />
    </button>
  );
}

/** O endereço inteiro não cabe na linha e não diz nada a mais que o domínio. */
function rotuloMidia(link: string): string {
  try {
    const u = new URL(link);
    const host = u.hostname.replace(/^www\./, "");
    return u.pathname.length > 1 ? `${host}/…` : host;
  } catch {
    return link;
  }
}

function LinkMidia({ link }: { link: string | null }) {
  if (!link) return <span className="text-faint">—</span>;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-[150px] items-center gap-1 text-[12.5px] text-accent-ink underline underline-offset-2 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="truncate">{rotuloMidia(link)}</span>
      <ExternalLink className="size-3 shrink-0" aria-hidden />
      <span className="sr-only">(abre em outra aba)</span>
    </a>
  );
}

function SeloTipo({ tipo }: { tipo: Atividade["tipo"] }) {
  return (
    <span className="shrink-0 rounded bg-border-soft px-1.5 py-px text-[10px] font-bold tracking-wide text-faint uppercase">
      {rotuloTipo(tipo)}
    </span>
  );
}

function AcoesLinha({
  titulo,
  aoEditar,
  aoExcluir,
  compacto = false,
}: {
  titulo: string;
  aoEditar: () => void;
  aoExcluir: () => void;
  compacto?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {/* Sem `compacto` estamos no celular: o alvo tem que continuar com 44px de altura. */}
      <Button
        type="button"
        variant="outline"
        size={compacto ? "icon-sm" : "default"}
        onClick={aoEditar}
        aria-label={compacto ? `Editar ${titulo}` : undefined}
      >
        <Pencil aria-hidden />
        {!compacto && "Editar"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size={compacto ? "icon-sm" : "default"}
        onClick={aoExcluir}
        aria-label={compacto ? `Excluir ${titulo}` : undefined}
        className="text-muted-foreground hover:text-crit"
      >
        <Trash2 aria-hidden />
        {!compacto && "Excluir"}
      </Button>
    </div>
  );
}

// ————————————————————————————————————————————————————————————— a tela

const TH =
  "border-b border-border px-3 pb-2.5 text-left font-mono text-[10px] font-semibold tracking-wider text-faint uppercase";
const TD = "border-b border-border-soft px-3 py-2.5 align-middle";

/** O botão do cabeçalho. Vive fora da tabela: criar não depende de nenhuma linha. */
export function NovaAtividadeBotao({
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
      <Button type="button" onClick={() => setAberto(true)}>
        <Plus aria-hidden />
        Nova atividade
      </Button>

      <Dialog disablePointerDismissal open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova atividade</DialogTitle>
            <DialogDescription>
              Ela entra na escala de todo mundo assim que você salvar.
            </DialogDescription>
          </DialogHeader>
          <FormAtividade
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

export function AtividadesManager({
  atividades,
  pessoas,
  funcoes,
  trocas,
  dataPadrao,
  mensagemVazia,
}: {
  atividades: Atividade[];
  pessoas: Pessoa[];
  funcoes: Funcao[];
  /** Histórico por atividade — o que já foi trocado, para o diálogo de troca mostrar. */
  trocas: Record<string, Troca[]>;
  /** "Hoje" calculado no servidor: o fuso de quem lê não decide a data sugerida. */
  dataPadrao: string;
  /** A frase do vazio muda com o filtro, então quem filtra é quem a escreve. */
  mensagemVazia: string;
}) {
  const [foco, setFoco] = useState<Foco | null>(null);

  const pessoaPorId = new Map(pessoas.map((p) => [p.id, p]));
  const funcaoPorId = new Map(funcoes.map((f) => [f.id, f]));
  const fechar = () => setFoco(null);

  const linhas = atividades.map((atividade) => ({
    atividade,
    funcao: atividade.funcaoId ? funcaoPorId.get(atividade.funcaoId) : undefined,
    responsavel: atividade.responsavelId ? pessoaPorId.get(atividade.responsavelId) : undefined,
    suplente: atividade.suplenteId ? pessoaPorId.get(atividade.suplenteId) : undefined,
  }));

  if (atividades.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-panel">
        <Vazio>{mensagemVazia}</Vazio>
      </div>
    );
  }

  return (
    <>
      {/* Celular: um cartão por atividade, com a mesma informação da tabela empilhada. */}
      <div className="flex flex-col gap-3 lg:hidden">
        {linhas.map(({ atividade, funcao, responsavel, suplente }) => (
          <article
            key={atividade.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-panel p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-semibold tracking-wide text-faint uppercase">
                  {formatarDataCurta(atividade.data)}
                  {atividade.hora && ` · ${formatarHora(atividade.hora)}`}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-[14.5px] font-bold">
                  {atividade.titulo}
                  <SeloTipo tipo={atividade.tipo} />
                </p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  {funcao ? funcao.nome : "Sem função definida"}
                </p>
              </div>
              <StatusRapido atividade={atividade} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="kicker">Responsável</span>
                <BotaoElenco
                  pessoa={responsavel}
                  papel="responsavel"
                  titulo={atividade.titulo}
                  aoClicar={() => setFoco({ modo: "trocar", atividade, papel: "responsavel" })}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="kicker">Suplente</span>
                <BotaoElenco
                  pessoa={suplente}
                  papel="suplente"
                  titulo={atividade.titulo}
                  aoClicar={() => setFoco({ modo: "trocar", atividade, papel: "suplente" })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border-soft pt-3">
              <LinkMidia link={atividade.linkMidia} />
              <AcoesLinha
                titulo={atividade.titulo}
                aoEditar={() => setFoco({ modo: "editar", atividade })}
                aoExcluir={() => setFoco({ modo: "excluir", atividade })}
              />
            </div>
          </article>
        ))}
      </div>

      {/* Desktop: a versão densa. A tabela rola dentro do próprio painel, nunca a página. */}
      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-panel lg:block">
        <table className="w-full border-collapse text-[13px]">
          <caption className="sr-only">
            Atividades da escala com responsável, suplente, mídia e status
          </caption>
          <thead>
            <tr>
              <th scope="col" className={cn(TH, "pt-3.5 pl-4")}>
                Data
              </th>
              <th scope="col" className={cn(TH, "pt-3.5")}>
                Atividade
              </th>
              <th scope="col" className={cn(TH, "pt-3.5")}>
                Função
              </th>
              <th scope="col" className={cn(TH, "pt-3.5")}>
                Responsável
              </th>
              <th scope="col" className={cn(TH, "pt-3.5")}>
                Suplente
              </th>
              <th scope="col" className={cn(TH, "pt-3.5")}>
                Mídia
              </th>
              <th scope="col" className={cn(TH, "pt-3.5")}>
                Status
              </th>
              <th scope="col" className={cn(TH, "pt-3.5 pr-4 text-right")}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child_td]:border-b-0">
            {linhas.map(({ atividade, funcao, responsavel, suplente }) => (
              <tr key={atividade.id} className="transition-colors hover:bg-muted/40">
                <td className={cn(TD, "pl-4 font-mono text-[12.5px] font-medium whitespace-nowrap")}>
                  {formatarDataCurta(atividade.data)}
                  {atividade.hora && (
                    <span className="block text-[11px] text-faint">
                      {formatarHora(atividade.hora)}
                    </span>
                  )}
                </td>
                <td className={TD}>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{atividade.titulo}</span>
                    <SeloTipo tipo={atividade.tipo} />
                  </span>
                </td>
                <td className={cn(TD, "text-muted-foreground")}>
                  {funcao ? funcao.nome : <span className="text-faint">—</span>}
                </td>
                <td className={TD}>
                  <BotaoElenco
                    pessoa={responsavel}
                    papel="responsavel"
                    titulo={atividade.titulo}
                    aoClicar={() => setFoco({ modo: "trocar", atividade, papel: "responsavel" })}
                  />
                </td>
                <td className={TD}>
                  <BotaoElenco
                    pessoa={suplente}
                    papel="suplente"
                    titulo={atividade.titulo}
                    aoClicar={() => setFoco({ modo: "trocar", atividade, papel: "suplente" })}
                  />
                </td>
                <td className={TD}>
                  <LinkMidia link={atividade.linkMidia} />
                </td>
                <td className={TD}>
                  <StatusRapido atividade={atividade} />
                </td>
                <td className={cn(TD, "pr-4")}>
                  <div className="flex justify-end">
                    <AcoesLinha
                      titulo={atividade.titulo}
                      aoEditar={() => setFoco({ modo: "editar", atividade })}
                      aoExcluir={() => setFoco({ modo: "excluir", atividade })}
                      compacto
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*
        Um diálogo de cada tipo para a tela inteira, guiado pelo foco — e não um por linha.
        O `key` na atividade zera o formulário quando o foco muda de uma linha para outra.
      */}
      <Dialog disablePointerDismissal open={foco?.modo === "editar"} onOpenChange={(aberto) => !aberto && fechar()}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          {foco?.modo === "editar" && (
            <>
              <DialogHeader>
                <DialogTitle>Editar atividade</DialogTitle>
                <DialogDescription>
                  O que você mudar aqui vale para a escala de todo mundo.
                </DialogDescription>
              </DialogHeader>
              <FormAtividade
                key={foco.atividade.id}
                atividade={foco.atividade}
                pessoas={pessoas}
                funcoes={funcoes}
                dataPadrao={dataPadrao}
                aoConcluir={fechar}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog disablePointerDismissal open={foco?.modo === "trocar"} onOpenChange={(aberto) => !aberto && fechar()}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
          {foco?.modo === "trocar" && (
            <>
              <DialogHeader>
                <DialogTitle>Trocar {ROTULO_PAPEL[foco.papel].toLowerCase()}</DialogTitle>
                <DialogDescription>
                  {rotuloTipo(foco.atividade.tipo)} — {foco.atividade.titulo} ·{" "}
                  {formatarDataCurta(foco.atividade.data)}
                </DialogDescription>
              </DialogHeader>
              <FormTroca
                key={`${foco.atividade.id}-${foco.papel}`}
                historico={trocas[foco.atividade.id] ?? []}
                atividade={foco.atividade}
                pessoas={pessoas}
                papelInicial={foco.papel}
                aoConcluir={fechar}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog disablePointerDismissal open={foco?.modo === "excluir"} onOpenChange={(aberto) => !aberto && fechar()}>
        <DialogContent className="sm:max-w-md">
          {foco?.modo === "excluir" && (
            <>
              <DialogHeader>
                <DialogTitle>Excluir {foco.atividade.titulo}?</DialogTitle>
                <DialogDescription>
                  {rotuloTipo(foco.atividade.tipo)} de {formatarDataCurta(foco.atividade.data)}.
                </DialogDescription>
              </DialogHeader>
              <FormExcluir key={foco.atividade.id} atividade={foco.atividade} aoConcluir={fechar} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
