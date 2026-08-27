"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DiaSemana, Funcao, Pessoa, Periodo } from "@/lib/types";

const DIAS: { valor: DiaSemana; label: string }[] = [
  { valor: "seg", label: "Seg" },
  { valor: "ter", label: "Ter" },
  { valor: "qua", label: "Qua" },
  { valor: "qui", label: "Qui" },
  { valor: "sex", label: "Sex" },
  { valor: "sab", label: "Sáb" },
  { valor: "dom", label: "Dom" },
];

const PERIODOS: { valor: Periodo; label: string }[] = [
  { valor: "manha", label: "Manhã" },
  { valor: "tarde", label: "Tarde" },
  { valor: "noite", label: "Noite" },
];

export function CadastroForm({
  pessoa,
  funcoesDisponiveis,
  funcoesIniciais,
}: {
  pessoa: Pessoa;
  funcoesDisponiveis: Funcao[];
  funcoesIniciais: string[];
}) {
  const [nome, setNome] = useState(pessoa.nome);
  const [contato, setContato] = useState(pessoa.contato);
  const [funcaoIds, setFuncaoIds] = useState<string[]>(funcoesIniciais);
  const [dias, setDias] = useState<string[]>(pessoa.disponibilidade.dias);
  const [periodos, setPeriodos] = useState<string[]>(pessoa.disponibilidade.periodos);

  const iniciais = nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  function salvar() {
    toast.success("Cadastro salvo.");
  }

  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">
            {iniciais}
          </div>
          <p className="text-sm text-muted-foreground">Foto (opcional)</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contato">Contato</Label>
            <Input id="contato" value={contato} onChange={(e) => setContato(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Departamento</Label>
          <Input value="Cultural" disabled className="bg-muted text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <Label>Função(ões)</Label>
          <ToggleGroup
            multiple
            variant="outline"
            value={funcaoIds}
            onValueChange={setFuncaoIds}
            className="flex-wrap justify-start"
          >
            {funcoesDisponiveis.map((f) => (
              <ToggleGroupItem key={f.id} value={f.id} className="rounded-full px-3">
                {f.nome}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Disponibilidade — dias da semana</Label>
            <ToggleGroup multiple variant="outline" value={dias} onValueChange={setDias}>
              {DIAS.map((d) => (
                <ToggleGroupItem key={d.valor} value={d.valor} className="rounded-full">
                  {d.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <Label>Disponibilidade — período</Label>
            <ToggleGroup multiple variant="outline" value={periodos} onValueChange={setPeriodos}>
              {PERIODOS.map((p) => (
                <ToggleGroupItem key={p.valor} value={p.valor} className="rounded-full px-3">
                  {p.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button onClick={salvar}>Salvar cadastro</Button>
        </div>
      </CardContent>
    </Card>
  );
}
