"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { alternarPresenca } from "@/lib/actions/reunioes";
import type { EstadoForm } from "@/lib/actions/auth";

const INICIAL: EstadoForm = {};

/**
 * A pessoa confirma a própria presença na reunião — e desfaz com o mesmo toque.
 *
 * O estado de verdade é o do servidor (`confirmado`, que volta pela revalidação): o botão
 * não guarda cópia local, então o rótulo nunca diverge do que está gravado.
 */
export function BotaoPresenca({
  atividadeId,
  pessoaId,
  confirmado,
}: {
  atividadeId: string;
  pessoaId: string;
  confirmado: boolean;
}) {
  const [estado, acao, pendente] = useActionState(alternarPresenca, INICIAL);

  // useActionState devolve um objeto novo a cada envio — comparar por identidade avisa
  // uma vez por resposta, sem re-disparar quando só o `confirmado` do servidor muda.
  const avisado = useRef<EstadoForm>(INICIAL);
  useEffect(() => {
    if (estado === avisado.current) return;
    avisado.current = estado;
    if (estado.ok) {
      toast.success(confirmado ? "Presença confirmada." : "Presença desfeita.");
    }
  }, [estado, confirmado]);

  return (
    <form action={acao} className="flex flex-col items-start gap-1.5">
      <input type="hidden" name="atividadeId" value={atividadeId} />
      <input type="hidden" name="pessoaId" value={pessoaId} />
      {/* O botão é um alternador: manda sempre o oposto do que está valendo agora. */}
      <input type="hidden" name="presente" value={confirmado ? "0" : "1"} />

      <Button
        type="submit"
        variant={confirmado ? "outline" : "default"}
        disabled={pendente}
        className="w-full sm:w-auto"
      >
        {pendente
          ? "Salvando…"
          : confirmado
            ? "Você confirmou presença ✓"
            : "Confirmar presença"}
      </Button>

      {confirmado && !estado.erro && (
        <span className="text-[12px] text-muted-foreground">Pode desfazer quando precisar.</span>
      )}

      {estado.erro && (
        <p role="alert" className="rounded-lg bg-crit-soft px-3 py-2 text-[13px] text-crit">
          {estado.erro}
        </p>
      )}
    </form>
  );
}
