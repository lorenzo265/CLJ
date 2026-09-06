"use client";

import { useActionState, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { excluirFuncao, salvarFuncao } from "@/lib/actions/funcoes";
import { cn } from "@/lib/utils";
import type { EstadoForm } from "@/lib/actions/auth";
import type { Funcao } from "@/lib/types";

const INICIAL: EstadoForm = {};

export interface FuncaoNaGestao extends Funcao {
  /** Quantas pessoas do departamento carregam essa função no cadastro. */
  pessoas: number;
  /** Em quantas atividades da escala ela aparece — acima de zero, excluir apagaria histórico. */
  naEscala: number;
}

function contar(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** A mesma frase no tooltip do desktop, na linha do cartão e no rótulo do leitor de tela. */
function motivoDoBloqueio(f: FuncaoNaGestao): string {
  return `Está em ${contar(f.naEscala, "atividade", "atividades")} da escala.`;
}

/**
 * O catálogo de funções com o CRUD inteiro: tabela densa no desktop, cartões no celular.
 * Nada aqui guarda cópia dos dados — a lista vem do servidor a cada revalidação, e o
 * estado local só decide qual diálogo está aberto.
 */
export function FuncoesManager({ funcoes }: { funcoes: FuncaoNaGestao[] }) {
  /*
    Dois pares de estado por diálogo, de propósito:
    - `alvo` não é limpo ao fechar, senão o diálogo pisca de "Editar" para "Nova função"
      durante a animação de saída;
    - `n` muda a cada abertura e serve de `key`: remontar o formulário é o que zera o
      estado do useActionState (erro antigo, campos preenchidos) entre uma edição e outra.
  */
  const [form, setForm] = useState<{ alvo: FuncaoNaGestao | null; n: number }>({
    alvo: null,
    n: 0,
  });
  const [formAberto, setFormAberto] = useState(false);
  const [exclusao, setExclusao] = useState<{ alvo: FuncaoNaGestao | null; n: number }>({
    alvo: null,
    n: 0,
  });
  const [exclusaoAberta, setExclusaoAberta] = useState(false);

  function abrirForm(alvo: FuncaoNaGestao | null) {
    setForm((atual) => ({ alvo, n: atual.n + 1 }));
    setFormAberto(true);
  }

  function abrirExclusao(alvo: FuncaoNaGestao) {
    setExclusao((atual) => ({ alvo, n: atual.n + 1 }));
    setExclusaoAberta(true);
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          {contar(funcoes.length, "função", "funções")} no catálogo
        </p>
        <Button type="button" onClick={() => abrirForm(null)}>
          <Plus aria-hidden />
          Nova função
        </Button>
      </div>

      {funcoes.length === 0 ? (
        <div className="rounded-xl border border-border bg-panel">
          <Vazio>Nenhuma função por aqui ainda — crie a primeira para começar a escala.</Vazio>
        </div>
      ) : (
        <>
          {/* Desktop: a tabela do canvas. Larga, então rola sozinha em vez de espremer a página. */}
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-panel lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border">
                  <Th className="pl-4">Função</Th>
                  <Th>Descrição</Th>
                  <Th>Pessoas</Th>
                  <Th className="pr-4 text-right">Ações</Th>
                </tr>
              </thead>
              <tbody>
                {funcoes.map((f) => (
                  <tr key={f.id} className="border-b border-border-soft last:border-0">
                    <td className="py-3.5 pr-3.5 pl-4 align-top text-[13.5px] font-bold">
                      {f.nome}
                    </td>
                    <td className="p-3.5 align-top text-[13.5px] text-muted-foreground">
                      {/* A largura mora no bloco interno: `max-width` em <td> o navegador ignora. */}
                      <div className="max-w-[420px]">
                        {f.descricao || <span className="text-faint">Sem descrição</span>}
                      </div>
                    </td>
                    <td className="p-3.5 align-top">
                      <Contador pessoas={f.pessoas} />
                    </td>
                    <td className="py-3.5 pr-4 pl-3.5 align-top">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          aria-label={`Editar ${f.nome}`}
                          onClick={() => abrirForm(f)}
                        >
                          <Pencil className="size-3.5" aria-hidden />
                        </Button>

                        {f.naEscala > 0 ? (
                          /*
                            O botão desabilitado não recebe hover (pointer-events: none),
                            então quem carrega o tooltip é o span em volta dele.
                          */
                          <Tooltip>
                            <TooltipTrigger render={<span className="inline-flex" />}>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                disabled
                                aria-label={`Excluir ${f.nome} — indisponível. ${motivoDoBloqueio(f)}`}
                              >
                                <Trash2 className="size-3.5" aria-hidden />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {motivoDoBloqueio(f)} Troque a função dessas atividades antes de
                              excluir.
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label={`Excluir ${f.nome}`}
                            onClick={() => abrirExclusao(f)}
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Celular: a mesma informação em cartões, com os alvos de toque inteiros. */}
          <ul className="flex flex-col gap-3 lg:hidden">
            {funcoes.map((f) => (
              <li key={f.id} className="rounded-xl border border-border bg-panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-sans text-[15px] leading-snug font-bold">{f.nome}</h2>
                  <Contador pessoas={f.pessoas} />
                </div>

                {f.descricao && (
                  <p className="mt-1 text-[13px] text-muted-foreground">{f.descricao}</p>
                )}

                <div className="mt-3.5 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => abrirForm(f)}
                  >
                    <Pencil aria-hidden />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={f.naEscala > 0}
                    onClick={() => abrirExclusao(f)}
                  >
                    <Trash2 aria-hidden />
                    Excluir
                  </Button>
                </div>

                {/* No celular a explicação é texto visível: tooltip não existe no toque. */}
                {f.naEscala > 0 && (
                  <p className="mt-2 text-[12px] text-muted-foreground">
                    {motivoDoBloqueio(f)} Troque a função dessas atividades antes de excluir.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <Dialog disablePointerDismissal open={formAberto} onOpenChange={setFormAberto}>
        <DialogContent>
          <FormularioFuncao
            key={form.n}
            funcao={form.alvo}
            aoFechar={() => setFormAberto(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog disablePointerDismissal open={exclusaoAberta} onOpenChange={setExclusaoAberta}>
        <DialogContent>
          {exclusao.alvo && (
            <ConfirmarExclusao
              key={exclusao.n}
              funcao={exclusao.alvo}
              aoFechar={() => setExclusaoAberta(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
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

/** O contador de pessoas. Zero não é erro — só uma função que ainda espera gente. */
function Contador({ pessoas }: { pessoas: number }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[7px] text-[12px] font-bold tabular-nums",
        pessoas > 0 ? "bg-accent-soft text-accent-ink" : "bg-border-soft text-muted-foreground",
      )}
    >
      {pessoas}
      <span className="sr-only"> {pessoas === 1 ? "pessoa" : "pessoas"} com essa função</span>
    </span>
  );
}

/**
 * Criar e editar dividem o mesmo formulário: a única diferença é o `id` escondido, que é
 * o que a action usa para decidir entre inserir e atualizar.
 */
function FormularioFuncao({
  funcao,
  aoFechar,
}: {
  funcao: FuncaoNaGestao | null;
  aoFechar: () => void;
}) {
  const [estado, acao, pendente] = useActionState(salvarFuncao, INICIAL);
  const campo = useId();
  const editando = funcao !== null;

  // useActionState devolve um objeto novo a cada envio — comparar por identidade fecha o
  // diálogo uma vez só, mesmo com o pai re-renderizando e trocando o `aoFechar`.
  const tratado = useRef<EstadoForm>(INICIAL);
  useEffect(() => {
    if (estado === tratado.current || !estado.ok) return;
    tratado.current = estado;
    toast.success(editando ? "Função atualizada." : "Função criada.");
    aoFechar();
  }, [estado, editando, aoFechar]);

  return (
    <form action={acao} className="flex flex-col gap-4">
      {funcao && <input type="hidden" name="id" value={funcao.id} />}

      <DialogHeader>
        <DialogTitle>{editando ? "Editar função" : "Nova função"}</DialogTitle>
        <DialogDescription>
          {editando
            ? "O nome aparece na escala e no cadastro de quem assume essa função."
            : "Dê um nome curto e diga em uma linha o que essa função entrega."}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${campo}-nome`}>Nome</Label>
          <Input
            id={`${campo}-nome`}
            name="nome"
            defaultValue={funcao?.nome ?? ""}
            placeholder="Terço Diário"
            maxLength={80}
            required
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${campo}-descricao`}>
            Descrição
            <span className="text-xs font-normal text-muted-foreground">opcional</span>
          </Label>
          <Textarea
            id={`${campo}-descricao`}
            name="descricao"
            rows={3}
            maxLength={400}
            defaultValue={funcao?.descricao ?? ""}
            placeholder="O que quem assume essa função entrega."
          />
        </div>
      </div>

      {estado.erro && (
        <p role="alert" className="rounded-lg bg-crit-soft px-3 py-2 text-[13px] text-crit">
          {estado.erro}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={aoFechar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : editando ? "Salvar função" : "Criar função"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Excluir sempre confirma. O diálogo só é oferecido para função fora da escala, mas a
 * palavra final continua sendo da action — ela recusa de novo no servidor.
 */
function ConfirmarExclusao({
  funcao,
  aoFechar,
}: {
  funcao: FuncaoNaGestao;
  aoFechar: () => void;
}) {
  const [estado, acao, pendente] = useActionState(excluirFuncao, INICIAL);

  const tratado = useRef<EstadoForm>(INICIAL);
  useEffect(() => {
    if (estado === tratado.current || !estado.ok) return;
    tratado.current = estado;
    toast.success("Função excluída.");
    aoFechar();
  }, [estado, aoFechar]);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={funcao.id} />

      <DialogHeader>
        <DialogTitle>Excluir {funcao.nome}?</DialogTitle>
        <DialogDescription>
          {funcao.pessoas > 0
            ? `${contar(funcao.pessoas, "pessoa fica", "pessoas ficam")} sem essa função no cadastro. `
            : "Ninguém tem essa função no cadastro. "}
          Nenhuma atividade da escala usa ela, então o histórico continua inteiro.
        </DialogDescription>
      </DialogHeader>

      {estado.erro && (
        <p role="alert" className="rounded-lg bg-crit-soft px-3 py-2 text-[13px] text-crit">
          {estado.erro}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={aoFechar}>
          Cancelar
        </Button>
        <Button type="submit" variant="destructive" disabled={pendente}>
          {pendente ? "Excluindo…" : "Excluir função"}
        </Button>
      </DialogFooter>
    </form>
  );
}
