import "server-only";
import { buscarConvite, convitesPendentes, conviteValido } from "@/lib/repos/auth";
import type { Convite } from "@/lib/types";

/**
 * Convites — a única porta de entrada do departamento (não existe autocadastro).
 * Vive em lib/data/ para que a tela do convite e a de participantes não precisem falar
 * com lib/repos/ (docs/sdd-implementacao.md §2, regra 1).
 */

export async function getConvite(token: string): Promise<Convite | undefined> {
  return buscarConvite(token);
}

/** Nem usado, nem vencido — é o que a tela de participantes lista e o que a de convite aceita. */
export async function getConviteValido(token: string): Promise<Convite | undefined> {
  const convite = buscarConvite(token);
  return conviteValido(convite) ? convite : undefined;
}

export async function getConvitesPendentes(departamentoId: string): Promise<Convite[]> {
  return convitesPendentes(departamentoId);
}
