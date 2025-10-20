"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  ArrowUpDown,
  Shield,
  Users,
  Settings,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect, useTransition } from "react";

interface InstitutionalLayoutProps {
  children?: React.ReactNode;
}

export default function InstitutionalLayout({
  children,
}: InstitutionalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);

  // Listen for navigation state
  useEffect(() => {
    setIsNavigating(isPending);
  }, [isPending]);

  const navigationItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      href: "/protection",
      label: "My Protection",
      icon: Shield,
    },
    {
      href: "/protection/explore",
      label: "Marketplace",
      icon: Users,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const getPageDescription = (path: string): string => {
    switch (path) {
      case "/dashboard":
        return "Overview of your lending positions and portfolio performance";
      case "/protection":
        return "Create protection options for your lending positions";
      case "/protection/explore":
        return "Browse and support lending positions in the marketplace";
      case "/settings":
        return "Configure your BTCShield preferences";
      default:
        return "BTC Protection Platform";
    }
  };

  const currentPage = navigationItems.find((item) => item.href === pathname);
  const pageTitle = currentPage?.label || "BTCShield";
  const pageDescription = getPageDescription(pathname);

  const handleNavigation = (href: string) => {
    if (href === pathname) return; // Don't navigate if already on page

    setIsNavigating(true);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mezo-dark-950 via-mezo-dark-900 to-mezo-dark-800">
      {/* Page Transition Loader - Blocking Overlay */}
      {isNavigating && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-mezo-dark-950/95 backdrop-blur-md pointer-events-auto"
          style={{ cursor: "wait" }}
        >
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-mezo-btc-500 animate-spin" />
            <p className="text-mezo-dark-200 font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 institutional-card border-b border-white/[0.08]">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg btc-gradient flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-mezo-dark-50 font-display">
                  BTCShield
                </h1>
                <p className="text-xs text-mezo-dark-300">
                  Liquidation Protection Platform
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-mezo-btc-500/10 text-mezo-btc-500 border border-mezo-btc-500/20"
                      : "text-mezo-dark-300 hover:text-mezo-dark-50 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            <ConnectButton />
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-mezo-dark-50 font-display">
                    {pageTitle}
                  </h2>
                  <p className="text-mezo-dark-300 mt-1">{pageDescription}</p>
                </div>

                <div className="flex items-center space-x-2 text-sm text-mezo-dark-300">
                  <Activity className="w-4 h-4" />
                  <span>Live data</span>
                </div>
              </div>
            </motion.div> */}

            {/* Content */}
            <div>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
