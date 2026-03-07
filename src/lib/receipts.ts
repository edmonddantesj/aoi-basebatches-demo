import type { TxResult } from '../wallet/types';
import type { Skill } from '../bazaar/mock-data';

export type DemoReceipt = {
  id: string;
  created_at: string;
  wallet_address: string;
  wallet_provider: string;
  chain: string;
  tx_hash: string;
  explorer_url: string;
  amount: string;
  token: string;
  skill: Pick<Skill, 'id' | 'name' | 'source' | 'price' | 'author'>;
  proof: any;
};

const STORAGE_KEY = 'aoi_demo_receipts_v0';

export function makeExplorerUrl(txHash: string) {
  return `https://sepolia.basescan.org/tx/${txHash}`;
}

export function loadReceipts(): DemoReceipt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DemoReceipt[];
  } catch {
    return [];
  }
}

export function saveReceipt(input: { tx: TxResult; skill: Skill }): DemoReceipt {
  const r: DemoReceipt = {
    id: `demo_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    created_at: new Date().toISOString(),
    wallet_address: input.tx.from,
    wallet_provider: input.tx.proof?.wallet_provider ?? 'unknown',
    chain: input.tx.chain,
    tx_hash: input.tx.txHash,
    explorer_url: makeExplorerUrl(input.tx.txHash),
    amount: input.tx.amount,
    token: input.tx.token,
    skill: {
      id: input.skill.id,
      name: input.skill.name,
      source: input.skill.source,
      price: input.skill.price,
      author: input.skill.author,
    },
    proof: input.tx.proof,
  };

  const prev = loadReceipts();
  const next = [r, ...prev].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return r;
}

export function clearReceipts() {
  localStorage.removeItem(STORAGE_KEY);
}
