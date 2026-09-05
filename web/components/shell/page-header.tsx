import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * O cabeçalho da tela. Duas densidades, uma identidade (decisoes-design.md §7.3):
 * no celular o título é grande e respira; no desktop vira a barra de 64px do canvas.
 */
export function PageHeader({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-5 pt-6 pb-4",
        "lg:h-16 lg:flex-nowrap lg:border-b lg:border-border lg:px-8 lg:py-0",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="truncate font-serif text-[22px] leading-tight font-bold lg:text-[19px]">
          {title}
        </h1>
        {subtitle && <p className="truncate text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </header>
  );
}
