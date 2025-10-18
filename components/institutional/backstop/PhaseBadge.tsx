import { OptionPhase } from "@/hooks/useRcoManager";

interface PhaseBadgeProps {
  phase: OptionPhase;
}

const phaseConfig: Record<number, { color: string; label: string }> = {
  0: {
    color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    label: "None",
  },
  1: {
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    label: "Initializing",
  },
  2: {
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    label: "Pre-Maturity",
  },
  3: {
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    label: "Maturity",
  },
  4: {
    color: "bg-green-500/10 text-green-400 border-green-500/20",
    label: "Exercised",
  },
  5: {
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    label: "Terminated",
  },
  6: {
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    label: "Defaulted",
  },
};

const PhaseBadge = ({ phase }: PhaseBadgeProps) => {
  const config = phaseConfig[phase as number] || phaseConfig[0];
  return (
    <span
      className={`px-2 py-1 rounded-lg text-xs font-medium border ${config.color}`}
    >
      {config.label}
    </span>
  );
};

export default PhaseBadge;
