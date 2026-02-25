# Bazaar Demo App — Architecture

## 목적
3/9 Base Batches 제출용 데모. 에이전트가 지갑 로그인 → Bazaar에서 스킬 검색 → 구매(DRY_RUN) 전체 플로우 시연.

## 지갑 연결: 2-Option (따로따로)

```
┌─────────────────────────────────────────┐
│           Login Screen                  │
│                                         │
│   [ 🔐 Privy Login ]   [ 💰 awal Login ]│
│                                         │
│   → Privy 세션          → awal 세션      │
│   → Privy 지갑 주소      → awal 지갑 주소  │
│                                         │
│   ─────── 로그인 후 동일 UI ───────       │
│                                         │
│   Bazaar Skill Market                   │
│   Skill Aggregator Search               │
│   구매 → DRY_RUN tx → 증빙 생성          │
└─────────────────────────────────────────┘
```

## 향후: Wallet Adapter (프로덕션)
- 공통 인터페이스: `getAddress()`, `getBalance()`, `send()`, `sign()`
- Privy/awal 각각 adapter 구현 → 지갑 종류 무관하게 Bazaar 작동

## 기술 스택
- **Frontend:** React + Vite + Tailwind CSS
- **Privy:** @privy-io/react-auth
- **awal:** CLI wrapper (npx awal) → API bridge
- **Chain:** Base Sepolia (테스트넷)
- **데모 모드:** DRY_RUN only (실제 서명 없음)

## 폴더 구조
```
demo/bazaar-app/
├── ARCHITECTURE.md          ← 이 파일
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx      ← 2-Option 로그인
│   │   ├── MarketPage.tsx     ← Skill Market + 검색
│   │   └── PurchasePage.tsx   ← 구매 + DRY_RUN tx
│   ├── wallet/
│   │   ├── types.ts           ← 공통 WalletSession 인터페이스
│   │   ├── privy-adapter.ts   ← Privy 연결
│   │   └── awal-adapter.ts    ← awal CLI bridge
│   ├── bazaar/
│   │   ├── SkillSearch.tsx    ← Aggregator 검색 UI
│   │   ├── SkillCard.tsx      ← 스킬 카드 컴포넌트
│   │   └── mock-data.ts      ← 데모용 스킬 목록
│   ├── components/
│   │   ├── Header.tsx
│   │   └── WalletBadge.tsx    ← 연결된 지갑 표시
│   └── lib/
│       ├── proof.ts           ← 증빙 JSON 생성
│       └── dry-run.ts         ← DRY_RUN tx 시뮬레이션
├── public/
│   └── assets/
└── .env.example
```

## DRY_RUN 정책
- 모든 트랜잭션은 시뮬레이션만 수행
- 실제 on-chain 서명/전송 절대 없음
- tx receipt는 mock으로 생성하되, 실제 포맷과 동일
- 증빙: `{ type: "DRY_RUN", wallet, skill, amount, timestamp, simulated_tx_hash }`

## 데모 시나리오 (3/9 제출용)
1. 화면: 2-Option 로그인 → Privy 선택 → 지갑 연결됨
2. Bazaar Skill Market 진입 → 스킬 목록 표시
3. Aggregator 검색 → "trading strategy" 검색 → 외부(ClawHub/GitHub) 결과 포함
4. 스킬 선택 → 가격/S-DNA/Guardian 스캔 결과 표시
5. "Purchase (DRY_RUN)" 클릭 → 시뮬레이션 tx 생성
6. 증빙 화면: proof JSON + tx receipt 표시
7. (옵션) awal 로그인으로 전환 → 동일 플로우 반복

## Exposure
- **STEALTH** — 데모 코드/영상은 Base Batches 제출 전용
- Arena 관련 일체 노출 없음
