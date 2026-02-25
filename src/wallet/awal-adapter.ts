import type { WalletSession, WalletAdapter, TxResult } from './types';
import { getOnChainBalance } from '../lib/chain';

const BRIDGE_URL = 'http://localhost:3098';

// Fallback address if bridge is unavailable
const FALLBACK_ADDRESS = '0x00267782aB06fA2B7540c20EB5FFFBC1ea360f8B';

function generateTxHash(): string {
  const bytes = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
  return `0x${bytes}`;
}

async function fetchBridge(path: string) {
  try {
    const res = await fetch(`${BRIDGE_URL}${path}`);
    return await res.json();
  } catch {
    return null;
  }
}

export const awalAdapter: WalletAdapter = {
  async connect(): Promise<WalletSession> {
    // Try real awal CLI via bridge
    const status = await fetchBridge('/api/awal/status');
    const balanceData = await fetchBridge('/api/awal/balance');

    const address = balanceData?.address ?? FALLBACK_ADDRESS;
    const email = status?.auth?.email ?? 'unknown';
    const authenticated = status?.auth?.authenticated ?? false;

    if (!authenticated) {
      throw new Error('awal not authenticated. Run: npx awal auth login <email>');
    }

    const balance = await getOnChainBalance(address);

    return {
      provider: 'awal',
      address,
      email,
      chain: 'Base Sepolia',
      balance,
      connected: true,
    };
  },

  async disconnect(): Promise<void> {},

  async getBalance() {
    const balanceData = await fetchBridge('/api/awal/balance');
    const address = balanceData?.address ?? FALLBACK_ADDRESS;
    return getOnChainBalance(address);
  },

  async send(to: string, amount: string, token = 'USDC'): Promise<TxResult> {
    // DRY_RUN only
    await new Promise(r => setTimeout(r, 1200));

    const balanceData = await fetchBridge('/api/awal/balance');
    const from = balanceData?.address ?? FALLBACK_ADDRESS;
    const txHash = generateTxHash();
    const timestamp = new Date().toISOString();

    return {
      success: true,
      dryRun: true,
      txHash,
      from,
      to,
      amount,
      token,
      chain: 'Base Sepolia',
      timestamp,
      proof: {
        type: 'DRY_RUN',
        wallet_provider: 'awal',
        amount,
        token,
        chain: 'Base Sepolia',
        simulated_tx_hash: txHash,
        timestamp,
        bazaar_version: '0.1.0-demo',
      },
    };
  },
};
