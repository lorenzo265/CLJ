import "server-only";
import * as repo from "@/lib/repos/series";
import type { Serie } from "@/lib/types";

/** As séries do departamento com quantas atividades cada uma ainda tem no banco. */
export async function getSeries(
  departamentoId: string,
): Promise<{ serie: Serie; atividades: number }[]> {
  const contagem = repo.contagemPorSerie(departamentoId);
  return repo
    .listarSeries(departamentoId)
    .map((serie) => ({ serie, atividades: contagem[serie.id] ?? 0 }));
}

export async function getSerie(id: string): Promise<Serie | undefined> {
  return repo.buscarSerie(id);
}
