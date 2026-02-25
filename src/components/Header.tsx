import type { WalletSession } from '../wallet/types';

export function Header({
  wallet,
  onDisconnect,
}: {
  wallet: WalletSession | null;
  onDisconnect: () => void;
}) {
  return (
    <header className="border-b border-[#1e293b] bg-[#0a0e1a]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏪</span>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">
              NEXUS Bazaar
            </h1>
            <p className="text-xs text-slate-500">
              Search anywhere. Trust through Bazaar.
            </p>
          </div>
        </div>

        {/* Wallet Status */}
        {wallet?.connected ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    wallet.provider === 'privy' ? 'bg-purple-400' : 'bg-cyan-400'
                  }`}
                />
                <span className="text-sm font-medium text-white">
                  {wallet.provider === 'privy' ? '🔐 Privy' : '💰 Agentic Wallet'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </p>
            </div>
            <div className="text-right px-3 py-1 rounded-lg bg-[#1a1f2e] border border-[#1e293b]">
              <p className="text-sm font-bold text-white">${wallet.balance.usdc}</p>
              <p className="text-xs text-slate-500">USDC</p>
            </div>
            <button
              onClick={onDisconnect}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <span className="text-sm text-slate-500">Not connected</span>
        )}
      </div>
    </header>
  );
}
