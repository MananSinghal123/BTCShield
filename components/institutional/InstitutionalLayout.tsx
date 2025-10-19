"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface InstitutionalLayoutProps {
  children?: React.ReactNode;
  tabs: Array<{
    id: string;
    label: string;
    icon: any;
    component: React.ComponentType<any>;
  }>;
  activeTab: string;
  ActiveComponent?: React.ComponentType<any>;
}

export default function InstitutionalLayout({
  children,
  tabs,
  activeTab,
  ActiveComponent,
}: InstitutionalLayoutProps) {
  console.log("InstitutionalLayout rendering with:", {
    activeTab,
    ActiveComponent: !!ActiveComponent,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-mezo-dark-950 via-mezo-dark-900 to-mezo-dark-800">
      {/* Top Navigation */}

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
                    {tabs.find((tab) => tab.id === activeTab)?.label}
                  </h2>
                  <p className="text-mezo-dark-300 mt-1">
                    {activeTab === "collateral" &&
                      "Monitor your BTC collateral and LTV ratios"}
                    {activeTab === "risk" &&
                      "Advanced risk analytics with BTCShield liquidation mitigation"}
                    {activeTab === "borrow" &&
                      "Borrow MUSD against BTC collateral with real-time oracle feeds"}
                    {activeTab === "backstop" &&
                      "Create and manage reversible call options for borrower protection and supporter rewards"}
                    {activeTab === "supporters" &&
                      "Support undercollateralized positions and earn premiums through BTCShield backstop mechanism"}
                    {activeTab === "analytics" &&
                      "Portfolio analytics and stress scenario simulations"}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-sm text-mezo-dark-300">
                  <Activity className="w-4 h-4" />
                  <span>Live data</span>
                </div>
              </div>
            </motion.div>

            {/* Active Component */}
            {ActiveComponent && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ActiveComponent />
              </motion.div>
            )}

            {/* Custom Children */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
