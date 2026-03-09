# AOI Base Batches Demo

> Proof-first AI infrastructure for verified actions, auditable records, and proof-linked workflows.

This repository is the **public demo repo** for Aoineco's Base Batches application.

It shows a simple but important idea:

**AI systems should not only act — they should leave behind proof.**

## The problem

AI agents can execute actions, but teams still struggle to trust them in real workflows because the process is often hard to inspect later.

What matters in practice is not only that something happened, but also:
- what was executed
- under what inputs or conditions
- whether the output can be checked later
- whether the workflow leaves behind evidence instead of only claims

Aoineco is building toward that missing layer.

## Judge in 2 minutes

### 1) Install
```bash
npm install
```

### 2) Run
```bash
npm run bridge
npm run dev
```

### 3) Verify the core idea
Try the demo verification flow:

```bash
curl -sS -X POST http://localhost:3098/api/demo/runverify \
  -H "content-type: application/json" \
  -d '{}'
```

Expected shape of result:
- a `receipt_id`
- a verification result
- structured evidence payload

You can also inspect:
- `GET /api/core/workflows`
- `POST /api/core/verify`
- `examples/sample_execution_receipt.json`

**The point of the repo is not only UI. The point is that a run should leave behind something inspectable.**

## What this demo shows

This repository focuses on a narrow, reviewable slice of the broader product direction:

- a Base-oriented demo app
- wallet-connected user flow
- dry-run and read-only execution paths
- structured execution receipts
- verification-friendly endpoints
- an early path toward accumulated verified outcomes

In short:

**we are not pitching “AI magic.”**
We are pitching a proof-first execution model for AI systems.

## Why this matters for Base Batches

For Base Batches, we want to show that:

1. **Aoineco is building proof-first AI infrastructure**
2. **Base is a strong environment for machine-usable, inspectable workflows**
3. even an early demo can produce reviewable outputs instead of black-box claims

## Why Base

We think Base is a strong fit for this direction because it supports:

- low-cost machine activity
- wallet-connected user participation
- onchain-adjacent verification and settlement flows
- early evidence layers for Base-native machine actions

We do **not** claim that every part of the system must live onchain.

Our claim is narrower and more practical:

- actions need proof
- proofs need stable references
- workflows need outputs that can be checked later
- Base is a strong place to start building that stack

## What makes this more than a concept demo

This project is no longer only an internal mockup.

### Early validated usage
- approximately **8 verified outcomes** have already been collected in early demo / validation context
- the verification flow has been exercised by real users outside the core build loop
- we are preparing an Archive-style surface to display accumulated verified outcomes more clearly

### Public distribution and participation
We also used public distribution to bring external users into the verification flow.

On **2026-02-26**, we published an X post inviting people to run the demo and return verification outputs such as:
- `VERIFIED=True`
- `RECEIPT_ID=...`

This mattered because it helped move the project beyond an internal-only prototype and into a workflow that outside users could actually enter.

### Failure → fix → verified success
Not every flow worked on the first try.

That is part of the evidence.

We tested the workflow with real users, observed failure cases, diagnosed issues, iterated, and then produced verified outcomes. Representative screenshots and evidence notes are being prepared to show not only success states, but also the hardening process behind them.

## Current vs vision

| Layer | What exists now | What comes next |
|------|------------------|-----------------|
| **Current repo** | demo app, wallet flow, dry-run / read-only execution, receipts, verification endpoints | stronger reviewer packaging, clearer proof surfaces, better Archive presentation |
| **Near-term product step** | limited AOI PRO beta with external testers | early Archive experience, visible verified outcome accumulation, small live Base transactions |
| **Long-term vision** | proof-first execution model | **The Archive** — a trustworthy history of verified work |

## AOI PRO beta context

We are currently running a limited **AOI PRO beta** with external testers.

Public-safe description of the beta includes:
- wallet-connected demo participation
- visible verification outcomes
- early proof-linked workflow testing
- preparation for small real Base transactions after the beta period

After the beta phase, we plan to open an early Archive experience and begin very small wallet-based purchases on Base starting from **$0.01 USDC** in order to seed the first live proof trail.

The goal is to test proof accumulation and real usage behavior, not to optimize short-term revenue.

## What Aoineco is actually building

At the company level, the direction is larger than this demo.

We are building infrastructure for:
- **verified actions**
- **auditable records**
- **proof-linked workflows**

And over time, those verified results should accumulate into:
- **The Archive** — a trustworthy history of verified work

This repository shows the **current public demo slice**, not the entire product.

## Public endpoints worth checking

Read-only / demo-oriented endpoints include:
- `GET /api/core/workflows`
- `POST /api/demo/runverify`
- `POST /api/core/verify`
- `GET /api/aggregator/search?q=...`

These matter because they expose the repo’s core thesis more directly than UI alone:

**a run should produce something verifiable.**

## Reviewer guide

If you only inspect a few things, inspect these:
- `README.md`
- `SUBMISSION_SUMMARY.md`
- `VERIFIED_EVIDENCE_SUMMARY.md`
- `examples/sample_execution_receipt.json`
- `server.js`

## Repository guide

- `README.md` — reviewer entry point
- `ARCHITECTURE.md` — current technical structure
- `SUBMISSION_SUMMARY.md` — submission-facing summary
- `VERIFIED_EVIDENCE_SUMMARY.md` — validated usage, participation, and Archive direction
- `EVIDENCE_LOG.md` — evidence index and supporting notes
- `SUBMISSION_CHECKLIST.md` — packaging checklist
- `examples/sample_execution_receipt.json` — sanitized reviewer sample
- `server.js` — bridge + proof / verification demo endpoints
- `src/` — frontend demo app
- `default_workflows.json` — public workflow registry

## Credits placeholder

We promised to acknowledge early contributors who helped generate verified outcomes.

### Early verification contributors (placeholder)
1. TBD — X: TBD — verified image: pending
2. TBD — X: TBD — verified image: pending
3. TBD — X: TBD — verified image: pending
4. TBD — X: TBD — verified image: pending
5. TBD — X: TBD — verified image: pending
6. TBD — X: TBD — verified image: pending
7. TBD — X: TBD — verified image: pending
8. TBD — X: TBD — verified image: pending

## Submission positioning

For application purposes, describe this repo as:

> A public demo of Aoineco’s proof-first AI infrastructure direction, showing how agent actions can produce structured, auditable, and reviewable receipts instead of unverifiable black-box behavior — and how those verified outcomes can begin accumulating into an Archive-style review layer.

## License

Proprietary — Aoineco & Co. All rights reserved.
