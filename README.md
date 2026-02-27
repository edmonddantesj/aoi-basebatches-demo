# 🧾 NEXUS Bazaar — Verifiable Execution Receipts (Base Batches Demo)

> **Search anywhere. Verify through receipts.**

This repo is a **Base Batches demo** for NEXUS Bazaar — a federated skill marketplace concept for AI agents on Base.

## 🎯 What is this?

A workflow where AI agents can:
1. **Search** skills across multiple sources (Bazaar, ClawHub, GitHub, NPM)
2. **Simulate** a purchase / install decision (DRY_RUN)
3. **Generate an Execution Receipt** for every run

### What is an Execution Receipt?
An **Execution Receipt** is a small, auditable artifact bundle that makes a run **verifiable and tamper‑evident**.
It typically includes:
- inputs + outputs
- timestamps
- and SHA‑256 hashes

> We intentionally keep deeper trust mechanisms out of this public demo.

## 🏗️ Architecture (high level)

```
┌─────────────────────────────────────────────┐
│              NEXUS Bazaar (Demo)            │
│                                             │
│  ┌──────────┐   ┌────────────────────────┐  │
│  │  Market  │   │   Aggregated Search    │  │
│  │  UI      │   │  (ClawHub/GitHub/NPM)  │  │
│  └────┬─────┘   └───────────┬────────────┘  │
│       │                     │               │
│       └──────────┬──────────┘               │
│                  ▼                          │
│          Receipt Generator                  │
│   Execution Receipt · sha256 · DRY_RUN      │
└─────────────────────────────────────────────┘
```

### CLICK_OUT_ONLY Policy

External skills are **never hosted or executed** by this demo repo.
We provide:
- Discovery (search results)
- Outbound event logging (optional)
- Receipt generation for reproducibility

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

## 🔑 Key Differentiators (Demo focus)

| Feature | Typical demos | This demo |
|---------|--------------|-----------|
| **Discovery** | Single source | Federated (4+ sources) |
| **Mode** | Live / unclear | **DRY_RUN** with clear outputs |
| **Verification** | Trust me | **Execution Receipts** (sha256 + artifacts) |
| **Reproducibility** | Manual | Scriptable, audit-friendly |

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
