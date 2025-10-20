"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  PieChart,
} from "lucide-react";
import { useBorrowerOperations } from "@/hooks/useBorrowerOperations";
import { useBTCPrice } from "@/hooks/useBtcPrice";
import { useTroveManager, TroveStatus } from "@/hooks/useTroveManager";
import { useInitBtcPrice } from "@/hooks/useInitBtcPrice";
import { CollateralGauge } from "./CollateralGauge";
import { HealthBar } from "./HealthBar";

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
  const [collateralAmount, setCollateralAmount] = useState<number | null>(null);
  const [musdAmount, setMusdAmount] = useState<number | null>(null);
  const [openTroveDebt, setOpenTroveDebt] = useState<number | null>(null);
  const [openTroveCollateral, setOpenTroveCollateral] = useState<number | null>(
    null
  );

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
    if (
      !isConnected
      // || !price || price <= 0
    ) {
      setTroveData(null);
      // setSystemStats(null);
      // setCurrentICR(0);
      return;
    }

    setTroveLoading(true);
    setTroveError(null);

    try {
      // console.log("Fetching trove data with BTC Price:", btcPrice);
      const troveInfo = await getCompleteTroveData();
      // Pass the stable price value into your functions
      // const icr = await getCurrentICR(undefined, btcPrice || 0);
      // const systemInfo = await getSystemStats(btcPrice || 0);

      setTroveData(troveInfo);
      // setSystemStats(systemInfo);
      // setCurrentICR(icr);
      // console.log("Fetched trove data:", troveInfo, systemInfo, icr);
    } catch (error) {
      console.error("Error fetching trove data:", error);
      setTroveError(
        error instanceof Error ? error.message : "Failed to fetch trove data"
      );
    } finally {
      setTroveLoading(false);
    }
  }, [isConnected]); // Keep dependencies here

  useEffect(() => {
    fetchTroveData();
  }, [isConnected]);

  const fetchICRData = async () => {
    if (!isConnected || !btcPrice || btcPrice <= 0) {
      setCurrentICR(0);
      return;
    }

    try {
      const icr = await getCurrentICR(undefined, btcPrice || 0);
      setCurrentICR(icr);
    } catch (error) {
      console.error("Error fetching ICR data:", error);
    }
  };

  const fetchSystemStats = async () => {
    if (!isConnected || !btcPrice || btcPrice <= 0) {
      setSystemStats(null);
      return;
    }

    try {
      const stats = await getSystemStats(btcPrice || 0);
      setSystemStats(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
    }
  };

  useEffect(() => {
    fetchICRData();
    fetchSystemStats();
  }, [btcPrice, isConnected]);

  useEffect(() => {
    const fetchMinNetDebt = async () => {
      try {
        const minDebt = await getMinNetDebt();
        setMinNetDebt(Number(minDebt));
      } catch (err) {
        setMinNetDebt(1800);
      }
    };
    fetchMinNetDebt();
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
  const calculateMaxMUSD = useCallback(
    (collateral: number) => {
      if (!collateral || !price) return 0;
      const collateralValue = collateral * price;
      const MCR = 1.1;
      return collateralValue / MCR;
    },
    [price]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* System Stats Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-mezo-dark-800/30 border-b border-white/10">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <span className="text-lg font-semibold text-mezo-dark-50">
            System Status
          </span>
        </div>

        {troveLoading ? (
          <div className="flex gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-white/5 rounded w-20 animate-pulse"
              ></div>
            ))}
          </div>
        ) : systemStats ? (
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-xs text-mezo-dark-300 mb-1">TCR</div>
              <div className="font-mono font-semibold text-mezo-dark-50">
                {parseFloat(systemStats.tcr).toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-mezo-dark-300 mb-1">
                Recovery Mode
              </div>
              <div
                className={`text-sm font-semibold ${
                  systemStats.isRecoveryMode ? "text-red-400" : "text-green-400"
                }`}
              >
                {systemStats.isRecoveryMode ? "ACTIVE" : "Inactive"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-mezo-dark-300 mb-1">Total Loans</div>
              <div className="font-mono font-semibold text-mezo-dark-50">
                {systemStats.troveCount}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-mezo-dark-400">No system data available</p>
        )}
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-6">
        {/* Left Column - Trove Overview (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Trove Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PieChart className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-mezo-dark-50">
                My Position
              </h2>
            </div>
            {troveData?.isActive && (
              <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-sm font-semibold text-green-400">
                Active
              </span>
            )}
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
            <div className="text-center py-12 bg-mezo-dark-800/30 rounded-xl">
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
            <div className="text-center py-12 bg-mezo-dark-800/30 rounded-xl">
              <p className="text-mezo-dark-300">Wallet not connected</p>
              <p className="text-xs text-mezo-dark-400 mt-1">
                Connect your wallet to view trove details
              </p>
            </div>
          ) : troveData &&
            (troveData.isActive ||
              parseFloat(troveData.totalCollateral) > 0) ? (
            <div className="space-y-6">
              {/* Risk Alerts */}
              {currentICR && currentICR < 1.5 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-sm text-red-300">
                      Warning: Your position is approaching liquidation
                      threshold. Consider asking support.
                    </p>
                  </div>
                </div>
              )}

              {currentICR && currentICR >= 1.5 && currentICR < 2.0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <p className="text-sm text-yellow-300">
                      Moderate risk level. Monitor your position closely.
                    </p>
                  </div>
                </div>
              )}

              {/* Collateral Health */}
              <div className="bg-mezo-dark-800/30 rounded-xl p-6 border border-white/10">
                <h3 className="text-sm font-semibold text-mezo-dark-50 mb-4 flex items-center gap-2">
                  {/* <Shield className="w-4 h-4 text-blue-400" /> */}
                  Collateral Health
                </h3>

                <div className="mb-4">
                  <CollateralGauge
                    ratio={currentICR}
                    liquidationThreshold={1.1}
                  />
                </div>

                <HealthBar ratio={currentICR} liquidationThreshold={1.1} />

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-xs text-mezo-dark-300 mb-1">
                      Liquidation Price
                    </div>
                    <div className="text-xl font-bold text-red-400">
                      $
                      {troveData && troveData.totalCollateral > 0
                        ? (
                            (troveData.totalDebt * 1.1) /
                            troveData.totalCollateral
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-300 mb-1">
                      Marginal CR
                    </div>
                    <div className="text-xl font-bold text-blue-400">110%</div>
                  </div>
                </div>
              </div>

              {/* Position Details */}
              <div className="grid grid-cols-3 gap-6">
                <div className="border-l-2 border-blue-400 pl-4">
                  <div className="text-xs text-mezo-dark-300 mb-1">
                    Collateral
                  </div>
                  <div className="text-xl font-mono font-bold text-mezo-dark-50">
                    {parseFloat(troveData.totalCollateral).toFixed(6)}
                  </div>
                  <div className="text-xs text-mezo-dark-400 mt-1">BTC</div>
                </div>

                <div className="border-l-2 border-purple-400 pl-4">
                  <div className="text-xs text-mezo-dark-300 mb-1">
                    Total Debt
                  </div>
                  <div className="text-xl font-mono font-bold text-mezo-dark-50">
                    $
                    {parseFloat(troveData.totalDebt).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-mezo-dark-400 mt-1">MUSD</div>
                </div>

                <div className="border-l-2 border-green-400 pl-4">
                  <div className="text-xs text-mezo-dark-300 mb-1">
                    Interest Rate
                  </div>
                  <div className="text-xl font-mono font-bold text-mezo-dark-50">
                    {(troveData.interestRate / 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-mezo-dark-400 mt-1">Annual</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-sm text-mezo-dark-300">
                  Collateral Ratio
                </span>
                <span className="text-lg font-mono font-bold text-mezo-dark-50">
                  {currentICR &&
                  isFinite(Number(currentICR)) &&
                  Number(currentICR) < 1e6
                    ? currentICR.toFixed(4)
                    : currentICR && Number(currentICR) >= 1e6
                    ? "N/A"
                    : "...."}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-mezo-dark-300">
                  Max Borrowing Capacity
                </span>
                <span className="text-lg font-mono font-bold text-mezo-dark-50">
                  $
                  {parseFloat(troveData.maxBorrowingCapacity).toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 0,
                    }
                  )}{" "}
                  MUSD
                </span>
              </div>

              {troveData.hasPendingRewards && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
                  <p className="text-xs text-yellow-300">
                    Pending rewards available to claim
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-mezo-dark-800/30 rounded-xl">
              <p className="text-mezo-dark-300">No active trove</p>
              <p className="text-xs text-mezo-dark-400 mt-1">
                Open a trove to start borrowing against your BTC collateral
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions (1/3 width) */}
        <div className="space-y-6">
          {/* Open/Close Trove */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-mezo-dark-50">
                Loan Management
              </h3>
            </div>

            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-300">
                  Min Debt:{" "}
                  <span className="font-semibold">
                    {minNetDebt.toFixed(2)} MUSD
                  </span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {/* <label htmlFor="open-trove-collateral">Collateral (BTC)</label> */}
              <input
                type="number"
                value={openTroveCollateral}
                onChange={(e) =>
                  setOpenTroveCollateral(parseFloat(e.target.value))
                }
                placeholder="Collateral (BTC)"
                className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-purple-500/50 focus:outline-none placeholder-mezo-dark-400"
                disabled={!isConnected || isAnyLoading}
              />
              {openTroveCollateral && price && (
                <div className="text-xs text-mezo-dark-300 mt-1">
                  ≈ $
                  {(openTroveCollateral * price).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  USD
                </div>
              )}

              <input
                type="number"
                value={openTroveDebt}
                onChange={(e) => setOpenTroveDebt(parseFloat(e.target.value))}
                placeholder="Debt (MUSD)"
                className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-purple-500/50 focus:outline-none placeholder-mezo-dark-400"
                disabled={!isConnected || isAnyLoading}
              />

              {openTroveCollateral && price && (
                <div className="text-xs text-mezo-dark-300 mt-1">
                  Max Debt: $
                  {calculateMaxMUSD(openTroveCollateral).toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 2,
                    }
                  )}
                  {openTroveDebt &&
                    openTroveDebt > calculateMaxMUSD(openTroveCollateral) && (
                      <span className="text-red-400 ml-2">
                        ⚠️ Exceeds max debt
                      </span>
                    )}
                </div>
              )}

              <button
                onClick={handleOpenTrove}
                disabled={
                  !isConnected ||
                  isAnyLoading ||
                  !openTroveDebt ||
                  !openTroveCollateral
                }
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
              >
                {loadingStates.openTrove ? "Confirming..." : "Create Position"}
              </button>

              <button
                onClick={handleCloseTrove}
                disabled={!isConnected || isAnyLoading}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
              >
                {loadingStates.closeTrove ? "Confirming..." : "Close Position"}
              </button>
            </div>
          </div>

          {/* BTC Operations */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Bitcoin className="w-5 h-5 text-mezo-btc-500" />
              <h3 className="text-lg font-semibold text-mezo-dark-50">
                BTC Collateral
              </h3>
            </div>

            <input
              type="number"
              value={collateralAmount}
              onChange={(e) =>
                setCollateralAmount(parseFloat(e.target.value) || 0)
              }
              placeholder="Amount (BTC)"
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-mezo-btc-500/50 focus:outline-none placeholder-mezo-dark-400"
              disabled={!isConnected || isAnyLoading}
            />

            {collateralAmount && price && (
              <div className="text-xs text-mezo-dark-300 mt-1">
                Max MUSD: $
                {calculateMaxMUSD(collateralAmount).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                (
                {(collateralAmount * price).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                collateral value)
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleAddCollateral}
                disabled={!isConnected || isAnyLoading || !collateralAmount}
                className="w-full btc-button flex items-center justify-center gap-2 cursor-pointer hover:opacity-100"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {loadingStates.addCollateral ? "Confirming..." : "Add"}
                </span>
              </button>

              <button
                onClick={handleWithdrawCollateral}
                disabled={!isConnected || isAnyLoading || !collateralAmount}
                className="w-full btc-button flex items-center justify-center gap-2 cursor-pointer hover:opacity-100"
              >
                <Minus className="w-4 h-4" />
                <span>
                  {loadingStates.withdrawCollateral
                    ? "Confirming..."
                    : "Withdraw"}
                </span>
              </button>

              <button
                onClick={handleClaimCollateral}
                disabled={!isConnected || isAnyLoading}
                className="w-full btc-button flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500"
              >
                <Bitcoin className="w-4 h-4" />
                <span>
                  {loadingStates.claimCollateral ? "Confirming..." : "Claim"}
                </span>
              </button>
            </div>
          </div>

          {/* MUSD Operations */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-mezo-musd-500" />
              <h3 className="text-lg font-semibold text-mezo-dark-50">
                MUSD Operations
              </h3>
            </div>

            <input
              type="number"
              value={musdAmount}
              onChange={(e) => setMusdAmount(parseFloat(e.target.value) || 0)}
              placeholder="Amount (MUSD)"
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-mezo-musd-500/50 focus:outline-none placeholder-mezo-dark-400"
              disabled={!isConnected || isAnyLoading}
            />

            <div className="space-y-2">
              <button
                onClick={handleBorrowMUSD}
                disabled={!isConnected || isAnyLoading || !musdAmount}
                className="w-full musd-button flex items-center cursor-pointer justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {loadingStates.borrowMUSD ? "Confirming..." : "Borrow"}
                </span>
              </button>

              <button
                onClick={handleRepayMUSD}
                disabled={!isConnected || isAnyLoading || !musdAmount}
                className="w-full musd-button flex items-center justify-center gap-2 cursor-pointer hover:opacity-100"
              >
                <Minus className="w-4 h-4" />
                <span>
                  {loadingStates.repayMUSD ? "Confirming..." : "Repay"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {!isConnected && (
        <div className="mx-6 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
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
        </div>
      )}
    </div>
  );
}
