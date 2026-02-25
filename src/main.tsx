import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import App from './App';
import './index.css';

// Privy App ID — from vault (safe to expose in frontend)
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'PLACEHOLDER';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#06b6d4',
          logo: '🏪',
        },
        loginMethods: ['email', 'wallet'],
        embeddedWallets: {}, 
        defaultChain: {
          id: 84532, // Base Sepolia
          name: 'Base Sepolia',
          network: 'base-sepolia',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: {
            default: { http: ['https://sepolia.base.org'] },
          },
          blockExplorers: {
            default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
          },
        } as any,
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>
);
