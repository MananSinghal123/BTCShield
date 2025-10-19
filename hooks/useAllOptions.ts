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

const MEZO_TESTNET = {
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
} as const;

export function useAllOptions() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Use wagmi's usePublicClient with multicall batching enabled
  const publicClient = usePublicClient({
    chainId: 31611,
  });

  // Fallback public client with multicall batching enabled
  const fallbackPublicClient = useMemo(
    () =>
      createPublicClient({
        transport: http(RPC_URL),
        chain: MEZO_TESTNET,
        batch: {
          multicall: true, // Enable multicall batching
        },
      }),
    []
  );

  const client = publicClient || fallbackPublicClient;

  // Create contract instance with getContract for optimized read operations
  const contract = useMemo(
    () =>
      getContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ReversibleCallOptionManagerAbi.abi,
        client,
      }),
    [client]
  );

  // Fetch available options for supporters
  async function fetchAvailableOptions() {
    const currentBlock = await client.getBlockNumber();
    const fromBlock = 8067900n; // Last ~2 days
    const maxBlockRange = 10000n; // RPC limit

    // Chunk the block range into batches
    const allEvents = [];
    let currentFromBlock = fromBlock;

    while (currentFromBlock <= currentBlock) {
      const currentToBlock =
        currentFromBlock + maxBlockRange - 1n > currentBlock
          ? currentBlock
          : currentFromBlock + maxBlockRange - 1n;

      console.log(
        `Fetching events from block ${currentFromBlock} to ${currentToBlock}`
      );

      const events = await client.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: "event",
          name: "OptionInitialized",
          inputs: [
            { type: "address", name: "borrower", indexed: true },
            { type: "uint256", name: "lambda" },
            { type: "uint256", name: "premium" },
            { type: "uint256", name: "strikeCR" },
            { type: "uint256", name: "maturityTime" },
          ],
        },
        fromBlock: currentFromBlock,
        toBlock: currentToBlock,
      });

      allEvents.push(...events);
      currentFromBlock = currentToBlock + 1n;
    }

    console.log("Fetched OptionInitialized events:", allEvents);

    // const price = await priceFeed.read.fetchPrice();
    const availableOptions = [];

    for (const event of allEvents) {
      const borrower = event.args.borrower;
      const option = (await contract.read.getOption([
        borrower,
      ])) as BackstopOption;

      console.log(`Fetched option for borrower ${borrower}:`, option);

      // Only show options in Initialization phase (waiting for supporter)
      // if (option.phase === 1) {
      // OptionPhase.Initialization
      // const currentICR = await troveManager.read.getCurrentICR([
      //   borrower,
      //   price,
      // ]);

      const {
        // borrower,
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
      // }
    }

    console.log("Available Options for Supporters:", availableOptions);

    return availableOptions;
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
