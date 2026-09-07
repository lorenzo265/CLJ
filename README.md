# CLJ NSR — Plataforma do Departamento Cultural

Plataforma interna de gestão de pessoas do Departamento Cultural da **Paróquia Nossa Senhora do Rosário**: cadastro, escala, calendário e reuniões num só lugar — no lugar de planilha solta, grupo de WhatsApp disperso e memória do coordenador.

> **A escala se defende sozinha**: cada participante vê a própria responsabilidade sem esforço, e o coordenador para de ser o lembrete ambulante do departamento.

## Estrutura do repositório

| Pasta | O que é |
|---|---|
| `design/` | Fonte da verdade do design: 21 artboards `.dc.html` + `canvas.json` (layout) + o canvas montado `clj-nsr-estrutura-paginas.html`. Editável no canvas publicado (link abaixo) ou nos arquivos. |
| `docs/` | **[sdd-projeto-completo.md](docs/sdd-projeto-completo.md)** é o SDD de ponta a ponta: visão, frontend, backend, design, as Fases 0–7 (feitas) e o caminho das Fases 8–13 até o fim do mandato. Registros que ele consolida: [decisoes-design.md](docs/decisoes-design.md) (identidade, tokens, princípios), [decisoes-estrutura.md](docs/decisoes-estrutura.md) (produto, papéis, telas) e [sdd-implementacao.md](docs/sdd-implementacao.md) (o plano das sete fases de construção). [pesquisa-identidade-visual.md](docs/pesquisa-identidade-visual.md) é a pesquisa que rege a identidade v2 (ciência, método dos estúdios, briefing, fontes de estilo, entregáveis). `abertura-clj-nsr.html` é o documento de abertura do projeto. |
| `web/` | O app — Next.js 16 (App Router) + TypeScript + Tailwind 4 + SQLite + GSAP. Todas as telas existem sobre **dados reais e persistentes**, com login por convite e a identidade "O Fio" aplicada. Como rodar e como está organizado: [web/README.md](web/README.md). |

## Links vivos

- **Canvas de design** (todas as telas): https://claude.ai/code/artifact/14a752be-4f96-4078-9f34-928991f4f24a
- **Briefing de design** (conceito, princípios, pesquisa): https://claude.ai/code/artifact/00c156b4-8382-460b-96d4-1ac2a8df0f96
- **Documento de abertura**: https://claude.ai/code/artifact/a2733bb6-d7fc-45b1-a749-74b41f2e80bb
- **Pesquisa de identidade visual (entrega 1 da v2)** (leitura): https://claude.ai/code/artifact/b5a9460f-9d6f-4e44-8206-019329565f4a — fonte: [docs/pesquisa-identidade-visual.md](docs/pesquisa-identidade-visual.md)
- **Briefing da identidade v2 (entrega 2)** (leitura): https://claude.ai/code/artifact/616d85b5-4a11-406c-8dd2-a44c38c95787 — fonte: [docs/briefing-identidade-v2.md](docs/briefing-identidade-v2.md) — as perguntas que decidem a identidade, com a decisão que cada resposta muda
- **SDD do projeto completo** (leitura): https://claude.ai/code/artifact/21ee0664-b983-4d4a-a017-a316415aceb2 — fonte: [docs/sdd-projeto-completo.md](docs/sdd-projeto-completo.md)

## A identidade em uma linha

**"O Fio"** — a plataforma é o terço do Departamento Cultural: cada responsabilidade é uma conta no fio, no azul da paróquia (`#253990`) sobre papel e tinta bem tipografados; a sua próxima conta é sempre a manchete. Detalhes completos em [docs/decisoes-design.md](docs/decisoes-design.md).

## Rodando o app

```bash
cd web
npm install
npm run dev
```

O banco local nasce sozinho no primeiro boot, com o departamento de demonstração.
Entre como coordenação em `maria@clj-nsr.local` / `terco2026`, ou como participante em
`ana@clj-nsr.local` / `terco2026`.

Testes: `npm test` · Lint: `npm run lint` · Recomeçar o banco: `npm run db:reset`

## Trabalhando em duas máquinas

1. Clone o repositório e rode `npm install` dentro de `web/` (o `node_modules/` não é versionado).
2. O design é editado preferencialmente no **canvas publicado** (link acima — botão Save publica para todos); os arquivos em `design/` são a cópia versionada. Depois de uma rodada de edições no canvas, sincronize os arquivos de `design/` no repositório para manter o histórico.
   O banco (`web/data/`) é local de cada máquina e não atravessa o Git — o que atravessa é código e decisão.
3. Toda decisão nova de design ou estrutura entra em `docs/` — os arquivos de decisões (e o plano de implementação) são o contrato entre as máquinas, e entre sessões de trabalho com IA.
