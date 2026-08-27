# Decisões de Design — CLJ NSR

Registro vivo das decisões de identidade visual e UX. Atualizado em **2026-08-26**.
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

## 4. Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Manchetes / títulos de página | **Source Serif 4** (600/700) | Títulos 19px+, manchete da tela Hoje, números grandes do Painel |
| Corpo / UI | **Public Sans** (400–800) | Tudo o mais; base 13.5–16px |
| Kickers, datas, códigos | **IBM Plex Mono** (500/600) | Micro-rótulos uppercase (letter-spacing 0.07–0.09em), datas com `tabular-nums` |

Nunca `system-ui`/Inter/Roboto como identidade. Carregadas via Google Fonts em cada artboard; no app, self-host.

## 5. Motion — assinatura "passar a conta"

Tokens: `--dur-micro:140ms · --dur-base:240ms · --dur-entrance:420ms · ease-out: cubic-bezier(0.16,1,0.3,1) · stagger: 35ms`.

Dois momentos de fanfarra (os únicos):
1. **Navegar = passar as contas.** Ao trocar de item do menu, cada conta desliza 4px e volta, em cascata a partir da conta clicada (stagger 35ms); a conta de destino assenta preenchendo-se de azul (escala 1.4→1.0, 320ms, ease-out). Vibração leve no celular (`navigator.vibrate(8)`).
2. **Concluir = conta se preenche** (240ms, ease-out) + carimbo dourado "Publicado".

Com `prefers-reduced-motion`: apenas cross-fade de cor. Protótipo clicável na seção 04 do briefing.

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

## 9. Status do design (2026-08-26)

- ✅ Identidade aplicada nos 18 artboards do canvas (desktop + mobile + componentes)
- ✅ Sidebar-terço e MobileNav como componentes reutilizados
- ⏳ Escolher a direção da tela Escala do participante (Opções A/B/C no canvas)
- ⏳ Validar aplicação do terço com coordenação/pároco
- ⏳ Marca final (cruz/medalha) como exploração própria
- ⏳ Dark mode das telas (derivado, não invertido)
