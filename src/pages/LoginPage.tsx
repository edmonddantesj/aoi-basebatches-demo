import { useState } from 'react';
import type { WalletSession, WalletProvider } from '../wallet/types';
import { awalAdapter } from '../wallet/awal-adapter';

export function LoginPage({
  onConnect,
  onPrivyLogin,
}: {
  onConnect: (session: WalletSession) => void;
  onPrivyLogin: () => void;
}) {
  const [connecting, setConnecting] = useState<WalletProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAwalConnect = async () => {
    setConnecting('awal');
    setError(null);
    try {
      const session = await awalAdapter.connect();
      onConnect(session);
    } catch (e: any) {
      setError(e.message || 'Failed to connect awal');
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <span className="text-6xl mb-4 block">🏪</span>
          <h1 className="text-3xl font-bold text-white mb-2">NEXUS Bazaar</h1>
          <p className="text-slate-400">
            The Agent Skill Marketplace on Base
          </p>
          <p className="text-sm text-cyan-400 mt-1">
            Search anywhere. Trust through Bazaar.
          </p>
        </div>

        {/* Wallet Options */}
        <div className="space-y-4">
          {/* Privy */}
          <button
            onClick={() => {
              setConnecting('privy');
              onPrivyLogin();
            }}
            disabled={connecting !== null}
            className="w-full p-5 rounded-xl border border-purple-500/30 bg-[#1a1f2e] hover:bg-[#1f2537] hover:border-purple-500/50 transition-all group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🔐
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-semibold text-white">Privy Wallet</h3>
                <p className="text-sm text-slate-400">
                  Team wallet with role-based policies
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                  Enterprise
                </span>
              </div>
            </div>
            {connecting === 'privy' && (
              <div className="mt-3 text-sm text-purple-400 animate-pulse">
                Connecting to Privy...
              </div>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#1e293b]" />
            <span className="text-xs text-slate-600">OR</span>
            <div className="flex-1 h-px bg-[#1e293b]" />
          </div>

          {/* awal */}
          <button
            onClick={handleAwalConnect}
            disabled={connecting !== null}
            className="w-full p-5 rounded-xl border border-cyan-500/30 bg-[#1a1f2e] hover:bg-[#1f2537] hover:border-cyan-500/50 transition-all group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                💰
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-semibold text-white">Agentic Wallet</h3>
                <p className="text-sm text-slate-400">
                  Coinbase agent wallet — 2min setup
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">
                  Quick Start
                </span>
              </div>
            </div>
            {connecting === 'awal' && (
              <div className="mt-3 text-sm text-cyan-400 animate-pulse">
                Connecting to Agentic Wallet...
              </div>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-600">
            Base Sepolia Testnet · DRY_RUN Mode · No real transactions
          </p>
          <p className="text-xs text-slate-700 mt-1">
            Powered by Aoineco & Co.
          </p>
        </div>
      </div>
    </div>
  );
}
