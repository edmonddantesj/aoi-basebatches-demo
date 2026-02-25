// 공통 WalletSession 인터페이스
// Privy와 awal 모두 이 인터페이스를 구현 → 향후 Wallet Adapter 패턴 확장 가능

export type WalletProvider = 'privy' | 'awal';

export interface WalletSession {
  provider: WalletProvider;
  address: string;
  email?: string;
  chain: string;
  balance: {
    usdc: string;
    eth: string;
  };
  connected: boolean;
}

export interface WalletAdapter {
  connect(): Promise<WalletSession>;
  disconnect(): Promise<void>;
  getBalance(): Promise<{ usdc: string; eth: string }>;
  send(to: string, amount: string, token?: string): Promise<TxResult>;
}

export interface TxResult {
  success: boolean;
  dryRun: true;
  txHash: string;        // simulated hash
  from: string;
  to: string;
  amount: string;
  token: string;
  chain: string;
  timestamp: string;
  proof: ProofRecord;
}

export interface ProofRecord {
  type: 'DRY_RUN';
  wallet_provider: WalletProvider;
  skill_id?: string;
  skill_name?: string;
  amount: string;
  token: string;
  chain: string;
  simulated_tx_hash: string;
  timestamp: string;
  bazaar_version: string;
}
