import { useMemo, useState } from 'react';
import { MOCK_SKILLS } from '../bazaar/mock-data';
import type { Skill } from '../bazaar/mock-data';
import type { WalletSession } from '../wallet/types';
import { Header } from '../components/Header';
import { PurchaseModal } from './PurchaseModal';
import { logClickout } from '../lib/aggregator';

type TrustLevel = 'high' | 'medium' | 'low';

export function SkillDetailPage({
  skill,
  loading,
  error,
  wallet,
  onBack,
  onDisconnect,
  onOpenSkill,
}: {
  skill: Skill | null;
  loading: boolean;
  error: string | null;
  wallet: WalletSession;
  onBack: () => void;
  onDisconnect: () => void;
  onOpenSkill: (skill: Skill) => void;
}) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const trust = useMemo<TrustLevel>(() => {
    if (!skill) return 'low';
    if (skill.sdna_verified && skill.guardian_pass) return 'high';
    if (skill.sdna_verified || skill.guardian_pass) return 'medium';
    return 'low';
  }, [skill]);

  const [externalStatus, setExternalStatus] = useState<'idle' | 'redirecting' | 'done'>('idle');

  const trustLabel =
    trust === 'high'
      ? '🛡️ Trusted (S-DNA + Guardian)'
      : trust === 'medium'
        ? '⚖️ Partial Trust'
        : '⚠️ External / Untrusted';

  const sourceClass =
    skill?.source === 'bazaar'
      ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
      : skill?.source === 'clawhub'
        ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
        : skill?.source === 'github'
          ? 'bg-gray-500/15 border-gray-500/30 text-gray-300'
          : 'bg-red-500/15 border-red-500/30 text-red-300'

  const relatedSkills = useMemo(() => {
    if (!skill) return [] as Skill[];

    const tagSet = new Set(skill.tags);
    const candidates = MOCK_SKILLS.filter(s => s.id !== skill.id);

    const scored = candidates
      .map(s => {
        const overlap = s.tags.reduce((acc, t) => (tagSet.has(t) ? acc + 1 : acc), 0);
        const sameSource = s.source === skill.source ? 1 : 0;
        const trust = (s.sdna_verified ? 1 : 0) + (s.guardian_pass ? 1 : 0);
        const score = overlap * 10 + sameSource * 3 + trust * 2 + (s.rank_score ?? s.core_temp);
        return { s, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(x => x.s);

    return scored;
  }, [skill]);
;

  const handleExternalClick = async () => {
    if (!skill || !skill.url) return;
    setExternalStatus('redirecting');
    try {
      await logClickout({
        skill_id: skill.id,
        source: skill.source,
        destination_url: skill.url,
        wallet_address: wallet.address,
      });
    } catch (error) {
      console.error('clickout log failed', error);
    } finally {
      window.open(skill.url, '_blank', 'noopener,noreferrer');
      setExternalStatus('done');
      setTimeout(() => setExternalStatus('idle'), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Header wallet={wallet} onDisconnect={onDisconnect} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="mb-6 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 cursor-pointer"
        >
          ← Back to Market
        </button>

        {loading && (
          <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-10 text-center text-slate-400">
            Loading skill detail...
          </div>
        )}

        {error && !loading && !skill && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-6 text-amber-300">
            {error}
          </div>
        )}

        {!loading && skill && (
          <section className="rounded-2xl border border-[#1e293b] bg-[#111827] p-6">
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <span className={`px-3 py-1 rounded-full border text-sm ${sourceClass}`}>
                {skill.source}
              </span>
              <span className="px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm">
                {trustLabel}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">{skill.name}</h1>
            <p className="text-slate-400 mb-2">by {skill.author}</p>
            <p className="text-slate-300 mb-6">{skill.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-slate-300 mb-6">
              <div className="rounded-lg bg-[#0f172a] border border-[#1e293b] p-3">
                <p className="text-slate-500 text-xs">Price</p>
                <p className="font-semibold mt-1">{Number(skill.price) === 0 ? 'Free' : `$${skill.price}`}</p>
              </div>
              <div className="rounded-lg bg-[#0f172a] border border-[#1e293b] p-3">
                <p className="text-slate-500 text-xs">Core-Temp</p>
                <p className="font-semibold mt-1">{skill.core_temp}°C</p>
              </div>
              <div className="rounded-lg bg-[#0f172a] border border-[#1e293b] p-3">
                <p className="text-slate-500 text-xs">Score</p>
                <p className="font-semibold mt-1">{skill.rank_score ?? skill.core_temp}</p>
              </div>
              <div className="rounded-lg bg-[#0f172a] border border-[#1e293b] p-3">
                <p className="text-slate-500 text-xs">Downloads</p>
                <p className="font-semibold mt-1">{skill.downloads.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-[#0f172a] border border-[#1e293b] p-3">
                <p className="text-slate-500 text-xs">Rating</p>
                <p className="font-semibold mt-1">⭐ {skill.rating}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {skill.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-[#1e293b]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {skill.url && (
              <p className="text-xs text-slate-400 mb-4">
                Source: <a className="text-cyan-300 underline" href={skill.url} target="_blank" rel="noreferrer">{skill.url}</a>
              </p>
            )}

            {skill.source === 'bazaar' ? (
              <button
                onClick={() => setSelectedSkill(skill)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium cursor-pointer"
              >
                Purchase (DRY_RUN)
              </button>
            ) : (
              <button
                onClick={handleExternalClick}
                disabled={externalStatus === 'redirecting' || !skill.url}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
                  externalStatus === 'redirecting' || !skill.url
                    ? 'bg-slate-600 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500 cursor-pointer'
                }`}
              >
                {externalStatus === 'redirecting'
                  ? 'Redirecting + logging attribution...'
                  : `Open on ${skill.source}`}
              </button>
            )}

            {skill.source !== 'bazaar' && externalStatus === 'done' && (
              <p className="text-emerald-400 text-sm mt-3">Attribution logged and opened in new tab.</p>
            )}


            {relatedSkills.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-white mb-3">Related Skills</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {relatedSkills.map(rs => (
                    <button
                      key={rs.id}
                      onClick={() => onOpenSkill(rs)}
                      className="text-left rounded-xl border border-[#1e293b] bg-[#0f172a] p-4 hover:bg-[#111827] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white line-clamp-1">{rs.name}</p>
                        <span className="text-[11px] text-slate-400">{rs.source}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{rs.description}</p>
                      <p className="text-xs text-slate-500 mt-2">Score: {rs.rank_score ?? rs.core_temp}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {selectedSkill && (
        <PurchaseModal skill={selectedSkill} wallet={wallet} onClose={() => setSelectedSkill(null)} />
      )}
    </div>
  );
}
