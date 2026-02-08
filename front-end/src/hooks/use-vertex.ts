import { useCallback, useMemo } from 'react';
import { useAccount, useBalance, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { VERTEX_ABI, VERTEX_ADDRESS } from '@/constants/vertex';
import { parseAmountSafe, estimateTokenAmountFromEth } from '@/lib/vertex-math';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export const useVertexData = (amountInput: string, isBuy: boolean) => {
  const { address } = useAccount();

  const { data: spotPrice, isLoading: isLoadingSpot, refetch: refetchSpot } = useReadContract({
    address: VERTEX_ADDRESS,
    abi: VERTEX_ABI,
    functionName: 'getSpotPrice',
  });

  const { data: totalSupply, isLoading: isLoadingSupply, refetch: refetchSupply } = useReadContract({
    address: VERTEX_ADDRESS,
    abi: VERTEX_ABI,
    functionName: 'totalSupply',
  });

  const { data: contractEth, isLoading: isLoadingPool, refetch: refetchPool } = useBalance({
    address: VERTEX_ADDRESS,
  });

  const debouncedAmount = useDebouncedValue(amountInput, 200);
  const parsedInput = useMemo(() => parseAmountSafe(debouncedAmount), [debouncedAmount]);

  const tokenAmount = useMemo(() => {
    if (!totalSupply) return 0n;
    return isBuy ? estimateTokenAmountFromEth(parsedInput, totalSupply) : parsedInput;
  }, [isBuy, parsedInput, totalSupply]);

  const { data: quotePrice, isLoading: isLoadingQuote } = useReadContract({
    address: VERTEX_ADDRESS,
    abi: VERTEX_ABI,
    functionName: isBuy ? 'getBuyPrice' : 'getSellPrice',
    args: [tokenAmount],
    query: {
      enabled: tokenAmount > 0n,
    }
  });

  const { data: balance, isLoading: isLoadingBalance, refetch: refetchBalance } = useReadContract({
    address: VERTEX_ADDRESS,
    abi: VERTEX_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address }
  });

  const refetchAll = useCallback(() => {
    refetchSpot();
    refetchBalance();
    refetchSupply();
    refetchPool();
  }, [refetchSpot, refetchBalance, refetchSupply, refetchPool]);

  return {
    spotPrice,
    quotePrice,
    tokenAmount,
    balance,
    totalSupply,
    poolBalance: contractEth,
    isLoading: isLoadingSpot || isLoadingSupply || isLoadingPool || isLoadingQuote || isLoadingBalance,
    refetchAll,
  };
};

export const useVertexTrade = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const executeTrade = useCallback((tokenAmount: bigint, quotePrice: bigint, isBuy: boolean) => {
    if (!tokenAmount || !quotePrice) return;

    if (isBuy) {
      const maxEthCost = (quotePrice * 105n) / 100n;
      writeContract({
        address: VERTEX_ADDRESS,
        abi: VERTEX_ABI,
        functionName: 'buy',
        args: [tokenAmount, maxEthCost],
        value: maxEthCost,
      });
      return;
    }

    const minEthReturn = (quotePrice * 95n) / 100n;
    writeContract({
      address: VERTEX_ADDRESS,
      abi: VERTEX_ABI,
      functionName: 'sell',
      args: [tokenAmount, minEthReturn],
    });
  }, [writeContract]);

  return { executeTrade, isPending, isConfirming, isSuccess, hash, error };
};
