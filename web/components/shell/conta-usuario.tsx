"use client";

import { LogOut } from "lucide-react";
import { sair } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import type { PapelSistema } from "@/lib/types";

export function iniciaisDe(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0] ?? "")
    .join("")
    .toUpperCase();
}

/** O rodapé do fio: quem você é e a porta de saída. */
export function ContaUsuario({
  nome,
  papelSistema,
  className,
}: {
  nome: string;
  papelSistema: PapelSistema;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5 border-t border-border-soft pt-3", className)}>
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[13px] font-bold text-accent-ink"
        aria-hidden
      >
        {iniciaisDe(nome)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold">{nome}</div>
        <div className="text-[11.5px] text-muted-foreground">
          {papelSistema === "coordenador" ? "Coordenação" : "Participante"}
        </div>
      </div>
      <form action={sair}>
        <button
          type="submit"
          title="Sair"
          aria-label="Sair da conta"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}
