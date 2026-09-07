"use server";

import { format } from "date-fns";
import { exigirCoordenadorEmAction } from "@/lib/auth/sessao";
import { revalidarEscala } from "@/lib/actions/revalidar";
import { dataISO, dias, hora, lista, texto, textoOuNulo, tipoAtividade } from "@/lib/actions/comum";
import { MAX_DATAS_DA_SERIE, datasDaSerie, distribuirRodizio } from "@/lib/escala/serie";
import * as repo from "@/lib/repos/series";
import { garantirReuniao } from "@/lib/repos/reunioes";
import { buscarFuncao } from "@/lib/repos/funcoes";
import { buscarPessoa } from "@/lib/repos/pessoas";
import type { EstadoForm } from "@/lib/actions/auth";
import type { CandidatoRodizio } from "@/lib/escala/serie";
import type { Pessoa } from "@/lib/types";

/*
  A divisão é sempre recalculada AQUI, no servidor, pela mesma função pura que desenhou a
  prévia. O navegador manda a regra e o grupo — nunca a escala pronta. Se mandasse, quem
  soubesse forjar um POST escolheria a dedo quem faz o quê.
*/

const hojeISO = () => format(new Date(), "yyyy-MM-dd");

/** O grupo do rodízio: só gente ativa e do departamento, na ordem em que a tela mandou. */
function montarGrupo(
  ids: string[],
  departamentoId: string,
  respeitarDisponibilidade: boolean,
): { grupo: CandidatoRodizio[]; pessoas: Pessoa[] } {
  const vistos = new Set<string>();
  const pessoas: Pessoa[] = [];

  for (const id of ids) {
    if (vistos.has(id)) continue;
    vistos.add(id);
    const p = buscarPessoa(id);
    if (p && p.departamentoId === departamentoId && p.status === "ativo") pessoas.push(p);
  }

  return {
    pessoas,
    grupo: pessoas.map((p) => ({
      id: p.id,
      dias: respeitarDisponibilidade ? p.disponibilidade.dias : [],
    })),
  };
}

export async function criarSerie(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();
  const departamentoId = coordenador.departamentoId;

  const titulo = texto(formData, "titulo", 160);
  if (!titulo) return { erro: "A série precisa de um título." };

  const diasDaSemana = dias(formData);
  if (diasDaSemana.length === 0) {
    return { erro: "Escolha ao menos um dia da semana em que a série acontece." };
  }

  const inicio = dataISO(formData, "inicio");
  const fim = dataISO(formData, "fim");
  if (!inicio || !fim) return { erro: "Escolha o começo e o fim da série." };
  if (fim < inicio) return { erro: "O fim da série não pode vir antes do começo." };

  const datas = datasDaSerie({ dias: diasDaSemana, inicio, fim });
  if (datas.length === 0) {
    return { erro: "Nenhuma data cai nesses dias da semana dentro do período escolhido." };
  }
  if (datas.length >= MAX_DATAS_DA_SERIE) {
    return {
      erro: `Isso geraria ${MAX_DATAS_DA_SERIE} atividades ou mais. Encurte o período — dá para criar outra série depois.`,
    };
  }

  const funcaoIdBruto = textoOuNulo(formData, "funcaoId", 64);
  const funcao = funcaoIdBruto ? buscarFuncao(funcaoIdBruto) : undefined;

  const { grupo } = montarGrupo(
    lista(formData, "grupo"),
    departamentoId,
    texto(formData, "respeitarDisponibilidade") === "sim",
  );

  const alocacoes = distribuirRodizio(datas, grupo);
  const tipo = tipoAtividade(formData);

  const { serieId, criadas } = repo.criarSerie(
    departamentoId,
    {
      titulo,
      tipo,
      funcaoId: funcao && funcao.departamentoId === departamentoId ? funcao.id : null,
      hora: hora(formData),
      dias: diasDaSemana,
      inicio,
      fim,
    },
    alocacoes.map((a) => ({ data: a.data, responsavelId: a.pessoaId, suplenteId: null })),
    coordenador.id,
  );

  if (tipo === "reuniao") {
    for (const a of repo.atividadesRemanejaveis(serieId, inicio)) garantirReuniao(a.id);
  }

  revalidarEscala();
  return { ok: true, mensagem: `${criadas} atividades criadas.` };
}

/**
 * Redistribui o que ainda está por vir. Só mexe de hoje em diante e nunca no que já foi
 * publicado; a carga já cumprida entra como peso, para que quem vinha carregando mais não
 * volte à fila do zero.
 */
export async function redistribuirSerie(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();

  const serieId = texto(formData, "serieId", 64);
  const serie = repo.buscarSerie(serieId);
  if (!serie || serie.departamentoId !== coordenador.departamentoId) {
    return { erro: "Série não encontrada." };
  }

  const aPartirDe = hojeISO();
  const pendentes = repo.atividadesRemanejaveis(serieId, aPartirDe);
  if (pendentes.length === 0) {
    return { erro: "Não há nada por vir nessa série — tudo já passou ou já foi publicado." };
  }

  const { grupo } = montarGrupo(
    lista(formData, "grupo"),
    coordenador.departamentoId,
    texto(formData, "respeitarDisponibilidade") === "sim",
  );

  const alocacoes = distribuirRodizio(
    pendentes.map((a) => a.data),
    grupo,
    repo.cargaFixadaDaSerie(serieId, aPartirDe),
  );

  const mudadas = repo.aplicarRedistribuicao(
    pendentes.map((a, i) => ({
      id: a.id,
      deId: a.responsavelId,
      paraId: alocacoes[i].pessoaId,
    })),
    {
      feitaPor: coordenador.id,
      motivo: texto(formData, "motivo", 200) || `Redistribuição da série "${serie.titulo}"`,
    },
  );

  revalidarEscala();
  return {
    ok: true,
    mensagem:
      mudadas === 0
        ? "A divisão já era essa — nada mudou."
        : `${mudadas} de ${pendentes.length} atividades mudaram de mãos.`,
  };
}

/** Desfaz a série daqui para a frente. O que já foi publicado fica, virando avulso. */
export async function excluirSerie(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();

  const serieId = texto(formData, "serieId", 64);
  const serie = repo.buscarSerie(serieId);
  if (!serie || serie.departamentoId !== coordenador.departamentoId) {
    return { erro: "Série não encontrada." };
  }

  const apagadas = repo.excluirSerie(serieId, hojeISO());
  revalidarEscala();
  return {
    ok: true,
    mensagem: `Série desfeita. ${apagadas} atividades por vir foram apagadas; o que já saiu no ar continua no histórico.`,
  };
}
