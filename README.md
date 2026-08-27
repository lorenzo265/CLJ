# CLJ NSR — Plataforma do Departamento Cultural

Plataforma interna de gestão de pessoas do Departamento Cultural da **Paróquia Nossa Senhora do Rosário**: cadastro, escala, calendário e reuniões num só lugar — no lugar de planilha solta, grupo de WhatsApp disperso e memória do coordenador.

> **A escala se defende sozinha**: cada participante vê a própria responsabilidade sem esforço, e o coordenador para de ser o lembrete ambulante do departamento.

## Estrutura do repositório

| Pasta | O que é |
|---|---|
| `design/` | Fonte da verdade do design: 18 artboards `.dc.html` + `canvas.json` (layout) + o canvas montado `clj-nsr-estrutura-paginas.html`. Editável no canvas publicado (link abaixo) ou nos arquivos. |
| `docs/` | Decisões documentadas: [decisoes-design.md](docs/decisoes-design.md) (identidade, tokens, princípios) e [decisoes-estrutura.md](docs/decisoes-estrutura.md) (produto, papéis, telas). `abertura-clj-nsr.html` é o documento de abertura do projeto. |
| `web/` | O app — Next.js 16 (App Router) + TypeScript + Tailwind 4 + framer-motion. Todas as rotas e telas já existem com **dados mock** (`lib/mock/`); falta backend, autenticação e a aplicação da identidade "O Fio" na UI. |

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
3. Toda decisão nova de design ou estrutura entra em `docs/` — os dois arquivos de decisões são o contrato entre as máquinas (e entre sessões de trabalho com IA).
