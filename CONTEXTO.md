# Contexto técnico — Quant Partners (frontend)

Documento para um agente que **não terá o código-fonte**. Análise do working tree deste repositório (React), não do backend. O otimizador de produção não está aqui.

Legenda de certeza, usada no texto:

- **Confirmado:** comportamento lido no código.
- **Inferência forte:** consequência quase direta do código, sem o backend para provar.
- **Hipótese:** explicação plausível, não comprovada.
- Quando faltar evidência: "Não foi possível determinar pelo código analisado."

---

## 1. O que o sistema é

**Confirmado.** Este repositório é só o frontend da Quant Partners (`package.json`: `lindo-fe-vite`). É uma aplicação web para uma fábrica modelada como injeção plástica: cadastra clientes, produtos, moldes, máquinas, linhas, turnos, feriados e insumos; o usuário escolhe até 30 pedidos e dispara um sequenciamento. O cálculo da programação é feito por uma API externa. Esta tela monta o payload, espera a resposta HTTP e depois lê o plano pronto (tabela, Gantt, carga, faturamento, matéria-prima).

**Por que existe.** **Inferência forte.** O README tem uma linha: "Quant Partners FrontEnd". O domínio (molde, cavidade, refugo, tempo de injeção e pós-injeção, setup entre produtos, paradas, regime de faturamento, prioridade de cliente) descreve programação finita de chão de fábrica, não um ERP genérico. A otimização em si não está neste repo.

**Quem usa.** **Inferência forte.** Um usuário autenticado de uma empresa (`enterprise_id` no login). Não há papéis, permissões nem multi-tenant na UI além desse id. Cadastro de conta exige um `token` de convite enviado a `POST /users/` com `enterprise_id: 0` fixo. O que esse token significa no backend não foi possível determinar pelo código analisado.

**Onde os dados moram.** **Confirmado.** Não há banco, ORM, migration nem cache de servidor neste repo. Persistência de negócio é a API (`VITE_BACKEND_URL`). O browser guarda sessão e o rascunho do wizard em `localStorage`.

---

## 2. Arquitetura

```
Usuário (browser)
  ↓
React SPA (Vite)
  Router + AuthGuard
  PageLayout + Sidebar
  Páginas de cadastro / sequenciamento / resultados
  ↓
apiClient (Axios)
  Bearer access_token
  refresh em 401 → POST /auth/refresh
  ↓
API Quant (outro serviço, não está neste repo)
  REST JSON
  POST /solver/solver
  GET /sequenciamento/stream   (SSE, sem header Authorization)
  ↓
Não foi possível determinar pelo código analisado:
  banco, filas, workers, Redis
```

Deploy deste frontend:

```
Dockerfile
  stage build: node:20, npm ci, npm run build
  stage run: nginx:1.27
  docker-entrypoint.sh grava /ui-config.js
  nginx
    /            → SPA (try_files → index.html)
    /ui-config.js
    /api/        → proxy http://api:8000   (rede Docker)
```

**Confirmado.** O Axios **não** usa o prefixo `/api/`. Ele chama `VITE_BACKEND_URL` direto. O proxy nginx existe para um compose em que o serviço se chama `api` na porta 8000. Não há `docker-compose` neste repo. Não foi possível determinar pelo código analisado se a produção usa o proxy ou a URL absoluta.

Camadas neste frontend (não há controller/service/repository):

| Camada | Responsabilidade |
|---|---|
| `src/router` | Rotas e guarda de sessão |
| `src/ui/pages` | Uma página por rota, quase sempre só monta um componente |
| `src/ui/components/<domínio>` | Lista, modal, formulário novo, formulário editar. Aqui está a regra de UI e o payload |
| `src/schemas` | Zod. Vários schemas estão desatualizados em relação ao POST real |
| `src/types` | Formas TypeScript da resposta da API. Não são o schema do banco |
| `src/utils/apiClient.ts` | HTTP, token, refresh |
| `src/config/featureFlags.ts` | Modo restrito de moldes |
| `src/contexts` | `AuthContext` (ids) e `StepContext` (wizard) |

Processos:

- Quase tudo é **síncrono do ponto de vista da UI**: `await apiClient.post/get` e toast.
- **Assíncrono confirmado:** `EventSource` em `GET {VITE_BACKEND_URL}/sequenciamento/stream?user_id=`. Enquanto o evento não vier com `finished: true`, o botão "Iniciar Sequenciamento" fica desabilitado com o texto "Sequenciamento ainda está sendo processado...". O POST do solver **não espera** esse stream. Os dois mecanismos coexistem e podem divergir. **Hipótese:** o backend processa o solver em background e o SSE avisa o fim; a UI trata o HTTP 2xx do POST como "concluído" na hora.

Não há fila, worker, cron nem WebSocket além desse SSE.

---

## 3. Mapa do projeto

```
src/
├── main.tsx, App.tsx          → React root, QueryClient, ErrorBoundary, Router
├── router/index.tsx           → rotas
├── router/AuthGuard.tsx       → sessão
├── config/featureFlags.ts     → hideMoldFields, rótulo "Maq. Gargalo"
├── config/tokens.ts           → nomes das chaves access_token / refresh_token
├── utils/apiClient.ts         → Axios + refresh
├── utils/moldResolution.ts    → achar molde a partir do produto (modo restrito)
├── contexts/AuthContext.tsx
├── contexts/StepContext.tsx
├── schemas/                   → Zod (nem todo schema é o contrato real)
├── types/                     → DTOs de resposta
└── ui/
    ├── pages/                 → uma rota cada
    ├── layouts/               → AuthLayout, PageLayout
    └── components/
        ├── clientes, produto, maquinas, moldes, linha-producao
        ├── maquina/           → composição DENTRO de uma linha (não é o cadastro)
        ├── insumos, itensCompra, composicao
        ├── turnosRegulares, feriados
        ├── sequenciamento/    → pedidos + wizard + POST solver
        └── cadastro/          → dashboard de resultados (não é a tela de cadastro)

Dockerfile, nginx.conf, docker-entrypoint.sh, index.html
```

Dois nomes que confundem:

- `src/ui/components/maquinas/` — cadastro mestre. API `/machines`.
- `src/ui/components/maquina/` — composição da linha (molde + produto + máquinas + setup). API `/composition-lines` e `/setup-matrix`. A rota é `/linhas-producao/:linhaId`.
- `src/ui/components/insumos/formEditarMaquina.tsx` edita **matéria-prima**.
- `src/ui/pages/cadastro.tsx` é o **dashboard de resultados** (`/resultados`), não o menu Cadastros.
- `ganntChart.tsx` é o Gantt (grafia do arquivo).

Entrada: `index.html` carrega `/ui-config.js` antes do bundle. `main.tsx` monta `App`.

---

## 4. Casos de uso

**Confirmado**, pelas rotas e pelos POSTs:

1. Entrar, criar conta com token, pedir e redefinir senha, sair.
2. Cadastrar cliente (nome, prioridade, id externo de ERP).
3. Cadastrar produto simples ou composto (estrutura de componentes) e tempo de pós-injeção em segundos.
4. Cadastrar molde (produtos, cavidades, refugo, risco de cavidade) e vincular componente que ainda não tem molde.
5. Cadastrar máquina (nome, disponibilidade, quantidade de moldes aceitos) e linha de produção.
6. Ligar, numa linha, molde + produto + uma ou mais máquinas (composition line) e editar tempos de setup entre essas combinações.
7. Cadastrar matéria-prima, item de compra e a composição do produto (quanto de cada insumo).
8. Cadastrar turno semanal (manhã/tarde/noite e frequência) e feriado (nacional, estadual, municipal).
9. Importar pedidos por XLSX ou criar pedido na mão; escolher até 30; informar início, calendário de faturamento, estado das máquinas e paradas; disparar o solver.
10. Ver o último plano ou um plano antigo: tabela, horas, gráfico de faturamento, Gantt, compras de matéria-prima.

---

## 5. Fluxos

### Fluxo: autenticação

Entrada: `/login`.

Etapas:

1. `POST /auth/login` com body `application/x-www-form-urlencoded`: `username` = email, `password`.
2. Resposta esperada: `access_token`, `refresh_token`, `user.id`, `user.enterprise_id`.
3. Grava tokens, `enterprise_id` e `user_id` no `localStorage`.
4. Navega para `/cadastro/cliente`.

`AuthGuard`: sem token, rota privada vai para `/login`. Com token, rota pública (`/login`, `/signup`, `/forgot-password`, `/resetar`) vai para `/cadastro/cliente`.

Refresh: em 401, se a URL não contém `/auth/login` e ainda não houve retry, `POST {VITE_BACKEND_URL}/auth/refresh` com JSON `{ refreshToken }`. Sucesso substitui os dois tokens e repete o request. Falha limpa tokens e manda para `/login`.

Logout: `POST /logout` (erro ignorado), apaga `user_id` e `enterprise_id`, zera tokens, vai para `/login`.

Persistência: `localStorage` apenas.

Falhas: toast com `response.data.detail` quando existe; senão mensagem genérica. Não há perfil de autorização além de "tem token".

Cadastro: `POST /users/` com `name`, `email`, `token`, `password`, `enterprise_id: 0`. Exige aceitar termos e política só na UI. Senha de cadastro e reset: 8–100. Senha de login: 6–24. Essa diferença está no Zod, não se sabe se o backend concorda.

Esqueci senha: `POST /password-reset/request` com `{ email }`. Reset: `POST /password-reset/confirm` com `{ new_password, token }` lido da query string. Nome do parâmetro de query: não foi relido nesta passagem além do uso de `token` no form; tratar como contrato existente em `ResetPasswordForm.tsx`.

### Fluxo: sequenciamento

Entrada: `/sequenciamento`. Dois painéis até o usuário clicar em iniciar.

Etapas:

1. `GET /jobs`. Pedidos já colocados na fila (`localStorage` `jobs_para_sequenciamento`) somem da lista da esquerda.
2. Clique move o pedido para a fila (máximo 30). Clique na fila devolve o pedido. Fila só no browser, não há POST de "fila".
3. Upload opcional: `POST /upload/jobs-xlsx` (multipart, campo `file`). Aceita `.xlsx` e `.xls`, 1 arquivo, 10 MB. Sucesso invalida a query `["get", "jobs"]`.
4. Ao abrir a página, abre SSE `GET {VITE_BACKEND_URL}/sequenciamento/stream?user_id={user_id}`. Sem header Authorization (**confirmado**: `EventSource` nativo). Mensagem JSON `{ finished: boolean }`. Se `finished !== true`, o botão de iniciar fica bloqueado.
5. "Iniciar Sequenciamento" grava `jobs_ids` (array de ids) e liga `startSteps`. Some a seleção e entra o wizard de 3 passos (`StepContext`, índice 0–2):
   - Passo 0 `SequenciamentoInfo`: data, hora, regime de faturamento, sábado e domingo seguintes são úteis. Pré-preenche com `GET /billing-configuration/` (primeiro item: `rule_type_index`, `billing_deadline_time`). Salva `sequenciamento_info` no `localStorage`.
   - Passo 1 estado atual da máquina: lista local, salva `estado_atual_maquina`.
   - Passo 2 paradas: lista só em memória deste passo (não vai para `localStorage` antes do POST).
6. Confirmar lê storage + paradas, valida (ver regras), `POST /billing-configuration/`, depois `POST /solver/solver`.
7. Sucesso apaga as chaves do wizard, mostra modal e navega para `/resultados`.

Persistência intermediária: `localStorage`. Paradas não sobrevivem a refresh. **Confirmado.**

Integrações: API REST + SSE.

Resultado: o POST não devolve o plano para a tela. A tela de resultados busca `GET /production-schedule/latest`.

Falhas: toast genérico no catch do solver (não mostra `detail`). Se faltar storage dos passos anteriores, pede para voltar. Se "incluir paradas" = sim e a lista está vazia, bloqueia. Se "incluir paradas" = não, o Zod do payload inteiro **não roda** (ver débito).

Cancelar no passo 0 apaga `sequenciamento_info`, `estado_atual_maquina` e `jobs_ids` e volta à seleção. Não apaga `jobs_para_sequenciamento`.

### Fluxo: resultados

Entrada: `/resultados` ou `/resultados?id={id}` a partir do histórico.

Etapas:

1. Sem `id`: `GET /production-schedule/latest`. Com `id`: `GET /production-schedule/{id}`.
2. Renderiza info, tabela de `results`, métricas de horas, resumo, `revenue_forecast`.
3. Modal Gantt: `GET /schedule-reports/{id}/gantt`.
4. Modal matéria-prima: `GET /production-schedule/{id}/procurements-by-job` e `GET /production-schedule/{id}/procurements-forecast`.

Histórico: `GET /production-schedule` (lista). Card mostra data e `machine_status` `"On Time"` ou `"Late"`. Clique abre `/resultados?id=`.

O dashboard de resultados **não** refaz o fetch quando a query `id` muda: o `useEffect` depende de `[]`. **Confirmado.** Trocar de um id para outro sem remontar a página pode manter o plano anterior.

### Fluxo: produto e molde

Entrada: `/cadastro/produto` e `/cadastro/moldes`.

Produto (`POST/PUT /products`):

- `external_id` (trim ou `null`), `name`, `post_injection_cycle_time` (inteiro, segundos), `components` via `toProductStructurePayload`.
- Simples: `components: []`.
- Composto: cada item é peça existente `{ component_product_id, external_id, quantity }` **ou** peça nova `{ name, external_id, quantity }`.

Moldes novos só listam produtos com `is_simple !== false`.

`GET /products/without-mold` lista componentes sem molde. Vincular: `PUT /molds/{id}` reenviando o molde inteiro com o id acrescentado em `products`, ou `POST /molds` criando molde só com aquele produto.

### Fluxo: linha, composição e setup

1. `POST /production-lines` cria a linha (nome).
2. Sidebar busca `GET /production-lines/` e monta links `/linhas-producao/:id`.
3. Na linha, `GET /production-lines/{id}` traz `composition_lines`.
4. Nova composition line: `POST /composition-lines` com `production_line_id`, `mold_id`, `product_id`, `machines` (ids). A UI só abre o modal se já houver menos de 10 composition lines.
5. Setup: `GET /setup-matrix/production-line/{linhaId}`. Edição manda só as linhas alteradas em `PUT /setups/batch` `{ updates: [{ id, setup_time }] }`. Upload XLSX de setup usa o mesmo componente `XlsxUpload` com outro `endpoint` (o valor exato do endpoint de upload de setup está na tela da linha; o componente posta em `/upload/${endpoint}`).

`cycle_time` aparece na grade vindo da API (`ICompositionLineMachine.cycle_time`). O formulário de editar composition line enviado hoje manda `mold_id`, `product_id`, `machines` — não envia `cycle_time`. Não foi possível determinar pelo código analisado onde o ciclo da máquina na linha é editado.

---

## 6. Modelo de dados (semântica)

Não há tabelas neste repo. Abaixo é o modelo que a UI assume. IDs numéricos, gerados no backend.

**Empresa e usuário.** Login devolve `user.id` e `user.enterprise_id`. A sidebar busca `GET /enterprises/{enterprise_id}/` e mostra `name`.

**Cliente.** `id`, `external_id` (texto, máx. 120, rótulo "ID do ERP"), `name`, `priority` (inteiro). A prioridade aparece na fila de pedidos (`client.priority`). Como o solver usa a prioridade: não foi possível determinar pelo código analisado.

**Produto.** `id`, `external_id`, `name`, `post_injection_cycle_time` (segundos), `is_simple`, `structure_components[]` (`id`, `name`, `quantity`, `external_id`). Campos `scrap`, `cycle`, `bottleneck` existem no tipo `IProduto` mas o POST atual de produto **não os envia**.

Peça simples pode ir para molde. Peça com `is_simple === false` é filtrada nas listas de molde e de estado de máquina.

**Molde.** `id`, `name`, `products[]` `{id, name}`, `total_cavities`, `open_cavities`, `scrap`, `closed_cavity_risk`. Vários produtos por molde. Um produto pode estar em um molde achado por `products.some`.

**Máquina (cadastro).** `id`, `name`, `availability` (número; a UI fala em 0–100), `accepted_molds`. Ver regra do 9999.

**Linha de produção.** `id`, `name`.

**Composition line.** Liga `production_line_id` + `mold_id` + `product_id` + lista de `machines`. Cada máquina na linha tem `cycle_time`. O molde embutido repete cavidades, scrap e risco. É o que diz ao solver o que aquela linha fabrica.

**Setup.** Par origem → destino entre composition lines, com `setup_time`. Matriz por linha.

**Pedido (`job`).** `id`, `order_number`, cliente, produto, molde, `promised_date`, `demand`, `product_value`, tempos e prazos calculados (`total_time_sec`, `total_time_hours`, `deadline_days`, `deadline_hours`, `sequencing_start_date`), `processed`. A UI de criação **não envia** hora prometida, prazo nem ciclo, embora o formulário os exija. Quem calcula tempo e prazo: não foi possível determinar pelo código analisado (provavelmente o backend, a partir de demanda, ciclo e cadastros).

**Turno.** `dia_semana` por extenso em português, booleanos `manha` / `tarde` / `noite`, `frequencia`: `Diário | Semanal | Mensal | Quinzenal | Não Trabalha`. O arquivo `src/schemas/turnosRegulares.ts` usa enums diferentes (`segunda`, `diario`, …) e **não é o schema do formulário que posta**.

**Feriado.** `name`, `date`, `level`: `Nacional | Estadual | Municipal`. A UI só filtra a lista; não calcula calendário.

**Composição de insumo** (`product-composition`), distinta da estrutura de produto:

- Estrutura de produto = quais peças formam um composto.
- Composição = quantidades de matéria-prima e itens de compra daquele produto.

Payload: `produto_id`, `raw_materials[{id, quantity}]`, `purchase_items[{id, quantity}]`. O schema `src/schemas/composicao.ts` (PP virgem, PEAD, garras metálicas, etc.) **não é usado** pelo POST atual. É resquício.

**Parada programada.** Só existe na memória do passo 3 até o POST: linha, máquina, motivo, início e fim (data + hora).

**Estado de máquina no início do sequenciamento.** Linha, máquina, se está em uso (`used`), nome do molde, nome do produto, concluído ou não, número do pedido, cliente, horas restantes de injeção e pós-injeção, demanda, valor a faturar, data/hora limite de faturamento.

**Plano (`production schedule`).** `sequencing_start`, contagens (`setup_count`, `optimized_setups`, `on_time_jobs`), `total_machine_hours`, `max_deadline_hours`, `machine_status`, `billing_deadline_time`, `results[]`, `revenue_forecast[]`, `metrics` (`hs_de_disponibilidade`, `hs_nec_de_producao`, `carga_de_maquina_percent`).

Cada `result`: pedido, cliente, produto, máquina, molde, quantidade, datas programada/real/conclusão/faturamento, status, `expected_revenue`, `order_index`.

**Gantt.** `lines[]` com `machines[]` e `blocks[]` (`job_id`, `label`, `start`, `duration`, `end`, `product_id`, `is_dowtime` — grafia da API). Mais `legend[]`.

**Regimes de faturamento** (valor enviado como `rule_type` inteiro):

| Valor | Rótulo na UI |
|---|---|
| 1 | Segunda a sexta (sem feriados) |
| 2 | Todos os dias (incluindo feriados) |
| 3 | Todos os dias (sem feriados) |
| 4 | Todos os dias e em qualquer horário (incluindo feriados) |

No regime 4 a UI não pede horário limite e envia `billing_deadline_time: null`.

---

## 7. APIs e integrações

Única integração de negócio: a API Quant.

- Base: variável `VITE_BACKEND_URL` (sem valor neste documento).
- Auth das chamadas Axios: `Authorization: Bearer {access_token}`.
- SSE: só `user_id` na query. Não foi possível determinar pelo código analisado se o backend exige cookie ou se o stream é aberto de propósito sem Bearer.
- Erro típico de negócio: HTTP com `response.data.detail` string. Várias telas ignoram `detail` e mostram toast fixo. O solver é uma delas.
- 401: refresh uma vez; falha desloga.

Variáveis de ambiente (nomes apenas):

| Nome | Onde | Função |
|---|---|---|
| `VITE_BACKEND_URL` | build Vite / Axios / SSE | URL da API |
| `VITE_HIDE_MOLD_FIELDS` | build | se `"true"`, esconde campos de molde |
| `VITE_RESTRICTED_HOSTS` | build | hostnames extras do modo restrito, separados por vírgula |
| `HIDE_MOLD_FIELDS` | runtime do container | se `true`, `ui-config.js` força modo restrito |
| `RESTRICTED_HOSTS` | runtime | hostnames do modo restrito |
| `PORT` | container | porta do nginx (default 80) |

`index.html` carrega `/ui-config.js`, que define `window.__QUANT_UI_CONFIG__` com `forceRestricted` e `restrictedHosts`.

Endpoints usados (contrato que a UI depende):

| Método | Caminho | Uso |
|---|---|---|
| POST | `/auth/login` | login form-urlencoded |
| POST | `/auth/refresh` | body `{ refreshToken }` |
| POST | `/logout` | |
| POST | `/users/` | cadastro |
| POST | `/password-reset/request` | |
| POST | `/password-reset/confirm` | |
| GET | `/enterprises/{id}/` | nome na sidebar |
| CRUD | `/clients`, `/clients/` | |
| CRUD | `/products`, `/products/` | |
| GET | `/products/without-mold` | componentes sem molde |
| CRUD | `/molds`, `/molds/` | |
| CRUD | `/machines`, `/machines/` | |
| CRUD | `/production-lines`, `/production-lines/` | |
| GET | `/production-lines/{id}` | composition lines da linha |
| POST/PUT/DELETE | `/composition-lines`, `/composition-lines/{id}` | |
| GET | `/setup-matrix/production-line/{id}` | |
| PUT | `/setups/batch` | `{ updates: [{ id, setup_time }] }` |
| CRUD | `/raw-material`, `/purchase-items` | |
| CRUD | `/product-composition` | BOM de insumos |
| CRUD | `/regular-shifts` | delete do turno está comentado na lista |
| CRUD | `/holidays` | |
| GET/POST/DELETE | `/jobs` | |
| POST | `/upload/{endpoint}` | xlsx; sequenciamento usa `jobs-xlsx` |
| GET | `/billing-configuration/` | |
| POST | `/billing-configuration/` | `{ rule_type, billing_deadline_time }` |
| POST | `/solver/solver` | dispara o plano |
| GET | `/sequenciamento/stream?user_id=` | SSE |
| GET | `/production-schedule` | histórico |
| GET | `/production-schedule/latest` e `/{id}` | plano |
| GET | `/production-schedule/{id}/procurements-by-job` | |
| GET | `/production-schedule/{id}/procurements-forecast` | |
| GET | `/schedule-reports/{id}/gantt` | |

Payload do solver — não mudar nomes nem formatos:

```json
{
  "job_ids": [1],
  "sequencing_date": "YYYY-MM-DDTHH:mm:00",
  "next_saturday_is_working": false,
  "next_sunday_is_working": false,
  "machine_states_json": [{
    "production_line_id": 0,
    "machine_id": 0,
    "used": true,
    "mold_name": "",
    "product_name": "",
    "completed": false,
    "order_number": null,
    "client_name": null,
    "remaining_injection_hours": 0,
    "remaining_post_injection_hours": 0,
    "demand": 0,
    "billing_value": 0,
    "billing_deadline_date": null,
    "billing_deadline_time": null
  }],
  "programmed_stops_json": [{
    "production_line_id": 0,
    "reason": "",
    "machine_id": 0,
    "start_date": "",
    "start_time": "HH:mm:ss",
    "end_date": "",
    "end_time": "HH:mm:ss"
  }],
  "user_id": "string"
}
```

`billing_deadline_time` do regime (não o da parada) passa por `formatBillingDeadlineTime`: `HH:mm` vira `HH:mm:00.000Z`. Horas de parada e do estado usam `HH:mm:ss` sem sufixo `Z`.

Não há pagamento, e-mail direto, fila ou outro SaaS no frontend. O XLSX é só upload para a API.

---

## 8. Regras de negócio

### Regime de faturamento 1–4

REGRA: O regime é inteiro de 1 a 4. Fora disso o disparo para. No regime 4 não há horário limite (`null`). Nos outros, a UI mostra o campo de hora. O valor vigente é lido de `GET /billing-configuration/` e regravado com `POST` imediatamente antes do solver.

LOCALIZAÇÃO: `sequenciamentoInfo.tsx`, `paradas.tsx`.

EVIDÊNCIA: options 1–4; `if (regimeFaturamento > 4 || regimeFaturamento < 1)`; regime `"4"` zera o horário.

IMPACTO: calendário de faturamento que o solver usa. A semântica exata de cada regime no cálculo não está neste repo.

CERTEZA: Confirmado na UI. Efeito no plano: não foi possível determinar pelo código analisado.

### Sábado e domingo seguintes

REGRA: Dois booleanos independentes: o sábado seguinte e o domingo seguinte à data de início são ou não dia de trabalho. Default falso. Vão no solver como `next_saturday_is_working` e `next_sunday_is_working`.

LOCALIZAÇÃO: `sequenciamentoInfo.tsx`, `paradas.tsx`.

EVIDÊNCIA: radios e campos do POST.

IMPACTO: calendário do solver. Não substitui turnos nem feriados; são flags extras do run.

CERTEZA: Confirmado.

### No máximo 30 pedidos por run

REGRA: A fila local não passa de 30 pedidos.

LOCALIZAÇÃO: `PedidosDisponiveis.tsx`. O título da fila mostra `(n/30)`.

EVIDÊNCIA: `length >= 30` gera toast e return.

IMPACTO: tamanho de `job_ids`. Não se sabe se o backend impõe o mesmo limite.

CERTEZA: Confirmado na UI.

### No máximo 10 composition lines por linha

REGRA: O modal de nova composition line só abre se `composition_lines.length < 10`.

LOCALIZAÇÃO: `maquina/maquinas.tsx`.

EVIDÊNCIA: `isVisible={novaMaquina && (linhaProd?.composition_lines.length ?? 0) < 10}`.

IMPACTO: cadastro da linha. O backend pode ter outro limite. Não foi possível determinar pelo código analisado.

CERTEZA: Confirmado na UI.

### Status concluído zera o pedido em andamento

REGRA: Se o estado da máquina é `Concluido`, a UI limpa número do pedido, tempos restantes, demanda, valor e limites, e força `utilizacao: true`. No solver, `completed` é `status === "Concluido"`. O outro valor do enum é `"Não concluido"`.

LOCALIZAÇÃO: `formNovoEstadoMaquina.tsx`, `paradas.tsx`.

EVIDÊNCIA: `useEffect` no status; `completed: estadoAtual.status === "Concluido"`.

IMPACTO: o que o solver entende como máquina livre versus ocupada.

CERTEZA: Confirmado.

### Produto composto versus simples

REGRA: Simples envia `components: []`. Composto exige componentes. Cada componente tem id de peça existente **ou** nome de peça nova, nunca os dois e nunca nenhum. Quantidade é inteiro ≥ 1. A tela bloqueia composto com menos de 2 componentes antes do Zod. O Zod só exige "pelo menos um" se o tipo é composto.

LOCALIZAÇÃO: `ProductCadastroForm.tsx` (mínimo 2), `schemas/produto.ts` (mínimo 1 e XOR id/nome), `ProductStructureFields.tsx` `toProductStructurePayload`.

EVIDÊNCIA: `onFormSubmit` faz `preventDefault` se `count < 2`; `superRefine` exige length > 0; payload ramifica em `component_product_id`.

IMPACTO: BOM de peças. Lista de "peça existente" só inclui ids que já aparecem como componente de algum produto (`pieceIds`), não qualquer produto.

CERTEZA: Confirmado. Por que o mínimo da tela é 2 e o do schema é 1: não há comentário. Tratar o mínimo 2 como regra de UI atual.

### Só peça simples recebe molde

REGRA: Selects de produto em molde e no estado da máquina descartam `is_simple === false`.

LOCALIZAÇÃO: `formNovoMolde.tsx`, `formNovoEstadoMaquina.tsx`.

EVIDÊNCIA: `.filter((product) => product.is_simple !== false)`.

IMPACTO: composto não é escolhido como o que a máquina está fabricando nem como produto direto do molde. Componentes sem molde aparecem em outra lista (`/products/without-mold`).

CERTEZA: Confirmado.

### Cavidades

REGRA: Cavidades abertas não podem ser maiores que o total, na criação de molde para um componente sem molde. O POST de molde sempre manda `total_cavities`, `open_cavities`, `scrap`, `closed_cavity_risk` numéricos.

LOCALIZAÇÃO: `formVincularComponente.tsx`, `formNovoMolde.tsx`.

EVIDÊNCIA: `if (open > total) throw`.

IMPACTO: capacidade do molde no solver. A fórmula (peças por ciclo, refugo, risco) não está neste frontend.

CERTEZA: Confirmado o limite. Fórmula: não foi possível determinar pelo código analisado.

### Modo restrito esconde molde e ainda envia molde

REGRA: Em hosts restritos a UI não mostra molde, cavidades nem risco, e troca o texto "injetora" por "Maq. Gargalo". O molde continua obrigatório no payload. A UI resolve o molde pelo produto (`findMoldForProduct` / `findMoldByProductName`). Molde criado nesse modo usa `total_cavities: 1`, `open_cavities: 1`, `closed_cavity_risk: 0`. Scrap continua editável.

LOCALIZAÇÃO: `featureFlags.ts`, `moldResolution.ts`, formulários de molde, composition line, estado de máquina, tabela de resultados.

EVIDÊNCIA: `hideMoldFields`; defaults 1/1/0; `hiddenModeLabel(..., "Maq. Gargalo")`.

IMPACTO: o mesmo backend atende uma UI completa (fábrica com molde visível) e uma UI restrita (cópia/demo). Apagar o ramo restrito ou deixar de enviar `mold_id` / `mold_name` quebra um dos dois modos.

CERTEZA: Confirmado.

Liga quando qualquer um destes for verdadeiro:

- `window.__QUANT_UI_CONFIG__.forceRestricted === true` (entrypoint liga isso se `HIDE_MOLD_FIELDS` ou `VITE_HIDE_MOLD_FIELDS` é `true`);
- `VITE_HIDE_MOLD_FIELDS === "true"` no bundle;
- hostname atual está na lista: default `127.0.0.1` e `quant-copy-production.up.railway.app`, mais `restrictedHosts` do runtime e `VITE_RESTRICTED_HOSTS`.

### Quantidade de moldes aceitos pela máquina

REGRA: Na tela, 0 significa "sem limite informado". A API guarda isso como `9999` (`ACCEPTED_MOLDS_DEFAULT`). Ao exibir, `9999` volta a aparecer como 0. Inteiro positivo é gravado como está.

LOCALIZAÇÃO: `schemas/maquinas.ts`, `formNovaMaquina.tsx` / `formEditarMaquina.tsx` da pasta `maquinas`.

EVIDÊNCIA: `acceptedMoldsToStore` / `acceptedMoldsToDisplay`.

IMPACTO: campo `accepted_molds` de `POST/PUT /machines`. Não foi possível determinar pelo código analisado como o solver interpreta 9999.

CERTEZA: Confirmado o mapeamento. Significado "ilimitado" é inferência forte pelo par 0 ↔ 9999.

### Disponibilidade da máquina

REGRA: A UI rejeita valor não numérico e valor negativo. A mensagem diz "entre 0 e 100", mas **não há** teto 100 no código. O número segue como `availability`.

LOCALIZAÇÃO: `maquinas/formNovaMaquina.tsx` (e o editar equivalente).

EVIDÊNCIA: `parseFloat < 0` e `isNaN`; nenhum `> 100`.

IMPACTO: dado de capacidade. Unidade (percentual ou horas) não está documentada no código.

CERTEZA: Confirmado.

### Pedido criado não envia todos os campos do formulário

REGRA: O formulário exige data, hora, prazo em dias, ciclo, cliente, produto, demanda e valor. O POST manda só `promised_date`, `demand`, `product_value` (inteiros via `parseInt`), `processed: true`, `fk_id_client`, `fk_id_product`.

LOCALIZAÇÃO: `formNovoPedido.tsx`, `schemas/pedido.ts`.

EVIDÊNCIA: objeto do `apiClient.post("/jobs", ...)`.

IMPACTO: hora, prazo e ciclo digitados são descartados. Se o backend precisa deles, o bug já está na UI. Não foi possível determinar pelo código analisado quais campos o backend exige em `POST /jobs`.

CERTEZA: Confirmado o descarte.

### Paradas opcionais

REGRA: Se o usuário marca "não" em incluir paradas, `programmed_stops_json` vai `[]`. Se marca "sim", precisa de ao menos uma parada válida.

LOCALIZAÇÃO: `paradas.tsx`. Estado inicial de `incluirParadas` é `true`.

EVIDÊNCIA: ternário no POST; toast se a lista está vazia.

IMPACTO: paradas do run. Não são os turnos nem os feriados cadastrados.

CERTEZA: Confirmado.

### Filtro de produto na fila

REGRA: A busca da fila da direita filtra `product_name.includes(busca)`. A coluna cliente mostra `product_name.split(" - ")[0]` e a coluna produto o `[1]`.

LOCALIZAÇÃO: `pedidos.paraSequencimento.tsx`.

EVIDÊNCIA: split e filter.

IMPACTO: a tela assume que `product_name` vem no formato `"cliente - produto"`. Se a API mudar o separador, as colunas quebram. O tipo `IPedido` também tem `client` e `product` separados; a tabela da fila não usa esses objetos nas colunas de nome.

CERTEZA: Confirmado.

### Upload

REGRA: Um arquivo, até 10 MB, MIME de xlsx/xls. POST multipart em `/upload/${endpoint}`.

LOCALIZAÇÃO: `XlsxUpload.tsx`.

CERTEZA: Confirmado. O layout das colunas da planilha não está neste repo.

### Turnos e feriados

REGRA: A UI só persiste o cadastro. Não há, neste frontend, código que cruze turno, feriado e regime para calcular horas disponíveis. Esse cruzamento, se existe, está no backend.

LOCALIZAÇÃO: telas de turno e feriado; ausência de cálculo nas páginas de resultado.

CERTEZA: Confirmado que a UI não calcula. Onde o backend usa esses cadastros: não foi possível determinar pelo código analisado.

### Delete de turno

REGRA: A chamada `DELETE /regular-shifts/{id}` está comentada.

LOCALIZAÇÃO: `turnosRegulares/tunos-regulares.tsx` (grafia do arquivo).

CERTEZA: Confirmado. Não dá para apagar turno pela UI.

---

## 9. Decisões arquiteturais

DECISÃO: Frontend e solver são sistemas separados. Este repo não implementa otimização.

EVIDÊNCIA: o único disparo é `POST /solver/solver`; resultados vêm de `/production-schedule` e `/schedule-reports`.

DECISÃO: SPA com rotas no cliente e nginx devolvendo `index.html`.

EVIDÊNCIA: `nginx.conf` `try_files ... /index.html`; React Router.

DECISÃO: Autenticação por access token + refresh token no `localStorage`, não por cookie httpOnly visível neste código.

EVIDÊNCIA: `setToken`, interceptor, `AuthGuard`.

DECISÃO: Estado de servidor com TanStack Query; rascunho do wizard e fila de pedidos com `localStorage`, fora do Query cache persistido.

EVIDÊNCIA: chaves `sequenciamento_info`, `estado_atual_maquina`, `jobs_para_sequenciamento`, `jobs_ids`.

DECISÃO: Formulário = React Hook Form + Zod, mas o contrato real é o objeto passado ao Axios, que às vezes ignora o schema.

EVIDÊNCIA: pedido, composição de insumo e turno (schemas paralelos não usados ou incompletos).

DECISÃO: Um modo de UI restrito por hostname/env, sem segundo codebase. O contrato da API de molde permanece.

EVIDÊNCIA: `featureFlags.ts` e ramos `hideMoldFields` que ainda postam molde.

DECISÃO: Modo restrito pode ser ligado em runtime sem rebuild, via `ui-config.js` gerado no start do container.

EVIDÊNCIA: `docker-entrypoint.sh` e `<script src="/ui-config.js">`.

DECISÃO: Não há camada de serviço. Cada formulário conhece a URL e o formato.

EVIDÊNCIA: `apiClient.post` espalhado nos componentes.

DECISÃO: Query do React Query não refaz ao focar a janela.

EVIDÊNCIA: `App.tsx` `refetchOnWindowFocus: false`.

DECISÃO: Erro de render cai num boundary único e manda o usuário para `/cadastro/cliente`.

EVIDÊNCIA: `AppErrorBoundary.tsx`.

Não foi possível determinar pelo código analisado: escolha de banco, filas, estratégia de cache no backend, nem por que existem dois deploys (API de produção versus host `quant-copy-production` restrito). Os hostnames aparecem no Dockerfile default e na lista de hosts restritos; a motivação de negócio não está comentada no código. **Hipótese:** a cópia é um ambiente de demonstração que não pode exibir detalhe de molde.

---

## 10. Autenticação, erro e convenções

Autorização: só "logado ou não". Nenhuma checagem de papel na UI. O `enterprise_id` vai no GET da empresa; as outras rotas não anexam o id no cliente — o backend deve filtrar pelo token. **Inferência forte.**

Erros: toast (`react-toastify`), `console.error`, e o boundary de render. Não há página de erro HTTP nem retry além do refresh de token.

Convenções para encaixar funcionalidade nova:

- Rota em `src/router/index.tsx` dentro do `AuthGuard` privado e do `PageLayout`.
- Item no array `menuItems` de `sidebar.tsx`.
- Pasta `src/ui/components/<domínio>` com lista + `formNovo*` + `formEditar*`.
- Zod em `src/schemas`, tipo de resposta em `src/types`.
- Chamadas via `apiClient`, nunca Axios solto, para herdar o Bearer. Exceção já existente: o SSE, que não passa pelo Axios.
- Invalidar a mesma `queryKey` que a lista usa. As keys são strings soltas, por exemplo `["get", "all", "products"]`, `["get", "jobs"]`, `["jobs", "para", "sequenciamento"]`.
- Se a tela mostra molde, cavidade ou a palavra injetora, ramificar com `hideMoldFields` / `hiddenModeLabel`.
- Visual legado: borda inferior, cor `#212A4F`. O formulário novo de produto (`ProductCadastroForm.tsx`) usa outro visual (input com borda completa). Não misturar os dois no mesmo form sem pedido.

`localStorage` que não deve ser renomeado:

`access_token`, `refresh_token`, `enterprise_id`, `user_id`, `sequenciamento_info`, `estado_atual_maquina`, `jobs_ids`, `jobs_para_sequenciamento`.

---

## 11. Limitações e débitos

Confirmados no código:

- Não há testes, nem pasta de teste, nem CI neste repo.
- README não descreve o domínio.
- Rota `/cadastro/tempo-de-ciclo` importa `src/ui/pages/tempo-ciclo`, arquivo **ausente**. O build TypeScript deve falhar nesse import até o arquivo existir ou a rota sair.
- Sidebar aponta `/perfil` e `/atendimento`. Não há rota. O catch-all mostra "Nada encontrado".
- `schemas/composicao.ts` e `schemas/turnosRegulares.ts` não representam o POST atual.
- `POST /jobs` descarta hora, prazo e ciclo coletados na tela.
- Mensagem de disponibilidade 0–100 sem validar o teto.
- Com `incluirParadas === false`, o `safeParse` do wizard inteiro não roda antes do solver.
- `StepContext.nextStep`: o guarda é `activeStep > 2`, então a partir do passo 2 (último) um `nextStep` iria para 3 e `steps[3]` quebra. `prevStep` a partir de 0 decrementa para -1. No fluxo normal o passo 0 não chama `prev` e o passo 2 não chama `next`; o buraco existe na função.
- `menuItems` é array de módulo. O `useEffect` da sidebar faz `menuItems[1].items = machines`. Mutação compartilhada, não estado React.
- Dashboard `/resultados` não reage a mudança de `?id=` (effect com deps `[]`).
- SSE sem Bearer e com `user_id` na URL.
- Delete de turno comentado.
- `console.log` de payload em composição e em criação de máquina/molde.
- Vários `eslint-disable` para `any` nos submits.
- Typo estável de API/arquivo: `is_dowtime`, `ganntChart`, `tunos-regulares.tsx`, `sequencimentoFinalizado`.
- Signup grava `enterprise_id: 0` sempre.
- Fila de pedidos e paradas não são modelo de servidor: refresh no meio do wizard perde paradas; a fila de jobs sobrevive porque está no `localStorage`.
- Não há comentários TODO/FIXME relevantes. O que está incompleto aparece como código comentado, schema morto ou import quebrado.

Restrição operacional **fora do código** (pedido explícito de quem mantém o projeto, não evidência deste repo): não desligar, apagar, redimensionar nem alterar o droplet DigitalOcean `ubuntu-s-1vcpu-1gb-sfo2-01` (ID 552519452, IP 157.245.162.176, região sfo2). Não é o app Quant.

---

## 12. Estado atual do desenvolvimento

Últimos commits no git (tema, não diff):

- Modo restrito de moldes e rótulo "Maq. Gargalo".
- Flag de domingo útil (`next_sunday_is_working`) e outro campo novo no sequenciamento.
- Ajustes de login, tabela de clientes, cache de setup e Gantt (`product_id`, `is_dowtime`).

Working tree **não commitado**, concentrado em cadastros: cliente com `external_id`, produto com estrutura simples/composto (`ProductCadastroForm`, `toProductStructurePayload`), máquina com `accepted_molds`, moldes (lista, forms, `componentesSemMolde`, `formVincularComponente`), sidebar, router, e o estado de máquina no wizard. Isso já está descrito neste documento como comportamento atual do working tree, não como feature só no papel.

Não foi possível determinar pelo código analisado a data de release nem qual ambiente está à frente.

---

## 13. O que não alterar

Estas peças são contrato com o backend ou com o modo restrito. Não renomear, não "limpar", não unificar, não reimplementar o solver no browser.

1. Corpo de `POST /solver/solver` e de `POST /billing-configuration/` em `paradas.tsx`, inclusive formatos de hora (`:00` no `sequencing_date`, `HH:mm:ss` nas paradas, `HH:mm:ss.000Z` no horário limite de faturamento).
2. `criarStepsSequenciamentoschema` em `src/schemas/steps.ts`. `codMolde` continua obrigatório no modo restrito.
3. `toProductStructurePayload`.
4. `uniqueProductsFromMolds`, `findMoldForProduct`, `findMoldByProductName`.
5. `getHideMoldFields`, `hideMoldFields`, `hiddenModeLabel` e os ramos que escondem molde sem deixar de enviá-lo.
6. Interceptor de `apiClient.ts` (Bearer, um retry, não refrescar `/auth/login`, redirect `/login`).
7. Nomes das chaves de `localStorage` listadas acima.
8. Redirects do `AuthGuard`.
9. Filtro `is_simple !== false` onde já existe.
10. Mapeamento 0 ↔ `9999` de `accepted_molds`, salvo pedido explícito de mudar o contrato com a API.
11. O droplet citado na seção 11.

Pode mudar layout, texto, validação que só impede submit inválido, e telas novas, desde que o JSON e o modo restrito permaneçam.

Funcionalidade nova de cadastro deve seguir o par lista/modal e invalidar a query da lista. Funcionalidade que alimenta o solver deve entrar ou no cadastro que a API já lê, ou nos campos já existentes de `machine_states_json` / `programmed_stops_json` / `job_ids`. Inventar campo novo no POST do solver sem o backend aceitar é quebra silenciosa: a UI mostra sucesso e o plano ignora o dado. Não foi possível determinar pelo código analisado se a API rejeita campos desconhecidos ou os ignora.
