# 📋 CONTEXTO GENERAL DEL PROYECTO — AI Portfolio on Celo

> Documento maestro para futuras modificaciones del frontend y el ecosistema completo.
> Creado: 2026-11-06

---

## 🏗️ ARQUITECTURA GENERAL

El sistema es un **portafolio de inversión automático en Celo mainnet** con 4 componentes principales que interactúan entre sí:

```
Usuario (Frontend)
  │
  ├── InvestModal → MetaMask → depositAsset() en StockWallet Vault
  │                                   │
  │                                   ├── Swap a USDT (Uniswap V3)
  │                                   └── Distribuye: 78% tokens, 20% AI, 2% gas
  │
  ├── StockWallet Bot (bot_adgent)
  │     ├── Escucha eventos AssetDeposited
  │     ├── Ejecuta invest() → compra WBTC/WETH según allocation
  │     ├── Monitorea stop-loss / take-profit → selltoken()
  │     └── Pausa 24h después de cada venta
  │
  ├── Celo Investment Agent (bot_adgent en GitHub)
  │     ├── Loop cada 10h
  │     ├── Lee balances del MinimalAccount (AI Capital Account)
  │     ├── LLM decide: swap, supply Aave, borrow, repay, withdraw, hold
  │     ├── Firma off-chain → execute() / batchExecute() en MinimalAccount
  │     └── 3 proveedores LLM: x402/DeepSeek → Ollama Cloud → Google Gemini
  │
  └── Dashboard (Frontend Next.js)
        ├── Lee balances on-chain del Vault y AI Capital Account
        ├── Lee decisiones y actividad desde PostgreSQL
        ├── Muestra posiciones, allocation, AI activity, audit log
        └── Permite depositar vía MetaMask + Ripio Ramp
```

---

## 📦 COMPONENTE 1: Frontend Dashboard (`Fronted_ai_adgent`)

**Ubicación:** `/home/openclaw-project/Descargas/Fronted_ai_adgent`

**Stack:** Next.js 14 + TypeScript + Tailwind CSS + viem + PostgreSQL (pg)

### Estructura de archivos

```
src/
├── app/
│   ├── page.tsx              → Dashboard principal con 5 tabs
│   ├── layout.tsx            → Root layout (Plus Jakarta Sans font)
│   ├── globals.css
│   └── api/
│       ├── dashboard/route.ts → GET: Lee on-chain + DB (bot_state, decisions, positions, vault balances)
│       └── activity/route.ts  → GET: Audit log paginado con filtros (asset, search, action)
├── components/
│   ├── Navbar.tsx            → Header sticky con refresh + Add Funds
│   ├── AccountSummary.tsx    → Balance total USD + barra de allocation (78%/20%/2%)
│   ├── SelectedTokens.tsx    → Posiciones del vault (WBTC, WETH, USDT) con safety limits
│   ├── CashReserve.tsx       → Capital autónomo AI (USDT + aCelUSDT en Aave)
│   ├── AiActivity.tsx        → Feed de decisiones del AI pilot (expandible)
│   ├── ProtectionLog.tsx     → Audit log con search + filtros + paginación
│   ├── InvestModal.tsx       → Modal de depósito: MetaMask + Ripio Ramp (CO/BR/AR)
│   ├── StatCards.tsx         → 4 cards de métricas (NO usado en page.tsx actualmente)
│   ├── PositionsTable.tsx    → Tabla de posiciones (NO usado en page.tsx actualmente)
│   ├── AaveSection.tsx       → Sección Aave (NO usado en page.tsx actualmente)
│   ├── DecisionsFeed.tsx     → Feed de decisiones (NO usado en page.tsx actualmente)
│   ├── ActivityLog.tsx       → Log de actividad (NO usado en page.tsx actualmente)
│   ├── KnowledgeBaseView.tsx → Vista de knowledge base (NO usado en page.tsx actualmente)
│   └── CoinLogos.tsx         → SVG logos: BTC, ETH, USDT, wBRL, wARS, CELO, MetaMask, Coinbase
└── lib/
    ├── web3.ts               → viem config, contratos, ERC20, vault deposit, Ripio Ramp
    ├── db.ts                 → Pool PostgreSQL (singleton, Railway-compatible)
    └── currency.ts           → Conversión BRL/USD
```

### Funcionalidad actual

1. **Dashboard en tiempo real** — Auto-refresh cada 15s
2. **5 Tabs:**
   - **My Portfolio** — Vista general (tokens + reserve + AI activity)
   - **Selected Tokens (78%)** — Posiciones del vault con safety limits
   - **Autonomous AI Capital (20%)** — USDT + aCelUSDT en Aave
   - **AI Pilot Activity** — Decisiones del LLM
   - **Safety Log** — Audit log paginado
3. **InvestModal** — Conecta MetaMask, deposita USDT/wBRL/wARS al vault
   - Integración Ripio Ramp (PSE Colombia, PIX Brasil, ARS Argentina)
   - Allocation: 78% tokens (39% ETH + 39% BTC), 20% AI agent, 2% gas
   - Flow: approve ERC20 → depositAsset() en vault → swap automático a USDT
4. **AccountSummary** — Barra visual de allocation con 3 cards
5. **Safety limits** — Stop-loss y take-profit visibles por token (expandible)

### Contratos referenciados desde el frontend

| Contrato | Dirección | Propósito |
|----------|-----------|-----------|
| **Deposit Vault (StockWallet)** | `0x573a678Ea7a51B51344fe6a1781BBCCbF0E453C7` | Recibe depósitos, invierte, ejecuta stop-loss/take-profit |
| **AI Capital Account (MinimalAccount)** | `0x74E16132B76Af0B03730F5c4BF540D777b085DDc` | Smart wallet del AI agent con meta-transactions |

### Tokens soportados en el frontend

| Token | Address | Decimals | Uso |
|-------|---------|----------|-----|
| USDT | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` | 6 | Depósito + base token |
| wBRL | `0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0` | 18 | Depósito (Real brasileño) |
| wARS | `0x0DC4F92879B7670e5f4e4e6e3c801D229129D90D` | 18 | Depósito (Peso argentino) |
| WBTC | `0x8aC2901Dd8A1F17a1A4768A6bA4C3751e3995B2D` | 8 | Token de inversión |
| WETH | `0xD221812de1BD094f35587EE8E174B07B6167D9Af` | 18 | Token de inversión |
| aCelUSDT | `0xDeE98402A302e4D707fB9bf2bac66fAEEc31e8Df` | 6 | Receipt token de Aave |

### Configuración web3.ts

- **RPC:** `https://forno.celo.org`
- **Chain:** Celo mainnet (42220)
- **USD_TO_COP_RATE:** 4200
- **DEFAULT_USD_TO_BRL:** 5.05
- **Ripio Ramp:** `https://ramp.ripio.com/onramp` con params dinámicos

### Base de datos (PostgreSQL Railway)

Tablas usadas por el frontend (vía API routes):
- `bot_state` — Estado del bot (last_processed_block, pause_until, processed_events)
- `decisions` — Decisiones del AI agent (action, asset, amount, reason, confidence, level, executed, result)
- `stockwallet_activity` — Log de eventos (timestamp, type, asset, action, reason, tx_hash, pool_fee)
- `stockwallet_asset_status` — Snapshot latest por token (balance, estimated_value, invested, action)
- `knowledge` — Knowledge base del agent (category, key, value)
- `performance` — Métricas históricas (total_value, total_pnl, win_rate, trade_count)

### Componentes NO usados actualmente en page.tsx

- `StatCards.tsx` — 4 cards de métricas agregadas
- `PositionsTable.tsx` — Tabla alternativa de posiciones
- `AaveSection.tsx` — Sección dedicada a Aave
- `DecisionsFeed.tsx` — Feed alternativo de decisiones
- `ActivityLog.tsx` — Log alternativo
- `KnowledgeBaseView.tsx` — Vista de knowledge base

---

## 📦 COMPONENTE 2: StockWallet Smart Contract

**Ubicación:** `/home/openclaw-project/Documentos/stockwallet`

**Stack:** Solidity ^0.8.20 + Foundry + OpenZeppelin + Uniswap V3

### Contrato principal: `StockWallet.sol`

**Funcionalidad:**
- Recibe depósitos de cualquier token → swap a USDT vía Uniswap V3
- Distribuye automáticamente: gas fee (2%) + adgent fee (5%) + inversión (resto)
- Invierte en assets configurados según allocationBps
- Stop-loss y take-profit automáticos ejecutados por el AI agent
- Re-escala allocations automáticamente al agregar/remover assets

**Roles:**
- **Owner:** Configura assets, allocations, risk params, withdraw
- **ADGENT_ROLE:** Ejecuta `invest()` y `selltoken()`

**Configuración:**
- Base token: USDT (configurable en constructor)
- Uniswap V3 Universal Router: `0x643770E279d5D0733F21d6DC03A8efbABf3255B4`
- Permit2: `0x000000000022D473030F116dDEE9F6B43aC78BA3`
- Gas fee: 200 bps (2%)
- Adgent percentage: 500 bps (5%)

**Funciones clave:**
| Función | Caller | Descripción |
|---------|--------|-------------|
| `depositAsset(token, amount, path)` | Anyone | Depósito + swap a USDT |
| `invest(paths)` | ADGENT_ROLE | Distribuye USDT en assets según allocation |
| `selltoken(token, path)` | ADGENT_ROLE | Ejecuta stop-loss o take-profit |
| `selltokenAll(paths)` | Owner | Vende todo |
| `addAsset(config, oldToken)` | Owner | Agrega asset |
| `removeAsset(token)` | Owner | Remueve asset |
| `updateAllocation(token, bps)` | Owner | Actualiza allocation |
| `updateRiskConfig(token, stopLoss, takeProfit)` | Owner | Configura SL/TP |
| `withdrawAsset(token)` | Owner | Retira token |
| `withdrawAssetUsdt(amount)` | Owner | Retira USDT |

**Librerías:**
- `UniswapV3Twap.sol` — TWAP oracle
- `FullMath.sol` — Math de precisión
- `TickMath.sol` — Cálculos de tick

**Deploy en Celo mainnet:**
- Broadcast en `broadcast/StockWalletDeploy.s.sol/42220/`
- Contrato desplegado: `0x573a678Ea7a51B51344fe6a1781BBCCbF0E453C7`

---

## 📦 COMPONENTE 3: MinimalAccount (Account Abstraction v2)

**Ubicación:** `/home/openclaw-project/Documentos/v2_foundry-account-abstraction`

**Stack:** Solidity ^0.8.24 + Foundry + OpenZeppelin + Chainlink

### Contrato: `MinimalAccount.sol`

**Funcionalidad:**
- Smart contract wallet con meta-transacciones (firma off-chain)
- Owner o AI agent (adgent) firman → cualquiera envía la tx
- Whitelist de targets, selectors y recipients
- Pause de emergencia
- Batch execute para operaciones atómicas

**Direcciones pre-configuradas en constructor:**
- Universal Router: `0xe2023F3FA515cF070e07fD9d51c1d236e07843f4`
- Permit2: `0x000000000022D473030F116dDEE9F6B43aC78BA3`
- Aave V3 Pool: `0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402`
- 14 tokens soportados (USDT, USDC, WBTC, WETH, CELO, wBRL, wARS, EURm, CHFm, GBPm, TetherGold, SUSHI, ETHIX, PLASTIK)

**Selectores registrados:**
| Selector | Función | Offset |
|----------|---------|--------|
| `0x095ea7b3` | approve | 0 |
| `0x87517c45` | permit2.permit | 0 |
| `0x3593564c` | UniversalRouter.execute | 256 |
| `0x617ba037` | Aave.supply | 64 |
| `0x69328dec` | Aave.withdraw | 64 |
| `0xa415bcad` | Aave.borrow | 128 |
| `0x573ade81` | Aave.repay | 96 |
| `0xc04b8d59` | exactInput | 64 |
| `0x414bf389` | exactInputSingle | 96 |
| `0xf28c0498` | exactOutput | 64 |
| `0xdb3e2198` | exactOutputSingle | 96 |

**OracleLib.sol** — Wrapper de Chainlink con staleness check (3h timeout)

**Deploy en Celo mainnet:**
- Contrato: `0x74E16132B76Af0B03730F5c4BF540D777b085DDc`
- Guía completa en `docs/ADGENT_GUIDE.md`

---

## 📦 COMPONENTE 4: StockWallet Bot (Price Monitor)

**Ubicación:** `/home/openclaw-project/Documentos/bot/stockwallet-bot`

**Stack:** Node.js (ESM) + viem + PostgreSQL + @celo/attribution-tags

### Funcionalidad

Bot que monitorea el contrato StockWallet en Celo mainnet:

1. **Escucha eventos on-chain:**
   - `AssetDeposited` → ejecuta `invest()` automáticamente
   - `AssetSold`, `StopLossTriggered`, `TakeProfitTriggered` → activa pausa 24h

2. **Monitorea precios cada 15s:**
   - Lee balances de cada asset registrado
   - Quota via Uniswap V3 QuoterV2 (todas las fee tiers: 100, 500, 3000, 10000)
   - Compara con stop-loss y take-profit thresholds
   - Ejecuta `selltoken()` si se dispara SL o TP

3. **Estado persistente en PostgreSQL:**
   - `bot_state` — último bloque procesado, pausa, eventos procesados
   - `stockwallet_activity` — log de eventos críticos
   - `stockwallet_asset_status` — snapshot latest por token

4. **Pausa automática:**
   - 24h después de cada venta
   - Previene re-entradas precipitadas

5. **Modo DRY_RUN:**
   - Simula operaciones sin enviar txs (default: true)

### Configuración (.env)
- `STOCKWALLET_ADDRESS` — dirección del contrato
- `UNISWAP_QUOTER_ADDRESS` — Quoter V2
- `BOT_PRIVATE_KEY` — clave del agent con ADGENT_ROLE
- `DRY_RUN` — true/false
- `POLL_INTERVAL_MS` — 15000 (default)
- `DATABASE_URL` — PostgreSQL Railway

---

## 📦 COMPONENTE 5: Celo Investment Agent (bot_adgent)

**Ubicación:** GitHub `https://github.com/batublockdev/bot_adgent`
**Copia local:** `/home/openclaw-project/.openclaw/workspace/agents/dev/celo-investment-agent`

**Stack:** TypeScript + viem + OpenAI SDK + @x402/fetch + PostgreSQL + @celo/attribution-tags

### Arquitectura

```
Loop cada 10h
  │
  ├── 1. KNOWLEDGE UPDATER — Lee on-chain: precios, APYs Aave, balances
  │     └── Guarda en tabla `knowledge` (PostgreSQL)
  │
  ├── 2. PERCEPCIÓN — Lee balances del MinimalAccount + posiciones Aave
  │     ├── getAllMinimalAccountBalances() — 14 tokens
  │     ├── getAavePositions() — aTokens, debt tokens, Health Factor
  │     └── getMarketData() — precios on-chain + DeFiLlama fallback
  │
  ├── 3. CONTEXTO — Construye prompt para LLM
  │     ├── System prompt con estrategias DeFi
  │     ├── Estado actual (balances, Aave, permisos)
  │     ├── Market data (precios, TVLs)
  │     ├── Historial (trades previos, performance)
  │     └── Reglas de seguridad por nivel
  │
  ├── 4. DECISIÓN — LLM decide acción
  │     ├── Proveedor 1: x402/Agent402 (DeepSeek-V3, $0.003/req en USDC)
  │     ├── Fallback 1: Ollama Cloud (glm-5.3-flash:cloud)
  │     └── Fallback 2: Google Gemini (gemini-2.0-flash)
  │
  ├── 5. EJECUCIÓN — Firma off-chain → MinimalAccount
  │     ├── executeWithSignature() — operación individual
  │     ├── batchExecuteWithSignature() — operaciones atómicas
  │     ├── executeSwap() — approve + permit2 + swap
  │     ├── executeSupply() — approve + supply Aave
  │     ├── executeBorrow() / executeRepay() / executeWithdraw()
  │     └── executeSwapAndSupply() — swap + supply en 2 pasos
  │
  └── 6. MEMORIA — Guarda en PostgreSQL
        ├── decisions — cada decisión del LLM
        ├── trades — trades ejecutados
        ├── performance — snapshot de performance
        └── strategies — estrategias conocidas + success rate
```

### Niveles de autonomía

| Nivel | Permisos | Restricciones |
|-------|----------|---------------|
| **Alto** | Swap, supply, borrow, repay, withdraw | HF > 1.5 para borrow, max 70% colateral |
| **Medio** | Swap, supply | No borrow, max 30% por asset |
| **Bajo** | Swap a USDT, supply | Solo USDT/USDC, allocation 50/50 |

### Configuración actual
- **Level:** Alto
- **Loop:** 10 horas
- **Confidence mínima:** 70%
- **MinimalAccount:** `0x74E16132B76Af0B03730F5c4BF540D777b085DDc`
- **Attribution tag:** `celo_6d966470558a`

### Archivos del bot_adgent

| Archivo | Función |
|---------|---------|
| `src/index.ts` | Loop principal: percepción → contexto → decisión → ejecución |
| `src/decision.ts` | Integración LLM (x402 → Ollama → Gemini), system prompts, parsing JSON |
| `src/executor.ts` | Firma EIP-191, execute/batchExecute, construcción de calldata, swaps, Aave |
| `src/client.ts` | Wallet client con viem + attribution tags |
| `src/context.ts` | Builder del contexto para LLM (balances, Aave, allowances, market data) |
| `src/marketData.ts` | Precios on-chain desde pools Uniswap V3 + fallback DeFiLlama |
| `src/memory.ts` | PostgreSQL: trades, decisions, performance, strategies, knowledge |
| `src/allowanceManager.ts` | Verificación de permisos del MinimalAccount (targets, selectors, allowances) |
| `src/knowledgeUpdater.ts` | Actualiza knowledge base con datos on-chain (precios, APYs, balances) |
| `scripts/execute-swap.ts` | Script manual para ejecutar swaps |

---

## 🔗 MAPEO DE CONTRATOS Y DIRECCIONES

### Celo Mainnet (Chain ID: 42220)

| Contrato | Dirección | Componente |
|----------|-----------|------------|
| StockWallet (Vault) | `0x573a678Ea7a51B51344fe6a1781BBCCbF0E453C7` | Frontend + Bot |
| MinimalAccount (AI Capital) | `0x74E16132B76Af0B03730F5c4BF540D777b085DDc` | Frontend + bot_adgent |
| Universal Router (v1) | `0x643770E279d5D0733F21d6DC03A8efbABf3255B4` | StockWallet.sol |
| Universal Router (v2) | `0xe2023F3FA515cF070e07fD9d51c1d236e07843f4` | MinimalAccount.sol |
| Permit2 | `0x000000000022D473030F116dDEE9F6B43aC78BA3` | Ambos |
| Aave V3 Pool | `0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402` | MinimalAccount + bot_adgent |
| Uniswap V3 Factory | (en constructor) | StockWallet.sol |
| Uniswap V3 Quoter V2 | (en constructor) | StockWallet.sol + Bot |

### Pools Uniswap V3 confirmadas en Celo

| Par | Fee | Pool Address |
|-----|-----|--------------|
| wBRL/USDT | 100 (0.01%) | `0x01c3cf91cdf7B34181C7eC8566c0236951FEA40F` |
| CELO/USDT | 100 (0.01%) | `0x6cde5f5a192fBf3fD84df983aa6DC30dbd9f8Fac` |
| WETH/USDT | 3000 (0.3%) | `0x6F42B9D2085a0dEb711C00A460a98B9863ae4897` |
| WBTC/USDT | 3000 (0.3%) | `0x57332c214E647063bB4c5A73e5A8b7bbA79Be1E4` |
| USDC/USDT | 100 (0.01%) | `0x1a810e0B6c2dd5629AFa2f0c898b9512C6F78846` |

### Tokens (14 total)

| Token | Address | Decimals | Tipo |
|-------|---------|----------|------|
| USDT | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` | 6 | Stablecoin USD |
| USDC | `0xcebA9300f2b948710d2653dD7B07f33A8B32118C` | 6 | Stablecoin USD |
| WBTC | `0x8aC2901Dd8A1F17a1A4768A6bA4C3751e3995B2D` | 8 | Crypto (Bitcoin) |
| WETH | `0xD221812de1BD094f35587EE8E174B07B6167D9Af` | 18 | Crypto (Ethereum) |
| CELO | `0x471EcE3750Da237f93B8E339c536989b8978a438` | 18 | Crypto (Celo nativo) |
| wBRL | `0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0` | 18 | Fiat LATAM (Real) |
| wARS | `0x0DC4F92879B7670e5f4e4e6e3c801D229129D90D` | 18 | Fiat LATAM (Peso AR) |
| EURm | `0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73` | 18 | Fiat (Euro) |
| CHFm | `0xb55a79F398E759E43C95b979163f30eC87Ee131D` | 18 | Fiat (Franco) |
| GBPm | `0xCCF663b1fF11028f0b19058d0f7B674004a40746` | 18 | Fiat (Libra) |
| TetherGold | `0xaf37E8B6C9ED7f6318979f56Fc287d76c30847ff` | 6 | Commodities (Oro) |
| SUSHI | `0xD15EC721C2A896512Ad29C671997DD68f9593226` | 18 | DeFi token |
| ETHIX | `0x9995cc8F20Db5896943Afc8eE0ba463259c931ed` | 18 | DeFi token |
| PLASTIK | `0x27cd006548dF7C8c8e9fdc4A67fa05C2E3CA5CF9` | 18 | DeFi token |

### Aave V3 aTokens y debt tokens

| Token | aToken | Var Debt Token |
|-------|--------|----------------|
| USDT | `0xDeE98402A302e4D707fB9bf2bac66fAEEc31e8Df` | `0x444E85e29F3417E0Df6B697bfDfE5E9A96B550e5` |
| USDC | `0xE15324a9887999803b931Ac45aa89a94A9750052` | `0x7e16eeBAC3276515EDD0BC54E7241668eF015E33` |
| WETH | `0xf385280F36e009C157697D25E0B802EfaBfd789c` | `0x6508cff7c5FbA053Af00a4E894500e6fA00274B7` |
| WBTC | `0x8B62d241Bf59f40991DCd18531683156d7013355` | (pendiente verificar) |

---

## 🗄️ BASE DE DATOS COMPARTIDA (PostgreSQL Railway)

**Connection string:** `postgresql://postgres:BDQhRVQZxLdSpBrFJdKvEJXqPZlUlShg@shuttle.proxy.rlwy.net:46796/railway`

### Tablas

| Tabla | Creada por | Propósito |
|-------|-----------|-----------|
| `bot_state` | stockwallet-bot | Estado del bot (bloque, pausa, eventos) |
| `stockwallet_activity` | stockwallet-bot | Log de eventos críticos |
| `stockwallet_asset_status` | stockwallet-bot | Snapshot latest por token |
| `decisions` | bot_adgent | Decisiones del LLM |
| `trades` | bot_adgent | Trades ejecutados |
| `performance` | bot_adgent | Snapshots de performance |
| `strategies` | bot_adgent | Estrategias conocidas |
| `knowledge` | bot_adgent | Knowledge base (precios, APYs, balances) |

---

## 🔄 FLUJO COMPLETO DE UN DEPÓSITO

1. **Usuario abre InvestModal** en el frontend
2. **Conecta MetaMask** → switch a Celo mainnet
3. **Selecciona token** (USDT/wBRL/wARS) y monto
4. **Si no tiene balance** → botón "Buy on Ripio" (PSE/PIX/ARS)
5. **Approve ERC20** → `approve(vault, amount)` desde MetaMask
6. **depositAsset()** → `vault.depositAsset(token, amount, '0x')`
7. **Vault swap** → Si no es USDT, swap a USDT vía Uniswap V3
8. **Evento AssetDeposited** → Bot detecta el evento
9. **Bot ejecuta invest()** → Distribuye USDT en assets según allocationBps
10. **AI Capital Account** → Recibe 20% para gestión autónoma
11. **bot_adgent** → En siguiente ciclo (10h), lee balances, LLM decide, ejecuta vía MinimalAccount
12. **Dashboard** → Auto-refresh muestra posiciones actualizadas

---

## ⚠️ NOTAS IMPORTANTES PARA MODIFICACIONES

1. **Universal Router tiene 2 direcciones diferentes:**
   - StockWallet.sol usa `0x643770E279d5D0733F21d6DC03A8efbABf3255B4`
   - MinimalAccount.sol usa `0xe2023F3FA515cF070e07fD9d51c1d236e07843f4`
   - El frontend (`web3.ts`) usa la de MinimalAccount

2. **Componentes no usados:** StatCards, PositionsTable, AaveSection, DecisionsFeed, ActivityLog, KnowledgeBaseView existen pero no se importan en `page.tsx`

3. **El frontend usa 2 direcciones clave:**
   - `DEPOSIT_VAULT_CONTRACT_ADDRESS` = StockWallet
   - `AI_CAPITAL_ACCOUNT_ADDRESS` = MinimalAccount

4. **Allocation hardcodeada en el frontend:** 78% / 20% / 2% está en AccountSummary e InvestModal, no viene del contrato

5. **StockWallet Bot** usa `ethers` como dependency pero el código usa `viem` (dependency legacy)

6. **bot_adgent** tiene 3 proveedores LLM con fallback encadenado:
   - x402 (pago en USDC on-chain, $0.003/req)
   - Ollama Cloud
   - Google Gemini free tier

7. **El bot_adgent está deployado en Railway** (`railway.json` incluido)

8. **Aave caps:** CELO no se puede supply (cap lleno), USDT sí funciona

9. **Fees de pool confirmados:** wBRL→USDT = fee 100, USDT→WBTC = fee 3000

10. **DRY_RUN del stockwallet-bot:** Por defecto en true (simula, no ejecuta txs reales)

---

*Documento generado por Dev Agent — 2026-11-06*
*Basado en revisión completa de: Fronted_ai_adgent, stockwallet, v2_foundry-account-abstraction, stockwallet-bot, bot_adgent*
