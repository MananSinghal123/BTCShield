import { useState, useEffect } from "react";
import { HermesClient } from "@pythnetwork/hermes-client";

// interface PriceData {
//   price: string | null;
//   confidence: string | null;
//   expo: number | null;
//   publishTime: number | null;
// }

interface UseBtcPriceReturn {
  btcPrice: number | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const BTC_USD_PRICE_ID =
  "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";

export const useInitBtcPrice = (): UseBtcPriceReturn => {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBtcPrice = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const connection = new HermesClient("https://hermes.pyth.network", {});

      // Get latest price updates for BTC/USD
      const priceUpdates = await connection.getLatestPriceUpdates([
        BTC_USD_PRICE_ID,
      ]);

      if (
        priceUpdates &&
        priceUpdates.parsed &&
        priceUpdates.parsed.length > 0
      ) {
        const btcPriceData = priceUpdates.parsed[0];

        setBtcPrice(
          Number(btcPriceData.price.price) *
            Math.pow(10, btcPriceData.price.expo)
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch BTC price")
      );
      console.error("Error fetching BTC price:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBtcPrice();
  }, []);

  return {
    btcPrice,
    isLoading,
    error,
    refetch: fetchBtcPrice,
  };
};

// Helper function to format the price with proper decimal places
export const formatBtcPrice = (btcPrice: number | null): string | null => {
  if (btcPrice === null) return null;

  return btcPrice.toFixed(2);
};
