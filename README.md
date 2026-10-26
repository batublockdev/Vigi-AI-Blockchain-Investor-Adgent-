# Adgent Protocol

**Autonomous AI-Driven DeFi Portfolio Management with Zero-Trust Vaults on Celo**

---

## 1. Executive Summary

**Adgent Protocol** is an autonomous, smart-contract-enforced decentralized finance (DeFi) investment architecture operating on the Celo network. The system combines off-chain Artificial Intelligence strategy generation with strict on-chain Zero-Trust execution rules.

By integrating Large Language Models (LLMs) with meta-transaction smart account vaults, Adgent Protocol enables autonomous rebalancing, yield optimization, and risk management across protocols such as Uniswap V3 and Aave V3—while guaranteeing that AI agents can never divert funds to unauthorized external addresses.

---

## 2. System Architecture & Core Components

The architecture consists of two main on-chain smart contracts and two specialized off-chain automation engines:

```
                              [Investor / Owner]
                                      │
                                      │ USDC Deposit
                                      ▼
                          ┌───────────────────────┐
                          │   StockWallet.sol     │
                          └───────────┬───────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │ 78%                       │ 20%                       │ 2%
          ▼                           ▼                           ▼
┌──────────────────┐        ┌───────────────────┐       ┌───────────────────┐
│ Asset Basket     │        │ MinimalAccount    │       │ Gas Fee Reserve   │
│ (Uniswap V3)     │        │ (Zero-Trust Vault)│       │ (Operational)     │
└──────────────────┘        └─────────┬─────────┘       └───────────────────┘
                                      ▲
                        Meta-TX Signed│
                                      │
                            ┌───────────────────┐
                            │    bot_adgent     │
                            │  (index.ts / LLM) │
                            └───────────────────┘
                              (Runs every 10h)
```

### On-Chain Smart Contracts

#### 1. StockWallet.sol (Portfolio & Asset Basket Manager)
- **Deposit & Allocation**: Receives base token deposits (USDC) and distributes capital according to pre-configured asset weightings.
- **Capital Split**:
  - **78%**: Direct investment into the pre-defined basket of tokens via Uniswap V3.
  - **20%**: Allocated to `MinimalAccount.sol` for autonomous AI agent yield strategies.
  - **2%**: Retained as an operational gas fee reserve.
- **DEX Integration**: Executes swaps using Uniswap V3 (Universal Router + Permit2) and queries `IQuoterV2` for optimal pool fees.

#### 2. MinimalAccount.sol (Zero-Trust Smart Account Vault)
- **Meta-Transactions**: Supports off-chain signatures from either the contract owner or the designated AI agent (`_adgent`).
- **Target & Selector Whitelisting**: Restricts execution strictly to authorized contracts (`isAllowedTarget`: Uniswap V3 Universal Router, Permit2, Aave V3 Pool) and approved function selectors (`isSelectorSupported`).
- **Recipient Invariant Enforcement (`RecipientInvalido`)**: Inspects transaction `calldata` using offset parameters (`functionAddressOffsets`) to verify that destination token addresses match `MinimalAccount.sol` (`address(this)`). If an external address is supplied as the recipient, the transaction reverts immediately.

---

### Off-Chain Automation & Intelligence

#### 3. bot.js (bot_Check_invest - Off-chain Risk & Event Guard)
- **Event Listening**: Monitored via `viem` and PostgreSQL, tracking events such as `AssetDeposited`, `AssetSold`, `StopLossTriggered`, and `TakeProfitTriggered`.
- **Automated Execution**: Triggers `invest()` on `StockWallet.sol` when pending USDC deposits exceed threshold limits.
- **Risk Parameters**: Continuously checks token prices via Uniswap `IQuoterV2`. Executes 100% liquidation upon crossing Stop-Loss thresholds and harvests gains on Take-Profit triggers.
- **Safety Cooldown**: Imposes a mandatory 24-hour pause following any Stop-Loss or Take-Profit sale to prevent repetitive trading loops.

#### 4. index.ts (bot_adgent - Autonomous AI Strategy Engine)
- **Execution Cycle**: Runs on a scheduled loop every 10 hours.
- **Market Context & Inference**: Gathers live portfolio balances and queries LLM models (via Ollama Cloud or Gemini) using the x402 protocol for USDC inference micropayments.
- **Confidence Threshold**: Generates and signs meta-transactions only when the AI model confidence score reaches or exceeds 70%.

---

## 3. Capital Flow Breakdown

| Component | Share | Primary Function | Destination / Protocol |
| :--- | :---: | :--- | :--- |
| **Asset Basket** | **78%** | Direct automated portfolio diversification | Uniswap V3 Pools |
| **AI Smart Account** | **20%** | Autonomous yield optimization & tactical swaps | MinimalAccount.sol (Aave V3 / Uniswap V3) |
| **Gas Reserve** | **2%** | Protocol maintenance & transaction fee coverage | Operational Gas Balance |

---

## 4. Security & Zero-Trust Invariants

1. **Sandboxed AI Execution**: AI agents sign meta-transactions off-chain; however, `MinimalAccount.sol` enforces strict on-chain validation before execution.
2. **Strict Calldata Inspection**: The `RecipientInvalido` error guards against prompt injection or model hallucination by ensuring token output addresses are hard-locked to the smart account.
3. **Emergency Pause**: Global pause mechanisms allow administrative freezing of contract operations during market anomalies or maintenance.

---

## 5. Repositories & Contract Code

- **Smart Account Vault**: `ai_adgent_rules_contract_solidity / src / ethereum / MinimalAccount.sol`
- **Portfolio Management Contract**: `stocktoken-wallet-uniswap / src / StockWallet.sol`
- **Risk & Monitoring Bot**: `bot_Check_invest / src / bot.js`
- **AI Agent Engine**: `bot_adgent / src / index.ts`
- **Developer Profile**: GitHub (`batublockdev`)

---

## 6. Technology Stack

- **Blockchain Network**: Celo Mainnet
- **Smart Contracts**: Solidity ^0.8.24, OpenZeppelin, Uniswap V3, Aave V3
- **Off-Chain Stack**: TypeScript, JavaScript (Node.js), Viem, PostgreSQL
- **AI Infrastructure**: LLM (Ollama / Gemini) integrated with x402 USDC micropayments
