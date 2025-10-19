"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  XCircle,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Wallet,
} from "lucide-react";
import { useRcoManager, SupporterStats } from "@/hooks/useRcoManager";
import OptionCard from "./backstop/OptionCard";

interface BackstopOptionManagerProps {
  borrowerAddress?: string;
}

export default function BackstopOptionManager({
  borrowerAddress,
}: BackstopOptionManagerProps) {
  const {
    publicClient,

    // Read functions
    getOptionData,

    getTerminationFee,

    // Write functions
    initializeOption,
    terminateEarly,
    exercise,
    defaultOption,

    // Utility functions
    calculateExpectedPremium,

    // State
    address,
    isConnected,
  } = useRcoManager();

  // State management
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [option, setOption] = useState<any>(null);
  const [terminationFees, setTerminationFees] = useState<number>(0);
  const [supporterStats, setSupporterStats] = useState<SupporterStats | null>(
    null
  );
  const [contractParams, setContractParams] = useState<any>(null);
  // Create option form state
  const [showCreateForm, setShowCreateForm] = useState<boolean>(true);
  const [createForm, setCreateForm] = useState<{
    borrowerAddress: string;
    maturityDuration: number;
    collateralValue: number;
  }>({
    borrowerAddress: address || "",
    maturityDuration: 3600, // 1 hour default
    collateralValue: 0,
  });

  const [createLoading, setCreateLoading] = useState(false);

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

  // Maturity duration presets
  const maturityPresets = [
    { label: "30 min", value: 1800 },
    { label: "1 hour", value: 3600 },
    { label: "6 hours", value: 21600 },
    { label: "1 day", value: 86400 },
    { label: "3 days", value: 259200 },
    { label: "7 days", value: 604800 },
  ];

  // Calculate premium using useMemo to avoid expensive recalculations
  const calculatedPremium = useMemo(() => {
    if (createForm.collateralValue && createForm.collateralValue > 0) {
      return calculateExpectedPremium(createForm.collateralValue);
    }
    return 0;
  }, [createForm.collateralValue, calculateExpectedPremium]);

  // Load data for user Option
  const loadData = useCallback(async () => {
    if (!isConnected || !address) return;

    setLoading(true);
    try {
      // console.log("Fetching option data for", address);
      const borrowerOptionData = await getOptionData(address as `0x${string}`);

      setOption(borrowerOptionData);
    } catch (error) {
      console.log("No option found where user is borrower");
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);

  useEffect(() => {
    loadData();
    console.log(option);
  }, [address, isConnected]);

  // Update borrower address when wallet address changes
  useEffect(() => {
    setCreateForm((prev) => ({
      ...prev,
      borrowerAddress: address || "",
    }));
  }, [address]);

  // Fetch termination fees for each option
  useEffect(() => {
    async function fetchTerminationFees() {
      try {
        const fees = await getTerminationFee(address as `0x${string}`);
        setTerminationFees(fees);
      } catch (error) {
        console.error("Error fetching termination fees:", error);
      }
    }

    fetchTerminationFees();
  }, [userOptions, getTerminationFee]);

  // Handle action (terminate, exercise, default)
  // const handleAction = async (
  //   action: string,
  //   borrower: string,
  //   terminationFee?: string
  // ) => {
  //   if (!isConnected) {
  //     alert("Please connect your wallet");
  //     return;
  //   }

  //   const confirmed = confirm(
  //     `Are you sure you want to ${action} this option?${
  //       action === "terminate" && terminationFee
  //         ? `\n\nTermination fee: $${terminationFee}`
  //         : ""
  //     }`
  //   );

  //   if (!confirmed) return;

  //   setActionLoading(true);
  //   try {
  //     let hash: `0x${string}`;

  //     switch (action) {
  //       case "terminate":
  //         if (!terminationFee) throw new Error("Termination fee not provided");
  //         hash = await terminateEarly(terminationFee);
  //         break;

  //       case "exercise":
  //         hash = await exercise(borrower as `0x${string}`);
  //         break;

  //       case "default":
  //         hash = await defaultOption(borrower as `0x${string}`);
  //         break;

  //       default:
  //         throw new Error("Unknown action");
  //     }

  //     // Wait for transaction confirmation
  //     await waitForTransaction(hash);

  //     alert(`✅ Successfully ${action}ed option!`);

  //     // Reload data after successful action
  //     setTimeout(loadData, 2000);
  //   } catch (error: any) {
  //     console.error(`Error ${action}ing option:`, error);
  //     alert(`❌ Failed to ${action} option:\n${extractErrorMessage(error)}`);
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  // Handle create option
  const handleCreateOption = async () => {
    if (!isConnected || !createForm.borrowerAddress) {
      alert("Please fill in all required fields");
      return;
    }

    setCreateLoading(true);
    try {
      const hash = await initializeOption(
        createForm.borrowerAddress as `0x${string}`,
        createForm.maturityDuration
      );

      await waitForTransaction(hash);
      alert("✅ Option created successfully!");

      // Reset form and reload data
      setCreateForm({
        borrowerAddress: "",
        maturityDuration: 3600,
        collateralValue: 0,
      });
      setShowCreateForm(false);
      setTimeout(loadData, 2000);
    } catch (error: any) {
      console.error("Error creating option:", error);
      alert(`❌ Failed to create option:\n${extractErrorMessage(error)}`);
    } finally {
      setCreateLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="institutional-card text-center py-12">
          <Wallet className="w-16 h-16 text-mezo-dark-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-mezo-dark-50 mb-2">
            Wallet Not Connected
          </h2>
          <p className="text-mezo-dark-300">
            Please connect your wallet to access the Backstop Option Manager
          </p>
        </div>
      </motion.div>
    );
  }

  console.log("Rendering BackstopOptionManager with option:", option);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="institutional-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-mezo-dark-50 font-display">
                Backstop Option Manager
              </h2>
              <p className="text-sm text-mezo-dark-300">
                Create and manage reversible call options for borrower
                protection
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <RefreshCw
                className={`w-5 h-5 text-mezo-dark-300 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </motion.button>
          </div>
        </div>
      </div>
      {/* Create Option Section */}
      <div className="institutional-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-green-500/10">
              <Plus className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-mezo-dark-50">
              Create New Option
            </h3>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            {showCreateForm ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span className="text-sm">
              {showCreateForm ? "Hide" : "Show"} Form
            </span>
          </motion.button>
        </div>
        {/*Form to Create Option*/}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t border-white/10 pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-mezo-dark-200 mb-2">
                      Borrower Address
                    </label>
                    <input
                      type="text"
                      value={createForm.borrowerAddress}
                      readOnly
                      placeholder="Connect wallet to auto-fill"
                      className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-purple-500/50 focus:outline-none placeholder-mezo-dark-400 opacity-70 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mezo-dark-200 mb-2">
                      Collateral Value (BTC)
                    </label>
                    <input
                      type="number"
                      value={createForm.collateralValue}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          collateralValue: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="10000"
                      className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-purple-500/50 focus:outline-none placeholder-mezo-dark-400"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-mezo-dark-200 mb-2">
                      Maturity Duration
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {maturityPresets.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() =>
                            setCreateForm((prev) => ({
                              ...prev,
                              maturityDuration: preset.value,
                            }))
                          }
                          className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                            createForm.maturityDuration === preset.value
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : "bg-white/5 text-mezo-dark-300 hover:bg-white/10 border border-white/10"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={createForm.maturityDuration}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          maturityDuration: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="3600"
                      className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-mezo-dark-50 font-mono focus:border-purple-500/50 focus:outline-none placeholder-mezo-dark-400"
                      min="0"
                    />
                    <p className="text-xs text-mezo-dark-400 mt-1">
                      Duration in seconds
                    </p>
                  </div>
                </div>

                {/* Premium Calculation */}
                <div className="space-y-4">
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                    <h4 className="text-lg font-medium text-purple-400 mb-3">
                      Premium Calculation
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-mezo-dark-300">
                          Collateral Value:
                        </span>
                        <span className="font-mono text-sm text-mezo-dark-50">
                          {createForm.collateralValue || "0"} BTC
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-mezo-dark-300">
                          Calculated Premium:
                        </span>
                        <span className="font-mono text-sm text-purple-400 font-semibold">
                          {calculatedPremium} BTC
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-mezo-dark-300">
                          Lambda:
                        </span>
                        <span className="font-mono text-sm text-mezo-dark-50">
                          {createForm.collateralValue &&
                          createForm.collateralValue > 0
                            ? (
                                (calculatedPremium /
                                  createForm.collateralValue) *
                                100
                              ).toFixed(2)
                            : "0.00"}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateOption}
                    disabled={createLoading || !createForm.borrowerAddress}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center space-x-2"
                  >
                    {createLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating Option...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Initialize Option</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* User Option Display */}{" "}
      {option ? (
        <OptionCard
          option={option}
          userRole="borrower"
          terminationFee={terminationFees}
          onTerminateEarly={(terminationFee) =>
            terminateEarly(terminationFee || 0)
          }
        />
      ) : (
        <div className="institutional-card text-center py-12">
          <XCircle className="w-16 h-16 text-mezo-dark-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-mezo-dark-50 mb-2">
            No Active Option Found
          </h2>
          <p className="text-mezo-dark-300">
            You currently have no active backstop options as a borrower.
          </p>
        </div>
      )}
    </motion.div>
  );
}
