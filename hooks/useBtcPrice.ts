"use client";

import { useState, useEffect } from "react";
import { HermesClient } from "@pythnetwork/hermes-client";

const BTC_PRICE_FEED_ID =
  (process.env.NEXT_PUBLIC_BTC_PRICE_FEED_ADDRESS as `0x${string}`) ||
  "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";

export function useBTCPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  useEffect(() => {
    const connection = new HermesClient("https://hermes.pyth.network", {});
    let eventSource: EventSource | null = null;

    const initializeStream = async () => {
      try {
        // Get initial price
        const priceUpdates = await connection.getLatestPriceUpdates([
          BTC_PRICE_FEED_ID,
        ]);

        if (priceUpdates.parsed && priceUpdates.parsed.length > 0) {
          const priceData = priceUpdates.parsed[0].price;
          const btcPrice =
            Number(priceData.price) * Math.pow(10, priceData.expo);
          const conf = Number(priceData.conf) * Math.pow(10, priceData.expo);

          setPrice(btcPrice);
          setConfidence(conf);
          setLoading(false);
        }

        // Start streaming updates
        eventSource = await connection.getStreamingPriceUpdates([
          BTC_PRICE_FEED_ID,
        ]);

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.parsed && data.parsed.length > 0) {
              const priceData = data.parsed[0].price;
              const btcPrice =
                Number(priceData.price) * Math.pow(10, priceData.expo);
              const conf =
                Number(priceData.conf) * Math.pow(10, priceData.expo);

              setPrice(btcPrice);
              setConfidence(conf);
              setError(null);
            }
          } catch (err) {
            console.error("Error parsing price update:", err);
          }
        };

        eventSource.onerror = (error) => {
          console.error("Error receiving updates:", error);
          setError("Connection error");
          eventSource?.close();
        };
      } catch (err) {
        console.error("Error initializing price feed:", err);
        setError("Failed to fetch price");
        setLoading(false);
      }
    };

    initializeStream();

    return () => {
      if (eventSource) {
        console.log("Closing price feed connection");
        eventSource.close();
      }
    };
  }, []);

  return { price, loading, error, confidence };
}
