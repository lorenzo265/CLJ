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

### Se a instalação quebrar

O `better-sqlite3` é um módulo nativo, mas **não precisa de compilador**: a versão
travada aqui (13.0.3) já traz o binário pronto de cada plataforma dentro do pacote
(`prebuilds/win32-x64.node`, `linux-x64.node`, …) e declara `gypfile: false`, que
manda o npm não chamar o `node-gyp`.

Se mesmo assim o npm tentar compilar e reclamar de Visual Studio (Windows) ou de
`make`/`g++` (Linux), o problema é uma árvore de `node_modules` suja ou travada —
não a sua máquina. Feche o editor e qualquer `npm run dev` aberto (no Windows eles
seguram os arquivos e o npm falha com `EPERM`), e reinstale a partir do lockfile:

```bash
rm -rf node_modules && npm ci     # PowerShell: Remove-Item -Recurse -Force node_modules
```

Use `npm ci`, não `npm install`: ele instala exatamente o que está no
`package-lock.json`. Em último caso, `npm ci --ignore-scripts` pula qualquer chamada
ao compilador — neste projeto só um pacote roda script de instalação
(`unrs-resolver`, do ESLint), então só o `npm run lint` fica prejudicado.

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
