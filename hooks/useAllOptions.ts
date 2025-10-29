import { useMemo } from "react";
import {
  createPublicClient,
  getContract,
  http,
  parseEther,
  formatEther,
} from "viem";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import ReversibleCallOptionManagerAbi from "../abi/ReversibleCallOptionManager.json";
import { BackstopOption, OptionPhase } from "./useRcoManager";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_RCO_MANAGER_ADDRESS as `0x${string}`;

const RPC_URL = "https://rpc.test.mezo.org";

// Add your Goldsky subgraph endpoint
const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL as string;

const MEZO_TESTNET = {
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
} as const;

export function useAllOptions() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const publicClient = usePublicClient({
    chainId: 31611,
  });

  const fallbackPublicClient = useMemo(
    () =>
      createPublicClient({
        transport: http(RPC_URL),
        chain: MEZO_TESTNET,
        batch: {
          multicall: true,
        },
      }),
    []
  );

  const client = publicClient || fallbackPublicClient;

  const contract = useMemo(
    () =>
      getContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ReversibleCallOptionManagerAbi.abi,
        client,
      }),
    [client]
  );

  // Fetch available options from subgraph
  async function fetchAvailableOptions() {
    try {
      // GraphQL query to fetch unique borrowers with their latest option
      const query = `
        {
          optionInitializeds(first: 100, orderDirection: desc) {
            id
            borrower
            lambda
            premium
            strikeCR
            maturityTime
          }
        }
      `;

      console.log("Fetching options from subgraph...");

      // Fetch from subgraph
      const response = await fetch(SUBGRAPH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const { data, errors } = await response.json();
      console.log("Subgraph response data:", data);

      if (errors) {
        console.error("Subgraph query errors:", errors);
        throw new Error("Failed to fetch from subgraph");
      }

      console.log(
        "Fetched OptionInitialized events from subgraph:",
        data.optionInitializeds
      );

      // Get unique borrowers (most recent option per borrower)
      const borrowerMap = new Map();
      data.optionInitializeds.forEach((event: any) => {
        if (!borrowerMap.has(event.borrower)) {
          borrowerMap.set(event.borrower, event);
        }
      });

      const uniqueBorrowers = Array.from(borrowerMap.keys());
      console.log("Unique borrowers:", uniqueBorrowers);

      const availableOptions = [];

      // Fetch current option state for each borrower
      for (const borrower of uniqueBorrowers) {
        try {
          const option = (await contract.read.getOption([
            borrower,
          ])) as BackstopOption;

          console.log(`Fetched option for borrower ${borrower}:`, option);

          const {
            supporter,
            collateralAtStart,
            debtAtStart,
            lambda,
            premium,
            strikeCR,
            startTime,
            maturityTime,
            interestRate,
            phase,
            exists,
          } = option as any;

          // Only include existing options
          if (exists) {
            availableOptions.push({
              borrower: borrower as `0x${string}`,
              supporter: supporter as `0x${string}`,
              collateralAtStart: formatEther(collateralAtStart),
              debtAtStart: formatEther(debtAtStart),
              lambda: formatEther(lambda),
              premium: formatEther(premium),
              strikeCR: formatEther(strikeCR),
              startTime: Number(startTime),
              maturityTime: Number(maturityTime),
              interestRate: formatEther(interestRate),
              phase: Number(phase) as OptionPhase,
              exists: Boolean(exists),
            });
          }
        } catch (error) {
          console.error(
            `Error fetching option for borrower ${borrower}:`,
            error
          );
        }
      }

      console.log("Available Options for Supporters:", availableOptions);

      return availableOptions;
    } catch (error) {
      console.error("Error fetching options from subgraph:", error);
      // Fallback to empty array or throw error
      return [];
    }
  }

  function calculateProfitPotential(option: any, price: bigint) {
    // Add your profit calculation logic here
    return "0";
  }

  return {
    contract,
    address,
    walletClient,
    client,
    fetchAvailableOptions,
  };
}
