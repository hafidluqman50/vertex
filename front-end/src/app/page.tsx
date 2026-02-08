'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from "sonner";
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVertexData, useVertexTrade } from '@/hooks/use-vertex';

const generateBondingCurveData = (currentSupply: bigint | undefined) => {
  const supplyVal = currentSupply ? parseFloat(formatEther(currentSupply)) : 0;
  
  const maxView = supplyVal > 0 ? supplyVal * 1.5 : 100; 
  const points = 20;
  
  return Array.from({ length: points }, (_, i) => {
    const s = (i / (points - 1)) * maxView;
    return {
      supply: s,
      price: s * 0.001 
    };
  });
};

export default function Home() {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState<string>('');
  const [isBuy, setIsBuy] = useState(true);

  const { spotPrice, quotePrice, tokenAmount, balance, totalSupply, poolBalance, isLoading, refetchAll } = useVertexData(amount, isBuy);
  const { executeTrade, isPending, isConfirming, isSuccess, hash } = useVertexTrade();

  const chartData = useMemo(() => generateBondingCurveData(totalSupply), [totalSupply]);

  const handleTrade = () => {
    if (quotePrice && tokenAmount) {
      executeTrade(tokenAmount, quotePrice, isBuy);
    }
  };

  const lastSuccessHash = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isSuccess || !hash) return;
    if (lastSuccessHash.current === hash) return;
    lastSuccessHash.current = hash;

    const timer = setTimeout(() => {
      refetchAll();
    }, 1000);

    toast.success("Transaction Successful", { description: "Your balance has been updated." });

    return () => clearTimeout(timer);
  }, [isSuccess, hash, refetchAll]);

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans">
      {/* NAVBAR */}
      <nav className="border-b border-zinc-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
             <Image width={200} height={200} src='/logo_vertex_.png' alt='logo vertex' draggable={false} />
          </div>
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: INFORMATION & CHART */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 uppercase tracking-wide">
                <ShieldCheck size={14} />
                <span>Audited Math Architecture</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
                Trust the Math, <br />
                <span className="text-[#12AAFF]">Not the Market.</span>
              </h1>
              <p className="text-lg text-zinc-500 max-w-md leading-relaxed">
                The first bonding curve protocol on Arbitrum with a mathematical floor price that can only go up.
              </p>
            </div>

            {/* CHART VISUALIZER */}
            <div className="relative h-[300px] w-full bg-zinc-50 rounded-xl border border-zinc-100 p-6 overflow-hidden">
              <div className="absolute top-6 left-6 z-10">
                <p className="text-sm text-zinc-500 font-medium">Current Floor Price</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {spotPrice ? parseFloat(formatEther(spotPrice)).toFixed(6) : '0.000'} ETH
                </p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#12AAFF" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#12AAFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip cursor={false} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="price" stroke="#12AAFF" strokeWidth={3} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* STATS ROW (SEKARANG DINAMIS!) */}
            <div className="grid grid-cols-3 gap-4">
               {/* Total Supply */}
               <div className="p-4 rounded-xl border border-zinc-100 bg-white shadow-sm">
                  <p className="text-xs text-zinc-400 font-medium uppercase">Total Supply</p>
                  <p className="text-lg font-bold text-zinc-900 mt-1">
                    {totalSupply ? parseFloat(formatEther(totalSupply)).toFixed(0) : '0'} VTX
                  </p>
               </div>
               
               {/* Floor Reserve (TVL) */}
               <div className="p-4 rounded-xl border border-zinc-100 bg-white shadow-sm">
                  <p className="text-xs text-zinc-400 font-medium uppercase">Floor Reserve</p>
                  <p className="text-lg font-bold text-zinc-900 mt-1">
                    {poolBalance ? parseFloat(poolBalance.formatted).toFixed(4) : '0.00'} ETH
                  </p>
               </div>

               {/* Status */}
               <div className="p-4 rounded-xl border border-zinc-100 bg-white shadow-sm">
                  <p className="text-xs text-zinc-400 font-medium uppercase">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-lg font-bold text-zinc-900">Live</p>
                  </div>
               </div>
            </div>
          </div>

          {/* RIGHT: TRADING INTERFACE */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-[420px] shadow-xl shadow-zinc-200/40 border-zinc-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex justify-between items-center text-lg">
                  <span>Trade VTX</span>
                  {isConnected && (
                    <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-1 rounded">
                      Bal: {balance ? parseFloat(formatEther(balance)).toFixed(2) : '0'} VTX
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="buy" onValueChange={(v) => setIsBuy(v === 'buy')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-100 p-1 rounded-lg">
                    <TabsTrigger value="buy" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#12AAFF] data-[state=active]:shadow-sm font-medium">Buy</TabsTrigger>
                    <TabsTrigger value="sell" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm font-medium">Sell</TabsTrigger>
                  </TabsList>

                  <div className="space-y-6">
                    
                    {/* INPUT SECTION (VTX) */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-medium text-zinc-500 uppercase">
                        <span>{isBuy ? 'I want to Buy' : 'I want to Sell'}</span>
                        <span className="text-[#12AAFF] font-bold">Amount ({isBuy ? 'ETH' : 'VTX'})</span>
                      </div>
                      <Input 
                        type="number" 
                        placeholder={isBuy ? '0.01' : '100'}
                        className="text-3xl font-bold h-16 border-zinc-200 focus-visible:ring-[#12AAFF] focus-visible:ring-1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-center -my-2 relative z-10">
                      <div className="bg-zinc-50 p-2 rounded-full border border-zinc-100 text-zinc-400">
                        <ArrowRight size={16} className="rotate-90" />
                      </div>
                    </div>

                    {/* OUTPUT SECTION */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-medium text-zinc-500 uppercase">
                        <span>Estimated Receive</span>
                        <span>Asset: {isBuy ? 'VTX' : 'ETH'}</span>
                      </div>
                      <div className="h-16 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center px-4 justify-between">
                          <span className="text-2xl font-bold text-zinc-900">
                            {amount && (isBuy ? tokenAmount : quotePrice) ? parseFloat(formatEther(isBuy ? tokenAmount : quotePrice!)).toFixed(isBuy ? 4 : 6) : (isBuy ? '0.0000' : '0.000000')}
                          </span>
                          {isLoading && <span className="text-xs text-blue-500 animate-pulse">Calculating...</span>}
                      </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <Button 
                      className={`w-full h-14 text-lg font-semibold shadow-lg shadow-blue-600/10 transition-all ${
                        isBuy ? 'bg-[#12AAFF] hover:bg-blue-600' : 'bg-zinc-900 hover:bg-zinc-800'
                      }`}
                      onClick={handleTrade}
                      disabled={!isConnected || isPending || isConfirming || !amount}
                    >
                      {isPending || isConfirming ? (
                        <span className="flex items-center gap-2">
                          <Activity className="animate-spin w-4 h-4" /> Processing...
                        </span>
                      ) : (
                        isBuy ? `Buy ${tokenAmount && amount ? parseFloat(formatEther(tokenAmount)).toFixed(4) : '0.0000'} VTX` : `Sell ${amount || '0'} VTX`
                      )}
                    </Button>

                    {isSuccess && (
                      <div className="p-4 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 flex items-center justify-center gap-2">
                        <ShieldCheck size={16} />
                        <a 
                          href={`https://sepolia.arbiscan.io/tx/${hash}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="hover:underline font-medium"
                        >
                          View Transaction
                        </a>
                      </div>
                    )}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}