import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

interface AddressDisplayProps {
  address: string;
  label: string;
  showCopy?: boolean;
  showExternalLink?: boolean;
}

const AddressDisplay = ({
  address,
  label,
  showCopy = true,
  showExternalLink = false,
}: AddressDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const truncateAddress = (addr: string) => {
    if (!addr || addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-mezo-dark-300">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="font-mono text-sm text-mezo-dark-50">
          {truncateAddress(address)}
        </span>
        {showCopy && (
          <button
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-white/5 transition-colors"
            title="Copy address"
          >
            <Copy
              className={`w-3 h-3 ${
                copied ? "text-green-400" : "text-mezo-dark-400"
              }`}
            />
          </button>
        )}
        {showExternalLink && (
          <button
            onClick={() =>
              window.open(`https://mempool.space/address/${address}`, "_blank")
            }
            className="p-1 rounded-md hover:bg-white/5 transition-colors"
            title="View on explorer"
          >
            <ExternalLink className="w-3 h-3 text-mezo-dark-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressDisplay;
