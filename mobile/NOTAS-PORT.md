# Port do domínio — web/ → mobile/

Feito em 2026-09-05, junto com a decisão de migrar para Expo.

O alias `@/*` do Expo aponta para `./src/*`, o mesmo que `@/lib/...` significava no app Next.
**Os 15 arquivos do domínio foram copiados sem uma única edição de import.**

| Portado | O quê |
|---|---|
| `src/lib/types.ts` | modelo de dados |
| `src/lib/data/` | camada de acesso, já `async` desde o dia 1 |
| `src/lib/mock/` | dados de exemplo |
| `src/lib/escala/agenda.ts` + teste | regra de agrupamento da escala |
| `src/lib/calendario/mes.ts` | grade do mês |
| `src/lib/format.ts` | formatação pt-BR |

**Não portado:** `lib/utils.ts` (`clsx` + `tailwind-merge` — só faz sentido com Tailwind).

`web/` fica no repositório como referência até as telas do Expo cobrirem o mesmo terreno.
