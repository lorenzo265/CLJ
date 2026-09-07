import { cn } from "@/lib/utils";
import type { CargaDoMes } from "@/lib/calendario/carga";

/*
  A faixa que a grade sozinha nunca deu: dá para ver que o mês está cheio, mas não que ele
  está cheio PARA UMA PESSOA SÓ. É o mesmo desequilíbrio que o quadro por pessoa mostra, na
  janela em que ele importa mais — o mês que está sendo montado.

  Aviso é serviço, não cobrança (decisoes-design.md §7.4): a faixa diz o tamanho da carga,
  não quem está devendo.
*/

export function CargaDoMesFaixa({ carga }: { carga: CargaDoMes }) {
  if (carga.total === 0) return null;

  const maior = Math.max(1, ...carga.porPessoa.map((p) => p.total), carga.furos);

  return (
    <section
      aria-labelledby="titulo-carga"
      className="flex flex-col gap-2.5 rounded-2xl border border-border bg-panel p-4"
    >
      <h2 id="titulo-carga" className="kicker">
        Como o mês está dividido
      </h2>

      <ul className="flex flex-col gap-1.5">
        {carga.furos > 0 && (
          <Linha
            nome="Sem responsável"
            total={carga.furos}
            proporcao={carga.furos / maior}
            furo
          />
        )}
        {carga.porPessoa.map((p) => (
          <Linha
            key={p.pessoaId}
            nome={p.nome}
            total={p.total}
            proporcao={p.total / maior}
          />
        ))}
      </ul>

      {carga.porPessoa.length === 0 && carga.furos > 0 && (
        <p className="text-[12.5px] text-muted-foreground">
          Nenhuma das {carga.total} atividades deste mês tem responsável ainda.
        </p>
      )}
    </section>
  );
}

function Linha({
  nome,
  total,
  proporcao,
  furo = false,
}: {
  nome: string;
  total: number;
  proporcao: number;
  furo?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          "w-28 shrink-0 truncate text-[12.5px] sm:w-36",
          furo ? "font-semibold text-warn" : "text-foreground",
        )}
      >
        {nome}
      </span>
      {/* A barra é decorativa: o número ao lado já carrega o dado. */}
      <span className="h-2 min-w-0 flex-1 rounded-full bg-border-soft" aria-hidden>
        <span
          className={cn("block h-2 rounded-full", furo ? "bg-warn" : "bg-primary")}
          style={{ width: `${Math.max(proporcao * 100, 3)}%` }}
        />
      </span>
      <span className="w-6 shrink-0 text-right font-mono text-[11.5px] tabular-nums text-muted-foreground">
        {total}
      </span>
    </li>
  );
}
