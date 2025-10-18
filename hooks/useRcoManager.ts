import { useMemo } from "react";
import {
  createPublicClient,
  getContract,
  http,
  formatEther,
  parseEther,
} from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import ReversibleCallOptionManagerAbi from "../abi/ReversibleCallOptionManager.json";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_RCO_MANAGER_ADDRESS as `0x${string}`;
const RPC_URL = "https://rpc.test.mezo.org";

const MEZO_TESTNET = {
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
} as const;

export enum OptionPhase {
  None = 0,
  Initialization = 1,
  PreMaturity = 2,
  Maturity = 3,
  Exercised = 4,
  Terminated = 5,
  Defaulted = 6,
}

export interface BackstopOption {
  borrower: `0x${string}`;
  supporter: `0x${string}`;
  collateralAtStart: string;
  debtAtStart: string;
  lambda: string;
  premium: string;
  strikeCR: string;
  startTime: number;
  maturityTime: number;
  interestRate: string;
  phase: OptionPhase;
  exists: boolean;
}

export interface SupporterStats {
  balance: string;
  totalPremiums: string;
  exercises: number;
  terminations: number;
}

export function useRcoManager() {
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
        abi: ReversibleCallOptionManagerAbi.abi,
        client,
      }),
    [client]
  );

  // ============ READ FUNCTIONS ============

  /**
   * Get complete option data for a borrower
   * @param borrower - Borrower address (defaults to connected address)
   */
  const getOptionData = async (borrower?: `0x${string}`) => {
    const optionOwner = borrower || address;
    if (!optionOwner) throw new Error("No address provided");

    try {
      const result = await contract.read.getOption([optionOwner]);
      // console.log("getOptionData: Raw result from contract:", result);
      // if (typeof result !== "object" || result === null) {
      //   console.error("getOptionData: Unexpected result format", result);
      //   throw new TypeError(
      //     "getOptionData: result is not an object. Raw result: " +
      //       JSON.stringify(result)
      //   );
      // }
      const {
        borrower,
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
      } = result as any;

      console.log("getOptionData: Parsed result:", {
        borrower,
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
      });

      return {
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
      } as BackstopOption;
    } catch (error) {
      console.error("Error fetching option data:", error);
      throw error;
    }
  };

  /**
   * Get option phase for a borrower
   * @param borrower - Borrower address (defaults to connected address)
   */
  const getOptionPhase = async (borrower?: `0x${string}`) => {
    const optionOwner = borrower || address;
    if (!optionOwner) throw new Error("No address provided");

    try {
      const phase = await contract.read.getOptionPhase([optionOwner]);
      return Number(phase) as OptionPhase;
    } catch (error) {
      console.error("Error fetching option phase:", error);
      throw error;
    }
  };

  /**
   * Check if option is active
   * @param borrower - Borrower address (defaults to connected address)
   */
  const isOptionActive = async (borrower?: `0x${string}`) => {
    const optionOwner = borrower || address;
    if (!optionOwner) throw new Error("No address provided");

    try {
      const isActive = await contract.read.isOptionActive([optionOwner]);
      return isActive as boolean;
    } catch (error) {
      console.error("Error checking if option is active:", error);
      throw error;
    }
  };

  /**
   * Get termination fee for early termination
   * @param borrower - Borrower address (defaults to connected address)
   */
  const getTerminationFee = async (
    borrower?: `0x${string}`
  ): Promise<number> => {
    const optionOwner = borrower || address;
    if (!optionOwner) throw new Error("No address provided");

    try {
      const fee = await contract.read.getTerminationFee([optionOwner]);
      return parseFloat(formatEther(fee as bigint));
    } catch (error) {
      console.error("Error fetching termination fee:", error);
      throw error;
    }
  };

  /**
   * Get supporter statistics
   * @param supporter - Supporter address (defaults to connected address)
   */
  const getSupporterStats = async (supporter?: `0x${string}`) => {
    const supporterAddr = supporter || address;
    if (!supporterAddr) throw new Error("No address provided");

    try {
      const result = await contract.read.getSupporterStats([supporterAddr]);
      const [balance, totalPremiums, exercises, terminations] = result as any[];

      return {
        balance: formatEther(balance),
        totalPremiums: formatEther(totalPremiums),
        exercises: Number(exercises),
        terminations: Number(terminations),
      } as SupporterStats;
    } catch (error) {
      console.error("Error fetching supporter stats:", error);
      throw error;
    }
  };

  /**
   * Get complete option overview with all relevant data
   * @param borrower - Borrower address (defaults to connected address)
   */
  const getCompleteOptionOverview = async (borrower?: `0x${string}`) => {
    const optionOwner = borrower || address;
    if (!optionOwner) throw new Error("No address provided");

    try {
      const [optionData, isActive, terminationFee] = await Promise.all([
        getOptionData(optionOwner),
        isOptionActive(optionOwner),
        getTerminationFee(optionOwner),
      ]);

      // Calculate time remaining
      const now = Math.floor(Date.now() / 1000);
      const timeRemaining = Math.max(0, optionData.maturityTime - now);
      const hasMatured = now >= optionData.maturityTime;

      return {
        ...optionData,
        isActive,
        terminationFee,
        timeRemaining,
        hasMatured,
        canTerminate: isActive && !hasMatured,
        canExercise:
          optionData.exists &&
          hasMatured &&
          optionData.phase === OptionPhase.PreMaturity,
        canDefault:
          optionData.exists &&
          hasMatured &&
          optionData.phase === OptionPhase.PreMaturity,
      };
    } catch (error) {
      console.error("Error fetching complete option overview:", error);
      throw error;
    }
  };

  /**
   * Get contract parameters
   */
  const getContractParameters = async () => {
    try {
      const [
        k_re,
        safetyMargin,
        minLambda,
        maxLambda,
        minMaturity,
        maxMaturity,
      ] = await Promise.all([
        contract.read.k_re(),
        contract.read.safetyMargin(),
        contract.read.MIN_LAMBDA(),
        contract.read.MAX_LAMBDA(),
        contract.read.MIN_MATURITY(),
        contract.read.MAX_MATURITY(),
      ]);

      return {
        k_re: formatEther(k_re as bigint),
        safetyMargin: formatEther(safetyMargin as bigint),
        minLambda: formatEther(minLambda as bigint),
        maxLambda: formatEther(maxLambda as bigint),
        minMaturity: Number(minMaturity),
        maxMaturity: Number(maxMaturity),
      };
    } catch (error) {
      console.error("Error fetching contract parameters:", error);
      throw error;
    }
  };

  // ============ WRITE FUNCTIONS ============

  /**
   * Initialize a backstop option for a borrower
   * @param borrower - Borrower address
   * @param maturityDuration - Time until maturity in seconds
   * @param premiumAmount - Premium amount in ETH
   */
  const initializeOption = async (
    borrower: `0x${string}`,
    maturityDuration: number
  ) => {
    if (!walletClient) throw new Error("Wallet not connected");
    if (!address) throw new Error("No address connected");

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ReversibleCallOptionManagerAbi.abi,
        functionName: "initializeOption",
        args: [borrower, BigInt(maturityDuration)],
      });

      return hash;
    } catch (error) {
      console.error("Error initializing option:", error);
      throw error;
    }
  };

  /**
   * Support an option by paying the required premium (supporter only)
   * @param borrower - Borrower address whose option to support
   * @param premiumAmount - Premium amount in ETH to pay
   */
  const support = async (borrower: `0x${string}`, premiumAmount: string) => {
    console.log("🚀 Support function called with:", {
      borrower,
      premiumAmount,
    });

    if (!walletClient) {
      console.error("❌ Wallet not connected");
      throw new Error("Wallet not connected");
    }
    if (!address) {
      console.error("❌ No address connected");
      throw new Error("No address connected");
    }

    console.log("✅ Wallet validation passed:", {
      address,
      walletClient: !!walletClient,
    });

    try {
      console.log("🔄 Converting premium amount to Wei:", premiumAmount);
      const premiumInWei = parseEther(premiumAmount);
      console.log("💰 Premium in Wei:", premiumInWei.toString());

      console.log("📞 Calling contract writeContract with:", {
        address: CONTRACT_ADDRESS,
        functionName: "support",
        args: [borrower],
        value: premiumInWei.toString(),
      });

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ReversibleCallOptionManagerAbi.abi,
        functionName: "support",
        args: [borrower],
        value: premiumInWei,
      });

      console.log("✅ Support transaction submitted successfully:", hash);
      return hash;
    } catch (error: any) {
      console.error("❌ Error supporting option:", error);
      console.error("🔍 Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
        cause: error.cause,
        stack: error.stack,
        name: error.name,
      });

      // Log contract-specific error information
      if (error.data) {
        console.error("📋 Contract error data:", error.data);
      }

      // Log transaction-specific error information
      if (error.reason) {
        console.error("🚫 Transaction revert reason:", error.reason);
      }

      throw error;
    }
  };

  /**
   * Terminate option early (borrower only)
   * @param terminationFeeAmount - Termination fee in ETH
   */
  const terminateEarly = async (terminationFeeAmount: number) => {
    if (!walletClient) throw new Error("Wallet not connected");
    if (!address) throw new Error("No address connected");

    try {
      const feeInWei = parseEther(terminationFeeAmount?.toString());

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ReversibleCallOptionManagerAbi.abi,
        functionName: "terminateEarly",
        args: [address],
        value: feeInWei,
      });

      return hash;
    } catch (error) {
      console.error("Error terminating option early:", error);
      throw error;
    }
  };

  /**
   * Exercise option at maturity (supporter only)
   * @param borrower - Borrower address whose option to exercise
   */
  const exercise = async (borrower: `0x${string}`) => {
    if (!walletClient) throw new Error("Wallet not connected");
    if (!address) throw new Error("No address connected");

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ReversibleCallOptionManagerAbi.abi,
        functionName: "exercise",
        args: [borrower],
      });

      return hash;
    } catch (error) {
      console.error("Error exercising option:", error);
      throw error;
    }
  };

  /**
   * Default on option (supporter or borrower)
   * @param borrower - Borrower address whose option to default
   */
  const defaultOption = async (borrower: `0x${string}`) => {
    if (!walletClient) throw new Error("Wallet not connected");
    if (!address) throw new Error("No address connected");

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ReversibleCallOptionManagerAbi.abi,
        functionName: "defaultOption",
        args: [borrower],
      });

      return hash;
    } catch (error) {
      console.error("Error defaulting option:", error);
      throw error;
    }
  };

  // ============ UTILITY FUNCTIONS ============

  /**
   * Calculate expected premium for a given collateral value
   * This mirrors the _calculateLambda logic from the contract
   * @param collateralValue - Collateral value in USD/ETH
   */
  const calculateExpectedPremium = (collateralValue: number): number => {
    const collateral = collateralValue;

    // Risk-Adjusted Collateral Formula
    const liquidationThreshold = 0.85; // 85%
    const recoveryFraction = 0.9; // 90%
    const safetyMarginPercent = 0.1; // 10%

    // Expected value at liquidation
    const liquidationValue = liquidationThreshold * collateral;

    // Expected recovery from liquidation
    const recoveryValue = liquidationValue * recoveryFraction;

    // Expected loss
    const expectedLoss = collateral - recoveryValue;

    // Safety margin amount
    const safetyMarginAmount = safetyMarginPercent * collateral;

    // Total risk
    const totalRisk = expectedLoss + safetyMarginAmount;

    // Lambda = Total Risk / Initial Collateral Value
    let lambda = totalRisk / collateral;

    // Clamp to valid range [5%, 50%]
    const MIN_LAMBDA = 0.05;
    const MAX_LAMBDA = 0.5;
    if (lambda < MIN_LAMBDA) lambda = MIN_LAMBDA;
    if (lambda > MAX_LAMBDA) lambda = MAX_LAMBDA;

    // Premium = lambda × collateral
    const premium = lambda * collateral;

    return premium;
  };

  /**
   * Format option phase to human-readable string
   */
  const formatOptionPhase = (phase: OptionPhase): string => {
    const phaseNames = {
      [OptionPhase.None]: "None",
      [OptionPhase.Initialization]: "Initialization",
      [OptionPhase.PreMaturity]: "Pre-Maturity",
      [OptionPhase.Maturity]: "Maturity",
      [OptionPhase.Exercised]: "Exercised",
      [OptionPhase.Terminated]: "Terminated",
      [OptionPhase.Defaulted]: "Defaulted",
    };
    return phaseNames[phase] || "Unknown";
  };

  /**
   * Calculate time remaining until maturity
   */
  const calculateTimeRemaining = (
    maturityTime: number
  ): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  } => {
    const now = Math.floor(Date.now() / 1000);
    const totalSeconds = Math.max(0, maturityTime - now);

    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds, totalSeconds };
  };

  /**
   * Get all options where the user is a supporter by querying contract events
   * @param supporter - Supporter address (defaults to connected address)
   */
  // const getSupporterOptions = async (supporter?: `0x${string}`) => {
  //   const supporterAddr = supporter || address;
  //   if (!supporterAddr) throw new Error("No address provided");

  //   try {
  //     // Get current block number
  //     const currentBlock = await client.getBlockNumber();

  //     // Mezo testnet has a 10,000 block limit for getLogs
  //     const CHUNK_SIZE = 9999n;

  //     // Calculate starting block (go back a reasonable amount, e.g., 100,000 blocks)
  //     // Adjust this based on when your contract was deployed
  //     const blocksToSearch = 100000n;
  //     const startBlock =
  //       currentBlock > blocksToSearch ? currentBlock - blocksToSearch : 0n;

  //     let allLogs: any[] = [];

  //     // Query in chunks
  //     for (
  //       let fromBlock = startBlock;
  //       fromBlock <= currentBlock;
  //       fromBlock += CHUNK_SIZE
  //     ) {
  //       const toBlock =
  //         fromBlock + CHUNK_SIZE > currentBlock
  //           ? currentBlock
  //           : fromBlock + CHUNK_SIZE;

  //       try {
  //         const logs = await client.getLogs({
  //           address: CONTRACT_ADDRESS,
  //           event: {
  //             type: "event",
  //             name: "OptionInitialized",
  //             inputs: [
  //               { type: "address", name: "borrower", indexed: true },
  //               // { type: "address", name: "supporter", indexed: true },
  //               { type: "uint256", name: "lambda" },
  //               { type: "uint256", name: "premium" },
  //               { type: "uint256", name: "strikeCR" },
  //               { type: "uint256", name: "maturityTime" },
  //             ],
  //           },
  //           args: {
  //             supporter: supporterAddr,
  //           },
  //           fromBlock,
  //           toBlock,
  //         });

  //         allLogs = [...allLogs, ...logs];
  //       } catch (chunkError) {
  //         console.warn(
  //           `Error fetching logs from block ${fromBlock} to ${toBlock}:`,
  //           chunkError
  //         );
  //       }
  //     }

  //     console.log(
  //       `Found ${allLogs.length} OptionInitialized events for supporter:`,
  //       supporterAddr
  //     );

  //     // Remove duplicate borrowers (keep most recent event)
  //     const uniqueBorrowers = new Map<string, any>();
  //     allLogs.forEach((log) => {
  //       const borrower = (log.args.borrower as string).toLowerCase();
  //       if (
  //         !uniqueBorrowers.has(borrower) ||
  //         log.blockNumber > uniqueBorrowers.get(borrower).blockNumber
  //       ) {
  //         uniqueBorrowers.set(borrower, log);
  //       }
  //     });

  //     // Fetch option data for each unique borrower found
  //     const optionPromises = Array.from(uniqueBorrowers.values()).map(
  //       async (log) => {
  //         const borrower = log.args.borrower as `0x${string}`;
  //         try {
  //           const optionData = await getOptionData(borrower);
  //           // Only return if option still exists and supporter matches
  //           if (
  //             optionData.exists &&
  //             optionData.supporter.toLowerCase() === supporterAddr.toLowerCase()
  //           ) {
  //             return { ...optionData, userRole: "supporter" as const };
  //           }
  //           return null;
  //         } catch (error) {
  //           console.log(
  //             `Error fetching option for borrower ${borrower}:`,
  //             error
  //           );
  //           return null;
  //         }
  //       }
  //     );

  //     const options = await Promise.all(optionPromises);
  //     const activeOptions = options.filter(
  //       (opt): opt is NonNullable<typeof opt> => opt !== null
  //     );

  //     console.log(`Found ${activeOptions.length} active options for supporter`);
  //     return activeOptions;
  //   } catch (error) {
  //     console.error("Error fetching supporter options:", error);
  //     return [];
  //   }
  // };

  return {
    // Contract instances
    contract,
    publicClient: client,

    // Read functions
    getOptionData,
    getOptionPhase,
    isOptionActive,
    getTerminationFee,
    getSupporterStats,
    getCompleteOptionOverview,
    getContractParameters,
    // getSupporterOptions,

    // Write functions
    initializeOption,
    support,
    terminateEarly,
    exercise,
    defaultOption,

    // Utility functions
    calculateExpectedPremium,
    formatOptionPhase,
    calculateTimeRemaining,

    // State
    address,
    isConnected: !!address,
    hasWallet: !!walletClient,
  };
}
