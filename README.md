# 🏪 NEXUS Bazaar — Agent Skill Marketplace on Base

> **Search anywhere. Trust through Bazaar.**

NEXUS Bazaar is the first **federated skill marketplace** for AI agents, built on Base. Agents can discover, evaluate, and purchase skills from multiple sources — all with built-in trust verification and on-chain settlement.

## 🎯 What is this?

A marketplace where **AI agents autonomously**:
1. **Login** with their own wallet (Privy or Coinbase Agentic Wallet)
2. **Search** skills across Bazaar, ClawHub, GitHub, and NPM
3. **Evaluate** trust signals (S-DNA verification, Guardian security scan, Core-Temp reputation)
4. **Purchase** skills with USDC on Base
5. **Generate proof** of every transaction for auditability

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              NEXUS Bazaar                   │
│                                             │
│  ┌──────────┐  ┌─────────────────────────┐ │
│  │  Skill   │  │   Skill Aggregator      │ │
│  │  Market  │  │  (Federated Search)     │ │
│  │ (Native) │  │                         │ │
│  │          │  │  ClawHub · GitHub · NPM │ │
│  └────┬─────┘  └────────────┬────────────┘ │
│       │                     │              │
│       └──────────┬──────────┘              │
│                  ▼                         │
│          Trust Engine                      │
│    S-DNA · Guardian · Core-Temp            │
│                  ▼                         │
│          Settlement Layer                  │
│     USDC on Base · DRY_RUN proofs          │
└─────────────────────────────────────────────┘
```

### Two-Layer Design

| Layer | Name | Function |
|-------|------|----------|
| **Layer A** | Listing Aggregator | Unified search across 4+ sources |
| **Layer B** | Decision Aggregator | Trust comparison, price routing, attribution |

### Wallet Options

| Wallet | Target | Integration |
|--------|--------|-------------|
| 🔐 **Privy** | Teams / Enterprise | Role-based policies, embedded wallets |
| 💰 **Agentic Wallet** | Solo agents | 2-min setup, CLI-native, x402 payments |

## 🛡️ Trust Model

Every skill is evaluated on three axes:

- **🧬 S-DNA** — Cryptographic origin verification (who made it?)
- **🛡️ Guardian** — Automated security scan (is it safe?)
- **🌡️ Core-Temp** — Reputation score (is the author trusted?)

External skills are **untrusted by default**. Bazaar native skills carry verified trust badges.

### CLICK_OUT_ONLY Policy

External skills are **never hosted or executed** by Bazaar. We provide:
- Discovery (search results)
- Trust comparison (Guardian scan available)
- Attribution tracking (outbound event logging)
- Migration path (list on Bazaar for full trust)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.10+ (for Arena simulation)

### Bazaar UI
```bash
cd demo/bazaar-app
cp .env.example .env
# Add your Privy App ID to .env
npm install
npm run dev
```

### awal Bridge (for Agentic Wallet)
```bash
node server.js
# Runs on http://localhost:3098
```

### Arena Simulation
```bash
cd demo/arena-engine
python3 simulator.py
# Outputs scoreboard + simulation_result.json
```

## 📁 Project Structure

```
demo/
├── bazaar-app/                  # React + Vite + Tailwind
│   ├── src/
│   │   ├── wallet/              # Privy & awal adapters
│   │   ├── bazaar/              # Skill search & cards
│   │   ├── pages/               # Login, Market, Purchase
│   │   ├── components/          # Header, badges
│   │   └── lib/                 # On-chain queries, proofs
│   ├── server.js                # awal CLI bridge
│   └── .env                     # Privy App ID
│
└── arena-engine/                # Python simulation
    └── simulator.py             # 6-agent trading arena
```

## 🔑 Key Differentiators

| Feature | Traditional Marketplaces | NEXUS Bazaar |
|---------|------------------------|--------------|
| **Buyer** | Humans | AI Agents |
| **Discovery** | Single platform | Federated (4+ sources) |
| **Trust** | Reviews/stars | Cryptographic (S-DNA + Guardian) |
| **Settlement** | Credit card | USDC on Base (gasless) |
| **Execution** | Manual install | Agent-to-agent (x402) |

## ⚡ Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS
- **Auth:** Privy (embedded wallets) + Coinbase Agentic Wallet (CLI)
- **Chain:** Base (Sepolia testnet for demo)
- **On-chain:** viem for balance queries
- **Simulation:** Python (GBM price feed, 6 strategies)
- **Payments:** USDC + x402 protocol (agent-to-agent)

## ⚠️ Demo Mode

This demo runs in **DRY_RUN mode**:
- No real transactions are executed
- All tx receipts are simulated
- Proof JSONs are generated for audit trail
- Base Sepolia testnet only

## 📜 License

Proprietary — Aoineco & Co. All rights reserved.

---

*Built for Base Batches 2026 🔵*
