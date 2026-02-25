export interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  price: string;          // USDC
  source: 'bazaar' | 'clawhub' | 'github' | 'npm';
  sdna_verified: boolean;
  guardian_pass: boolean;
  core_temp: number;       // 36.5 ~ 42.0
  core_temp_badge: string;
  tags: string[];
  downloads: number;
  rating: number;          // 0~5
  rank_score?: number;     // unified ranking score for federated results
  url?: string;            // Optional click-out destination for external skills
}

export const MOCK_SKILLS: Skill[] = [
  {
    id: 'AOI-2026-0225-SKILL-001',
    name: 'Whale Sonar',
    description: 'Real-time whale wallet tracking with on-chain pattern detection. Alerts on large transfers, accumulation, and distribution patterns.',
    author: 'Blue-Eye@aoineco',
    price: '2.50',
    source: 'bazaar',
    sdna_verified: true,
    guardian_pass: true,
    core_temp: 39.2,
    core_temp_badge: '🔥 Hot',
    rank_score: 95.8,
    tags: ['crypto', 'whale-tracking', 'on-chain'],
    downloads: 1842,
    rating: 4.7,
  },
  {
    id: 'AOI-2026-0225-SKILL-002',
    name: 'Prompt Armor',
    description: 'Protect your agent from prompt injection, jailbreak attempts, and adversarial inputs. Multi-layer defense with real-time scoring.',
    author: 'Blue-Blade@aoineco',
    price: '0.01',
    source: 'bazaar',
    sdna_verified: true,
    guardian_pass: true,
    core_temp: 40.1,
    core_temp_badge: '🔥 Hot',
    rank_score: 96.4,
    tags: ['security', 'prompt-injection', 'defense'],
    downloads: 3201,
    rating: 4.9,
  },
  {
    id: 'AOI-2026-0225-SKILL-003',
    name: 'OMNIA Debate Engine',
    description: 'Multi-perspective reasoning engine. Generates structured arguments from opposing viewpoints for better decision-making.',
    author: 'Blue-Brain@aoineco',
    price: '5.00',
    source: 'bazaar',
    sdna_verified: true,
    guardian_pass: true,
    core_temp: 38.8,
    core_temp_badge: '🌡️ Warm',
    rank_score: 94.7,
    tags: ['reasoning', 'debate', 'decision'],
    downloads: 956,
    rating: 4.5,
  },
  {
    id: 'clawhub:edmonddantesj/aoi-hackathon-scout-lite',
    name: 'AOI Hackathon Scout (Lite)',
    description: 'Public-safe hackathon source registry + filtering output (no crawling, no submissions).',
    author: 'edmonddantesj',
    price: '0.00',
    source: 'clawhub',
    sdna_verified: false,
    guardian_pass: false,
    core_temp: 36.8,
    core_temp_badge: '🧊 Frozen',
    rank_score: 46.2,
    tags: ['hackathon', 'registry', 'source-filter', 'community'],
    downloads: 1200,
    rating: 4.4,
    url: 'https://clawhub.ai/edmonddantesj/aoi-hackathon-scout-lite',
  },
  {
    id: 'ext-clawhub-weather-001',
    name: 'weather-forecast',
    description: 'Get current weather and forecasts via wttr.in or Open-Meteo. No API no key needed.',
    author: 'community',
    price: '0.00',
    source: 'clawhub',
    sdna_verified: false,
    guardian_pass: false,
    core_temp: 36.5,
    core_temp_badge: '🧊 Frozen',
    rank_score: 45.0,
    tags: ['weather', 'utility'],
    downloads: 12450,
    rating: 4.2,
    url: 'https://github.com/hwchase17/weather-forecast',
  },
  {
    id: 'ext-github-langchain-tools',
    name: 'langchain-community-tools',
    description: 'Community-maintained tool integrations for LangChain agents. 50+ connectors.',
    author: 'langchain-ai',
    price: '0.00',
    source: 'github',
    sdna_verified: false,
    guardian_pass: false,
    core_temp: 36.5,
    core_temp_badge: '🧊 Frozen',
    rank_score: 43.2,
    tags: ['langchain', 'tools', 'integration'],
    downloads: 89200,
    rating: 4.0,
    url: 'https://github.com/langchain-ai/langchain',
  },
  {
    id: 'ext-npm-zod-validator',
    name: '@agent-tools/zod-validator',
    description: 'Runtime schema validation for agent tool inputs/outputs using Zod.',
    author: 'agent-tools',
    price: '0.00',
    source: 'npm',
    sdna_verified: false,
    guardian_pass: false,
    core_temp: 36.5,
    core_temp_badge: '🧊 Frozen',
    rank_score: 42.8,
    tags: ['validation', 'schema', 'zod'],
    downloads: 45600,
    rating: 4.3,
    url: 'https://www.npmjs.com/package/@agent-tools/zod-validator',
  },
];
