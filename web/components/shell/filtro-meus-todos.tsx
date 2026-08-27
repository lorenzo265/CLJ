"use client";

import Link from "next/link";
import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

export function FiltroMeusTodos({
  base,
  atual,
  extraParams,
}: {
  base: string;
  atual: "meus" | "todos";
  extraParams?: Record<string, string>;
}) {
  const hrefPara = (filtro: "meus" | "todos") => {
    const params = new URLSearchParams({ ...extraParams, filtro });
    return `${base}?${params.toString()}`;
  };

  return (
    <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
      <Link
        href={hrefPara("meus")}
        aria-pressed={atual === "meus"}
        className={cn(toggleVariants({ size: "sm" }), "bg-transparent")}
      >
        Meus
      </Link>
      <Link
        href={hrefPara("todos")}
        aria-pressed={atual === "todos"}
        className={cn(toggleVariants({ size: "sm" }), "bg-transparent")}
      >
        Todos do departamento
      </Link>
    </div>
  );
}
