# Decisões de Design — CLJ NSR

Registro vivo das decisões de identidade visual e UX. Atualizado em **2026-09-05**.
Fonte expandida: [Briefing de Design](https://claude.ai/code/artifact/00c156b4-8382-460b-96d4-1ac2a8df0f96) · Telas: [Canvas](https://claude.ai/code/artifact/14a752be-4f96-4078-9f34-928991f4f24a)

## 1. O conceito nomeado: "O Fio"

> A plataforma é o **terço** do Departamento Cultural: cada responsabilidade é uma conta no fio, no azul de Nossa Senhora sobre papel e tinta bem tipografados — você passa as contas da sua semana, e a sua próxima conta é sempre a manchete.

O símbolo não foi inventado: NSR **é** Nossa Senhora do Rosário, o post mais recorrente é o Terço Diário, e um terço é estruturalmente o que uma escala é — contas em sequência com um compromisso por dia.

**Aplicações do terço (estrutura, nunca enfeite):**
- **Menu lateral = o fio.** O cordão sobe da cruz (a marca) e atravessa a navegação; cada item é uma conta do Pai-Nosso — esférica, com volume — que se enche de azul quando ativa. As três Ave-Marias separam "Meu espaço" de "Coordenação".
- **Semana = dezena.** As tarefas da semana são contas; concluir = "passar a conta" (ela se preenche). "Você está em dia ✓" = dezena completa.
- **Calendário:** dias com compromisso seu = conta azul preenchida; do departamento = conta neutra.
- **Cruz/medalha** ancora a marca — funciona minúscula (favicon, avatar de WhatsApp) e em uma cor só.

**Regra de reverência:** o terço é objeto de oração. A metáfora vive na estrutura (fio, contas, sequência), com sobriedade — nunca gamificação do sagrado nem imagem devocional como textura. Se um elemento usa o terço só para enfeitar, sai; se usa para organizar, fica. **Validar a aplicação com a coordenação e o pároco antes de lançar.**

## 2. Personalidade

Três adjetivos: **caloroso · caprichado · confiável**. Tendências (sliders): caloroso (não corporativo), sereno (não brincalhão), editorial (não techy), arejado (não denso), comunidade (não ferramenta fria).

## 3. Tokens de cor

Light (padrão). Dark mode existe derivado no doc de abertura — re-derivar por papel de cor, nunca inverter.

| Token | Hex | Papel |
|---|---|---|
| `--bg` | `#FAF7F2` | Papel — fundo de página, quente |
| `--panel` | `#FFFFFF` | Superfícies/cards |
| `--border` / `--border-soft` | `#E4DDD0` / `#EFEAE1` | Hairlines |
| `--text` | `#262320` | Tinta — texto principal |
| `--text-muted` / `--text-faint` | `#6E6862` / `#A9A199` | Secundário / terciário |
| `--accent` | **`#253990`** | **Azul oficial da paróquia** — única cor de destaque |
| `--accent-ink` | `#1A2A6C` | Azul para texto/hover |
| `--accent-soft` | `#E4E7F7` | Wash azul (fundos destacados) |
| `--accent-hi` | `#6C7CC9` | Brilho de gradiente (contas, cruz) |
| `--gold` / `--gold-ink` / `--gold-soft` | `#A9812F` / `#7A5D22` / `#F3E9D2` | **Reservado à celebração** (carimbo "Publicado", dezena completa, festas) — nunca como acento corriqueiro |
| `--ok` / `--warn` / `--info` / `--crit` | `#5C7A52` / `#B4682A` / `#5B7A96` / `#A6473C` | Semânticas (com washes) — status sempre com **cor + palavra**, nunca cor sozinha |

Regras: um destaque por tela; azul é marca-texto, não tinta de parede; contraste AA mínimo.

**Correção de contraste (2026-09-05, ao aplicar no app).** A régua do próprio doc é AA, e
seis valores do canvas reprovavam nas combinações em que o app realmente os usa. Medidos e
corrigidos:

| Token | Canvas | App | Por quê |
|---|---|---|---|
| `--text-muted` | `#6E6862` | **`#5A544E`** | abre espaço para o terciário sem colar nele |
| `--text-faint` | `#A9A199` | **`#756C64`** | **2.4:1** sobre o papel — reprova qualquer texto, e ele pinta kicker, data e rótulo de coluna |
| `--ok` | `#5C7A52` | **`#4D6A44`** | 4.0:1 sobre o próprio wash |
| `--warn` | `#B4682A` | **`#8D4E1A`** | 3.4:1 sobre o próprio wash |
| `--info` | `#5B7A96` | **`#4A6885`** | 4.1:1 sobre o próprio wash |

Os três níveis de texto ficam em 14.6 / 7.0 / 4.8 sobre o papel — todos AA e ainda
distinguíveis entre si. `--crit` já passava. **Os artboards do canvas ainda mostram os hex
antigos**: sincronizar é uma pendência da §10.

## 3b. Contas — tratamento visual (v2, flat)

Redesenhadas em 2026-08-27: a primeira versão (esferas com gradiente radial, brilho e sombra interna) lia "site anos 2000" — **skeuomorfismo é proibido** na identidade. A conta agora lê pela **geometria no fio**, não pela renderização 3D:

| Estado | Tratamento |
|---|---|
| Inativa | círculo 12px, fundo `--panel`, contorno 1.5px `--text-faint` |
| Ativa / sua | disco chapado `--accent` + **anel-auréola** de 3px em `--accent-soft` (`box-shadow: 0 0 0 3px`) |
| Suplência | anel 2px `--accent`, sem preenchimento |
| Ave-Marias (separador) | pontos 5px `--text-faint` a 60% |

O anel-auréola é a referência mariana embutida no estado ativo. Fio: hairline sólida `--border` (sem gradiente). A cruz interina do cabeçalho saiu: o lugar dela é da marca A (§9).

## 4. Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Manchetes / títulos de página | **Source Serif 4** (600/700) | Títulos 19px+, manchete da tela Hoje, números grandes do Painel |
| Corpo / UI | **Public Sans** (400–800) | Tudo o mais; base 13.5–16px |
| Kickers, datas, códigos | **IBM Plex Mono** (500/600) | Micro-rótulos uppercase (letter-spacing 0.07–0.09em), datas com `tabular-nums` |

Nunca `system-ui`/Inter/Roboto como identidade. Carregadas via Google Fonts em cada artboard; no app, self-host.

## 5. Motion — GSAP, assinatura "passar a conta"

**Biblioteca oficial: GSAP** (`gsap` + `@gsap/react` com o hook `useGSAP`) — decidido em 2026-08-27; substituiu framer-motion (removido). Usos no app: entrada em stagger da `AgendaList` e a assinatura "passar a conta" no sidebar-terço.

**Nota de implementação (2026-09-05):** a transição do sidebar foi feita com uma *timeline* sobre as próprias contas, não com **GSAP Flip**. Com o fio já desenhado, não há layout a interpolar — a conta ativa não se move de lugar, ela se preenche; a onda que percorre o fio é o que comunica a navegação. Flip resolveria um problema que o design não tem.

Tokens: `--dur-micro:140ms · --dur-base:240ms · --dur-entrance:420ms · stagger: 35–40ms`. Easing da casa `cubic-bezier(0.16,1,0.3,1)` ≈ `power3.out` no GSAP (ou `CustomEase` com a curva exata).

Dois momentos de fanfarra (os únicos):
1. **Navegar = passar as contas.** Timeline GSAP: cada conta desliza 4px e volta, com `stagger: { each: 0.035, from: <índice da conta clicada> }`; a conta de destino assenta preenchendo-se de azul (escala 1.4→1.0, 320ms, `power3.out`). Vibração leve no celular (`navigator.vibrate(8)`).
2. **Concluir = conta se preenche** (240ms) + carimbo dourado "Publicado".

Sempre checar `prefers-reduced-motion` (via `gsap.matchMedia()` ou guarda manual): reduzido = apenas cross-fade de cor. Protótipo clicável na seção 04 do briefing.

## 6. Hierarquia e voz

Toda tela de participante em três camadas: **manchete** (uma coisa: o que é seu e quando) → **sinal** (a semana, 2–4 itens) → **detalhe** (recolhido, sob demanda).

Microcopy em 2ª pessoa, ordem fixa: situação → o que é seu → um próximo passo. Ex.: "Seu post do Terço sai amanhã às 7h · você é o responsável". Notificação sempre carrega a informação completa — aviso é serviço, não cobrança.

## 7. Princípios que decidem brigas

1. **A manchete é a sua próxima conta** — rejeita abrir no calendário do mês.
2. **A plataforma carrega o peso, não a pessoa** — rejeita mostrar tabela crua.
3. **Celular do participante, desktop do coordenador** — mesma identidade, duas densidades; rejeita layout único que serve mal aos dois. Em conflito, o participante ganha.
4. **Aviso é serviço, não cobrança** — rejeita notificação-isca.
5. **Um destaque por tela** — dourado só na celebração; rejeita destacar tudo.

## 8. Mobile e hábito

- Tela **Hoje** responde uma pergunta ("tenho algo?") em <10s: manchete se sim, "Semana em dia ✓" sereno se não.
- **Bottom nav** com 4 destinos (Hoje · Escala · Calendário · Você), alvos ≥44px, zona do polegar.
- **Dezena da semana** como progresso — streak na versão que nos pertence, **sempre com perdão** (dezena incompleta não pune).
- **Widget de tela inicial** (dois estados: manchete / "Semana em dia ✓") = check de custo zero. Depende da plataforma técnica (nativo ou PWA) — decidir na etapa mobile do app.
- Push na janela em que a pessoa costuma responder, não em horário fixo.

## 9. Marca & branding — decidida

Três direções desenhadas no canvas (fileira "Marca"), todas ancoradas em Nossa Senhora do Rosário, flat, uma cor:

- **A — Auréola:** nove contas + a cruz fechando a dezena em círculo; lê como auréola/coroa de Nossa Senhora e vira sistema (as contas da marca acendem com o progresso). Custo: favicon precisa de variante simplificada.
- **B — Rosa:** a rosa em espiral num traço só (Rosário = coroa de rosas); o fio florescendo; abre-se desenhando (GSAP). Custo: menos literal ao produto.
- **C — Monograma:** M de Maria com a cruz nascendo do centro (Medalha Milagrosa geometrizada); força de selo, o mais robusto em 16px. Custo: lê mais "instituição" que "ferramenta".

**Decidido em 2026-09-05: direção A — Auréola.** A identidade já tinha adotado o *anel-auréola*
como o estado ativo de toda conta (§3b); escolher A faz a marca e o menor componente do sistema
dizerem a mesma coisa, e é a única das três que vira sistema (as contas acendem com o progresso).
Ela substituiu a cruz interina no sidebar, no login e no favicon, e vive num arquivo só —
`web/components/marca/marca-aureola.tsx`. Trocar por B ou C é reescrever esse arquivo.
**A decisão é do time e continua reversível**: se a coordenação preferir B ou C, o custo é uma tela.

## 10. Status do design (2026-09-05)

- ✅ Identidade aplicada nos 21 artboards do canvas (desktop + mobile + componentes + marcas)
- ✅ Sidebar-terço e MobileNav como componentes reutilizados
- ✅ Contas em flat com anel-auréola (v2 — §3b)
- ✅ GSAP adotado como biblioteca de motion (§5); framer-motion removido do app
- ✅ **Marca: direção A — Auréola** (§9)
- ✅ **Tela Escala: Opção A, agenda por prazo** — ver `sdd-implementacao.md` §1.1
- ✅ **"O Fio" aplicado na UI do app**: tokens em `globals.css`, sidebar-terço com a
  assinatura "passar a conta" em GSAP, bottom nav, tela Hoje
- ✅ Dark mode derivado por papel de cor (não invertido) nos tokens
- ⏳ Validar aplicação do terço com coordenação/pároco — **a única pendência que bloqueia lançar**
- ⏳ Revisar o dark mode tela a tela (os tokens estão prontos; falta olhar cada tela)
- ⏳ Sincronizar os artboards do canvas com as correções de contraste da §3
