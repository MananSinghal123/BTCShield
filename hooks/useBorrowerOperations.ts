import { useMemo } from "react";
import {
  createPublicClient,
  getContract,
  http,
  parseEther,
  formatEther,
} from "viem";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import BorrowerOperationsAbi from "../abi/BorrowerOperations.json";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_BORROWER_OPERATIONS_ADDRESS as `0x${string}`;

const RPC_URL = "https://rpc.test.mezo.org";

const MEZO_TESTNET = {
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
} as const;

export function useBorrowerOperations() {
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
        abi: BorrowerOperationsAbi.abi,
        client,
      }),
    [client]
  );

  // ============ READ FUNCTIONS ============

  //   /**
  //    * Get current borrowing rate (as a percentage)
  //    * Uses contract instance for automatic batching
  //    */
  //   const getBorrowingRate = async (): Promise<string> => {
  //     try {
  //       const result = await contract.read.borrowingRate();
  //       return formatEther(result as bigint);
  //     } catch (error) {
  //       console.error("Error fetching borrowing rate:", error);
  //       throw error;
  //     }
  //   };

  //   /**
  //    * Get current redemption rate (as a percentage)
  //    * Uses contract instance for automatic batching
  //    */
  //   const getRedemptionRate = async (): Promise<string> => {
  //     try {
  //       const result = await contract.read.redemptionRate();
  //       return formatEther(result as bigint);
  //     } catch (error) {
  //       console.error("Error fetching redemption rate:", error);
  //       throw error;
  //     }
  //   };

  /**
   * Get multiple contract values in a single batched call
   * This will automatically use multicall under the hood
   */
  const getBorrowingandRedemptionRate = async () => {
    try {
      const [borrowingRate, redemptionRate] = await Promise.all([
        contract.read.borrowingRate(),
        contract.read.redemptionRate(),
      ]);

      return {
        borrowingRate: formatEther(borrowingRate as bigint),
        redemptionRate: formatEther(redemptionRate as bigint),
      };
    } catch (error) {
      console.error("Error fetching batched data:", error);
      throw error;
    }
  };

  // ============ WRITE FUNCTIONS ============

  /**
   * Add collateral to an existing trove
   * @param collateralAmount - Amount of collateral to add (as string in BTC, e.g., "1.5")
   * @param upperHint - Address hint for sorted troves
   * @param lowerHint - Address hint for sorted troves
   */
  const addCollateral = async (
    collateralAmount: string,
    upperHint: `0x${string}` = "0x0000000000000000000000000000000000000000",
    lowerHint: `0x${string}` = "0x0000000000000000000000000000000000000000"
  ) => {
    if (!walletClient || !address) throw new Error("Wallet not connected");

    try {
      // parseEther converts from human-readable (e.g., "1.5") to wei (1.5 * 10^18)
      const valueInWei = parseEther(collateralAmount);

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: BorrowerOperationsAbi.abi,
        functionName: "addColl",
        args: [upperHint, lowerHint],
        value: valueInWei,
        chain: MEZO_TESTNET,
        account: address,
      });

      return hash;
    } catch (error) {
      console.error("Error adding collateral:", error);
      throw error;
    }
  };

  /**
   * Withdraw collateral from a trove
   * @param amount - Amount of collateral to withdraw (as string)
   * @param upperHint - Address hint for sorted troves
   * @param lowerHint - Address hint for sorted troves
   */
  const withdrawCollateral = async (
    amount: string,
    upperHint: `0x${string}` = "0x0000000000000000000000000000000000000000",
    lowerHint: `0x${string}` = "0x0000000000000000000000000000000000000000"
  ) => {
    if (!walletClient || !address) throw new Error("Wallet not connected");

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: BorrowerOperationsAbi.abi,
        functionName: "withdrawColl",
        args: [parseEther(amount), upperHint, lowerHint],
        chain: MEZO_TESTNET,
        account: address,
      });

      return hash;
    } catch (error) {
      console.error("Error withdrawing collateral:", error);
      throw error;
    }
  };

  /**
   * Withdraw MUSD tokens (increase debt)
   * @param amount - Amount of MUSD to withdraw (as string)
   * @param upperHint - Address hint for sorted troves
   * @param lowerHint - Address hint for sorted troves
   */
  const withdrawMUSD = async (
    amount: string,
    upperHint: `0x${string}` = "0x0000000000000000000000000000000000000000",
    lowerHint: `0x${string}` = "0x0000000000000000000000000000000000000000"
  ) => {
    if (!walletClient || !address) throw new Error("Wallet not connected");

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: BorrowerOperationsAbi.abi,
        functionName: "withdrawMUSD",
        args: [parseEther(amount), upperHint, lowerHint],
        chain: MEZO_TESTNET,
        account: address,
      });

      return hash;
    } catch (error) {
      console.error("Error withdrawing MUSD:", error);
      throw error;
    }
  };

  /**
   * Repay MUSD tokens (reduce debt)
   * @param amount - Amount of MUSD to repay (as string)
   * @param upperHint - Address hint for sorted troves
   * @param lowerHint - Address hint for sorted troves
   */
  const repayMUSD = async (
    amount: string,
    upperHint: `0x${string}` = "0x0000000000000000000000000000000000000000",
    lowerHint: `0x${string}` = "0x0000000000000000000000000000000000000000"
  ) => {
    if (!walletClient || !address) throw new Error("Wallet not connected");

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: BorrowerOperationsAbi.abi,
        functionName: "repayMUSD",
        args: [parseEther(amount), upperHint, lowerHint],
        chain: MEZO_TESTNET,
        account: address,
      });

      return hash;
    } catch (error) {
      console.error("Error repaying MUSD:", error);
      throw error;
    }
  };

  /**
   * Claim collateral surplus (after redemption or liquidation)
   */
  const claimCollateral = async () => {
    if (!walletClient || !address) throw new Error("Wallet not connected");

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: BorrowerOperationsAbi.abi,
        functionName: "claimCollateral",
        chain: MEZO_TESTNET,
        account: address,
      });

      return hash;
    } catch (error) {
      console.error("Error claiming collateral:", error);
      throw error;
    }
  };

  /**
   * Open a new trove
   * @param debtAmount - Amount of MUSD to borrow (as string)
   * @param collateralAmount - Amount of collateral to deposit (as string)
   * @param upperHint - Address hint for sorted troves insertion
   * @param lowerHint - Address hint for sorted troves insertion
   */
  const openTrove = async (
    debtAmount: string,
    collateralAmount: string,
    upperHint: `0x${string}` = "0x0000000000000000000000000000000000000000",
    lowerHint: `0x${string}` = "0x0000000000000000000000000000000000000000"
  ) => {
    console.log(CONTRACT_ADDRESS);
    if (!walletClient || !address) throw new Error("Wallet not connected");

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: BorrowerOperationsAbi.abi,
        functionName: "openTrove",
        args: [parseEther(debtAmount), upperHint, lowerHint],
        value: parseEther(collateralAmount),
        chain: MEZO_TESTNET,
      });

      return hash;
    } catch (error) {
      console.error("Error opening trove:", error);
      throw error;
    }
  };

  /**
   * Get minimum net debt required for a trove
   */
  const getMinNetDebt = async (): Promise<string> => {
    try {
      const result = await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: BorrowerOperationsAbi.abi,
        functionName: "minNetDebt",
      });
      return formatEther(result as bigint);
    } catch (error) {
      console.error("Error fetching min net debt:", error);
      throw error;
    }
  };

  /**
   * Close trove (repay all debt and withdraw all collateral)
   */
  const closeTrove = async () => {
    if (!walletClient || !address) throw new Error("Wallet not connected");

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: BorrowerOperationsAbi.abi,
        functionName: "closeTrove",
        chain: MEZO_TESTNET,
      });

      return hash;
    } catch (error) {
      console.error("Error closing trove:", error);
      throw error;
    }
  };

  return {
    // Contract instances
    contract,
    publicClient: client,

    // Read functions
    // getBorrowingRate,
    // getRedemptionRate,
    getMinNetDebt,
    getBorrowingandRedemptionRate, // New batched read function

    // Write functions
    addCollateral,
    withdrawCollateral,
    withdrawMUSD,
    repayMUSD,
    claimCollateral,
    openTrove,
    closeTrove,

    // Utilities
    address,
    isConnected: !!address && !!walletClient,
  };
}
