import Link from "next/link";
import { Bookmark, ClipboardList, ListChecks, TriangleAlert, Users } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getResumoPainel } from "@/lib/data/dashboard";
import { formatarDataCurta } from "@/lib/format";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";

const NAV_CARDS = [
  { href: "/coordenador/funcoes", label: "Funções", desc: "Catálogo de papéis do departamento", icon: Bookmark },
  { href: "/coordenador/escala", label: "Escala", desc: "Posts, tarefas e rodízio", icon: ListChecks },
  { href: "/coordenador/reunioes", label: "Reuniões", desc: "Pauta, decisões e follow-up", icon: ClipboardList },
  { href: "/coordenador/participantes", label: "Participantes", desc: "Cadastros e convites", icon: Users },
];

export default async function PainelPage() {
  const resumo = await getResumoPainel(DEPARTAMENTO_CULTURAL);

  return (
    <>
      <PageHeader title="Painel do coordenador" subtitle="Departamento Cultural" />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent>
              <p className="text-xs font-medium text-muted-foreground">Participantes ativos</p>
              <p className="mt-1.5 text-2xl font-bold">{resumo.participantesAtivos}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-xs font-medium text-muted-foreground">Tarefas sem responsável</p>
              <p className="mt-1.5 text-2xl font-bold text-warn">{resumo.tarefasSemResponsavel}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-xs font-medium text-muted-foreground">Próxima reunião</p>
              <p className="mt-1.5 text-2xl font-bold">
                {resumo.proximaReuniaoData ? formatarDataCurta(resumo.proximaReuniaoData) : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-xs font-medium text-muted-foreground">Furos essa semana</p>
              <p className="mt-1.5 text-2xl font-bold">{resumo.furosEstaSemana}</p>
            </CardContent>
          </Card>
        </div>

        {resumo.tarefasSemResponsavel > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-warn/30 bg-warn/10 px-4 py-3">
            <TriangleAlert className="size-5 shrink-0 text-warn" />
            <p className="text-sm text-warn">
              <strong>{resumo.tarefasSemResponsavel}</strong>{" "}
              {resumo.tarefasSemResponsavel === 1 ? "atividade" : "atividades"} ainda sem responsável
              definido.
            </p>
          </div>
        )}

        <div>
          <h2 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Gerenciar
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NAV_CARDS.map(({ href, label, desc, icon: Icon }) => (
              <Link key={href} href={href}>
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Icon className="size-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
