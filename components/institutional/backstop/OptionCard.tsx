import { motion } from "framer-motion";
import { Shield, XCircle, Zap, AlertTriangle, ThumbsUp } from "lucide-react";
import { BackstopOption, OptionPhase } from "@/hooks/useRcoManager";
import PhaseBadge from "./PhaseBadge";
import AddressDisplay from "./AddressDisplay";

interface OptionCardProps {
  option: BackstopOption;
  userRole: "borrower" | "supporter" | "none";
  terminationFee?: number;
  onTerminateEarly?: (terminationFee?: number) => Promise<`0x${string}`>;
  onExercise?: () => void;
  onDefault?: () => void;
  onSupport?: () => void;
  isLoading?: boolean;
}

const OptionCard = ({
  option,
  userRole,
  terminationFee,
  onTerminateEarly,
  onExercise,
  onDefault,
  onSupport,
  isLoading = false,
}: OptionCardProps) => {
  // Terminate button is enabled if phase is Initialization, PreMaturity, or Maturity
  const canTerminate = [
    OptionPhase.Initialization,
    OptionPhase.PreMaturity,
    // OptionPhase.Maturity,
  ].includes(option.phase);

  // Exercise is only available for supporters at maturity or pre-maturity
  const canExercise =
    userRole === "supporter" && [OptionPhase.Maturity].includes(option.phase);

  // Default can be triggered by either party at maturity or pre-maturity

  // Support is only available for users with no role during initialization
  const canSupport =
    userRole === "none" && [OptionPhase.Initialization].includes(option.phase);

  // Check if option has matured
  const now = Math.floor(Date.now() / 1000);
  const hasMatured = now >= option.maturityTime;

  const canDefault =
    now >= option.maturityTime + 86400 &&
    option.phase !== OptionPhase.Defaulted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="institutional-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-mezo-dark-50">
              Protection Option
            </h3>
            <p className="text-sm text-mezo-dark-300">
              Role:{" "}
              <span className="text-mezo-btc-500 font-medium capitalize">
                {userRole}
              </span>
            </p>
          </div>
        </div>
        <PhaseBadge phase={option.phase} />
      </div>

      <div className="space-y-3 mb-6">
        <AddressDisplay address={option.borrower} label="Borrower" />
        <AddressDisplay address={option.supporter} label="Supporter" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-mezo-dark-300">
            Collateral at Start
          </span>
          <span className="font-mono text-sm text-mezo-dark-50">
            {option.collateralAtStart} BTC
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-mezo-dark-300">Debt at Start</span>
          <span className="font-mono text-sm text-mezo-dark-50">
            ${option.debtAtStart}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-mezo-dark-300">Lambda</span>
          <span className="font-mono text-sm text-mezo-dark-50">
            {option.lambda}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-mezo-dark-300">Premium </span>
          <span className="font-mono text-sm text-mezo-dark-50">
            {option.premium} BTC
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-mezo-dark-300">Strike CR</span>
          <span className="font-mono text-sm text-mezo-dark-50">
            {option.strikeCR}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-mezo-dark-300">Interest Rate</span>
          <span className="font-mono text-sm text-mezo-dark-50">
            {Number(option.interestRate) * 1e16}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-mezo-dark-300">Start Time</span>
          <span className="font-mono text-sm text-mezo-dark-50">
            {option.startTime
              ? new Date(Number(option.startTime) * 1000).toLocaleString()
              : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-mezo-dark-300">Maturity Time</span>
          <span className="font-mono text-sm text-mezo-dark-50">
            {option.maturityTime
              ? new Date(Number(option.maturityTime) * 1000).toLocaleString()
              : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-mezo-dark-300">Status</span>
          <span
            className={`font-mono text-sm ${
              hasMatured ? "text-orange-400" : "text-green-400"
            }`}
          >
            {hasMatured ? "Matured" : "Active"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Terminate Early - Borrower Only */}
        {userRole === "borrower" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTerminateEarly?.(terminationFee)}
            disabled={isLoading || !canTerminate}
            className="w-full btc-button bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            <span>
              {isLoading
                ? "Processing..."
                : canTerminate
                ? `Terminate Early (Fee: ${
                    terminationFee ?? option.premium
                  } BTC)`
                : "Cannot terminate - option conditions not met"}
            </span>
          </motion.button>
        )}

        {/* {Support Button} */}
        {userRole === "none" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSupport}
            disabled={isLoading || !canSupport}
            className="w-full btc-button bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>
              {isLoading
                ? "Processing..."
                : !canSupport
                ? "Cannot support - invalid phase"
                : "Support Option"}
            </span>
          </motion.button>
        )}

        {/* Exercise Option - Supporter Only */}
        {userRole === "supporter" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExercise}
            disabled={isLoading || !canExercise || !hasMatured}
            className="w-full btc-button bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            <span>
              {isLoading
                ? "Processing..."
                : !hasMatured
                ? "Option not yet matured"
                : canExercise
                ? "Exercise Option"
                : "Cannot exercise - invalid phase"}
            </span>
          </motion.button>
        )}

        {/* Default Option - Available to Both */}
        {(userRole === "supporter" ||
          userRole === "none" ||
          userRole === "borrower") && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDefault}
            disabled={isLoading || !canDefault || !hasMatured}
            className="w-full btc-button bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>
              {isLoading
                ? "Processing..."
                : !hasMatured
                ? "Option not yet matured"
                : canDefault
                ? "Default Option"
                : "Cannot default - invalid phase"}
            </span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default OptionCard;
