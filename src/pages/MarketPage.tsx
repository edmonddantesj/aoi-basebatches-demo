import type { WalletSession } from '../wallet/types';
import { Header } from '../components/Header';
import { SkillSearch } from '../bazaar/SkillSearch';
import type { Skill } from '../bazaar/mock-data';

export function MarketPage({
  wallet,
  onDisconnect,
  onOpenSkill,
}: {
  wallet: WalletSession;
  onDisconnect: () => void;
  onOpenSkill: (skill: Skill) => void;
}) {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Header wallet={wallet} onDisconnect={onDisconnect} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Skill Market</h2>
          <p className="text-slate-400">
            Browse native Bazaar skills and search across ClawHub, GitHub, and NPM.
            External skills are untrusted by default — Guardian scan recommended.
          </p>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌐</span>
            <div>
              <p className="text-sm font-medium text-white">Federated Skill Aggregator Active</p>
              <p className="text-xs text-slate-400">
                Searching across 4 sources: Bazaar · ClawHub · GitHub · NPM
                <span className="text-cyan-400 ml-2">CLICK_OUT_ONLY for external</span>
              </p>
            </div>
          </div>
        </div>

        <SkillSearch onOpenDetail={onOpenSkill} />
      </main>
    </div>
  );
}
