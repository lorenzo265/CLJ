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
import { ChevronDown, Copy, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Vazio } from "@/components/fio/tipografia";
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
import { Separator } from "@/components/ui/separator";
import {
  alternarStatusPessoa,
  cancelarConvite,
  convidarParticipante,
  mudarPapel,
  salvarFuncoesDaPessoa,
  type EstadoConvite,
} from "@/lib/actions/participantes";
import { formatarDataCurta, nomeCurto } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EstadoForm } from "@/lib/actions/auth";
import type { Convite, Funcao, PapelSistema, Pessoa } from "@/lib/types";

const INICIAL: EstadoForm = {};
const INICIAL_CONVITE: EstadoConvite = {};

/** A pessoa com as funções já resolvidas em nome — a tela nunca mostra id. */
export interface PessoaNaGestao extends Pessoa {
  funcoes: { id: string; nome: string }[];
}

/* ------------------------------------------------------------------ peças */

/** O erro que a action devolveu. Nunca é engolido: recusa sem explicação vira mistério. */
function Erro({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg bg-crit-soft px-3 py-2 text-[13px] text-crit">
      {children}
    </p>
  );
}

/**
 * Situação — cor + palavra, sempre (decisoes-design.md §3).
 * "Convite pendente" não é falha: é alguém chamado que ainda não definiu a senha.
 */
function Situacao({ pessoa }: { pessoa: Pessoa }) {
  const { rotulo, classe } =
    pessoa.status === "inativo"
      ? { rotulo: "Inativo", classe: "bg-border-soft text-muted-foreground" }
      : pessoa.temSenha
        ? { rotulo: "Ativo", classe: "bg-ok-soft text-ok" }
        : { rotulo: "Convite pendente", classe: "bg-info-soft text-info" };

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-[3px] text-[11px] font-bold",
        classe,
      )}
    >
      {rotulo}
    </span>
  );
}

function Chips({ pessoa }: { pessoa: PessoaNaGestao }) {
  if (pessoa.funcoes.length === 0) {
    return <span className="text-[12.5px] text-faint">Sem função ainda</span>;
  }
  return (
    <span className="flex flex-wrap gap-1.5">
      {pessoa.funcoes.map((f) => (
        <span
          key={f.id}
          className={cn(
            "rounded-full px-2.5 py-[3px] text-[11px] font-semibold",
            // Inativa: a função continua registrada, mas não pesa mais na leitura da lista.
            pessoa.status === "inativo"
              ? "bg-border-soft text-muted-foreground"
              : "bg-accent-soft text-accent-ink",
          )}
        >
          {f.nome}
        </span>
      ))}
    </span>
  );
}

/** Marca discreta de quem também coordena — a coluna de papel não vale uma coluna inteira. */
function SeloCoordenacao() {
  return <span className="kicker text-accent-ink">Coordenação</span>;
}

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "px-3.5 pt-3.5 pb-2.5 text-[10.5px] font-bold tracking-[0.06em] text-faint uppercase",
        className,
      )}
    >
      {children}
    </th>
  );
}

/*
  Select nativo, como no resto da gestão: o valor precisa chegar no FormData da Server Action
  sem depender de estado em React.
*/
function SelectPapel({
  id,
  defaultValue,
  value,
  onChange,
}: {
  id: string;
  defaultValue?: Pessoa["papelSistema"];
  value?: Pessoa["papelSistema"];
  onChange?: ComponentProps<"select">["onChange"];
}) {
  return (
    <span className="relative block">
      <select
        id={id}
        name="papel"
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        className="h-11 w-full appearance-none rounded-lg border border-input bg-panel pr-9 pl-3 text-[14px] outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 lg:h-9 lg:text-[13px]"
      >
        <option value="participante">Participante</option>
        <option value="coordenador">Coordenação</option>
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-faint"
        aria-hidden
      />
    </span>
  );
}

/* ------------------------------------------------------------------ tela */

/**
 * Quem faz parte do departamento: convidar, acompanhar convite em aberto e cuidar de cada
 * cadastro. Nada aqui guarda cópia dos dados — a lista vem do servidor a cada revalidação,
 * e o estado local só decide qual diálogo está aberto.
 */
export function ParticipantesManager({
  pessoas,
  catalogo,
  convites,
  euId,
}: {
  pessoas: PessoaNaGestao[];
  catalogo: Funcao[];
  convites: Convite[];
  /** Quem está logado: as recusas do servidor ficam previsíveis quando a tela avisa antes. */
  euId: string;
}) {
  /*
    Guardamos o id, não a pessoa: depois de salvar, o servidor revalida e manda uma lista nova,
    e o diálogo aberto precisa mostrar o estado novo em vez de um retrato do que era antes.
    `alvoId` não é limpo ao fechar — senão o conteúdo some durante a animação de saída.
  */
  const [alvoId, setAlvoId] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);
  const alvo = pessoas.find((p) => p.id === alvoId) ?? null;

  function gerenciar(pessoa: PessoaNaGestao) {
    setAlvoId(pessoa.id);
    setAberto(true);
  }

  const ativas = pessoas.filter((p) => p.status === "ativo").length;

  return (
    <div className="flex flex-col gap-6">
      <Convidar />

      {convites.length > 0 && (
        <section>
          <h2 className="kicker mb-2.5">Convites em aberto</h2>
          <ul className="flex flex-col gap-2">
            {convites.map((c) => (
              <LinhaConvite key={c.token} convite={c} />
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-2.5 flex items-baseline justify-between gap-3">
          <h2 className="kicker">No departamento</h2>
          <p className="text-[12.5px] text-muted-foreground">
            {pessoas.length === 1 ? "1 pessoa" : `${pessoas.length} pessoas`} · {ativas} ativa
            {ativas === 1 ? "" : "s"}
          </p>
        </div>

        {pessoas.length === 0 ? (
          <div className="rounded-xl border border-border bg-panel">
            <Vazio>Ninguém por aqui ainda — o primeiro convite começa o departamento.</Vazio>
          </div>
        ) : (
          <>
            {/* Desktop: a tabela do canvas. Larga, então rola sozinha em vez de espremer a página. */}
            <div className="hidden overflow-x-auto rounded-xl border border-border bg-panel lg:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border">
                    <Th className="pl-4">Nome</Th>
                    <Th>Contato</Th>
                    <Th>Função(ões)</Th>
                    <Th>Situação</Th>
                    <Th className="pr-4 text-right">Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {pessoas.map((p) => {
                    const inativa = p.status === "inativo";
                    return (
                      <tr key={p.id} className="border-b border-border-soft last:border-0">
                        <td className="py-3.5 pr-3.5 pl-4 align-middle">
                          <span
                            className={cn(
                              "text-[13.5px] font-bold",
                              inativa && "font-semibold text-faint",
                            )}
                          >
                            {p.nome}
                          </span>
                          {p.papelSistema === "coordenador" && (
                            <span className="mt-0.5 block">
                              <SeloCoordenacao />
                            </span>
                          )}
                        </td>
                        <td
                          className={cn(
                            "p-3.5 align-middle text-[13.5px]",
                            inativa ? "text-faint" : "text-muted-foreground",
                          )}
                        >
                          {p.contato || <span className="text-faint">—</span>}
                        </td>
                        <td className="p-3.5 align-middle">
                          <Chips pessoa={p} />
                        </td>
                        <td className="p-3.5 align-middle">
                          <Situacao pessoa={p} />
                        </td>
                        <td className="py-3.5 pr-4 pl-3.5 text-right align-middle">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label={`Gerenciar ${p.nome}`}
                            onClick={() => gerenciar(p)}
                          >
                            <Pencil className="size-3.5" aria-hidden />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Celular: a mesma informação em cartões, com os alvos de toque inteiros. */}
            <ul className="flex flex-col gap-3 lg:hidden">
              {pessoas.map((p) => (
                <li key={p.id} className="rounded-xl border border-border bg-panel p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3
                        className={cn(
                          "text-[15px] leading-snug font-bold",
                          p.status === "inativo" && "font-semibold text-faint",
                        )}
                      >
                        {p.nome}
                      </h3>
                      {p.papelSistema === "coordenador" && (
                        <span className="mt-0.5 block">
                          <SeloCoordenacao />
                        </span>
                      )}
                    </div>
                    <Situacao pessoa={p} />
                  </div>

                  {p.contato && (
                    <p className="mt-1 text-[13px] text-muted-foreground">{p.contato}</p>
                  )}

                  <div className="mt-2.5">
                    <Chips pessoa={p} />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3.5 w-full"
                    onClick={() => gerenciar(p)}
                  >
                    <Pencil aria-hidden />
                    Gerenciar
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <Dialog disablePointerDismissal open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
          {alvo && (
            <GerenciarPessoa
              key={alvo.id}
              pessoa={alvo}
              catalogo={catalogo}
              souEu={alvo.id === euId}
              aoFechar={() => setAberto(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------- convidar */

/**
 * O convite não sai por e-mail (sdd-implementacao.md §6): a coordenação cria o link e manda
 * pelo canal que já usa com a pessoa. Por isso o link fica à vista, pronto para copiar.
 */
function Convidar() {
  const [estado, acao, pendente] = useActionState(convidarParticipante, INICIAL_CONVITE);
  const campo = useId();
  const formRef = useRef<HTMLFormElement>(null);

  /*
    O link precisa sair daqui completo, para colar no WhatsApp. A origem vem do navegador
    e é lida no render, não num efeito: o bloco do link só existe depois de um envio, ou
    seja, sempre no cliente — na renderização do servidor não há nada para descasar.
  */
  const origem = typeof window === "undefined" ? "" : window.location.origin;

  // useActionState devolve um objeto novo a cada envio — comparar por identidade toca o
  // toast e limpa os campos uma vez por convite, mesmo com o pai re-renderizando.
  const tratado = useRef<EstadoConvite>(INICIAL_CONVITE);
  useEffect(() => {
    if (estado === tratado.current || !estado.ok) return;
    tratado.current = estado;
    toast.success("Convite criado. Agora é só mandar o link.");
    formRef.current?.reset();
  }, [estado]);

  const link = estado.link ? `${origem}${estado.link}` : "";

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não deu para copiar. Selecione o link e copie à mão.");
    }
  }

  return (
    <section className="rounded-xl border border-border bg-panel p-4 lg:p-5">
      <h2 className="text-[14.5px] font-bold">Convidar participante</h2>
      <p className="mt-1 text-[12.5px] text-muted-foreground">
        O app não manda e-mail: você cria o convite aqui e manda o link pelo canal que já usa
        com a pessoa.
      </p>

      <form ref={formRef} action={acao} className="mt-4 flex flex-col gap-3">
        <div className="grid gap-3 lg:grid-cols-[2fr_1.4fr_1fr]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${campo}-email`}>E-mail</Label>
            <Input
              id={`${campo}-email`}
              name="email"
              type="email"
              autoComplete="off"
              placeholder="nome@email.com"
              maxLength={254}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${campo}-nome`}>
              Nome
              <span className="text-xs font-normal text-muted-foreground">opcional</span>
            </Label>
            <Input
              id={`${campo}-nome`}
              name="nome"
              autoComplete="off"
              placeholder="Como a pessoa é chamada"
              maxLength={120}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${campo}-papel`}>Entra como</Label>
            <SelectPapel id={`${campo}-papel`} defaultValue="participante" />
          </div>
        </div>

        {estado.erro && <Erro>{estado.erro}</Erro>}

        <div className="flex justify-end">
          <Button type="submit" disabled={pendente} className="max-lg:w-full">
            <Plus aria-hidden />
            {pendente ? "Criando…" : "Criar convite"}
          </Button>
        </div>
      </form>

      {estado.link && (
        <div className="mt-4 rounded-lg bg-accent-soft p-3.5">
          <p className="text-[12.5px] font-semibold text-accent-ink">
            Link do convite — mande para a pessoa
          </p>
          {/* A validade não se repete aqui: ela aparece na lista de convites em aberto. */}
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              readOnly
              value={link}
              aria-label="Link do convite"
              // Selecionar ao focar é a saída à mão quando a área de transferência é negada.
              onFocus={(e) => e.currentTarget.select()}
              className="border-transparent font-mono text-[12.5px]"
            />
            <Button type="button" variant="outline" onClick={copiar} className="shrink-0">
              <Copy aria-hidden />
              Copiar link
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

/** Convite em aberto: quem foi chamado, até quando vale e a saída para desfazer. */
function LinhaConvite({ convite }: { convite: Convite }) {
  const [estado, acao, pendente] = useActionState(cancelarConvite, INICIAL);
  const [confirmando, setConfirmando] = useState(false);

  const tratado = useRef<EstadoForm>(INICIAL);
  useEffect(() => {
    if (estado === tratado.current || !estado.ok) return;
    tratado.current = estado;
    toast.success("Convite cancelado.");
  }, [estado]);

  return (
    <li className="rounded-xl border border-border bg-panel p-3.5">
      <form action={acao} className="flex flex-col gap-3">
        <input type="hidden" name="token" value={convite.token} />

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold">{convite.email}</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {convite.papelSistema === "coordenador" ? "Entra na coordenação · " : ""}
              <span className="font-mono">vence {formatarDataCurta(convite.expiraEm)}</span>
            </p>
          </div>

          {/* Cancelar confirma antes: o link já pode estar no WhatsApp de alguém. */}
          {confirmando ? (
            <span className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" onClick={() => setConfirmando(false)}>
                Manter
              </Button>
              <Button type="submit" variant="destructive" disabled={pendente}>
                {pendente ? "Cancelando…" : "Confirmar"}
              </Button>
            </span>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setConfirmando(true)}
            >
              Cancelar convite
            </Button>
          )}
        </div>

        {confirmando && (
          <p className="text-[12.5px] text-muted-foreground">
            O link para de funcionar na hora. Se a pessoa ainda vai entrar, é só criar outro
            convite.
          </p>
        )}

        {estado.erro && <Erro>{estado.erro}</Erro>}
      </form>
    </li>
  );
}

/* ------------------------------------------------------------- uma pessoa */

/**
 * Tudo o que a coordenação faz com uma pessoa, num lugar só. São três Server Actions
 * independentes, então são três formulários irmãos — cada um com o seu próprio recado
 * quando o servidor recusa (inativar a si mesmo, rebaixar a última coordenação).
 */
function GerenciarPessoa({
  pessoa,
  catalogo,
  souEu,
  aoFechar,
}: {
  pessoa: PessoaNaGestao;
  catalogo: Funcao[];
  souEu: boolean;
  aoFechar: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{pessoa.nome}</DialogTitle>
        <DialogDescription>
          {pessoa.email}
          {pessoa.contato ? ` · ${pessoa.contato}` : ""}
        </DialogDescription>
      </DialogHeader>

      {!pessoa.temSenha && (
        <p className="rounded-lg bg-info-soft px-3 py-2 text-[12.5px] text-info">
          Convite ainda não usado — {nomeCurto(pessoa.nome)} entra assim que definir a senha
          pelo link.
        </p>
      )}

      <FormFuncoes pessoa={pessoa} catalogo={catalogo} />
      <Separator />
      <FormPapel pessoa={pessoa} souEu={souEu} />
      <Separator />
      <FormStatus pessoa={pessoa} souEu={souEu} />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={aoFechar}>
          Fechar
        </Button>
      </DialogFooter>
    </div>
  );
}

function FormFuncoes({ pessoa, catalogo }: { pessoa: PessoaNaGestao; catalogo: Funcao[] }) {
  const [estado, acao, pendente] = useActionState(salvarFuncoesDaPessoa, INICIAL);
  const marcadas = new Set(pessoa.funcoes.map((f) => f.id));

  const tratado = useRef<EstadoForm>(INICIAL);
  useEffect(() => {
    if (estado === tratado.current || !estado.ok) return;
    tratado.current = estado;
    toast.success("Funções salvas.");
  }, [estado]);

  return (
    <form action={acao} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={pessoa.id} />

      <fieldset>
        <legend className="mb-2 text-sm leading-none font-medium">Funções</legend>
        {catalogo.length === 0 ? (
          <Vazio>Nenhuma função no catálogo ainda.</Vazio>
        ) : (
          <div className="flex flex-wrap gap-2">
            {catalogo.map((f) => (
              <ChipFuncao key={f.id} funcao={f} marcada={marcadas.has(f.id)} />
            ))}
          </div>
        )}
      </fieldset>

      {estado.erro && <Erro>{estado.erro}</Erro>}

      {catalogo.length > 0 && (
        <div className="flex justify-end">
          <Button type="submit" variant="outline" disabled={pendente}>
            {pendente ? "Salvando…" : "Salvar funções"}
          </Button>
        </div>
      )}
    </form>
  );
}

/**
 * Chip de seleção múltipla: um <label> com o checkbox escondido atrás de `sr-only peer`.
 * O estado ligado sai do próprio `:checked` — funciona no teclado e não precisa de useState
 * espelhando o que o formulário já sabe.
 */
function ChipFuncao({ funcao, marcada }: { funcao: Funcao; marcada: boolean }) {
  return (
    <label className="inline-flex">
      <input
        type="checkbox"
        name="funcoes"
        value={funcao.id}
        defaultChecked={marcada}
        className="peer sr-only"
      />
      <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-border bg-panel px-4 text-[13px] font-semibold text-muted-foreground transition-colors select-none peer-checked:border-transparent peer-checked:bg-accent-soft peer-checked:font-bold peer-checked:text-accent-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-panel lg:min-h-9">
        {funcao.nome}
      </span>
    </label>
  );
}

/**
 * Sair da própria coordenação é irreversível de dentro: a action só recusa quando não
 * sobraria mais ninguém, então com outra pessoa na coordenação o clique tira o acesso na
 * hora. Por isso o mesmo pedido de confirmação em duas etapas do FormStatus.
 */
function FormPapel({ pessoa, souEu }: { pessoa: PessoaNaGestao; souEu: boolean }) {
  const [estado, acao, pendente] = useActionState(mudarPapel, INICIAL);
  const campo = useId();
  const [escolhido, setEscolhido] = useState<PapelSistema>(pessoa.papelSistema);

  const tratado = useRef<EstadoForm>(INICIAL);
  useEffect(() => {
    if (estado === tratado.current || !estado.ok) return;
    tratado.current = estado;
    toast.success("Papel atualizado.");
  }, [estado]);

  const vaiSeRebaixar = souEu && pessoa.papelSistema === "coordenador" && escolhido === "participante";

  return (
    <form action={acao} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={pessoa.id} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${campo}-papel`}>Papel no app</Label>
        <SelectPapel
          id={`${campo}-papel`}
          value={escolhido}
          onChange={(e) => setEscolhido(e.currentTarget.value as PapelSistema)}
        />
        <p className="text-[12px] text-muted-foreground">
          Quem está na coordenação enxerga a escala inteira, convida gente e edita as
          atividades.
          {souEu && " Este é o seu acesso."}
        </p>
      </div>

      {estado.erro && <Erro>{estado.erro}</Erro>}

      {vaiSeRebaixar ? (
        <div className="rounded-lg bg-warn-soft px-3 py-2.5">
          <p className="text-[12.5px] text-warn">
            Sair da coordenação? Você perde estas telas na hora, e só outra pessoa da
            coordenação pode te trazer de volta.
          </p>
          <div className="mt-2.5 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEscolhido(pessoa.papelSistema)}
            >
              Continuar na coordenação
            </Button>
            <Button type="submit" variant="destructive" disabled={pendente}>
              {pendente ? "Saindo…" : "Sair da coordenação"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="outline"
            disabled={pendente || escolhido === pessoa.papelSistema}
          >
            {pendente ? "Salvando…" : "Salvar papel"}
          </Button>
        </div>
      )}
    </form>
  );
}

/** Inativar tira o acesso no pedido seguinte — por isso confirma; reativar não precisa. */
function FormStatus({ pessoa, souEu }: { pessoa: PessoaNaGestao; souEu: boolean }) {
  const [estado, acao, pendente] = useActionState(alternarStatusPessoa, INICIAL);
  const [confirmando, setConfirmando] = useState(false);
  const ativa = pessoa.status === "ativo";

  const tratado = useRef<EstadoForm>(INICIAL);
  useEffect(() => {
    if (estado === tratado.current || !estado.ok) return;
    tratado.current = estado;
    setConfirmando(false);
    // Sem "inativada"/"reativada": quando o toast toca, a revalidação já pode ter trocado
    // a pessoa embaixo do componente, e a frase sairia invertida.
    toast.success("Situação atualizada.");
  }, [estado]);

  return (
    <form action={acao} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={pessoa.id} />

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{ativa ? "Acesso ao app" : "Acesso suspenso"}</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {ativa
              ? `${nomeCurto(pessoa.nome)} entra e vê a escala normalmente.`
              : `${nomeCurto(pessoa.nome)} não entra no app; o que já está na escala continua lá.`}
          </p>
        </div>

        {ativa ? (
          !confirmando && (
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setConfirmando(true)}
            >
              Inativar
            </Button>
          )
        ) : (
          <Button type="submit" variant="outline" className="shrink-0" disabled={pendente}>
            {pendente ? "Reativando…" : "Reativar"}
          </Button>
        )}
      </div>

      {souEu && ativa && (
        <p className="text-[12px] text-muted-foreground">
          Você não pode inativar a si mesmo — peça a outra pessoa da coordenação.
        </p>
      )}

      {confirmando && (
        <div className="rounded-lg border border-border-soft bg-background p-3">
          <p className="text-[13px]">
            Inativar {nomeCurto(pessoa.nome)}? O acesso cai na hora. A escala e o histórico
            ficam como estão, e dá para reativar quando quiser.
          </p>
          <div className="mt-2.5 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmando(false)}>
              Manter ativo
            </Button>
            <Button type="submit" variant="destructive" disabled={pendente}>
              {pendente ? "Inativando…" : "Inativar"}
            </Button>
          </div>
        </div>
      )}

      {estado.erro && <Erro>{estado.erro}</Erro>}
    </form>
  );
}
