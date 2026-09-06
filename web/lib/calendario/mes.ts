import { addDays, addMonths, format, startOfMonth, startOfWeek } from "date-fns";

/*
  Domínio puro do calendário: não conhece banco nem React (docs/sdd-implementacao.md §2,
  regra 4). "Hoje" entra por parâmetro em toda função que precisa dele — é o que torna a
  grade testável sem congelar o relógio do processo.
*/

export interface DiaGrade {
  data: string; // yyyy-MM-dd
  diaDoMes: number;
  ehDoMesAtual: boolean;
  ehHoje: boolean;
}

/** Grade de 6 semanas (42 dias, domingo a sábado) cobrindo o mês de `referencia`. */
export function getGradeDoMes(referencia: Date, hoje: Date = new Date()): DiaGrade[] {
  const inicioGrade = startOfWeek(startOfMonth(referencia));
  // Altura fixa em 42 dias: o mês trocando não faz a página pular sob o dedo.
  const hojeISO = format(hoje, "yyyy-MM-dd");

  return Array.from({ length: 42 }, (_, i) => {
    const dia = addDays(inicioGrade, i);
    const iso = format(dia, "yyyy-MM-dd");
    return {
      data: iso,
      diaDoMes: dia.getDate(),
      ehDoMesAtual: dia.getMonth() === referencia.getMonth(),
      ehHoje: iso === hojeISO,
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

const MESES_CURTOS = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

export function formatarMesAno(referencia: Date): string {
  return `${MESES[referencia.getMonth()]} ${referencia.getFullYear()}`;
}

/** "AGO 2026" — a versão do celular, onde o cabeçalho divide a linha com dois botões. */
export function formatarMesAnoCurto(referencia: Date): string {
  return `${MESES_CURTOS[referencia.getMonth()]} ${referencia.getFullYear()}`;
}

/** "2026-08" -> primeiro dia daquele mês. Cai no mês de `hoje` se ausente/inválido. */
export function parseReferenciaMes(valor: string | undefined, hoje: Date = new Date()): Date {
  if (valor && /^\d{4}-\d{2}$/.test(valor)) {
    const [ano, mes] = valor.split("-").map(Number);
    // Mês fora de 1..12 vira data inválida no Date — a querystring é entrada de usuário.
    if (mes >= 1 && mes <= 12) return new Date(ano, mes - 1, 1);
  }
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

export function formatarReferenciaMes(referencia: Date): string {
  return format(referencia, "yyyy-MM");
}
