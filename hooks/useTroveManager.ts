import { useMemo } from "react";
import {
  createPublicClient,
  getContract,
  http,
  formatEther,
  parseEther,
} from "viem";
import { useAccount, usePublicClient } from "wagmi";
import TroveManagerAbi from "../abi/TroveManager.json";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_TROVE_MANAGER_ADDRESS as `0x${string}`;

const RPC_URL = "https://rpc.test.mezo.org";

const MEZO_TESTNET = {
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
} as const;

export enum TroveStatus {
  NonExistent = 0,
  Active = 1,
  ClosedByOwner = 2,
  ClosedByLiquidation = 3,
  ClosedByRedemption = 4,
}

export function useTroveManager() {
  const { address } = useAccount();

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
          multicall: true,
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
        abi: TroveManagerAbi.abi,
        client,
      }),
    [client]
  );

  // ============ READ FUNCTIONS ============

  /**
   * Get complete trove data for a borrower in one batched call
   * @param borrower - Trove owner address (defaults to connected address)
   */
  const getCompleteTroveData = async (borrower?: `0x${string}`) => {
    const troveOwner = borrower || address;
    if (!troveOwner) throw new Error("No address provided");

    try {
      const [
        status,
        coll,
        debt,
        principal,
        interestOwed,
        interestRate,
        maxBorrowingCapacity,
        entireData,
        hasPendingRewards,
      ] = await Promise.all([
        contract.read.getTroveStatus([troveOwner]),
        contract.read.getTroveColl([troveOwner]),
        contract.read.getTroveDebt([troveOwner]),
        contract.read.getTrovePrincipal([troveOwner]),
        contract.read.getTroveInterestOwed([troveOwner]),
        contract.read.getTroveInterestRate([troveOwner]),
        contract.read.getTroveMaxBorrowingCapacity([troveOwner]),
        contract.read.getEntireDebtAndColl([troveOwner]),
        contract.read.hasPendingRewards([troveOwner]),
      ]);

      const [
        entireColl,
        entirePrincipal,
        entireInterest,
        pendingColl,
        pendingPrincipal,
        pendingInterest,
      ] = entireData as bigint[];

      return {
        status: status as TroveStatus,
        coll: formatEther(coll as bigint),
        debt: formatEther(debt as bigint),
        principal: formatEther(principal as bigint),
        interestOwed: formatEther(interestOwed as bigint),
        interestRate: Number(interestRate),
        maxBorrowingCapacity: formatEther(maxBorrowingCapacity as bigint),
        entireColl: formatEther(entireColl),
        entirePrincipal: formatEther(entirePrincipal),
        entireInterest: formatEther(entireInterest),
        pendingCollateral: formatEther(pendingColl),
        pendingPrincipal: formatEther(pendingPrincipal),
        pendingInterest: formatEther(pendingInterest),
        totalDebt: formatEther(
          entirePrincipal + entireInterest + pendingPrincipal + pendingInterest
        ),
        totalCollateral: formatEther(entireColl + pendingColl),
        hasPendingRewards: hasPendingRewards as boolean,
        isActive: (status as TroveStatus) === TroveStatus.Active,
      };
    } catch (error) {
      console.error("Error fetching complete trove data:", error);
      throw error;
    }
  };

  /**
   * Get trove health metrics in one batched call
   * @param borrower - Trove owner address (defaults to connected address)
   * @param price - Current BTC price (as string, will be converted to wei)
   */
  const getTroveHealthMetrics = async (
    borrower?: `0x${string}`,
    price?: string
  ) => {
    const troveOwner = borrower || address;
    if (!troveOwner) throw new Error("No address provided");
    if (!price) throw new Error("Price is required");

    const priceInWei = parseEther(price);

    try {
      const [icr, nicr, hasPendingRewards, status] = await Promise.all([
        contract.read.getCurrentICR([troveOwner, priceInWei]),
        contract.read.getNominalICR([troveOwner]),
        contract.read.hasPendingRewards([troveOwner]),
        contract.read.getTroveStatus([troveOwner]),
      ]);

      return {
        icr: formatEther(icr as bigint),
        nominalICR: formatEther(nicr as bigint),
        hasPendingRewards: hasPendingRewards as boolean,
        isActive: (status as TroveStatus) === TroveStatus.Active,
        status: status as TroveStatus,
      };
    } catch (error) {
      console.error("Error fetching trove health metrics:", error);
      throw error;
    }
  };

  /**
   * Get system-wide statistics in one batched call
   * @param price - Current BTC price (as string, will be converted to wei)
   */
  const getSystemStats = async (price: string) => {
    const priceInWei = parseEther(price);

    try {
      const [tcr, isRecoveryMode, troveCount, l_coll, l_principal, l_interest] =
        await Promise.all([
          contract.read.getTCR([priceInWei]),
          contract.read.checkRecoveryMode([priceInWei]),
          contract.read.getTroveOwnersCount(),
          contract.read.L_Collateral(),
          contract.read.L_Principal(),
          contract.read.L_Interest(),
        ]);

      return {
        tcr: formatEther(tcr as bigint),
        isRecoveryMode: isRecoveryMode as boolean,
        troveCount: Number(troveCount),
        l_collateral: formatEther(l_coll as bigint),
        l_principal: formatEther(l_principal as bigint),
        l_interest: formatEther(l_interest as bigint),
      };
    } catch (error) {
      console.error("Error fetching system stats:", error);
      throw error;
    }
  };

  /**
   * Get pending rewards for a trove
   * @param borrower - Trove owner address (defaults to connected address)
   */
  const getPendingRewards = async (borrower?: `0x${string}`) => {
    const troveOwner = borrower || address;
    if (!troveOwner) throw new Error("No address provided");

    try {
      const [pendingColl, pendingDebt, hasPendingRewards] = await Promise.all([
        contract.read.getPendingCollateral([troveOwner]),
        contract.read.getPendingDebt([troveOwner]),
        contract.read.hasPendingRewards([troveOwner]),
      ]);

      const [pendingPrincipal, pendingInterest] = pendingDebt as bigint[];

      return {
        pendingCollateral: formatEther(pendingColl as bigint),
        pendingPrincipal: formatEther(pendingPrincipal),
        pendingInterest: formatEther(pendingInterest),
        hasPendingRewards: hasPendingRewards as boolean,
      };
    } catch (error) {
      console.error("Error fetching pending rewards:", error);
      throw error;
    }
  };

  /**
   * Get entire debt and collateral including pending rewards
   * @param borrower - Trove owner address (defaults to connected address)
   */
  const getEntireDebtAndColl = async (borrower?: `0x${string}`) => {
    const troveOwner = borrower || address;
    if (!troveOwner) throw new Error("No address provided");

    try {
      const result = await contract.read.getEntireDebtAndColl([troveOwner]);
      const [
        coll,
        principal,
        interest,
        pendingColl,
        pendingPrincipal,
        pendingInterest,
      ] = result as bigint[];

      return {
        coll: formatEther(coll),
        principal: formatEther(principal),
        interest: formatEther(interest),
        pendingCollateral: formatEther(pendingColl),
        pendingPrincipal: formatEther(pendingPrincipal),
        pendingInterest: formatEther(pendingInterest),
        totalDebt: formatEther(
          principal + interest + pendingPrincipal + pendingInterest
        ),
        totalCollateral: formatEther(coll + pendingColl),
      };
    } catch (error) {
      console.error("Error fetching entire debt and collateral:", error);
      throw error;
    }
  };

  /**
   * Get current Individual Collateral Ratio (ICR)
   * @param borrower - Trove owner address (defaults to connected address)
   * @param price - Current BTC price (as string, will be converted to wei)
   */
  const getCurrentICR = async (borrower?: `0x${string}`, price?: string) => {
    const troveOwner = borrower || address;
    if (!troveOwner) throw new Error("No address provided");
    if (!price) throw new Error("Price is required");

    try {
      const priceInWei = parseEther(price);
      const icr = await contract.read.getCurrentICR([troveOwner, priceInWei]);
      return formatEther(icr as bigint);
    } catch (error) {
      console.error("Error fetching current ICR:", error);
      throw error;
    }
  };

  /**
   * Get nominal ICR (collateral / debt ratio without price)
   * @param borrower - Trove owner address (defaults to connected address)
   */
  const getNominalICR = async (borrower?: `0x${string}`) => {
    const troveOwner = borrower || address;
    if (!troveOwner) throw new Error("No address provided");

    try {
      const nicr = await contract.read.getNominalICR([troveOwner]);
      return formatEther(nicr as bigint);
    } catch (error) {
      console.error("Error fetching nominal ICR:", error);
      throw error;
    }
  };

  /**
   * Get Total Collateralization Ratio (TCR) for the entire system
   * @param price - Current BTC price (as string, will be converted to wei)
   */
  const getTCR = async (price: string) => {
    try {
      const priceInWei = parseEther(price);
      const tcr = await contract.read.getTCR([priceInWei]);
      return formatEther(tcr as bigint);
    } catch (error) {
      console.error("Error fetching TCR:", error);
      throw error;
    }
  };

  /**
   * Check if system is in recovery mode
   * @param price - Current BTC price (as string, will be converted to wei)
   */
  const checkRecoveryMode = async (price: string) => {
    try {
      const priceInWei = parseEther(price);
      const isRecovery = await contract.read.checkRecoveryMode([priceInWei]);
      return isRecovery as boolean;
    } catch (error) {
      console.error("Error checking recovery mode:", error);
      throw error;
    }
  };

  /**
   * Get trove status
   * @param borrower - Trove owner address (defaults to connected address)
   */
  const getTroveStatus = async (borrower?: `0x${string}`) => {
    const troveOwner = borrower || address;
    if (!troveOwner) throw new Error("No address provided");

    try {
      const status = await contract.read.getTroveStatus([troveOwner]);
      return status as TroveStatus;
    } catch (error) {
      console.error("Error fetching trove status:", error);
      throw error;
    }
  };

  /**
   * Get total number of troves in the system
   */
  const getTroveOwnersCount = async () => {
    try {
      const count = await contract.read.getTroveOwnersCount();
      return Number(count);
    } catch (error) {
      console.error("Error fetching trove owners count:", error);
      throw error;
    }
  };

  /**
   * Get trove owner address by index
   * @param index - Index in the TroveOwners array
   */
  const getTroveFromTroveOwnersArray = async (index: number) => {
    try {
      const owner = await contract.read.getTroveFromTroveOwnersArray([
        BigInt(index),
      ]);
      return owner as `0x${string}`;
    } catch (error) {
      console.error("Error fetching trove from array:", error);
      throw error;
    }
  };

  return {
    // Contract instances
    contract,
    publicClient: client,

    // Batched read functions (recommended)
    getCompleteTroveData,
    getTroveHealthMetrics,
    getSystemStats,
    getPendingRewards,
    getEntireDebtAndColl,

    // Individual read functions
    getCurrentICR,
    getNominalICR,
    getTCR,
    checkRecoveryMode,
    getTroveStatus,
    getTroveOwnersCount,
    getTroveFromTroveOwnersArray,

    // Utilities
    address,
    isConnected: !!address,
  };
}
