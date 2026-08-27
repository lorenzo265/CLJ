"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bookmark,
  Calendar,
  ClipboardList,
  LayoutGrid,
  List,
  ListChecks,
  MessageSquare,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { PapelSistema } from "@/lib/types";

interface NavEntry {
  href: string;
  label: string;
  icon: LucideIcon;
}

const MEU_ESPACO: NavEntry[] = [
  { href: "/cadastro", label: "Cadastro", icon: User },
  { href: "/escala", label: "Escala", icon: List },
  { href: "/calendario", label: "Calendário", icon: Calendar },
  { href: "/reunioes", label: "Reuniões", icon: MessageSquare },
];

const COORDENACAO: NavEntry[] = [
  { href: "/coordenador", label: "Painel", icon: LayoutGrid },
  { href: "/coordenador/funcoes", label: "Funções", icon: Bookmark },
  { href: "/coordenador/escala", label: "Gestão de Escala", icon: ListChecks },
  { href: "/coordenador/reunioes", label: "Gestão de Reuniões", icon: ClipboardList },
  { href: "/coordenador/participantes", label: "Participantes", icon: Users },
];

function NavLink({ href, label, icon: Icon }: NavEntry) {
  const pathname = usePathname();
  const isActive = href === "/coordenador" ? pathname === href : pathname.startsWith(href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={<Link href={href} />} className="relative">
        {isActive && (
          <motion.span
            layoutId="nav-active-pill"
            className="absolute inset-0 rounded-md bg-sidebar-accent"
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          />
        )}
        <Icon className="relative z-10 size-4" />
        <span className="relative z-10">{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({
  nome,
  papelSistema,
}: {
  nome: string;
  papelSistema: PapelSistema;
}) {
  const iniciais = nome
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-0 px-3 py-4">
        <span className="font-serif text-lg font-semibold">CLJ NSR</span>
        <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          Departamento Cultural
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Meu espaço</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MEU_ESPACO.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {papelSistema === "coordenador" && (
          <SidebarGroup>
            <SidebarGroupLabel>Coordenação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {COORDENACAO.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="flex-row items-center gap-2.5 border-t px-3 py-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
          {iniciais}
        </div>
        <div className="min-w-0 group-data-[collapsible=icon]:hidden">
          <div className="truncate text-sm font-medium">{nome}</div>
          <div className="text-xs text-muted-foreground">
            {papelSistema === "coordenador" ? "Coordenador(a)" : "Participante"}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
