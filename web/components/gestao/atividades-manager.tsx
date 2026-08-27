"use client";

import { useState } from "react";
import { CalendarIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatarDataCurta } from "@/lib/format";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";
import type { Atividade, Funcao, Pessoa, StatusAtividade, TipoAtividade } from "@/lib/types";

const NENHUM = "nenhum";

const TIPO_LABEL: Record<TipoAtividade, string> = {
  post: "Post",
  tarefa: "Tarefa",
  evento: "Evento",
  reuniao: "Reunião",
};

const STATUS_LABEL: Record<StatusAtividade, string> = {
  ideia: "Ideia",
  rascunho: "Rascunho",
  agendado: "Agendado",
  publicado: "Publicado",
  concluido: "Concluído",
};

const STATUS_VARIANT: Record<StatusAtividade, "outline" | "warn" | "info" | "ok"> = {
  ideia: "outline",
  rascunho: "warn",
  agendado: "info",
  publicado: "ok",
  concluido: "ok",
};

function vazia(): Atividade {
  return {
    id: "",
    departamentoId: DEPARTAMENTO_CULTURAL,
    tipo: "post",
    titulo: "",
    funcaoId: "",
    data: new Date().toISOString().slice(0, 10),
    responsavelId: "",
    status: "ideia",
  };
}

export function AtividadesManager({
  atividadesIniciais,
  pessoas,
  funcoes,
}: {
  atividadesIniciais: Atividade[];
  pessoas: Pessoa[];
  funcoes: Funcao[];
}) {
  const [atividades, setAtividades] = useState(atividadesIniciais);
  const [open, setOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Atividade>(vazia());

  const pessoaPorId = new Map(pessoas.map((p) => [p.id, p]));
  const funcaoPorId = new Map(funcoes.map((f) => [f.id, f]));

  function abrirNova() {
    setEditandoId(null);
    setRascunho(vazia());
    setOpen(true);
  }

  function abrirEdicao(a: Atividade) {
    setEditandoId(a.id);
    setRascunho(a);
    setOpen(true);
  }

  function salvar() {
    if (!rascunho.titulo.trim() || !rascunho.funcaoId || !rascunho.responsavelId) {
      toast.error("Preencha título, função e responsável.");
      return;
    }
    if (editandoId) {
      setAtividades((atual) => atual.map((a) => (a.id === editandoId ? rascunho : a)));
      toast.success("Atividade atualizada.");
    } else {
      setAtividades((atual) => [...atual, { ...rascunho, id: `a-${Date.now()}` }]);
      toast.success("Atividade criada.");
    }
    setOpen(false);
  }

  function remover(id: string) {
    setAtividades((atual) => atual.filter((a) => a.id !== id));
    toast.success("Atividade removida.");
  }

  const linhas = [...atividades].sort((a, b) => a.data.localeCompare(b.data));

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={abrirNova}>
          <Plus className="size-4" />
          Nova atividade
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="p-3 font-medium">Data</th>
              <th className="p-3 font-medium">Tipo</th>
              <th className="p-3 font-medium">Título</th>
              <th className="p-3 font-medium">Função</th>
              <th className="p-3 font-medium">Responsável</th>
              <th className="p-3 font-medium">Suplente</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="p-3 font-mono text-xs whitespace-nowrap">{formatarDataCurta(a.data)}</td>
                <td className="p-3 whitespace-nowrap">{TIPO_LABEL[a.tipo]}</td>
                <td className="p-3 font-medium whitespace-nowrap">{a.titulo}</td>
                <td className="p-3 whitespace-nowrap text-muted-foreground">{funcaoPorId.get(a.funcaoId)?.nome ?? "—"}</td>
                <td className="p-3 whitespace-nowrap">{pessoaPorId.get(a.responsavelId)?.nome ?? "—"}</td>
                <td className="p-3 whitespace-nowrap text-muted-foreground">
                  {a.suplenteId ? (pessoaPorId.get(a.suplenteId)?.nome ?? "—") : "—"}
                </td>
                <td className="p-3">
                  <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="outline" size="icon-sm" onClick={() => abrirEdicao(a)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => remover(a.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editandoId ? "Editar atividade" : "Nova atividade"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-4">
            <div className="space-y-1.5">
              <Label htmlFor="at-titulo">Título</Label>
              <Input
                id="at-titulo"
                value={rascunho.titulo}
                onChange={(e) => setRascunho({ ...rascunho, titulo: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select
                  value={rascunho.tipo}
                  onValueChange={(v) => setRascunho({ ...rascunho, tipo: v as TipoAtividade })}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TIPO_LABEL) as TipoAtividade[]).map((t) => (
                      <SelectItem key={t} value={t}>{TIPO_LABEL[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger render={<Button variant="outline" className="w-full justify-start font-normal" />}>
                    <CalendarIcon className="size-4" />
                    {formatarDataCurta(rascunho.data)}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(`${rascunho.data}T00:00:00`)}
                      onSelect={(d) => d && setRascunho({ ...rascunho, data: d.toISOString().slice(0, 10) })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Função</Label>
              <Select
                value={rascunho.funcaoId || undefined}
                onValueChange={(v) => setRascunho({ ...rascunho, funcaoId: v ?? "" })}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {funcoes.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Responsável</Label>
                <Select
                  value={rascunho.responsavelId || undefined}
                  onValueChange={(v) => setRascunho({ ...rascunho, responsavelId: v ?? "" })}
                >
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {pessoas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Suplente</Label>
                <Select
                  value={rascunho.suplenteId ?? NENHUM}
                  onValueChange={(v) => setRascunho({ ...rascunho, suplenteId: !v || v === NENHUM ? undefined : v })}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NENHUM}>Sem suplente</SelectItem>
                    {pessoas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={rascunho.status}
                onValueChange={(v) => setRascunho({ ...rascunho, status: v as StatusAtividade })}
              >
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as StatusAtividade[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="at-midia">Link de mídia</Label>
              <Input
                id="at-midia"
                placeholder="https://..."
                value={rascunho.linkMidia ?? ""}
                onChange={(e) => setRascunho({ ...rascunho, linkMidia: e.target.value || undefined })}
              />
            </div>
          </div>
          <SheetFooter>
            <Button onClick={salvar}>Salvar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
