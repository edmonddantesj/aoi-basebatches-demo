import type { Skill } from '../bazaar/mock-data';
import { AGGREGATOR_BRIDGE_URL } from './endpoints';

export type AggregatorSource = 'all' | 'bazaar' | 'clawhub' | 'github' | 'npm';

export type AggregatorSearchResponse = {
  query: string;
  count: number;
  source: string[];
  results: Skill[];
};

export async function searchSkills(params: {
  query: string;
  source: AggregatorSource;
  limit?: number;
}): Promise<AggregatorSearchResponse> {
  const query = params.query.trim() || 'agent';
  const url = new URL('/api/aggregator/search', AGGREGATOR_BRIDGE_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(params.limit ?? 20));

  if (params.source !== 'all') {
    url.searchParams.set('sources', params.source);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`search failed: ${response.status} ${body}`);
  }

  return response.json();
}

export async function logClickout(payload: {
  skill_id: string;
  source: string;
  destination_url: string;
  wallet_address?: string;
}): Promise<{ logged: boolean; event_id: string; timestamp: string }>
{
  const url = new URL('/api/aggregator/clickout', AGGREGATOR_BRIDGE_URL);
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      ts: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`clickout failed: ${response.status} ${body}`);
  }

  return response.json();
}


export async function fetchSkillById(skillId: string): Promise<Skill | null> {
  const url = new URL(`/api/aggregator/skill/${encodeURIComponent(skillId)}`, AGGREGATOR_BRIDGE_URL);

  const response = await fetch(url.toString());
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`skill detail failed: ${response.status} ${body}`);
  }

  const payload = await response.json();
  return payload?.skill as Skill;
}
