# AOI Base Batches Demo

> Proof-first AI infrastructure for verified actions, auditable records, and proof-linked workflows.

This repository is the **public demo repo** for Aoineco's Base Batches application.

It is designed to show one clear idea:

**AI systems should not only act — they should leave behind proof.**

## What this demo shows

This repo focuses on a narrow, reviewable slice of that vision:

- a Base-connected demo app
- a read-only / dry-run execution flow
- signed or structured execution receipts
- a simple verification surface for reviewers
- public-safe artifacts that are easier to inspect than a black-box agent demo

In short:

**we are not pitching “AI magic.”**
We are pitching a proof-first execution model for AI systems.

## Why this exists for Base Batches

For Base Batches, we want to show that:

1. **Aoineco is building proof-first AI infrastructure**
2. **Base is a strong home for machine-usable, verifiable action flows**
3. even a demo should produce artifacts that a reviewer can inspect, not just a marketing claim

This repo is therefore intentionally optimized for:

- clarity
- reviewer quickstart
- reproducibility
- audit-friendly outputs

## Current demo scope

The public demo in this repo covers:

- wallet login and Base-oriented demo flow
- federated skill discovery UI
- dry-run purchase / execution experience
- local execution receipt generation
- read-only verification endpoints
- signed receipt / proof-oriented server behavior

### Important limits

This is a **public-safe demo**, not the full product.

It intentionally excludes or simplifies:

- real production transaction execution
- sensitive trust logic
- deeper internal proof systems
- broader long-term archive functionality

## What Aoineco is actually building

At the company level, the direction is larger than this demo.

We are building infrastructure for:

- **verified actions**
- **auditable records**
- **proof-linked workflows**

And over time, those verified results should accumulate into:

- **The Archive** — a trustworthy history of verified work

This repo shows the **current demo layer**, not the entire long-term system.

## Why Base

Base matters here for three reasons:

1. **fast, low-cost execution environments** are a good fit for machine activity
2. **onchain-adjacent verification patterns** are easier to compose into auditable workflows
3. Base is a strong place to turn agent actions into inspectable, shared infrastructure primitives

We do **not** claim that everything must be onchain.

Our view is simpler:

- actions need proof
- proofs need stable references
- workflows need outputs that can be checked later

Base is a strong substrate for that direction.

## Reviewer quickstart

### Prerequisites
- Node.js 20+
- npm

### Install
```bash
npm install
```

### Run the frontend
```bash
npm run dev
```

### Run the bridge / demo server
```bash
npm run bridge
```

Default bridge URL:
- `http://localhost:3098`

### Production-like local serve
```bash
npm run serve
```

## Environment

Create a `.env` file from `.env.example`.

```bash
cp .env.example .env
```

Current public demo variables:

- `VITE_PRIVY_APP_ID`
- `VITE_BAZAAR_BRIDGE_URL`
- `BASE_RPC_URL` (optional for server-side read-only flows)
- `GITHUB_TOKEN` (optional, for federated search enrichment)

## Demo walkthrough

A reviewer can understand the repo in this order:

1. Open the app
2. Connect wallet in demo flow
3. Browse the market / search across multiple sources
4. open a skill detail page
5. trigger a dry-run purchase / execution flow
6. inspect the generated receipt / proof JSON
7. visit the verification screen
8. inspect server-side read-only verification endpoints

## Public endpoints worth checking

Read-only / demo-oriented endpoints include:

- `GET /api/core/workflows`
- `POST /api/demo/runverify`
- `POST /api/core/verify`
- `GET /api/aggregator/search?q=...`

These are useful because they expose the repo’s core thesis more directly than UI alone:

**a run should produce something verifiable.**

## Repository guide

- `README.md` — reviewer entry point
- `ARCHITECTURE.md` — current technical structure
- `SUBMISSION_SUMMARY.md` — submission-facing project summary
- `EVIDENCE_LOG.md` — proof / decision / reviewer-facing evidence notes
- `SUBMISSION_CHECKLIST.md` — packaging checklist
- `examples/sample_execution_receipt.json` — sanitized reviewer sample
- `server.js` — bridge + proof / verification demo endpoints
- `src/` — frontend demo app
- `default_workflows.json` — public workflow registry for read-only demo endpoints

## What changed from earlier framing

Earlier drafts of this repo leaned too heavily on marketplace branding alone.

For Base Batches, the clearer story is:

- not “just a marketplace”
- not “just an agent demo”
- but **proof-first AI infrastructure**

That is now the framing of this repository.

## Submission positioning

For application purposes, describe this repo as:

> A public demo of Aoineco’s proof-first AI infrastructure direction, showing how agent actions can produce structured, auditable, and reviewable receipts instead of unverifiable black-box behavior.

## License

Proprietary — Aoineco & Co. All rights reserved.
