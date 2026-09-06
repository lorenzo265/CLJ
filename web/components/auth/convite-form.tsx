"use client";

import { useActionState } from "react";
import { aceitarConvite, type EstadoForm } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INICIAL: EstadoForm = {};

export function ConviteForm({ token, nome }: { token: string; nome: string }) {
  const [estado, acao, pendente] = useActionState(aceitarConvite, INICIAL);

  return (
    <form action={acao} className="flex flex-col gap-3.5">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nome" className="text-xs text-muted-foreground">
          Seu nome
        </Label>
        <Input id="nome" name="nome" defaultValue={nome} autoComplete="name" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="senha" className="text-xs text-muted-foreground">
          Crie uma senha
        </Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-[11.5px] text-faint">Pelo menos 8 caracteres.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmacao" className="text-xs text-muted-foreground">
          Repita a senha
        </Label>
        <Input
          id="confirmacao"
          name="confirmacao"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {estado.erro && (
        <p role="alert" className="rounded-lg bg-crit-soft px-3 py-2 text-[13px] text-crit">
          {estado.erro}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-1.5 w-full" disabled={pendente}>
        {pendente ? "Criando…" : "Criar minha conta"}
      </Button>
    </form>
  );
}
