import { useEffect, useMemo, useState } from 'react';
import { MOCK_SKILLS, type Skill } from './mock-data';
import { SkillCard } from './SkillCard';
import { searchSkills, type AggregatorSource } from '../lib/aggregator';

type SourceFilter = 'all' | 'bazaar' | 'clawhub' | 'github' | 'npm';

export function SkillSearch({ onOpenDetail }: { onOpenDetail: (skill: Skill) => void }) {
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [skills, setSkills] = useState<Skill[]>(MOCK_SKILLS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortByRank = (items: Skill[]) => [...items].sort((a, b) => {
    if (a.source === 'bazaar' && b.source !== 'bazaar') return -1;
    if (a.source !== 'bazaar' && b.source === 'bazaar') return 1;
    const aRank = a.rank_score ?? a.core_temp;
    const bRank = b.rank_score ?? b.core_temp;
    if (bRank !== aRank) return bRank - aRank;
    return (b.core_temp - a.core_temp) || (b.downloads - a.downloads);
  });

  useEffect(() => {
    const fallbackFilter = () => {
      let results = MOCK_SKILLS;

      if (sourceFilter !== 'all') {
        results = results.filter(s => s.source === sourceFilter);
      }

      if (query.trim()) {
        const q = query.toLowerCase();
        results = results.filter(
          s =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.tags.some(t => t.includes(q)),
        );
      }

      return sortByRank(results);
    };

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await searchSkills({
          query: query.trim() || 'agent',
          source: (sourceFilter as AggregatorSource) ?? 'all',
          limit: 20,
        });
        setSkills(sortByRank(data.results));
      } catch (err) {
        console.error('search failed, fallback to mock', err);
        setError('Using local demo data. Aggregator bridge is currently unavailable.');
        setSkills(fallbackFilter());
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, sourceFilter]);

  const filtered = useMemo(() => {
    if (sourceFilter === 'all' && query.trim()) return skills;

    const q = query.trim().toLowerCase();
    let results = skills;

    if (sourceFilter !== 'all') {
      results = results.filter(s => s.source === sourceFilter);
    }

    if (q) {
      results = results.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some(t => t.includes(q)),
      );
    }

    return sortByRank(results);
  }, [query, sourceFilter, skills]);

  const filters: { key: SourceFilter; label: string }[] = [
    { key: 'all', label: '🌐 All Sources' },
    { key: 'bazaar', label: '🏪 Bazaar' },
    { key: 'clawhub', label: '🔮 ClawHub' },
    { key: 'github', label: '🐙 GitHub' },
    { key: 'npm', label: '📦 NPM' },
  ];

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search skills across all sources..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-xl bg-[#1a1f2e] border border-[#1e293b] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          <span className="absolute left-3 top-3.5 text-slate-500">🔍</span>
        </div>
      </div>

      {/* Source Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setSourceFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              sourceFilter === f.key
                ? 'bg-cyan-600 text-white'
                : 'bg-[#1a1f2e] text-slate-400 hover:text-white border border-[#1e293b]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Status */}
      <div className="text-sm text-slate-500 mb-4">
        {loading ? 'Searching...' : `${filtered.length} skill${filtered.length !== 1 ? 's' : ''} found`}
        {sourceFilter !== 'all' && ` in ${sourceFilter}`}
        {query && ` matching "${query}"`}
        {error && <span className="text-amber-400 ml-2">• {error}</span>}
      </div>

      {/* Skill Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(skill => (
          <SkillCard key={skill.id} skill={skill} onOpenDetail={onOpenDetail} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p className="text-4xl mb-2">🔍</p>
          <p>No skills found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
