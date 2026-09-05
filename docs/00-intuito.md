# O Intuito — CLJ NSR

O documento do topo. Todos os outros (`decisoes-produto.md`, `decisoes-design.md`, `decisoes-tecnicas.md`) assumem o que está escrito aqui. Definido em **2026-09-04**.

## 1. Para que este projeto existe

**Construir uma coisa minha, bem feita, do começo ao fim.**

A régua é o **ofício**: cada decisão de design, de produto e de código precisa ser defensável — por mim, em voz alta, sem "foi o que deu". Adoção pela paróquia é consequência desejada, não o critério de sucesso.

Isso não é o mesmo que "um app bonito sem uso". A plataforma serve ao Departamento Cultural de verdade, e é servindo de verdade que ela fica bem feita. Mas quando *entregar rápido* brigar com *entregar bem*, **ganha o bem feito** — e o Plano B (§6) existe justamente para que essa briga nunca coloque o Terço Diário em risco.

> Registro honesto: a pesquisa em [`pesquisa/stories-diarios-e-escopo-do-app.md`](pesquisa/stories-diarios-e-escopo-do-app.md) conclui que este escopo **não** se valida como necessidade operacional para o mandato. A conclusão continua correta na régua dela — necessidade operacional. Aqui a régua é outra: ofício. As duas coexistem, e é por isso que o Plano B é obrigatório e não opcional.

## 2. Quem sustenta

**Uma pessoa, do design ao deploy.** Não há segundo desenvolvedor, não há orçamento, não há quem revise o código.

Consequências que valem como lei neste repositório:

- Toda decisão vira documento **no mesmo commit** que a implementa — o "eu de daqui a três meses" e a IA da próxima sessão são os únicos revisores que existem.
- Entre duas peças, escolhe-se a de **menos manutenção**, não a mais impressionante.
- Nenhum trilho pode depender de alguém aparecer.

## 3. O prazo, e o que ele realmente significa

O mandato como coordenador vai até **o fim de 2026**. Contado de 2026-09-04, são ~17 semanas.

**O mandato não é prazo de entrega — é a janela de acesso.** Em janeiro eu continuo podendo programar. O que acaba é:

- a legitimidade para validar a marca e a aplicação da metáfora do terço com a coordenação e o pároco;
- o participante real para observar usando no celular;
- os dados verdadeiros de escala, calendário e reuniões.

Portanto: **o que exige o mandato tem data; o que exige só teclado, não.**

## 4. Os quatro trilhos

O projeto parecia difícil de organizar porque quatro coisas com réguas diferentes estavam no mesmo balaio. Separadas:

| # | Trilho | O que é | Régua | Pronto quando | Preso ao mandato? |
|---|---|---|---|---|---|
| 1 | **Ofício** | identidade, código e decisões defensáveis | "eu defendo cada decisão desta tela" | v1 no ar, cada decisão documentada | não |
| 2 | **Produto** | a mesa de comando do coordenador | "o coordenador deixa de ser o lembrete ambulante" | a fatia vertical roda com dados reais | não |
| 3 | **Operação** | terço, posts e reuniões acontecendo | constância sem depender de ação humana diária | o app assume — ou o Plano B assume | **sim** |
| 4 | **Evidência** | o que só existe enquanto eu for coordenador | acesso ao pároco e a usuários reais | validações feitas antes de dezembro | **sim** |

Os trilhos 3 e 4 têm data. Os trilhos 1 e 2 não morrem em janeiro — e não devem ser corrompidos por um prazo que não é deles.

## 5. Definição de pronto — duas fases

Decidido em 2026-09-04: **o app serve uma pessoa antes de servir o departamento.** Não é timidez, é o que torna a v1 entregável — a Fase A não depende de ninguém adotar nada, não precisa de convite, login de terceiros nem permissões, e já vale a pena com um único usuário.

### Fase A — só você (é o que precisa estar de pé no go/no-go)

1. Você monta o mês, do celular ou do computador.
2. Você produz os posts **em lote**, numa sentada, com a mídia à mão.
3. Todo dia o app te diz o que sai, quem está devendo e de quem é o aniversário.
4. Cada mensagem — conteúdo, lembrete, aniversário — sai **com um toque**, do seu telefone.
5. Acabou a escala em planilha e acabou o lembrete de cabeça.

Um usuário: você. Sem convite, sem push, sem RLS.

### Fase B — o departamento entra

6. Participantes entram por convite e veem só o que é deles.
7. Os lembretes passam a ir direto para eles, em vez de passar por você.
8. Duas pessoas trocam de dia entre si, e fica registrado.

Tudo que não estiver nessas duas listas é fase 2 e está fora do caminho crítico.

## 6. Go/no-go e Plano B

A operação do departamento depende do app — decisão tomada, com o risco aceito de forma consciente. O seguro contra esse risco:

**Data de go/no-go: 2026-11-01.** Se nessa data a **Fase A** (§5) não estiver de pé com dados reais, novembro e dezembro vão no Plano B, e o app segue sem pressa no trilho 1.

**Plano B, em uma linha:** lote mensal de conteúdo + Stories agendados no Meta Business Suite + escala numa planilha com responsável e suplente — exatamente o que a pesquisa de gestão de voluntários recomenda.

Decidir o Plano B em novembro, com calma, é ofício. Descobrir em dezembro que o Terço parou é o contrário.

## 7. Fora de escopo, de propósito

- **O app publicar sozinho no Instagram** — ver `decisoes-tecnicas.md` §5.
- **O app mandar sozinho em grupo de WhatsApp** — ver `decisoes-tecnicas.md` §4.
- **App nativo e publicação em loja.** O caminho é o site instalado na tela de início (`decisoes-tecnicas.md` §1).
- **Agente que publica controlando a máquina** — 30 a 60x mais risco de suspensão, para substituir algo que o Meta Business Suite já faz de graça. Ver `decisoes-tecnicas.md` §8.2.
- Rede social: feed, curtidas, comentários.
- Substituir o WhatsApp como lugar de **conversa** (o app o alimenta, não o substitui).
- Multi-departamento ou multi-paróquia.
- "Usuário avançado de software" como público. Nenhuma tela pode exigir treinamento.
