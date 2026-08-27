import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatarDataLonga } from "@/lib/format";
import { getReunioes } from "@/lib/data/reunioes";
import { getPessoas } from "@/lib/data/pessoas";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";

export default async function ReunioesPage({ searchParams }: PageProps<"/reunioes">) {
  const { reuniao } = await searchParams;

  const [reunioes, pessoas] = await Promise.all([
    getReunioes(DEPARTAMENTO_CULTURAL),
    getPessoas(DEPARTAMENTO_CULTURAL),
  ]);
  const pessoaPorId = new Map(pessoas.map((p) => [p.id, p]));

  const selecionada =
    reunioes.find((r) => r.atividadeId === reuniao) ?? reunioes[0];

  return (
    <>
      <PageHeader title="Reuniões" subtitle="Pauta, decisões e follow-up" />
      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[260px_1fr]">
        <div className="space-y-2">
          {reunioes.map((r) => {
            const realizada = r.atividade.status === "concluido";
            const ativa = r.atividadeId === selecionada?.atividadeId;
            return (
              <Link
                key={r.atividadeId}
                href={`/reunioes?reuniao=${r.atividadeId}`}
                className={cn(
                  "block rounded-lg border p-3 transition-colors",
                  ativa ? "border-primary bg-accent" : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-xs", ativa ? "text-accent-foreground" : "text-muted-foreground")}>
                    {formatarDataLonga(r.atividade.data)}
                  </span>
                  <Badge variant={realizada ? "ok" : "info"} className="text-[10px]">
                    {realizada ? "Realizada" : "Agendada"}
                  </Badge>
                </div>
                <p className={cn("mt-1 text-sm font-semibold", ativa && "text-accent-foreground")}>
                  {r.atividade.titulo}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="min-w-0 rounded-xl border bg-card p-5">
          {!selecionada ? (
            <p className="text-sm text-muted-foreground">Nenhuma reunião registrada ainda.</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-lg font-semibold">{selecionada.atividade.titulo}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatarDataLonga(selecionada.atividade.data)}
                    {selecionada.presentes.length > 0 &&
                      ` · ${selecionada.presentes.length} presentes`}
                  </p>
                </div>
                <Badge variant={selecionada.atividade.status === "concluido" ? "ok" : "info"}>
                  {selecionada.atividade.status === "concluido" ? "Realizada" : "Agendada"}
                </Badge>
              </div>

              <div className="mt-5 space-y-1.5">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Pauta</h3>
                <ol className="space-y-1.5">
                  {selecionada.pauta.map((pergunta, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="font-mono text-primary">{i + 1}.</span>
                      {pergunta}
                    </li>
                  ))}
                </ol>
              </div>

              {selecionada.decisoes.length > 0 && (
                <div className="mt-5 space-y-1.5">
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Decisões</h3>
                  <ul className="space-y-1 text-sm">
                    {selecionada.decisoes.map((d, i) => (
                      <li key={i}>— {d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selecionada.followUp.length > 0 && (
                <div className="mt-5 space-y-2">
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Follow-up</h3>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                          <th className="p-2 font-medium">Ação</th>
                          <th className="p-2 font-medium">Responsável</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selecionada.followUp.map((f, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="p-2">{f.acao}</td>
                            <td className="p-2">{pessoaPorId.get(f.responsavelId)?.nome ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
