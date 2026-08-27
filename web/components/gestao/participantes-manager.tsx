"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Plus, Power } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Funcao, Pessoa } from "@/lib/types";

export function ParticipantesManager({
  pessoasIniciais,
  funcoes,
  funcoesPorPessoa,
}: {
  pessoasIniciais: Pessoa[];
  funcoes: Funcao[];
  funcoesPorPessoa: Record<string, string[]>;
}) {
  const [pessoas, setPessoas] = useState(pessoasIniciais);
  const [funcoesPessoa, setFuncoesPessoa] = useState(funcoesPorPessoa);
  const [emailConvite, setEmailConvite] = useState("");
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<Pessoa | null>(null);

  const funcaoPorId = new Map(funcoes.map((f) => [f.id, f]));

  function abrirEdicao(p: Pessoa) {
    setEditando(p);
    setOpen(true);
  }

  function salvar() {
    if (!editando) return;
    setPessoas((atual) => atual.map((p) => (p.id === editando.id ? editando : p)));
    toast.success("Participante atualizado.");
    setOpen(false);
  }

  function alternarStatus(id: string) {
    setPessoas((atual) =>
      atual.map((p) => (p.id === id ? { ...p, status: p.status === "ativo" ? "inativo" : "ativo" } : p))
    );
  }

  function enviarConvite() {
    if (!emailConvite.trim()) return;
    toast.success(`Convite enviado para ${emailConvite}.`);
    setEmailConvite("");
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 rounded-xl border bg-card p-3.5 sm:flex-row sm:items-center">
        <span className="shrink-0 text-sm font-medium">Convidar participante</span>
        <Input
          className="flex-1"
          placeholder="nome@email.com"
          value={emailConvite}
          onChange={(e) => setEmailConvite(e.target.value)}
        />
        <Button size="sm" onClick={enviarConvite} className="shrink-0">
          <Plus className="size-4" />
          Enviar convite
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="p-3 font-medium">Nome</th>
              <th className="p-3 font-medium">Contato</th>
              <th className="p-3 font-medium">Função(ões)</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pessoas.map((p) => (
              <tr key={p.id} className={p.status === "inativo" ? "border-b text-muted-foreground last:border-0" : "border-b last:border-0"}>
                <td className="p-3 font-medium whitespace-nowrap">{p.nome}</td>
                <td className="p-3 whitespace-nowrap">{p.contato}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {(funcoesPessoa[p.id] ?? []).map((fid) => (
                      <Badge key={fid} variant="secondary" className="text-[10px]">
                        {funcaoPorId.get(fid)?.nome}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant={p.status === "ativo" ? "ok" : "outline"}>
                    {p.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" />}>
                        <MoreVertical className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => abrirEdicao(p)}>
                          <Pencil className="size-3.5" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alternarStatus(p.id)}>
                          <Power className="size-3.5" />
                          {p.status === "ativo" ? "Desativar" : "Ativar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar participante</SheetTitle>
          </SheetHeader>
          {editando && (
            <div className="space-y-4 px-4 pb-4">
              <div className="space-y-1.5">
                <Label htmlFor="p-nome">Nome</Label>
                <Input
                  id="p-nome"
                  value={editando.nome}
                  onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-contato">Contato</Label>
                <Input
                  id="p-contato"
                  value={editando.contato}
                  onChange={(e) => setEditando({ ...editando, contato: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Função(ões)</Label>
                <ToggleGroup
                  multiple
                  variant="outline"
                  value={funcoesPessoa[editando.id] ?? []}
                  onValueChange={(v) => setFuncoesPessoa({ ...funcoesPessoa, [editando.id]: v })}
                  className="flex-wrap justify-start"
                >
                  {funcoes.map((f) => (
                    <ToggleGroupItem key={f.id} value={f.id} className="rounded-full px-3">
                      {f.nome}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Ativo</p>
                  <p className="text-xs text-muted-foreground">Participa das escalas do departamento</p>
                </div>
                <Switch
                  checked={editando.status === "ativo"}
                  onCheckedChange={(c) => setEditando({ ...editando, status: c ? "ativo" : "inativo" })}
                />
              </div>
            </div>
          )}
          <SheetFooter>
            <Button onClick={salvar}>Salvar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
