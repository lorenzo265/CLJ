"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatarDataLonga } from "@/lib/format";
import type { ReuniaoCompleta } from "@/lib/data/reunioes";
import type { Pessoa } from "@/lib/types";

export function ReunioesManager({
  reunioesIniciais,
  pessoas,
}: {
  reunioesIniciais: ReuniaoCompleta[];
  pessoas: Pessoa[];
}) {
  const [reunioes, setReunioes] = useState(reunioesIniciais);
  const [selecionadaId, setSelecionadaId] = useState(reunioesIniciais[0]?.atividadeId ?? null);

  const selecionada = reunioes.find((r) => r.atividadeId === selecionadaId) ?? null;

  function atualizar(patch: Partial<ReuniaoCompleta>) {
    if (!selecionadaId) return;
    setReunioes((atual) =>
      atual.map((r) => (r.atividadeId === selecionadaId ? { ...r, ...patch } : r))
    );
  }

  function novaReuniao() {
    const id = `reuniao-${Date.now()}`;
    const nova: ReuniaoCompleta = {
      atividadeId: id,
      pauta: [],
      decisoes: [],
      followUp: [],
      presentes: [],
      atividade: {
        id,
        departamentoId: "cultural",
        tipo: "reuniao",
        titulo: "Nova reunião",
        funcaoId: pessoas[0]?.id ? "" : "",
        data: new Date().toISOString().slice(0, 10),
        responsavelId: pessoas[0]?.id ?? "",
        status: "agendado",
      },
    };
    setReunioes((atual) => [nova, ...atual]);
    setSelecionadaId(id);
  }

  function salvar() {
    toast.success("Reunião salva.");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <div className="space-y-2">
        <Button size="sm" className="w-full" onClick={novaReuniao}>
          <Plus className="size-4" />
          Nova reunião
        </Button>
        {reunioes.map((r) => {
          const realizada = r.atividade.status === "concluido";
          const ativa = r.atividadeId === selecionadaId;
          return (
            <button
              key={r.atividadeId}
              onClick={() => setSelecionadaId(r.atividadeId)}
              className={cn(
                "block w-full rounded-lg border p-3 text-left transition-colors",
                ativa ? "border-primary bg-accent" : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn("text-xs", ativa ? "text-accent-foreground" : "text-muted-foreground")}>
                  {formatarDataLonga(r.atividade.data)}
                </span>
                <Badge variant={realizada ? "ok" : "info"} className="text-[10px]">
                  {realizada ? "Realizada" : "Agendada"}
                </Badge>
              </div>
              <p className={cn("mt-1 text-sm font-semibold", ativa && "text-accent-foreground")}>
                {r.atividade.titulo}
              </p>
            </button>
          );
        })}
      </div>

      <div className="min-w-0 rounded-xl border bg-card p-5">
        {!selecionada ? (
          <p className="text-sm text-muted-foreground">Nenhuma reunião ainda — crie a primeira.</p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
              <div className="space-y-1.5">
                <Label>Título</Label>
                <Input
                  value={selecionada.atividade.titulo}
                  onChange={(e) => atualizar({ atividade: { ...selecionada.atividade, titulo: e.target.value } })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={selecionada.atividade.data}
                  onChange={(e) => atualizar({ atividade: { ...selecionada.atividade, data: e.target.value } })}
                />
              </div>
            </div>

            <ListaEditavel
              titulo="Pauta (perguntas)"
              itens={selecionada.pauta}
              onChange={(pauta) => atualizar({ pauta })}
              placeholder="Ex.: como está a produção do lote deste mês?"
              adicionarLabel="Adicionar pergunta"
              numerada
            />

            <ListaEditavel
              titulo="Decisões"
              itens={selecionada.decisoes}
              onChange={(decisoes) => atualizar({ decisoes })}
              placeholder="O que foi decidido"
              adicionarLabel="Adicionar decisão"
            />

            <div className="space-y-2">
              <Label>Follow-up</Label>
              <div className="space-y-2">
                {selecionada.followUp.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      className="flex-1"
                      placeholder="Ação"
                      value={f.acao}
                      onChange={(e) => {
                        const followUp = [...selecionada.followUp];
                        followUp[i] = { ...f, acao: e.target.value };
                        atualizar({ followUp });
                      }}
                    />
                    <Select
                      value={f.responsavelId || undefined}
                      onValueChange={(v) => {
                        const followUp = [...selecionada.followUp];
                        followUp[i] = { ...f, responsavelId: v ?? "" };
                        atualizar({ followUp });
                      }}
                    >
                      <SelectTrigger className="w-40"><SelectValue placeholder="Responsável" /></SelectTrigger>
                      <SelectContent>
                        {pessoas.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => atualizar({ followUp: selecionada.followUp.filter((_, j) => j !== i) })}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    atualizar({ followUp: [...selecionada.followUp, { acao: "", responsavelId: "", prazo: "" }] })
                  }
                >
                  <Plus className="size-3.5" />
                  Adicionar item
                </Button>
              </div>
            </div>

            <div className="flex justify-end border-t pt-4">
              <Button onClick={salvar}>Salvar reunião</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ListaEditavel({
  titulo,
  itens,
  onChange,
  placeholder,
  adicionarLabel,
  numerada = false,
}: {
  titulo: string;
  itens: string[];
  onChange: (itens: string[]) => void;
  placeholder: string;
  adicionarLabel: string;
  numerada?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{titulo}</Label>
      <div className="space-y-2">
        {itens.map((valor, i) => (
          <div key={i} className="flex items-center gap-2">
            {numerada && <span className="font-mono text-sm text-primary">{i + 1}.</span>}
            <Input
              className="flex-1"
              placeholder={placeholder}
              value={valor}
              onChange={(e) => {
                const copia = [...itens];
                copia[i] = e.target.value;
                onChange(copia);
              }}
            />
            <Button variant="outline" size="icon-sm" onClick={() => onChange(itens.filter((_, j) => j !== i))}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange([...itens, ""])}>
          <Plus className="size-3.5" />
          {adicionarLabel}
        </Button>
      </div>
    </div>
  );
}
