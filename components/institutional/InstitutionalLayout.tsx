"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  ArrowUpDown,
  Shield,
  Users,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface InstitutionalLayoutProps {
  children?: React.ReactNode;
}

export default function InstitutionalLayout({
  children,
}: InstitutionalLayoutProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
    },
    // {
    //   href: "/borrow",
    //   label: "Borrow & Lend",
    //   icon: ArrowUpDown,
    // },
    {
      href: "/options",
      label: "My Options",
      icon: Shield,
    },
    {
      href: "/options/explore",
      label: "Explore",
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
        return "Monitor your BTC collateral and portfolio analytics";
      // case "/borrow":
      //   return "Borrow MUSD against BTC collateral with real-time oracle feeds";
      case "/options":
        return "Create and manage reversible call options for borrower protection";
      case "/options/explore":
        return "Explore and support undercollateralized positions";
      case "/settings":
        return "Configure your BTCShield preferences";
      default:
        return "BTC Backstop Protection Platform";
    }
  };

  const currentPage = navigationItems.find((item) => item.href === pathname);
  const pageTitle = currentPage?.label || "BTCShield";
  const pageDescription = getPageDescription(pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mezo-dark-950 via-mezo-dark-900 to-mezo-dark-800">
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
                  BTC Backstop Protection Platform
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
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-mezo-btc-500/10 text-mezo-btc-500 border border-mezo-btc-500/20"
                        : "text-mezo-dark-300 hover:text-mezo-dark-50 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.div>
                </Link>
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
            <motion.div
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
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
