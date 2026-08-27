import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { FiltroMeusTodos } from "@/components/shell/filtro-meus-todos";
import { MonthGrid, type ItemDoDia } from "@/components/calendario/month-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAtividades } from "@/lib/data/atividades";
import { comPapel, filtrarMeus } from "@/lib/escala/agenda";
import {
  formatarMesAno,
  formatarReferenciaMes,
  getGradeDoMes,
  mesAnterior,
  mesSeguinte,
  parseReferenciaMes,
} from "@/lib/calendario/mes";
import { formatarDataCurta } from "@/lib/format";
import { PESSOA_ATUAL_ID } from "@/lib/mock/current-user";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";

export default async function CalendarioPage({ searchParams }: PageProps<"/calendario">) {
  const { filtro, mes } = await searchParams;
  const atual = filtro === "todos" ? "todos" : "meus";
  const referencia = parseReferenciaMes(typeof mes === "string" ? mes : undefined);

  const atividades = await getAtividades(DEPARTAMENTO_CULTURAL);
  const comPapelItens = comPapel(atividades, PESSOA_ATUAL_ID);
  const itens = atual === "todos" ? comPapelItens : filtrarMeus(comPapelItens);

  const itensPorDia = new Map<string, ItemDoDia[]>();
  for (const it of itens) {
    const lista = itensPorDia.get(it.atividade.data) ?? [];
    lista.push({ titulo: it.atividade.titulo, mine: it.papel !== "nenhum" });
    itensPorDia.set(it.atividade.data, lista);
  }

  const hojeIso = new Date().toISOString().slice(0, 10);
  const proximos = comPapelItens
    .filter((it) => it.papel !== "nenhum" && it.atividade.data >= hojeIso)
    .sort((a, b) => a.atividade.data.localeCompare(b.atividade.data))
    .slice(0, 4);

  const hrefMes = (ref: Date) => {
    const params = new URLSearchParams({ mes: formatarReferenciaMes(ref), filtro: atual });
    return `/calendario?${params.toString()}`;
  };

  return (
    <>
      <PageHeader title="Meu Calendário">
        <div className="flex items-center gap-1.5">
          <Button render={<Link href={hrefMes(mesAnterior(referencia))} />} nativeButton={false} variant="outline" size="icon-sm">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="w-32 text-center text-sm font-medium">{formatarMesAno(referencia)}</span>
          <Button render={<Link href={hrefMes(mesSeguinte(referencia))} />} nativeButton={false} variant="outline" size="icon-sm">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0 space-y-4">
          <FiltroMeusTodos
            base="/calendario"
            atual={atual}
            extraParams={{ mes: formatarReferenciaMes(referencia) }}
          />
          <MonthGrid dias={getGradeDoMes(referencia)} itensPorDia={itensPorDia} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Próximos</h2>
          {proximos.length === 0 && (
            <p className="text-sm text-muted-foreground">Nada agendado pra você.</p>
          )}
          {proximos.map((it) => (
            <div key={it.atividade.id} className="rounded-lg border bg-card p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {formatarDataCurta(it.atividade.data)}
                </span>
                {it.papel === "responsavel" && (
                  <Badge variant="info" className="text-[10px]">
                    é sua vez
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm font-medium">{it.atividade.titulo}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
