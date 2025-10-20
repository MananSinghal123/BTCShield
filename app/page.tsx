"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mezo-dark-950 via-mezo-dark-900 to-mezo-dark-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-lg btc-gradient flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-2xl font-bold text-white">₿</span>
        </div>
        <p className="text-mezo-dark-300">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
}
