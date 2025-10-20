"use client";
import InstitutionalLayout from "@/components/institutional/InstitutionalLayout";

export default function SettingsPage() {
  return (
    <InstitutionalLayout>
      <div className="institutional-card text-center py-12">
        <h2 className="text-2xl font-semibold text-mezo-dark-50 mb-4">
          Settings
        </h2>
        <p className="text-mezo-dark-300 mb-6">
          Configure your BTCShield preferences
        </p>
        <div className="text-sm text-mezo-dark-400">
          Settings panel coming soon...
        </div>
      </div>
    </InstitutionalLayout>
  );
}
