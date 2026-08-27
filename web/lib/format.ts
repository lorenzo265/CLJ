import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const DIAS_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** "2026-08-28" -> "Sex, 28/08" */
export function formatarDataCurta(iso: string): string {
  const data = parseISO(iso);
  return `${DIAS_ABREV[data.getDay()]}, ${format(data, "dd/MM")}`;
}

/** "2026-08-28" -> "28 de agosto de 2026" */
export function formatarDataLonga(iso: string): string {
  return format(parseISO(iso), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}
