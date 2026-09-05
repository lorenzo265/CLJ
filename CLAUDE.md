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
- Instagram: **o app não publica**; quem publica é o Meta Business Suite (`decisoes-tecnicas.md` §5). Nada de agente controlando a máquina para postar — 30 a 60x mais risco de suspensão da conta da paróquia (`decisoes-tecnicas.md` §8.2).
- Backend: **Supabase** (`decisoes-tecnicas.md` §3).
- Plataforma: **Expo / React Native** (`mobile/`), decidido em 2026-09-05 — reverte "app nativo fora de escopo" e a stack Next.js. O domínio inteiro foi portado sem edição para `mobile/src/lib/`; `web/` fica como referência.
- Motion: **Reanimated** (vem com o Expo). GSAP e framer-motion saíram junto com o app web.
- Skeuomorfismo é **proibido** na identidade (`decisoes-design.md` §3b).
- Identidade: **o app veste o tempo litúrgico** (`decisoes-design.md` §9c). Papel neutro; o tempo aparece na rubrica, na régua, na capitular do dia, nas hairlines e no fundo do post. O azul `#253990` nunca muda — é a cor da ação. **O tempo é da Igreja, a ação é sua.**
- Gramática: Apple + Notion (`decisoes-design.md` §9b) — nenhuma caixa, fonte do sistema (SF Pro + New York, nada importado), mídia protagonista, ação como texto azul.
- Distinção que vale: **esta paróquia** está fora da identidade (só as cores); **a Igreja** como tradição visual está dentro.
- A marca ainda é o último passo, extraída da interface depois que ela fechar.

## Ao trabalhar no app

```bash
cd mobile && npm install
npm run ios      # ou: npm run android · npm run web
npm test         # vitest, sobre o domínio em src/lib/
```

- Nenhuma tela importa de `src/lib/mock/` direto — sempre via `src/lib/data/`.
- Componente referencia **variável de cor por nome**, nunca hex solto.
- Regra de negócio (quando cobrar, quando é aniversário) nasce em `src/lib/` com teste, isolada de data real.
- Navegação: **native tabs** do Expo Router com SF Symbols e Liquid Glass — não recriar barra em JS.
- `web/` é referência histórica. Não desenvolver lá.

## Design

**Figma:** [CLJ NSR — Sistema](https://www.figma.com/design/CaCmCwkjD34BoLjEfoRxLP) — três páginas: *Fundações* (variáveis e a legenda), *Barras* (navegação) e *Telas* (as cinco telas da Fase A). É a superfície de desenho corrente. Atenção: a tipografia de lá é substituta (Inter/Newsreader); no código vale a fonte do sistema. Ver `decisoes-design.md` §9d.

`design/` é a cópia versionada do canvas publicado (18 artboards `.dc.html` + `canvas.json`). Edita-se preferencialmente no canvas (o botão Save publica para todos); depois sincroniza-se `design/` no repositório para manter o histórico.

## Fora de escopo

Ver `00-intuito.md` §7. Em resumo: nada de rede social, de multi-paróquia, de publicação automática em Instagram ou grupo, e nenhuma tela que exija treinamento.
