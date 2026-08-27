import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatarDataCurta } from "@/lib/format";
import type { AtividadeComPapel } from "@/lib/escala/agenda";
import type { Pessoa } from "@/lib/types";

const TIPO_LABEL: Record<string, string> = {
  post: "Post",
  tarefa: "Tarefa",
  evento: "Evento",
  reuniao: "Reunião",
};

const STATUS_LABEL: Record<string, string> = {
  ideia: "Ideia",
  rascunho: "Rascunho",
  agendado: "Agendado",
  publicado: "Publicado",
  concluido: "Concluído",
};

const STATUS_VARIANT: Record<string, "outline" | "warn" | "info" | "ok"> = {
  ideia: "outline",
  rascunho: "warn",
  agendado: "info",
  publicado: "ok",
  concluido: "ok",
};

export function AgendaRow({
  item,
  mostrarData = false,
  responsavel,
  suplente,
}: {
  item: AtividadeComPapel;
  mostrarData?: boolean;
  responsavel?: Pessoa;
  suplente?: Pessoa;
}) {
  const { atividade, papel } = item;

  const contexto =
    papel === "responsavel"
      ? suplente
        ? `Você é responsável · ${suplente.nome} é suplente`
        : "Você é responsável"
      : papel === "suplente"
        ? responsavel
          ? `Você é suplente · ${responsavel.nome} é responsável`
          : "Você é suplente"
        : responsavel
          ? `${responsavel.nome} é responsável`
          : "Sem responsável definido";

  return (
    <div className="flex items-start gap-3 border-b py-3 last:border-b-0">
      <span
        className={cn(
          "mt-1.5 size-2.5 shrink-0 rounded-full",
          papel === "responsavel" && "bg-primary",
          papel === "suplente" && "border-2 border-primary bg-background",
          papel === "nenhum" && "bg-border"
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-sm font-semibold",
              papel === "nenhum" && "font-medium text-muted-foreground"
            )}
          >
            {atividade.titulo}
          </span>
          <Badge variant="outline" className="text-[10px] uppercase">
            {TIPO_LABEL[atividade.tipo]}
          </Badge>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{contexto}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {mostrarData && (
          <span className="font-mono text-xs text-muted-foreground">
            {formatarDataCurta(atividade.data)}
          </span>
        )}
        <Badge variant={STATUS_VARIANT[atividade.status]}>{STATUS_LABEL[atividade.status]}</Badge>
      </div>
    </div>
  );
}
