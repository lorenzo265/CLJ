# CLJ NSR — contrato de trabalho

Plataforma do Departamento Cultural da Paróquia Nossa Senhora do Rosário. Desenvolvida por **uma pessoa só**, em duas máquinas, com sessões de IA. Este arquivo existe para que toda sessão comece sabendo o que já foi decidido — e não reabra o que está fechado.

## Leia nesta ordem

1. [`docs/00-intuito.md`](docs/00-intuito.md) — **sempre primeiro.** Para que o projeto existe, quem sustenta, o prazo, os quatro trilhos, a definição de pronto.
2. [`docs/decisoes-produto.md`](docs/decisoes-produto.md) — o que o app é, para quem, quais telas.
3. [`docs/decisoes-design.md`](docs/decisoes-design.md) — identidade "O Fio", tokens, motion, princípios.
4. [`docs/decisoes-tecnicas.md`](docs/decisoes-tecnicas.md) — stack, dados, integrações, infra.
5. [`docs/sdd-ciclo-minimo.md`](docs/sdd-ciclo-minimo.md) — o desenho detalhado da fatia vertical, quadro a quadro.

`docs/pesquisa/` é evidência de apoio, não decisão. `docs/abertura-clj-nsr.html` é histórico.

## A regra que sustenta o resto

**Decisão nova entra no documento correspondente no mesmo commit que a implementa.** Sem exceção. Não há segundo desenvolvedor: os documentos são o único revisor que existe.

**Mockup e SDD são um par.** Toda alteração física num artboard de `design/ciclo-minimo/` muda a seção correspondente de `docs/sdd-ciclo-minimo.md`, no mesmo commit — e o contrário também vale. Um botão no mockup que o SDD não define é um bug; uma regra no SDD que nenhum quadro mostra ainda não foi desenhada. A tabela de rastreabilidade está no §1 do SDD.

## Decisões fechadas — não reabrir sem pedido explícito

- A régua do projeto é **ofício**, não velocidade (`00-intuito.md` §1).
- O **coordenador** é a audiência #1; o participante vem em seguida (`decisoes-produto.md` §4).
- WhatsApp: **entrega com um toque**, o app nunca manda sozinho no grupo (`decisoes-tecnicas.md` §4).
- Instagram: **o app não publica**; quem publica é o Meta Business Suite (`decisoes-tecnicas.md` §5).
- Backend: **Supabase** (`decisoes-tecnicas.md` §3).
- Motion: **GSAP**. Framer-motion foi removido — não sugerir de volta.
- Skeuomorfismo é **proibido** na identidade (`decisoes-design.md` §3b).

## Ao trabalhar no app

```bash
cd web && npm install && npm run dev   # http://localhost:3000
npm test        # vitest
npm run lint
```

- Nenhuma página importa de `lib/mock/` direto — sempre via `lib/data/`.
- Componente referencia **token de design por nome**, nunca hex solto.
- shadcn é base, sempre re-estilizado com nossos tokens — nunca o look default.
- Regra de negócio (quando cobrar, quando é aniversário) nasce em `lib/` com teste, isolada de data real.

## Design

`design/` é a cópia versionada do canvas publicado (18 artboards `.dc.html` + `canvas.json`). Edita-se preferencialmente no canvas (o botão Save publica para todos); depois sincroniza-se `design/` no repositório para manter o histórico.

## Fora de escopo

Ver `00-intuito.md` §7. Em resumo: nada de rede social, de app nativo, de multi-paróquia, e nenhuma tela que exija treinamento.
