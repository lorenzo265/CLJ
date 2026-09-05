import { AppSidebar } from "@/components/shell/app-sidebar";
import { MobileNav } from "@/components/shell/mobile-nav";
import { exigirPessoa } from "@/lib/auth/sessao";

/**
 * O shell autenticado. Duas densidades da mesma identidade: o fio à esquerda no desktop,
 * a bottom nav embaixo no celular (docs/decisoes-design.md §7.3).
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const pessoa = await exigirPessoa();

  return (
    <div className="flex min-h-svh bg-background">
      <AppSidebar
        nome={pessoa.nome}
        papelSistema={pessoa.papelSistema}
        className="hidden lg:flex"
      />
      <div className="flex min-w-0 flex-1 flex-col pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </div>
      <MobileNav className="lg:hidden" />
    </div>
  );
}
