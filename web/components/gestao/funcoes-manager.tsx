"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";
import type { Funcao } from "@/lib/types";

interface FuncaoComContagem extends Funcao {
  contagem: number;
}

export function FuncoesManager({ funcoesIniciais }: { funcoesIniciais: FuncaoComContagem[] }) {
  const [funcoes, setFuncoes] = useState(funcoesIniciais);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<FuncaoComContagem | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  function abrirNova() {
    setEditando(null);
    setNome("");
    setDescricao("");
    setOpen(true);
  }

  function abrirEdicao(f: FuncaoComContagem) {
    setEditando(f);
    setNome(f.nome);
    setDescricao(f.descricao);
    setOpen(true);
  }

  function salvar() {
    if (!nome.trim()) return;
    if (editando) {
      setFuncoes((atual) =>
        atual.map((f) => (f.id === editando.id ? { ...f, nome, descricao } : f))
      );
      toast.success("Função atualizada.");
    } else {
      setFuncoes((atual) => [
        ...atual,
        { id: `f-${Date.now()}`, departamentoId: DEPARTAMENTO_CULTURAL, nome, descricao, contagem: 0 },
      ]);
      toast.success("Função criada.");
    }
    setOpen(false);
  }

  function remover(id: string) {
    setFuncoes((atual) => atual.filter((f) => f.id !== id));
    toast.success("Função removida.");
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={abrirNova}>
          <Plus className="size-4" />
          Nova função
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="p-3 font-medium">Função</th>
              <th className="p-3 font-medium">Descrição</th>
              <th className="p-3 font-medium">Pessoas</th>
              <th className="p-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcoes.map((f) => (
              <tr key={f.id} className="border-b last:border-0">
                <td className="p-3 font-medium whitespace-nowrap">{f.nome}</td>
                <td className="max-w-md p-3 text-muted-foreground">{f.descricao}</td>
                <td className="p-3">
                  <Badge variant="secondary">{f.contagem}</Badge>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="outline" size="icon-sm" onClick={() => abrirEdicao(f)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => remover(f.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar função" : "Nova função"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="funcao-nome">Nome</Label>
              <Input id="funcao-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="funcao-descricao">Descrição</Label>
              <Textarea
                id="funcao-descricao"
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={salvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
