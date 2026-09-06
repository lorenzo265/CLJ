-- CLJ NSR — schema. Ver docs/sdd-implementacao.md §3.
-- Idempotente: roda inteiro a cada boot. Alterar aqui é a migração.

CREATE TABLE IF NOT EXISTS pessoas (
  id                TEXT PRIMARY KEY,
  nome              TEXT NOT NULL,
  contato           TEXT NOT NULL DEFAULT '',
  email             TEXT NOT NULL,
  departamento_id   TEXT NOT NULL,
  papel_sistema     TEXT NOT NULL CHECK (papel_sistema IN ('coordenador', 'participante')),
  -- NULL enquanto a pessoa foi convidada mas ainda não definiu senha.
  senha_hash        TEXT,
  -- Conjuntos pequenos e fechados: CSV é honesto aqui, não vale tabela de junção.
  dias              TEXT NOT NULL DEFAULT '',
  periodos          TEXT NOT NULL DEFAULT '',
  cadastro_completo INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  criado_em         TEXT NOT NULL
);
-- E-mail é a identidade no login: único, sem diferenciar maiúsculas.
CREATE UNIQUE INDEX IF NOT EXISTS idx_pessoas_email ON pessoas (lower(email));

CREATE TABLE IF NOT EXISTS funcoes (
  id              TEXT PRIMARY KEY,
  departamento_id TEXT NOT NULL,
  nome            TEXT NOT NULL,
  descricao       TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS pessoa_funcoes (
  pessoa_id TEXT NOT NULL REFERENCES pessoas (id) ON DELETE CASCADE,
  funcao_id TEXT NOT NULL REFERENCES funcoes (id) ON DELETE CASCADE,
  PRIMARY KEY (pessoa_id, funcao_id)
);

CREATE TABLE IF NOT EXISTS atividades (
  id              TEXT PRIMARY KEY,
  departamento_id TEXT NOT NULL,
  tipo            TEXT NOT NULL CHECK (tipo IN ('post', 'tarefa', 'evento', 'reuniao')),
  titulo          TEXT NOT NULL,
  funcao_id       TEXT REFERENCES funcoes (id) ON DELETE SET NULL,
  data            TEXT NOT NULL,
  hora            TEXT,
  -- NULL = furo. O painel do coordenador conta exatamente estes.
  responsavel_id  TEXT REFERENCES pessoas (id) ON DELETE SET NULL,
  suplente_id     TEXT REFERENCES pessoas (id) ON DELETE SET NULL,
  status          TEXT NOT NULL CHECK (
                    status IN ('ideia', 'rascunho', 'agendado', 'publicado', 'concluido')
                  ),
  link_midia      TEXT
);
CREATE INDEX IF NOT EXISTS idx_atividades_dep_data ON atividades (departamento_id, data);

-- Extensão 1:1 de uma atividade do tipo 'reuniao'. Pauta e decisões são listas ordenadas
-- sempre lidas e escritas inteiras — JSON evita uma tabela só para guardar posição.
CREATE TABLE IF NOT EXISTS reunioes (
  atividade_id TEXT PRIMARY KEY REFERENCES atividades (id) ON DELETE CASCADE,
  pauta        TEXT NOT NULL DEFAULT '[]',
  decisoes     TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS reuniao_presentes (
  atividade_id TEXT NOT NULL REFERENCES atividades (id) ON DELETE CASCADE,
  pessoa_id    TEXT NOT NULL REFERENCES pessoas (id) ON DELETE CASCADE,
  PRIMARY KEY (atividade_id, pessoa_id)
);

CREATE TABLE IF NOT EXISTS reuniao_followup (
  id             TEXT PRIMARY KEY,
  atividade_id   TEXT NOT NULL REFERENCES atividades (id) ON DELETE CASCADE,
  acao           TEXT NOT NULL,
  responsavel_id TEXT REFERENCES pessoas (id) ON DELETE SET NULL,
  prazo          TEXT NOT NULL DEFAULT '',
  ordem          INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_followup_atividade ON reuniao_followup (atividade_id);

-- "Toda troca de responsável fica registrada na plataforma, nunca em conversa privada"
-- (decisoes-estrutura.md §5). Append-only: nada aqui é editado nem apagado.
CREATE TABLE IF NOT EXISTS trocas (
  id             TEXT PRIMARY KEY,
  atividade_id   TEXT NOT NULL REFERENCES atividades (id) ON DELETE CASCADE,
  papel          TEXT NOT NULL CHECK (papel IN ('responsavel', 'suplente')),
  de_pessoa_id   TEXT REFERENCES pessoas (id) ON DELETE SET NULL,
  para_pessoa_id TEXT REFERENCES pessoas (id) ON DELETE SET NULL,
  motivo         TEXT NOT NULL DEFAULT '',
  feita_por      TEXT NOT NULL,
  criado_em      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trocas_atividade ON trocas (atividade_id, criado_em);

CREATE TABLE IF NOT EXISTS convites (
  token           TEXT PRIMARY KEY,
  email           TEXT NOT NULL,
  nome            TEXT NOT NULL DEFAULT '',
  papel_sistema   TEXT NOT NULL CHECK (papel_sistema IN ('coordenador', 'participante')),
  departamento_id TEXT NOT NULL,
  criado_por      TEXT NOT NULL,
  criado_em       TEXT NOT NULL,
  expira_em       TEXT NOT NULL,
  usado_em        TEXT
);

-- Sessão em tabela (e não JWT) para que sair da conta revogue de verdade.
CREATE TABLE IF NOT EXISTS sessoes (
  token     TEXT PRIMARY KEY,
  pessoa_id TEXT NOT NULL REFERENCES pessoas (id) ON DELETE CASCADE,
  criado_em TEXT NOT NULL,
  expira_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessoes_pessoa ON sessoes (pessoa_id);
