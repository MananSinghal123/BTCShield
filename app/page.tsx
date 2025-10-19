"use client";
import InstitutionalLayout from "@/components/institutional/InstitutionalLayout";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ArrowUpDown,
  BarChart3,
  Bell,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import BorrowerOperationsPanel from "../components/institutional/BorrowerOperationsPanel";
import BackstopOptionManager from "../components/institutional/BackstopOptionManager";
import AllOptionsExplorer from "../components/institutional/AllOptionsExplorer";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("borrow");

  const tabs = [
    {
      id: "borrow",
      label: "Borrow & Lend",
      icon: ArrowUpDown,
      component: BorrowerOperationsPanel,
    },
    {
      id: "backstop",
      label: "Backstop Options",
      icon: Shield,
      component: BackstopOptionManager,
    },
    {
      id: "explorer",
      label: "Options Explorer",
      icon: Users,
      component: AllOptionsExplorer,
    },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 institutional-card border-b border-white/[0.08]">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>

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
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-mezo-btc-500/10 text-mezo-btc-500 border border-mezo-btc-500/20"
                      : "text-mezo-dark-300 hover:text-mezo-dark-50 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <Bell className="w-5 h-5 text-mezo-dark-300" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <Settings className="w-5 h-5 text-mezo-dark-300" />
            </motion.button>

            <ConnectButton />
          </div>
        </div>
      </nav>
      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="fixed inset-y-0 left-0 z-50 w-64 institutional-card lg:hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-mezo-dark-50">
                Navigation
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-mezo-btc-500/10 text-mezo-btc-500 border border-mezo-btc-500/20"
                        : "text-mezo-dark-300 hover:text-mezo-dark-50 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}
      <InstitutionalLayout
        tabs={tabs}
        activeTab={activeTab}
        ActiveComponent={tabs.find((tab) => tab.id === activeTab)?.component}
      />
    </>
  );
}
