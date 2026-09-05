# CLJ NSR — o app

Next.js 16 (App Router) + TypeScript + Tailwind 4 + SQLite. O plano que rege este código é
[`docs/sdd-implementacao.md`](../docs/sdd-implementacao.md); as regras de identidade estão em
[`docs/decisoes-design.md`](../docs/decisoes-design.md).

## Rodando

```bash
npm install
npm run dev      # http://localhost:3000
```

Na primeira execução o banco (`data/clj.db`, ignorado pelo Git) é criado, migrado e semeado
com o departamento de demonstração.

**Entrar como coordenação:** `maria@clj-nsr.local` · senha `terco2026`
**Entrar como participante:** `ana@clj-nsr.local` · senha `terco2026`
(as demais pessoas do seed usam o primeiro nome no mesmo domínio, com a mesma senha)

```bash
npm test         # vitest
npm run lint     # eslint
npm run build    # build de produção
npm run db:reset # apaga o banco local; ele é recriado e semeado no próximo boot
```

## Como o código está organizado

| Pasta | Papel |
|---|---|
| `app/` | Rotas. `(app)/` é o shell autenticado; `login/` e `convite/[token]/` ficam fora dele. |
| `components/fio/` | Os primitivos da identidade: a conta, o kicker, a manchete, a dezena. |
| `components/marca/` | A marca (direção A — Auréola). Trocar de direção é reescrever esse arquivo. |
| `components/shell/` | Sidebar-terço (desktop), bottom nav (celular), cabeçalho de página. |
| `lib/data/` | **A única porta de leitura** que páginas atravessam. Assinaturas `async`. |
| `lib/actions/` | **A única porta de escrita**: Server Actions que conferem sessão e papel. |
| `lib/repos/` | SQL cru. Só `lib/data/` e `lib/actions/` importam daqui. |
| `lib/db/` | Conexão, `schema.sql`, semeadura. |
| `lib/auth/` | Senha (scrypt), sessão em cookie httpOnly, guardas de rota e de papel. |
| `lib/escala/`, `lib/calendario/`, `lib/format.ts` | Domínio puro — sem React, sem banco. É onde ficam os testes. |

Regra que a revisão cobra: **página e componente nunca importam `lib/repos/` nem `lib/db/`.**

## Em produção

O banco continua sendo um arquivo. Defina antes do primeiro boot:

```bash
CLJ_COORDENADOR_EMAIL=coordenacao@exemplo.org
CLJ_COORDENADOR_SENHA=<uma senha forte>
CLJ_COORDENADOR_NOME="Nome de quem coordena"
CLJ_DB_PATH=/caminho/persistente/clj.db   # opcional; padrão: ./data/clj.db
```

Com o banco vazio e sem essas variáveis, **nenhuma conta é criada** — o app avisa no log em
vez de inventar um acesso. O seed de demonstração só roda fora de produção.

Convite não sai por e-mail: a coordenação gera um **link** na tela de Participantes e manda
pelo canal que o departamento já usa.
