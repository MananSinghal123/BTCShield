import { motion } from "framer-motion";

interface HealthBarProps {
  ratio: number;
  liquidationThreshold?: number;
}

export const HealthBar = ({
  ratio,
  liquidationThreshold = 1.1,
}: HealthBarProps) => {
  const normalizedRatio = ratio || 0;
  const percentage = Math.min((normalizedRatio / 3) * 100, 100);

  const getColor = () => {
    if (normalizedRatio >= 2.0) return "bg-green-500";
    if (normalizedRatio >= 1.5) return "bg-yellow-500";
    if (normalizedRatio >= liquidationThreshold) return "bg-red-500";
    return "bg-red-900";
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-mezo-dark-300 mb-2">
        <span>Liquidation</span>
        <span>Safe Zone</span>
      </div>
      <div className="relative h-3 bg-mezo-dark-800 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-[36.67%] bg-red-900/20" />
          <div className="w-[30%] bg-yellow-500/20" />
          <div className="w-[33.33%] bg-green-500/20" />
        </div>
        <div
          className={`absolute left-0 top-0 h-full ${getColor()} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-red-400"
          style={{ left: `${(liquidationThreshold / 3) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-mezo-dark-300 mt-1">
        <span>110%</span>
        <span>200%</span>
        <span>300%</span>
      </div>
    </div>
  );
};
