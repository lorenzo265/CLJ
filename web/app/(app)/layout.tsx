import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getPessoa } from "@/lib/data/pessoas";
import { PESSOA_ATUAL_ID } from "@/lib/mock/current-user";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const pessoa = await getPessoa(PESSOA_ATUAL_ID);
  if (!pessoa) redirect("/login");

  return (
    <SidebarProvider>
      <AppSidebar nome={pessoa.nome} papelSistema={pessoa.papelSistema} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
