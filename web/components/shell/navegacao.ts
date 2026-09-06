import type { PapelSistema } from "@/lib/types";

/** Os destinos do app, num lugar só — sidebar (desktop) e bottom nav (mobile) leem daqui. */

export interface Destino {
  href: string;
  label: string;
  /** Rótulo curto da bottom nav, onde cabem ~10 caracteres. */
  curto?: string;
}

export const MEU_ESPACO: Destino[] = [
  { href: "/hoje", label: "Hoje" },
  { href: "/escala", label: "Escala" },
  { href: "/calendario", label: "Calendário" },
  { href: "/reunioes", label: "Reuniões" },
  { href: "/voce", label: "Você" },
];

export const COORDENACAO: Destino[] = [
  { href: "/coordenador", label: "Painel" },
  { href: "/coordenador/funcoes", label: "Funções" },
  { href: "/coordenador/escala", label: "Gestão de Escala" },
  { href: "/coordenador/reunioes", label: "Gestão de Reuniões" },
  { href: "/coordenador/participantes", label: "Participantes" },
];

/** A bottom nav do celular tem quatro destinos e só — decisoes-design.md §8. */
export const MOBILE: Destino[] = [
  { href: "/hoje", label: "Hoje" },
  { href: "/escala", label: "Escala" },
  { href: "/calendario", label: "Calendário", curto: "Calendário" },
  { href: "/voce", label: "Você" },
];

export function destinosDe(papel: PapelSistema): Destino[] {
  return papel === "coordenador" ? [...MEU_ESPACO, ...COORDENACAO] : MEU_ESPACO;
}

/**
 * "/coordenador" só está ativo na rota exata; os demais aceitam sub-rotas.
 * Sem isso o Painel ficaria aceso em toda tela de coordenação.
 */
export function estaAtivo(href: string, pathname: string): boolean {
  if (href === "/coordenador") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
