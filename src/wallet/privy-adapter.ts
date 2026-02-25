import type { WalletSession, WalletAdapter, TxResult } from './types';
import { getOnChainBalance } from '../lib/chain';

function generateTxHash(): string {
  const bytes = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
  return `0x${bytes}`;
}

export function createPrivyAdapter(privyUser: {
  wallet?: { address: string };
  email?: { address: string };
} | null): WalletAdapter {
  const address = privyUser?.wallet?.address ?? '0x0000000000000000000000000000000000000000';
  const email = privyUser?.email?.address;

  return {
    async connect(): Promise<WalletSession> {
      if (!privyUser?.wallet) throw new Error('Privy wallet not available');
      const balance = await getOnChainBalance(address);
      return {
        provider: 'privy',
        address,
        email,
        chain: 'Base Sepolia',
        balance,
        connected: true,
      };
    },

    async disconnect(): Promise<void> {},

    async getBalance() {
      return getOnChainBalance(address);
    },

    async send(to: string, amount: string, token = 'USDC'): Promise<TxResult> {
      // DRY_RUN only
      await new Promise(r => setTimeout(r, 1200));
      const txHash = generateTxHash();
      const timestamp = new Date().toISOString();

      return {
        success: true,
        dryRun: true,
        txHash,
        from: address,
        to,
        amount,
        token,
        chain: 'Base Sepolia',
        timestamp,
        proof: {
          type: 'DRY_RUN',
          wallet_provider: 'privy',
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
}
