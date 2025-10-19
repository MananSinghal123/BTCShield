"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bitcoin,
  DollarSign,
  Plus,
  Minus,
  AlertCircle,
  Layers,
  Shield,
  BarChart3,
  XCircle,
} from "lucide-react";
import { useBorrowerOperations } from "@/hooks/useBorrowerOperations";
import { useBTCPrice } from "@/hooks/useBtcPrice";
import { useTroveManager, TroveStatus } from "@/hooks/useTroveManager";
import { useInitBtcPrice } from "@/hooks/useInitBtcPrice";

export default function BorrowerOperationsPanel() {
  const {
    addCollateral,
    withdrawCollateral,
    withdrawMUSD,
    repayMUSD,
    claimCollateral,
    openTrove,
    closeTrove,
    isConnected,
    publicClient,
    getMinNetDebt,
  } = useBorrowerOperations();

  // BTC Price hook
  const { price, loading, error } = useBTCPrice();
  const { btcPrice } = useInitBtcPrice();

  // Trove Manager hook
  const { getCompleteTroveData, getSystemStats, getCurrentICR, address } =
    useTroveManager();

  // State for minimum net debt
  const [minNetDebt, setMinNetDebt] = useState<number>(0);

  // State for trove data
  const [troveData, setTroveData] = useState<any>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [troveLoading, setTroveLoading] = useState<boolean>(false);
  const [currentICR, setCurrentICR] = useState<number>(0);

  // State for form inputs
  const [collateralAmount, setCollateralAmount] = useState<number>(0);
  const [musdAmount, setMusdAmount] = useState<number>(0);
  const [openTroveDebt, setOpenTroveDebt] = useState<number>(0);
  const [openTroveCollateral, setOpenTroveCollateral] = useState<number>(0);

  // Loading states for each operation
  const [loadingStates, setLoadingStates] = useState({
    addCollateral: false,
    withdrawCollateral: false,
    borrowMUSD: false,
    repayMUSD: false,
    claimCollateral: false,
    openTrove: false,
    closeTrove: false,
  });

  // Add error state
  const [troveError, setTroveError] = useState<string | null>(null);

  const fetchTroveData = useCallback(async () => {
    // This guard clause is important! It prevents fetching when price is invalid.
    if (!isConnected || !price || price <= 0) {
      setTroveData(null);
      setSystemStats(null);
      setCurrentICR(0);
      // It's often better to not set loading to false here,
      // to avoid a screen flicker if price is just initializing.
      return;
    }

    setTroveLoading(true);
    setTroveError(null);

    try {
      console.log("Fetching trove data with BTC Price:", btcPrice);
      const troveInfo = await getCompleteTroveData();
      // Pass the stable price value into your functions
      const icr = await getCurrentICR(undefined, btcPrice || 0);
      const systemInfo = await getSystemStats(btcPrice || 0);

      setTroveData(troveInfo);
      setSystemStats(systemInfo);
      setCurrentICR(icr);
      console.log("Fetched trove data:", troveInfo, systemInfo, icr);
    } catch (error) {
      console.error("Error fetching trove data:", error);
      setTroveError(
        error instanceof Error ? error.message : "Failed to fetch trove data"
      );
    } finally {
      setTroveLoading(false);
    }
  }, [isConnected, btcPrice]); // Keep dependencies here

  // Correctly trigger the effect when fetchTroveData is recreated
  useEffect(() => {
    setTroveLoading(true);
    fetchTroveData();
  }, [btcPrice]);

  useEffect(() => {
    const fetchMinNetDebt = async () => {
      try {
        const minDebt = await getMinNetDebt();
        setMinNetDebt(Number(minDebt));
      } catch (err) {
        // Fallback to a default value if fetch fails
        setMinNetDebt(2000);
      }
    };
    fetchMinNetDebt();
    // Only run once on mount, or add getMinNetDebt to deps if it can change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setOperationLoading = (
    operation: keyof typeof loadingStates,
    loading: boolean
  ) => {
    setLoadingStates((prev) => ({ ...prev, [operation]: loading }));
  };

  // Check if any operation is loading
  const isAnyLoading = Object.values(loadingStates).some((loading) => loading);

  // Helper function to wait for transaction confirmation
  const waitForTransaction = async (hash: `0x${string}`) => {
    if (!publicClient) throw new Error("Public client not available");

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

    if (receipt.status === "reverted") {
      try {
        const tx = await publicClient.getTransaction({ hash });
        if (tx) {
          await publicClient.call({
            account: tx.from,
            data: tx.input,
            to: tx.to!,
            value: tx.value,
          });
        }
      } catch (err: any) {
        const revertReason =
          err?.message || err?.details || "Transaction reverted";
        throw new Error(revertReason);
      }
      throw new Error("Transaction reverted");
    }

    return receipt;
  };

  // Error extraction helper
  const extractErrorMessage = (err: any): string => {
    let errorMessage = "Unknown error";
    if (err?.message) {
      errorMessage = err.message;
    } else if (err?.shortMessage) {
      errorMessage = err.shortMessage;
    } else if (err?.details) {
      errorMessage = err.details;
    } else if (err?.cause?.reason) {
      errorMessage = err.cause.reason;
    }

    if (errorMessage.includes("reverted")) {
      const match = errorMessage.match(/reason: (.+?)(?:\n|$)/);
      if (match) {
        errorMessage = match[1];
      }
    }

    return errorMessage;
  };

  // Action handlers
  const handleAddCollateral = async () => {
    if (!isConnected || !collateralAmount) {
      alert("Please connect wallet and enter collateral amount");
      return;
    }

    setOperationLoading("addCollateral", true);
    try {
      const hash = await addCollateral(collateralAmount);
      await waitForTransaction(hash);
      alert("✅ Collateral added successfully!");
      await fetchTroveData(); // Add this
      setCollateralAmount(0);
    } catch (err: any) {
      alert(`❌ Failed to add collateral:\n${extractErrorMessage(err)}`);
    } finally {
      setOperationLoading("addCollateral", false);
    }
  };

  const handleWithdrawCollateral = async () => {
    if (!isConnected || !collateralAmount) {
      alert("Please connect wallet and enter collateral amount");
      return;
    }

    setOperationLoading("withdrawCollateral", true);
    try {
      const hash = await withdrawCollateral(collateralAmount);
      await waitForTransaction(hash);
      alert("✅ Collateral withdrawn successfully!");
      await fetchTroveData(); // Add this
      setCollateralAmount(0);
    } catch (err: any) {
      alert(`❌ Failed to withdraw collateral:\n${extractErrorMessage(err)}`);
    } finally {
      setOperationLoading("withdrawCollateral", false);
    }
  };

  const handleBorrowMUSD = async () => {
    if (!isConnected || !musdAmount) {
      alert("Please connect wallet and enter MUSD amount");
      return;
    }

    setOperationLoading("borrowMUSD", true);
    try {
      const hash = await withdrawMUSD(musdAmount);
      await waitForTransaction(hash);
      alert("✅ MUSD borrowed successfully!");
      await fetchTroveData(); // Add this
      setMusdAmount(0);
    } catch (err: any) {
      alert(`❌ Failed to borrow MUSD:\n${extractErrorMessage(err)}`);
    } finally {
      setOperationLoading("borrowMUSD", false);
    }
  };

  const handleRepayMUSD = async () => {
    if (!isConnected || !musdAmount) {
      alert("Please connect wallet and enter MUSD amount");
      return;
    }

    setOperationLoading("repayMUSD", true);
    try {
      const hash = await repayMUSD(musdAmount);
      await waitForTransaction(hash);
      alert("✅ MUSD repaid successfully!");
      await fetchTroveData(); // Add this
      setMusdAmount(0);
    } catch (err: any) {
      alert(`❌ Failed to repay MUSD:\n${extractErrorMessage(err)}`);
    } finally {
      setOperationLoading("repayMUSD", false);
    }
  };

  const handleClaimCollateral = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    setOperationLoading("claimCollateral", true);
    try {
      const hash = await claimCollateral();
      await waitForTransaction(hash);

      alert("✅ Collateral claimed successfully!");
      await fetchTroveData(); // Add this
    } catch (err: any) {
      alert(`❌ Failed to claim collateral:\n${extractErrorMessage(err)}`);
    } finally {
      setOperationLoading("claimCollateral", false);
    }
  };

  const handleOpenTrove = async () => {
    if (!isConnected || !openTroveDebt || !openTroveCollateral) {
      alert("Please connect wallet and enter both debt and collateral amounts");
      return;
    }

    setOperationLoading("openTrove", true);
    try {
      const hash = await openTrove(openTroveDebt, openTroveCollateral);
      await waitForTransaction(hash);
      alert("✅ Trove opened successfully!");
      await fetchTroveData(); // Add this
      setOpenTroveDebt(0);
      setOpenTroveCollateral(0);
    } catch (err: any) {
      alert(`❌ Failed to open trove:\n${extractErrorMessage(err)}`);
    } finally {
      setOperationLoading("openTrove", false);
    }
  };

  const handleCloseTrove = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    const confirmClose = confirm(
      "Are you sure you want to close your trove? Make sure all debt is repaid."
    );
    if (!confirmClose) return;

    setOperationLoading("closeTrove", true);
    try {
      const hash = await closeTrove();
      await waitForTransaction(hash);
      await fetchTroveData(); // Add this
      alert("✅ Trove closed successfully!");
    } catch (err: any) {
      alert(`❌ Failed to close trove:\n${extractErrorMessage(err)}`);
    } finally {
      setOperationLoading("closeTrove", false);
    }
  };

  // Calculate maximum MUSD that can be borrowed based on collateral
  // Using MCR (Minimum Collateralization Ratio) of 1.1
  // Formula: Max MUSD = (BTC Amount × BTC Price) / MCR
  // Example: 0.03 BTC × 100,000 USD / 1.1 = 2,727 MUSD
  const maxMUSD = useMemo(() => {
    if (!openTroveCollateral || !price) return 0;
    const collateralValue = openTroveCollateral * price;
    const MCR = 1.1;
    return collateralValue / MCR;
  }, [openTroveCollateral, price]);

  // Truncate address for display
  // const truncateAddress = (addr: string) => {
  //   if (!addr) return "";
  //   return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  // };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Trove Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="institutional-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-mezo-dark-50">
              Your Trove
            </h3>
          </div>

          {troveLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 bg-white/5 rounded w-1/3 animate-pulse"></div>
                  <div className="h-4 bg-white/5 rounded w-1/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : troveError ? (
            <div className="text-center py-8">
              <p className="text-red-400">Error loading trove data</p>
              <p className="text-xs text-mezo-dark-400 mt-1">{troveError}</p>
              <button
                onClick={fetchTroveData}
                className="mt-3 text-sm text-blue-400 hover:text-blue-300"
              >
                Retry
              </button>
            </div>
          ) : !isConnected ? (
            <div className="text-center py-8">
              <p className="text-mezo-dark-300">Wallet not connected</p>
              <p className="text-xs text-mezo-dark-400 mt-1">
                Connect your wallet to view trove details
              </p>
            </div>
          ) : troveData &&
            (troveData.isActive ||
              parseFloat(troveData.totalCollateral) > 0) ? (
            <div className="space-y-4">
              {/* Your existing trove data display */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-mezo-dark-300">Status</span>
                  <span className="text-sm font-semibold text-mezo-dark-50">
                    {troveData.isActive ? (
                      <span className="text-green-400">Active</span>
                    ) : (
                      <span className="text-red-400">Inactive</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-mezo-dark-300">
                    Collateral (BTC)
                  </span>
                  <span className="font-mono font-semibold text-mezo-dark-50">
                    {parseFloat(troveData.totalCollateral).toFixed(6)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-mezo-dark-300">Total Debt</span>
                  <span className="font-mono font-semibold text-mezo-dark-50">
                    $
                    {parseFloat(troveData.totalDebt).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    MUSD
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-mezo-dark-300">
                    Interest Rate
                  </span>
                  <span className="font-mono font-semibold text-mezo-dark-50">
                    {(troveData.interestRate / 100).toFixed(2)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-mezo-dark-300">
                    Current ICR
                  </span>
                  <span className="font-mono font-semibold text-mezo-dark-50">
                    {currentICR &&
                    isFinite(Number(currentICR)) &&
                    Number(currentICR) < 1e6
                      ? currentICR.toFixed(4)
                      : currentICR && Number(currentICR) >= 1e6
                      ? "N/A"
                      : "-"}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-mezo-dark-300">
                      Max Borrowing Capacity
                    </span>
                    <span className="font-mono font-semibold text-mezo-dark-50">
                      $
                      {parseFloat(
                        troveData.maxBorrowingCapacity
                      ).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}{" "}
                      MUSD
                    </span>
                  </div>
                </div>

                {troveData.hasPendingRewards && (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
                    <p className="text-xs text-yellow-300">
                      Pending rewards available to claim
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-mezo-dark-300">No active trove</p>
              <p className="text-xs text-mezo-dark-400 mt-1">
                Open a trove to start borrowing against your BTC collateral
              </p>
            </div>
          )}
        </div>

        {/* System Stats */}
        <div className="institutional-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-indigo-500/10">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-mezo-dark-50">
              System Status
            </h3>
          </div>

          {troveLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 bg-white/5 rounded w-2/5 animate-pulse"></div>
                  <div className="h-4 bg-white/5 rounded w-1/5 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : systemStats ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-mezo-dark-300">
                  Total Collateral Ratio (TCR)
                </span>
                <span className="font-mono font-semibold text-mezo-dark-50">
                  {parseFloat(systemStats.tcr).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-mezo-dark-300">
                  Recovery Mode
                </span>
                <span
                  className={`text-sm font-semibold ${
                    systemStats.isRecoveryMode
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {systemStats.isRecoveryMode ? "ACTIVE" : "Inactive"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-mezo-dark-300">Total Troves</span>
                <span className="font-mono font-semibold text-mezo-dark-50">
                  {systemStats.troveCount}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-mezo-dark-300">No system data available</p>
              <p className="text-xs text-mezo-dark-400 mt-1">
                System statistics will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trove Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Trove */}
        <div className="institutional-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-mezo-dark-50">
              Open Trove
            </h3>
          </div>

          <div className="space-y-4">
            {/* Minimum Net Debt Info */}
            <div className="institutional-card bg-purple-500/5 border-purple-500/20">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">
                  Minimum Debt Required:{" "}
                  <span className="font-semibold">
                    {minNetDebt.toFixed(2)} MUSD
                  </span>
                </span>
              </div>
            </div>
            {/* Initial Collateral */}
            <div>
              <label className="block text-sm font-medium text-mezo-dark-200 mb-2">
                Initial Collateral (BTC)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={openTroveCollateral}
                  onChange={(e) =>
                    setOpenTroveCollateral(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-purple-500/50 focus:outline-none placeholder-mezo-dark-400"
                  step="0.001"
                  min="0"
                  disabled={!isConnected || isAnyLoading}
                />
                <div className="absolute right-3 top-3 text-sm text-mezo-dark-300">
                  BTC
                </div>
              </div>
              {openTroveCollateral && price && (
                <div className="text-xs text-mezo-dark-300 mt-1">
                  ≈ $
                  {(openTroveCollateral * price).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  USD
                </div>
              )}
            </div>

            {/* Initial Debt */}
            <div>
              <label className="block text-sm font-medium text-mezo-dark-200 mb-2">
                Initial Debt (MUSD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={openTroveDebt}
                  onChange={(e) =>
                    setOpenTroveDebt(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-purple-500/50 focus:outline-none placeholder-mezo-dark-400"
                  step="0.01"
                  min="0"
                  disabled={!isConnected || isAnyLoading}
                />
                <div className="absolute right-3 top-3 text-sm text-mezo-dark-300">
                  MUSD
                </div>
              </div>
              {openTroveCollateral && price && (
                <div className="text-xs text-mezo-dark-300 mt-1">
                  Max Debt: $
                  {maxMUSD.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                  {openTroveDebt && openTroveDebt > maxMUSD && (
                    <span className="text-red-400 ml-2">
                      ⚠️ Exceeds max debt
                    </span>
                  )}
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenTrove}
              disabled={
                !isConnected ||
                isAnyLoading ||
                !openTroveDebt ||
                !openTroveCollateral
              }
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              {loadingStates.openTrove ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Open Trove</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Close Trove */}
        <div className="institutional-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-red-500/10">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-mezo-dark-50">
              Close Trove
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-mezo-dark-300">
              Close your trove and withdraw all remaining collateral. Make sure
              all debt is repaid before closing.
            </p>

            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <p className="text-xs text-red-300">
                ⚠️ This action is irreversible. Ensure your trove is in good
                standing before proceeding.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCloseTrove}
              disabled={!isConnected || isAnyLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              {loadingStates.closeTrove ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Close Trove</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Operations Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BTC Collateral Operations */}
        <div className="institutional-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-mezo-btc-500/10">
              <Bitcoin className="w-5 h-5 text-mezo-btc-500" />
            </div>
            <h3 className="text-xl font-semibold text-mezo-dark-50">
              BTC Collateral
            </h3>
          </div>

          <div className="space-y-4">
            {/* Collateral Amount Input */}
            <div>
              <label className="block text-sm font-medium text-mezo-dark-200 mb-2">
                Amount (BTC)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={collateralAmount}
                  onChange={(e) =>
                    setCollateralAmount(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-mezo-btc-500/50 focus:outline-none placeholder-mezo-dark-400"
                  step="0.001"
                  min="0"
                  disabled={!isConnected || isAnyLoading}
                />
                <div className="absolute right-3 top-3 text-sm text-mezo-dark-300">
                  BTC
                </div>
              </div>
              {collateralAmount && price && (
                <div className="text-xs text-mezo-dark-300 mt-1">
                  Max MUSD: $
                  {maxMUSD.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  (
                  {(collateralAmount * price).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  collateral value)
                </div>
              )}
            </div>

            {/* Collateral Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddCollateral}
                disabled={!isConnected || isAnyLoading || !collateralAmount}
                className="w-full btc-button flex items-center justify-center space-x-2"
              >
                {loadingStates.addCollateral ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Collateral</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWithdrawCollateral}
                disabled={!isConnected || isAnyLoading || !collateralAmount}
                className="w-full btc-button flex items-center justify-center space-x-2 opacity-80 hover:opacity-100"
              >
                {loadingStates.withdrawCollateral ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-4 h-4" />
                    <span>Withdraw Collateral</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaimCollateral}
                disabled={!isConnected || isAnyLoading}
                className="w-full btc-button flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500"
              >
                {loadingStates.claimCollateral ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <Bitcoin className="w-4 h-4" />
                    <span>Claim Collateral</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* MUSD Operations */}
        <div className="institutional-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-mezo-musd-500/10">
              <DollarSign className="w-5 h-5 text-mezo-musd-500" />
            </div>
            <h3 className="text-xl font-semibold text-mezo-dark-50">
              MUSD Operations
            </h3>
          </div>

          <div className="space-y-4">
            {/* MUSD Amount Input */}
            <div>
              <label className="block text-sm font-medium text-mezo-dark-200 mb-2">
                Amount (MUSD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={musdAmount}
                  onChange={(e) =>
                    setMusdAmount(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-mezo-musd-500/50 focus:outline-none placeholder-mezo-dark-400"
                  step="0.01"
                  min="0"
                  disabled={!isConnected || isAnyLoading}
                />
                <div className="absolute right-3 top-3 text-sm text-mezo-dark-300">
                  MUSD
                </div>
              </div>
            </div>

            {/* MUSD Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBorrowMUSD}
                disabled={!isConnected || isAnyLoading || !musdAmount}
                className="w-full musd-button flex items-center justify-center space-x-2"
              >
                {loadingStates.borrowMUSD ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Borrow MUSD</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRepayMUSD}
                disabled={!isConnected || isAnyLoading || !musdAmount}
                className="w-full musd-button flex items-center justify-center space-x-2 opacity-80 hover:opacity-100"
              >
                {loadingStates.repayMUSD ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-4 h-4" />
                    <span>Repay MUSD</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="institutional-card bg-yellow-500/5 border-yellow-500/20"
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-yellow-400 font-medium">
                Wallet Not Connected
              </p>
              <p className="text-sm text-mezo-dark-300">
                Please connect your wallet to perform borrower operations.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
