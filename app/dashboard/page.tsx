"use client";
import BorrowerOperationsPanel from "@/components/institutional/BorrowerOperationsPanel";
import InstitutionalLayout from "@/components/institutional/InstitutionalLayout";

export default function Dashboard() {
  return (
    <InstitutionalLayout>
      <BorrowerOperationsPanel />
    </InstitutionalLayout>
  );
}
