"use client";

import { ReactNode } from "react";
import { RainbowKitProvider, Chain } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const mezoTestnet = {
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.test.mezo.org"] },
  },
  blockExplorers: {
    default: { name: "Mezo Explorer", url: "https://explorer.test.mezo.org" },
  },
} as const satisfies Chain;

const config = createConfig({
  chains: [mezoTestnet],
  connectors: [
    injected({ target: "metaMask" }),
    walletConnect({
      projectId: "033eaa805e753c515d064bced64b1d6d", // Replace with your WalletConnect Project ID
      showQrModal: true,
    }),
    coinbaseWallet({ appName: "BTCShield" }),
  ],
  transports: {
    [mezoTestnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={mezoTestnet}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
