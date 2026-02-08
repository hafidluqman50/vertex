import { parseEther } from 'viem';

export const SLOPE = 1000000000000000n;
export const SCALE = 10n ** 36n;

export const parseAmountSafe = (value: string) => {
  if (!value) return 0n;
  if (!/^\d+(\.\d+)?$/.test(value)) return 0n;
  try {
    return parseEther(value);
  } catch {
    return 0n;
  }
};

export const sqrtBigInt = (value: bigint) => {
  if (value < 0n) return 0n;
  if (value < 2n) return value;
  let x0 = value / 2n;
  let x1 = (x0 + value / x0) / 2n;
  while (x1 < x0) {
    x0 = x1;
    x1 = (x0 + value / x0) / 2n;
  }
  return x0;
};

export const estimateTokenAmountFromEth = (ethAmount: bigint, totalSupply: bigint) => {
  if (ethAmount <= 0n) return 0n;
  return sqrtBigInt((totalSupply ** 2n) + ((2n * SCALE * ethAmount) / SLOPE)) - totalSupply;
};
