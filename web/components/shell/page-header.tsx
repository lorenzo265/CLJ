import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <div className="min-w-0">
          <h1 className="truncate font-serif text-lg font-semibold leading-tight">{title}</h1>
          {subtitle && (
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}
