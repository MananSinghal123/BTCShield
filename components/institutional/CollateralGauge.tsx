import motion from "framer-motion";

interface CollateralGaugeProps {
  ratio: number;
  liquidationThreshold?: number;
}

// Collateral Gauge Component
export const CollateralGauge = ({
  ratio,
  liquidationThreshold = 1.1,
}: CollateralGaugeProps) => {
  const normalizedRatio = ratio || 0;
  const percentage = Math.min((normalizedRatio / 3) * 100, 100);

  const getColor = () => {
    if (normalizedRatio >= 2.0) return "#10b981";
    if (normalizedRatio >= 1.5) return "#f59e0b";
    if (normalizedRatio >= liquidationThreshold) return "#ef4444";
    return "#991b1b";
  };

  const getHealthLabel = () => {
    if (normalizedRatio >= 2.0) return "Healthy";
    if (normalizedRatio >= 1.5) return "Moderate";
    if (normalizedRatio >= liquidationThreshold) return "At Risk";
    return "Critical";
  };

  const color = getColor();
  const healthLabel = getHealthLabel();

  // Calculate the end point of the arc based on percentage
  const angle = (Math.PI * percentage) / 100;
  const endX = 20 + 160 * (percentage / 100);
  const endY = 100 - 80 * Math.sin(angle);
  const largeArcFlag = percentage > 50 ? 1 : 0;

  return (
    <div className="relative">
      <svg viewBox="0 0 200 120" className="w-full h-auto">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#1f2937"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 66.67 43.33"
          fill="none"
          stroke="#991b1b"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 66.67 43.33 A 80 80 0 0 1 133.33 43.33"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 133.33 43.33 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#10b981"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.3"
        />
        {percentage > 0 && (
          <path
            d={`M 20 100 A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY}`}
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeLinecap="round"
            style={{
              strokeDasharray: 251.2,
              strokeDashoffset: 251.2,
              animation: "drawArc 1.5s ease-out forwards",
            }}
          />
        )}
        <line
          x1={20 + 160 * (liquidationThreshold / 3)}
          y1={100 - 80 * Math.sin((Math.PI * liquidationThreshold) / 3)}
          x2={20 + 160 * (liquidationThreshold / 3)}
          y2={110}
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>
      <style jsx>{`
        @keyframes drawArc {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
        <div className="text-3xl font-bold" style={{ color }}>
          {normalizedRatio ? (normalizedRatio * 100).toFixed(0) + "%" : "N/A"}
        </div>
        <div className="text-xs text-mezo-dark-300 mt-1">{healthLabel}</div>
      </div>
    </div>
  );
};
