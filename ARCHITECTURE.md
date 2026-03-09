# Architecture

## Goal

This repository is a **public-safe Base Batches demo** for Aoineco.

It demonstrates a narrow but important slice of the broader product direction:

- agent-facing execution flows
- proof-oriented outputs
- auditable receipts
- verification-friendly interfaces

The design goal is not maximum complexity.
It is **maximum reviewer clarity**.

---

## Product framing

At a high level:

- the frontend shows a Base-oriented AI skill / action workflow
- the server exposes read-only and dry-run proof flows
- the system produces artifacts that can be inspected later

This supports Aoineco's broader thesis:

**verified actions → auditable records → proof-linked workflows → The Archive**

---

## System overview

```text
┌──────────────────────────────────────────────────────────┐
│                    AOI Base Batches Demo                 │
├──────────────────────────────────────────────────────────┤
│ Frontend (React / Vite)                                 │
│  - login                                                 │
│  - market / search                                       │
│  - skill detail                                          │
│  - dry-run purchase flow                                 │
│  - verified receipts view                                │
├──────────────────────────────────────────────────────────┤
│ Bridge / Server (Node)                                   │
│  - aggregator endpoints                                  │
│  - clickout logging                                      │
│  - workflow registry                                     │
│  - public demo run+verify endpoint                       │
│  - signed receipt generation + verification              │
├──────────────────────────────────────────────────────────┤
│ State / Evidence                                         │
│  - local receipt storage                                 │
│  - workflow registry JSON                                │
│  - receipt JSONL / identity / api key state              │
└──────────────────────────────────────────────────────────┘
```

---

## Frontend structure

### Key routes / screens
- `LoginPage` — wallet entry point
- `MarketPage` — skill discovery surface
- `SkillDetailPage` — individual item review / action entry
- `VerifiedPage` — local execution receipt inspection

### Frontend responsibilities
- present a clean reviewer-facing flow
- keep the demo understandable in a few minutes
- generate local receipt artifacts for the demo journey
- expose proof JSON instead of hiding everything behind UI polish

---

## Server responsibilities

`server.js` is the core bridge for the demo.

It currently handles:

### 1. Aggregation layer
- search across Bazaar / ClawHub / GitHub / npm
- fetch skill detail by id
- clickout logging for external results

### 2. Proof / receipt layer
- identity creation
- API key creation
- workflow registry exposure
- signed receipt generation
- receipt verification

### 3. Demo verification layer
- public `runverify` endpoint
- read-only workflow execution path
- explicit rate limits for public-safe demo usage

This matters because the repository should not just say “trust us.”
It should expose a small but real verification surface.

---

## Current workflow model

The most important public workflow right now is:

- `erc20_transfer_alert`

This workflow is intentionally constrained:

- read-only
- deny-by-default policy framing
- explicit capability manifest
- receipt generation
- verification path

That makes it a better demo for trust infrastructure than a flashy but opaque onchain action.

---

## Proof model in this repo

There are two proof surfaces in the current codebase:

### A. Frontend-local demo receipts
Used for reviewer-visible purchase / dry-run interactions.

### B. Server-side signed execution receipts
Used for workflow execution and verification endpoints.

Together, they support the central claim:

**the system should leave behind structured evidence of what happened.**

---

## Security / safety posture

This demo is intentionally conservative.

### Principles
- read-only where possible
- dry-run where execution would be misleading or risky
- public-safe defaults
- no requirement to expose production credentials

### Public demo guardrails
- rate-limited public endpoint
- limited workflow scope
- explicit capability manifest
- no production wallet execution path in public demo framing

---

## What is intentionally not shown

To keep the public repo reviewer-friendly, this repo does not try to expose everything.

It does **not** claim to contain:
- the full internal trust stack
- the full company roadmap implementation
- the complete Archive layer
- all internal orchestration / governance logic

Those belong to the broader company and product story.

This repo is the **submission-friendly public demo slice**.

---

## Mapping to Aoineco thesis

### Today in this repo
- demonstrable proof objects
- inspectable flows
- verification-friendly endpoints
- Base-oriented demo framing

### Tomorrow beyond this repo
- richer verified action models
- stronger auditability and provenance
- workflow chaining
- long-term accumulation into The Archive

---

## Reviewer takeaway

If a reviewer only remembers one thing, it should be this:

> Aoineco is building AI infrastructure where actions can be checked later.

This repository is a small, concrete demonstration of that belief.
