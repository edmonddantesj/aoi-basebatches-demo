import { createPublicClient, http, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

// Base Sepolia USDC contract
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const;

const USDC_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

export async function getOnChainBalance(address: string): Promise<{
  usdc: string;
  eth: string;
}> {
  try {
    const [ethBalance, usdcBalance] = await Promise.all([
      client.getBalance({ address: address as `0x${string}` }),
      client.readContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      }),
    ]);

    return {
      eth: formatUnits(ethBalance, 18),
      usdc: formatUnits(usdcBalance as bigint, 6),
    };
  } catch (e) {
    console.error('Failed to fetch on-chain balance:', e);
    return { usdc: '0.00', eth: '0.00' };
  }
}
