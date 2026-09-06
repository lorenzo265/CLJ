import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const DIAS_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_NOME = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];

/** "2026-08-28" -> "Sex, 28/08" */
export function formatarDataCurta(iso: string): string {
  const data = parseISO(iso);
  return `${DIAS_ABREV[data.getDay()]}, ${format(data, "dd/MM")}`;
}

/** "2026-08-28" -> "SEX 28/08" — o rótulo em mono das listas e do calendário. */
export function formatarDataKicker(iso: string): string {
  const data = parseISO(iso);
  return `${DIAS_ABREV[data.getDay()].toUpperCase()} ${format(data, "dd/MM")}`;
}

/** "2026-08-28" -> "28 de agosto de 2026" */
export function formatarDataLonga(iso: string): string {
  return format(parseISO(iso), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/** "2026-08-28" -> "28 de agosto" */
export function formatarDiaEMes(iso: string): string {
  return format(parseISO(iso), "d 'de' MMMM", { locale: ptBR });
}

/**
 * A data como uma pessoa fala: "hoje", "amanhã", "na sexta", "em 28/08".
 * Dentro da semana o nome do dia basta; depois disso, a data resolve.
 */
export function formatarQuando(iso: string, hoje: Date = new Date()): string {
  const dias = differenceInCalendarDays(parseISO(iso), hoje);
  if (dias === 0) return "hoje";
  if (dias === 1) return "amanhã";
  if (dias === -1) return "ontem";
  if (dias > 1 && dias <= 6) return `na ${DIAS_NOME[parseISO(iso).getDay()]}`;
  if (dias < -1 && dias >= -6) return `${DIAS_NOME[parseISO(iso).getDay()]} passada`;
  return `em ${format(parseISO(iso), "dd/MM")}`;
}

/** "07:00" -> "7h" · "19:30" -> "19h30". Zero à esquerda não se fala. */
export function formatarHora(hora: string | null): string {
  if (!hora) return "";
  const [h, m] = hora.split(":");
  const hh = String(Number(h));
  return m === "00" ? `${hh}h` : `${hh}h${m}`;
}

/**
 * "Ana Paula Ribeiro" -> "Ana P." — como o departamento se chama entre si.
 * O resultado já termina em ponto quando abrevia: quem monta frase com ele não acrescenta
 * outro, senão sai "Ana P..".
 */
export function nomeCurto(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[1][0].toUpperCase()}.`;
}

/** "Maria Aparecida" -> "MA". O avatar do app é tipográfico, não tem foto. */
export function iniciaisDe(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0] ?? "")
    .join("")
    .toUpperCase();
}
