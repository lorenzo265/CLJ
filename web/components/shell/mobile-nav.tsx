"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CircleCheck, List, User } from "lucide-react";
import { MOBILE, estaAtivo } from "@/components/shell/navegacao";
import { cn } from "@/lib/utils";

/*
  A bottom nav do celular: quatro destinos, alvo de 44px, na zona do polegar
  (docs/decisoes-design.md §8). O ponto azul embaixo do rótulo é a conta acesa.
*/

const ICONE = {
  "/hoje": CircleCheck,
  "/escala": List,
  "/calendario": CalendarDays,
  "/voce": User,
} as const;

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-panel",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      {MOBILE.map((destino) => {
        const ativo = estaAtivo(destino.href, pathname);
        const Icone = ICONE[destino.href as keyof typeof ICONE];

        return (
          <Link
            key={destino.href}
            href={destino.href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-[3px] text-[10px] font-semibold",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
              ativo ? "font-bold text-accent-ink" : "text-muted-foreground",
            )}
          >
            <Icone className="size-[21px]" strokeWidth={1.6} aria-hidden />
            <span>{destino.curto ?? destino.label}</span>
            <span
              aria-hidden
              className={cn("size-1 rounded-full", ativo ? "bg-primary" : "bg-transparent")}
            />
          </Link>
        );
      })}
    </nav>
  );
}
