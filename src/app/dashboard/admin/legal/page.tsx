"use client";

import { useEffect, useState } from "react";
import CasesPage from "./cases/page";
import ContractsPage from "./contracts/page";
import CompliancePage from "./compliance/page";

type AdminData = {
  id: number;
  name: string;
  email: string;
  role: string;
} | null;

interface LegalPageProps {
  adminData: AdminData;
}

const LegalPage: React.FC<LegalPageProps> = ({ adminData }) => {
  const [tab, setTab] = useState<"cases" | "contracts" | "compliance">("cases");

  // Load saved tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem("legalTab") as
      | "cases"
      | "contracts"
      | "compliance"
      | null;
    if (savedTab) {
      setTab(savedTab);
    }
  }, []);

  // Save tab to localStorage whenever it changes
  const handleTabChange = (t: "cases" | "contracts" | "compliance") => {
    setTab(t);
    localStorage.setItem("legalTab", t);
  };

  return (
    <div className="p-6">
      <p className="text-gray-600 mb-4">
        Manage all legal records here. You can switch between{" "}
        <span className="font-medium">Cases</span>,{" "}
        <span className="font-medium">Contracts</span>, and{" "}
        <span className="font-medium">Compliance</span> sections. Each section
        lets you search, filter, refresh records, and add new entries. You are
        also responsible for reviewing, updating, and maintaining accurate legal
        documentation to ensure compliance and smooth operations.
      </p>

      {adminData && (
        <p className="mb-4 text-sm text-gray-500">
          Logged in as: <span className="font-medium">{adminData.name}</span> (
          {adminData.role})
        </p>
      )}

      {/* Tabs for Desktop */}
      <div className="hidden sm:flex gap-4 mb-6">
        {["cases", "contracts", "compliance"].map((t) => (
          <button
            key={t}
            className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
              tab === t
                ? "bg-gray-900 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-black"
            }`}
            onClick={() =>
              handleTabChange(t as "cases" | "contracts" | "compliance")
            }
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Select for Mobile */}
      <div className="sm:hidden mb-6">
        <select
          value={tab}
          onChange={(e) =>
            handleTabChange(
              e.target.value as "cases" | "contracts" | "compliance"
            )
          }
          className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
        >
          {["cases", "contracts", "compliance"].map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Tab Content */}
      {tab === "cases" && <CasesPage adminData={adminData} />}
      {tab === "contracts" && <ContractsPage adminData={adminData} />}
      {tab === "compliance" && <CompliancePage adminData={adminData} />}
    </div>
  );
};

export default LegalPage;
