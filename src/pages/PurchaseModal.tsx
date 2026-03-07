import { useState } from 'react';
import type { Skill } from '../bazaar/mock-data';
import type { WalletSession, TxResult } from '../wallet/types';
import { awalAdapter } from '../wallet/awal-adapter';
import { createPrivyAdapter } from '../wallet/privy-adapter';
import { logClickout } from '../lib/aggregator';
import { saveReceipt } from '../lib/receipts';

export function PurchaseModal({
  skill,
  wallet,
  onClose,
}: {
  skill: Skill;
  wallet: WalletSession;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<'confirm' | 'processing' | 'done' | 'external'>('confirm');
  const [txResult, setTxResult] = useState<TxResult | null>(null);

  const isExternal = skill.source !== 'bazaar';

  // External skill → CLICK_OUT_ONLY
  if (isExternal && stage === 'confirm') {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center">
          <span className="text-5xl mb-4 block">↗️</span>
          <h3 className="text-xl font-bold text-white mb-2">External Skill</h3>
          <p className="text-slate-400 mb-4">
            This skill is from <span className="text-yellow-400">{skill.source}</span>.
            Bazaar does not host or execute external skills.
          </p>

          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-400 mb-6">
            ⚠️ Untrusted source · No S-DNA · No Guardian scan
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  await logClickout({
                    skill_id: skill.id,
                    source: skill.source,
                    destination_url: skill.url || `https://example.com/${skill.id}`,
                    wallet_address: wallet.address,
                  });
                } catch (error) {
                  console.error('clickout log failed', error);
                }

                if (skill.url) {
                  window.open(skill.url, '_blank', 'noopener,noreferrer');
                }

                setStage('external');
              }}
              className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-sm cursor-pointer"
            >
              View on {skill.source} ↗
            </button>
          </div>
        </div>
      </Overlay>
    );
  }

  if (stage === 'external') {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center">
          <span className="text-5xl mb-4 block">✅</span>
          <h3 className="text-lg font-bold text-white mb-2">Attribution Logged</h3>
          <p className="text-sm text-slate-400 mb-4">
            Click-out event recorded. Redirected to {skill.source}.
          </p>
          <pre className="text-left text-xs bg-[#0a0e1a] p-3 rounded-lg text-slate-400 overflow-auto mb-4">
{JSON.stringify(
  {
    type: 'CLICK_OUT',
    skill_id: skill.id,
    source: skill.source,
    destination_url: skill.url || '',
    wallet: wallet.address.slice(0, 10) + '...',
    timestamp: new Date().toISOString(),
    bazaar_version: '0.1.0-demo',
  },
  null,
  2,
)}
          </pre>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 text-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </Overlay>
    );
  }

  const handlePurchase = async () => {
    setStage('processing');
    const adapter = wallet.provider === 'awal'
      ? awalAdapter
      : createPrivyAdapter({ wallet: { address: wallet.address }, email: { address: wallet.email ?? '' } });

    const result = await adapter.send(
      '0xBazaarVault000000000000000000000000000001',
      skill.price,
      'USDC'
    );
    result.proof.skill_id = skill.id;
    result.proof.skill_name = skill.name;

    // Persist a local receipt so /verified can show proof bundle.
    try {
      saveReceipt({ tx: result, skill });
    } catch {
      // best-effort
    }

    setTxResult(result);
    setStage('done');
  };

  if (stage === 'processing') {
    return (
      <Overlay onClose={() => {}}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">Processing DRY_RUN...</h3>
          <p className="text-sm text-slate-400 mt-2">Simulating transaction on Base Sepolia</p>
        </div>
      </Overlay>
    );
  }

  if (stage === 'done' && txResult) {
    return (
      <Overlay onClose={onClose}>
        <div>
          <div className="text-center mb-4">
            <span className="text-5xl block mb-2">🧾</span>
            <h3 className="text-lg font-bold text-emerald-400">DRY_RUN Complete</h3>
          </div>

          {/* Tx Summary */}
          <div className="p-4 rounded-lg bg-[#0a0e1a] mb-4 space-y-2 text-sm">
            <Row label="Skill" value={skill.name} />
            <Row label="Amount" value={`$${txResult.amount} ${txResult.token}`} />
            <Row label="From" value={txResult.from.slice(0, 10) + '...'} />
            <Row label="Chain" value={txResult.chain} />
            <Row label="Wallet" value={txResult.proof.wallet_provider} />
            <Row label="Tx Hash" value={txResult.txHash.slice(0, 18) + '...'} mono />
            <div className="flex justify-between">
              <span className="text-slate-500">Explorer</span>
              <a
                className="text-cyan-300 underline text-xs"
                href={`https://sepolia.basescan.org/tx/${txResult.txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                Open ↗
              </a>
            </div>
          </div>

          {/* Proof JSON */}
          <details className="mb-4">
            <summary className="text-sm text-cyan-400 cursor-pointer hover:underline">
              View Proof JSON
            </summary>
            <pre className="mt-2 text-xs bg-[#0a0e1a] p-3 rounded-lg text-slate-400 overflow-auto max-h-48">
{JSON.stringify(txResult.proof, null, 2)}
            </pre>
          </details>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium cursor-pointer"
          >
            Back to Market
          </button>
        </div>
      </Overlay>
    );
  }

  // Confirm stage (Bazaar native)
  return (
    <Overlay onClose={onClose}>
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Confirm Purchase</h3>

        <div className="p-4 rounded-lg bg-[#0a0e1a] mb-4 space-y-2 text-sm">
          <Row label="Skill" value={skill.name} />
          <Row label="Author" value={skill.author} />
          <Row label="Price" value={`$${skill.price} USDC`} />
          <Row label="Chain" value="Base Sepolia" />
          <Row label="Wallet" value={`${wallet.provider} (${wallet.address.slice(0, 8)}...)`} />
        </div>

        {skill.sdna_verified && (
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 mb-4">
            🧬 S-DNA Verified · 🛡️ Guardian Pass · {skill.core_temp_badge}
          </div>
        )}

        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-xs text-blue-400 mb-4">
          ⚡ DRY_RUN Mode — No real transaction will be executed
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-slate-700 text-slate-300 text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium cursor-pointer"
          >
            Purchase (DRY_RUN)
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1f2e] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={mono ? 'font-mono text-cyan-300' : 'text-slate-300'}>{value}</span>
    </div>
  );
}
