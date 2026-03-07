import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import type { WalletSession } from './wallet/types';
import { getOnChainBalance } from './lib/chain';
import { LoginPage } from './pages/LoginPage';
import { MarketPage } from './pages/MarketPage';
import { SkillDetailPage } from './pages/SkillDetailPage';
import { VerifiedPage } from './pages/VerifiedPage';
import type { Skill } from './bazaar/mock-data';
import { fetchSkillById, searchSkills } from './lib/aggregator';

function extractSkillId(pathname: string): string | null {
  const match = pathname.match(/^\/skill\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function isVerifiedRoute(pathname: string) {
  return pathname === '/verified';
}

export default function App() {
  const [wallet, setWallet] = useState<WalletSession | null>(null);
  const [routePath, setRoutePath] = useState<string>(window.location.pathname);
  const [detailSkill, setDetailSkill] = useState<Skill | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();

  const skillIdInRoute = useMemo(() => extractSkillId(routePath), [routePath]);
  const isVerified = useMemo(() => isVerifiedRoute(routePath), [routePath]);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRoutePath(path);
  }, []);

  const openSkill = useCallback(
    (skill: Skill) => {
      navigate(`/skill/${encodeURIComponent(skill.id)}`);
    },
    [navigate],
  );

  const closeDetail = useCallback(() => {
    navigate('/');
  }, [navigate]);


  useEffect(() => {
    const onPopState = () => setRoutePath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    let canceled = false;

    const loadDetail = async () => {
      if (!skillIdInRoute) {
        setDetailSkill(null);
        setDetailError(null);
        setDetailLoading(false);
        return;
      }

      setDetailLoading(true);
      setDetailError(null);

      try {
        const direct = await fetchSkillById(skillIdInRoute);
        if (canceled) return;

        if (direct) {
          setDetailSkill(direct);
          return;
        }

        const searchHit = await searchSkills({
          query: skillIdInRoute,
          source: 'all',
          limit: 30,
        });

        if (canceled) return;
        const matched = searchHit.results.find(skill => skill.id === skillIdInRoute) || null;
        setDetailSkill(matched);
        if (!matched) {
          setDetailError(`Could not load skill: ${skillIdInRoute}`);
        }
      } catch (error) {
        if (!canceled) {
          setDetailError(error instanceof Error ? error.message : 'Failed to load skill details');
          setDetailSkill(null);
        }
      } finally {
        if (!canceled) setDetailLoading(false);
      }
    };

    loadDetail();

    return () => {
      canceled = true;
    };
  }, [skillIdInRoute]);

  const handlePrivyLogin = useCallback(() => {
    login();
  }, [login]);

  useEffect(() => {
    if (!authenticated || !user || wallet?.provider === 'privy') return;

    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
    if (!embeddedWallet) return;

    const address = embeddedWallet.address;

    setWallet({
      provider: 'privy',
      address,
      email: user.email?.address,
      chain: 'Base Sepolia',
      balance: { usdc: '...', eth: '...' },
      connected: true,
    });

    getOnChainBalance(address).then(balance => {
      setWallet(prev => (prev?.provider === 'privy' ? { ...prev, balance } : prev));
    });
  }, [authenticated, user, wallets, wallet?.provider]);

  const handleDisconnect = useCallback(async () => {
    if (wallet?.provider === 'privy') {
      await logout();
    }
    setWallet(null);
  }, [wallet, logout]);

  const handleAwalConnect = useCallback(async (session: WalletSession) => {
    setWallet(session);
    const balance = await getOnChainBalance(session.address);
    setWallet(prev => (prev?.provider === 'awal' ? { ...prev, balance } : prev));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!wallet) {
    return <LoginPage onConnect={handleAwalConnect} onPrivyLogin={handlePrivyLogin} />;
  }

  if (isVerified) {
    return (
      <VerifiedPage
        wallet={wallet}
        onDisconnect={handleDisconnect}
        onBackToMarket={closeDetail}
      />
    );
  }

  if (skillIdInRoute) {
    return (
      <SkillDetailPage
        skill={detailSkill}
        loading={detailLoading}
        error={detailError}
        wallet={wallet}
        onBack={closeDetail}
        onDisconnect={handleDisconnect}
        onOpenSkill={openSkill}
      />
    );
  }

  return <MarketPage wallet={wallet} onDisconnect={handleDisconnect} onOpenSkill={openSkill} />;
}
