# CLJ NSR — Plataforma do Departamento Cultural

Mesa de comando do Departamento Cultural da **Paróquia Nossa Senhora do Rosário**: organiza quem faz o quê, ajuda a produzir os posts em lote, cobra sozinha o que precisa sair e entrega o conteúdo do dia no grupo com um toque — no lugar de planilha solta, grupo de WhatsApp disperso e memória do coordenador.

> **A escala se defende sozinha**: cada participante vê a própria responsabilidade sem esforço, e o coordenador deixa de ser o lembrete ambulante do departamento.

Para que este projeto existe, quem o sustenta e o que conta como pronto estão em **[docs/00-intuito.md](docs/00-intuito.md)** — leia antes de qualquer outra coisa.

## Estrutura do repositório

| Pasta | O que é |
|---|---|
| `docs/` | As decisões, em quatro documentos: [00-intuito.md](docs/00-intuito.md) (o topo — propósito, prazo, trilhos, definição de pronto), [decisoes-produto.md](docs/decisoes-produto.md) (o que o app é, para quem, telas), [decisoes-design.md](docs/decisoes-design.md) (identidade, tokens, princípios) e [decisoes-tecnicas.md](docs/decisoes-tecnicas.md) (stack, dados, integrações). `pesquisa/` é evidência de apoio; `abertura-clj-nsr.html` é histórico. |
| `design/` | Fonte da verdade do design: 18 artboards `.dc.html` + `canvas.json` (layout) + o canvas montado `clj-nsr-estrutura-paginas.html`. Editável no canvas publicado (link abaixo) ou nos arquivos. |
| `web/` | O app — Next.js 16 (App Router) + TypeScript + Tailwind 4 + GSAP. Todas as rotas e telas já existem com **dados mock** (`lib/mock/`); falta backend, autenticação, as telas de produção/disparo/cobrança e a aplicação da identidade "O Fio" na UI. |

## Onde o projeto está

Todas as telas de organização estão desenhadas e mockadas. O que falta para a v1 é **a fatia vertical**: convite → escala real → cobrança automática → um toque para o grupo, com dados reais no Supabase e no ar. Critério de pronto e data de go/no-go em [00-intuito.md](docs/00-intuito.md) §5 e §6.

## Links vivos

- **Canvas de design** (todas as telas): https://claude.ai/code/artifact/14a752be-4f96-4078-9f34-928991f4f24a
- **Briefing de design** (conceito, princípios, pesquisa): https://claude.ai/code/artifact/00c156b4-8382-460b-96d4-1ac2a8df0f96
- **Documento de abertura**: https://claude.ai/code/artifact/a2733bb6-d7fc-45b1-a749-74b41f2e80bb

## A identidade em uma linha

**"O Fio"** — a plataforma é o terço do Departamento Cultural: cada responsabilidade é uma conta no fio, no azul da paróquia (`#253990`) sobre papel e tinta bem tipografados; a sua próxima conta é sempre a manchete. Detalhes completos em [docs/decisoes-design.md](docs/decisoes-design.md).

## Rodando o app

```bash
cd web
npm install
npm run dev
```

Testes: `npm test` · Lint: `npm run lint`

## Trabalhando em duas máquinas

1. Clone o repositório e rode `npm install` dentro de `web/` (o `node_modules/` não é versionado).
2. O design é editado preferencialmente no **canvas publicado** (link acima — botão Save publica para todos); os arquivos em `design/` são a cópia versionada. Depois de uma rodada de edições no canvas, sincronize os arquivos de `design/` no repositório para manter o histórico.
3. Toda decisão nova entra no documento correspondente em `docs/` **no mesmo commit que a implementa** — é o contrato entre as máquinas e entre sessões de trabalho com IA. O [CLAUDE.md](CLAUDE.md) na raiz resume esse contrato para quem (ou o que) abrir o repositório.
