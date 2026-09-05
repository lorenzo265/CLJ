"use client";

import { useActionState } from "react";
import { entrar, type EstadoForm } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INICIAL: EstadoForm = {};

export function LoginForm() {
  const [estado, acao, pendente] = useActionState(entrar, INICIAL);

  return (
    <form action={acao} className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-xs text-muted-foreground">
          E-mail
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="senha" className="text-xs text-muted-foreground">
          Senha
        </Label>
        <Input id="senha" name="senha" type="password" autoComplete="current-password" required />
      </div>

      {estado.erro && (
        <p role="alert" className="rounded-lg bg-crit-soft px-3 py-2 text-[13px] text-crit">
          {estado.erro}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-1.5 w-full" disabled={pendente}>
        {pendente ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
