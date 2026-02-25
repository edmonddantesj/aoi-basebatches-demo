import type { Skill } from './mock-data';

const SOURCE_COLORS: Record<string, string> = {
  bazaar: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  clawhub: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  github: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  npm: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const SOURCE_LABELS: Record<string, string> = {
  bazaar: '🏪 Bazaar',
  clawhub: '🔮 ClawHub',
  github: '🐙 GitHub',
  npm: '📦 NPM',
};

export function SkillCard({
  skill,
  onOpenDetail,
}: {
  skill: Skill;
  onOpenDetail: (skill: Skill) => void;
}) {
  const isBazaar = skill.source === 'bazaar';

  return (
    <div
      className={`rounded-xl border p-5 transition-all hover:scale-[1.02] hover:shadow-lg ${
        isBazaar
          ? 'border-cyan-500/30 bg-[#1a1f2e] shadow-cyan-500/5'
          : 'border-[#1e293b] bg-[#111827]'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
          <p className="text-sm text-slate-400">{skill.author}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full border ${SOURCE_COLORS[skill.source]}`}
        >
          {SOURCE_LABELS[skill.source]}
        </span>
      </div>

      <p className="text-sm text-slate-300 mb-4 line-clamp-2">{skill.description}</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {skill.sdna_verified && (
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            🧬 S-DNA Verified
          </span>
        )}
        {skill.guardian_pass && (
          <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
            🛡️ Guardian Pass
          </span>
        )}
        {!skill.sdna_verified && !skill.guardian_pass && (
          <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            ⚠️ Untrusted
          </span>
        )}
        <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
          {skill.core_temp_badge} {skill.core_temp}°C
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
        <span>⬇️ {skill.downloads.toLocaleString()}</span>
        <span>⭐ {skill.rating}</span>
        <div className="flex gap-1">
          {skill.tags.slice(0, 2).map(t => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-white">
          {Number(skill.price) === 0 ? 'Free' : `$${skill.price}`}
        </span>
        <button
          onClick={() => onOpenDetail(skill)}
          className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors cursor-pointer ${
            isBazaar
              ? 'bg-cyan-600 hover:bg-cyan-500'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
        >
          View Detail
        </button>
      </div>
    </div>
  );
}
