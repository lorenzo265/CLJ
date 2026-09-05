"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vazio } from "@/components/fio/tipografia";
import { salvarMeuCadastro } from "@/lib/actions/cadastro";
import { DIAS_SEMANA, PERIODOS } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { EstadoForm } from "@/lib/actions/auth";
import type { DiaSemana, Funcao, Periodo } from "@/lib/types";

const INICIAL: EstadoForm = {};

/** No círculo cabe a inicial; o nome inteiro do dia vai para o leitor de tela. */
const ROTULO_DIA: Record<DiaSemana, { letra: string; nome: string }> = {
  seg: { letra: "S", nome: "Segunda-feira" },
  ter: { letra: "T", nome: "Terça-feira" },
  qua: { letra: "Q", nome: "Quarta-feira" },
  qui: { letra: "Q", nome: "Quinta-feira" },
  sex: { letra: "S", nome: "Sexta-feira" },
  sab: { letra: "S", nome: "Sábado" },
  dom: { letra: "D", nome: "Domingo" },
};

const ROTULO_PERIODO: Record<Periodo, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};

const CHIP =
  "flex cursor-pointer items-center justify-center border border-border bg-panel font-semibold " +
  "text-muted-foreground transition-colors select-none " +
  "peer-checked:border-transparent peer-checked:bg-accent-soft peer-checked:font-bold peer-checked:text-accent-ink " +
  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-panel";

/**
 * Chip de seleção múltipla: um <label> com o checkbox escondido atrás de `sr-only peer`.
 * O estado ligado sai do próprio `:checked` — funciona no teclado, sobrevive a um POST
 * sem JavaScript e não precisa de um useState espelhando o que o formulário já sabe.
 */
function Chip({
  name,
  value,
  rotulo,
  nomeAcessivel,
  marcado,
  circular = false,
}: {
  name: string;
  value: string;
  rotulo: string;
  /** Quando o rótulo visível é abreviado (a inicial do dia), o nome completo vem aqui. */
  nomeAcessivel?: string;
  marcado: boolean;
  circular?: boolean;
}) {
  return (
    <label className="inline-flex">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={marcado}
        aria-label={nomeAcessivel}
        className="peer sr-only"
      />
      <span
        className={cn(
          CHIP,
          circular
            ? "size-11 rounded-full text-[13px] lg:size-10"
            : "min-h-11 rounded-full px-4 text-[13px] lg:min-h-9",
        )}
      >
        {rotulo}
      </span>
    </label>
  );
}

/** Rótulo de grupo — <legend> em vez de <label>, que sem controle não anuncia nada. */
function Legenda({ children }: { children: ReactNode }) {
  return <legend className="mb-2 text-sm leading-none font-medium">{children}</legend>;
}

export function CadastroForm({
  nome,
  contato,
  funcoes,
  funcoesMarcadas,
  dias,
  periodos,
}: {
  nome: string;
  contato: string;
  funcoes: Funcao[];
  funcoesMarcadas: string[];
  dias: DiaSemana[];
  periodos: Periodo[];
}) {
  const [estado, acao, pendente] = useActionState(salvarMeuCadastro, INICIAL);

  // A action devolve um objeto novo a cada envio, então o toast toca uma vez por salvamento.
  useEffect(() => {
    if (estado.ok) toast.success("Cadastro salvo.");
  }, [estado]);

  const marcadas = new Set(funcoesMarcadas);
  const diasMarcados = new Set(dias);
  const periodosMarcados = new Set(periodos);

  return (
    <form
      action={acao}
      className="flex flex-col gap-6 rounded-2xl border border-border bg-panel p-5 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            name="nome"
            defaultValue={nome}
            maxLength={120}
            autoComplete="name"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contato">Contato</Label>
          <Input
            id="contato"
            name="contato"
            type="tel"
            defaultValue={contato}
            maxLength={60}
            autoComplete="tel"
            placeholder="(11) 90000-0000"
          />
          <p className="text-[12px] text-muted-foreground">
            Onde a coordenação te chama — WhatsApp, de preferência.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="departamento">Departamento</Label>
        {/* Só existe o Cultural nesta rodada (sdd-implementacao.md §3) — campo de leitura. */}
        <Input
          id="departamento"
          value="Cultural"
          readOnly
          className="border-border-soft bg-background text-muted-foreground"
        />
      </div>

      <fieldset>
        <Legenda>Função(ões)</Legenda>
        {funcoes.length === 0 ? (
          <Vazio>A coordenação ainda não abriu funções por aqui.</Vazio>
        ) : (
          <div className="flex flex-wrap gap-2">
            {funcoes.map((f) => (
              <Chip
                key={f.id}
                name="funcoes"
                value={f.id}
                rotulo={f.nome}
                marcado={marcadas.has(f.id)}
              />
            ))}
          </div>
        )}
      </fieldset>

      <fieldset>
        <Legenda>Disponibilidade — dias da semana</Legenda>
        <div className="flex flex-wrap gap-2">
          {DIAS_SEMANA.map((d) => (
            <Chip
              key={d}
              name="dias"
              value={d}
              rotulo={ROTULO_DIA[d].letra}
              nomeAcessivel={ROTULO_DIA[d].nome}
              marcado={diasMarcados.has(d)}
              circular
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <Legenda>Disponibilidade — período</Legenda>
        <div className="flex flex-wrap gap-2">
          {PERIODOS.map((p) => (
            <Chip
              key={p}
              name="periodos"
              value={p}
              rotulo={ROTULO_PERIODO[p]}
              marcado={periodosMarcados.has(p)}
            />
          ))}
        </div>
      </fieldset>

      {estado.erro && (
        <p role="alert" className="rounded-lg bg-crit-soft px-3 py-2 text-[13px] text-crit">
          {estado.erro}
        </p>
      )}

      <div className="flex justify-end border-t border-border-soft pt-5">
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : "Salvar cadastro"}
        </Button>
      </div>
    </form>
  );
}
