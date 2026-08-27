import { addDays, addMonths, format, startOfMonth, startOfWeek } from "date-fns";

export interface DiaGrade {
  data: string; // yyyy-MM-dd
  diaDoMes: number;
  ehDoMesAtual: boolean;
  ehHoje: boolean;
}

/** Grade de 6 semanas (42 dias, domingo a sábado) cobrindo o mês de `referencia`. */
export function getGradeDoMes(referencia: Date): DiaGrade[] {
  const inicioGrade = startOfWeek(startOfMonth(referencia));
  const hoje = format(new Date(), "yyyy-MM-dd");

  return Array.from({ length: 42 }, (_, i) => {
    const dia = addDays(inicioGrade, i);
    const iso = format(dia, "yyyy-MM-dd");
    return {
      data: iso,
      diaDoMes: dia.getDate(),
      ehDoMesAtual: dia.getMonth() === referencia.getMonth(),
      ehHoje: iso === hoje,
    };
  });
}

export function mesAnterior(referencia: Date): Date {
  return addMonths(referencia, -1);
}

export function mesSeguinte(referencia: Date): Date {
  return addMonths(referencia, 1);
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function formatarMesAno(referencia: Date): string {
  return `${MESES[referencia.getMonth()]} ${referencia.getFullYear()}`;
}

/** "2026-08" -> primeiro dia daquele mês. Cai no mês atual se ausente/inválido. */
export function parseReferenciaMes(valor: string | undefined): Date {
  if (valor && /^\d{4}-\d{2}$/.test(valor)) {
    const [ano, mes] = valor.split("-").map(Number);
    return new Date(ano, mes - 1, 1);
  }
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), 1);
}

export function formatarReferenciaMes(referencia: Date): string {
  return format(referencia, "yyyy-MM");
}
