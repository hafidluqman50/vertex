"use client";

import {
	getDefaultConfig,
	getDefaultWallets,
	RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { ledgerWallet, trustWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type * as React from "react";
import { WagmiProvider } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

import "@rainbow-me/rainbowkit/styles.css";

const { wallets } = getDefaultWallets();

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
if (!rpcUrl) {
	console.warn("Missing NEXT_PUBLIC_RPC_URL in environment, falling back to public RPC.");
}

const chain = rpcUrl
	? {
		...arbitrumSepolia,
		rpcUrls: {
			default: { http: [rpcUrl] },
			public: { http: [rpcUrl] },
		},
	}
	: arbitrumSepolia;

const config = getDefaultConfig({
	appName: "VERTEX Protocol",
	projectId: "YOUR_PROJECT_ID",
	wallets: [
		...wallets,
		{
			groupName: "Other",
			wallets: [trustWallet, ledgerWallet],
		},
	],
	chains: [chain],
	ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider initialChain={chain}>
					{children}
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
