"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Info, FileText, ShieldCheck, Search } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import supabase from "@/utils/Supabase";

interface UserData {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface LegalPageProps {
  userData: UserData | null;
}

interface Case {
  id: number;
  case_number: string;
  title: string;
  description?: string;
  case_type: string;
  status: string;
  filed_date: string;
  closed_date?: string;
  document_url?: string;
  assigned_admin?: string;
  user_full_name?: string;
  created_at: string;
  updated_at: string;
}

interface ComplianceRecord {
  id: number;
  compliance_number: string;
  title: string;
  category: string;
  description?: string;
  due_date: string;
  status: string;
  document_url?: string;
  admin_name?: string;
  user_full_name?: string;
  created_at: string;
  updated_at: string;
}

// Raw response types from Supabase
interface CaseRaw extends Omit<Case, "assigned_admin" | "user_full_name"> {
  assigned_admin?: { name: string } | null;
  user?: { first_name: string; last_name: string } | null;
}

interface ComplianceRaw
  extends Omit<ComplianceRecord, "admin_name" | "user_full_name"> {
  admin_id?: { name: string } | null;
  user?: { first_name: string; last_name: string } | null;
}

export default function LegalPage({ userData }: LegalPageProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [complianceRecords, setComplianceRecords] = useState<
    ComplianceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Cases" | "Compliance">("All");
  const [search, setSearch] = useState("");

  // Fetch user-specific cases & compliance
  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.id) return;
      setLoading(true);

      try {
        const { data: casesData } = await supabase
          .from("cases")
          .select(
            `
              *,
              assigned_admin:admins(name),
              user:user_id(first_name,last_name)
            `
          )
          .eq("user_id", userData.id)
          .order("filed_date", { ascending: false });

        const { data: complianceData } = await supabase
          .from("compliance_records")
          .select(
            `
              *,
              admin_id:admins(name),
              user:user_id(first_name,last_name)
            `
          )
          .eq("user_id", userData.id)
          .order("due_date", { ascending: true });

        // Flatten admin and user objects
        const flattenedCases: Case[] =
          (casesData as CaseRaw[] | null)?.map((c) => ({
            ...c,
            assigned_admin: c.assigned_admin?.name || "-",
            user_full_name: c.user
              ? `${c.user.first_name} ${c.user.last_name}`
              : "-",
          })) || [];

        const flattenedCompliance: ComplianceRecord[] =
          (complianceData as ComplianceRaw[] | null)?.map((c) => ({
            ...c,
            admin_name: c.admin_id?.name || "-",
            user_full_name: c.user
              ? `${c.user.first_name} ${c.user.last_name}`
              : "-",
          })) || [];

        setCases(flattenedCases);
        setComplianceRecords(flattenedCompliance);
      } catch (err) {
        console.error("Error fetching legal data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  // Filtered and searched data
  const filteredCases = useMemo(
    () =>
      cases.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.case_number.toLowerCase().includes(search.toLowerCase())
      ),
    [cases, search]
  );

  const filteredCompliance = useMemo(
    () =>
      complianceRecords.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.compliance_number.toLowerCase().includes(search.toLowerCase())
      ),
    [complianceRecords, search]
  );

  const pieData = [
    {
      name: "Open Cases",
      value: cases.filter((c) => c.status === "Open").length,
    },
    {
      name: "Closed Cases",
      value: cases.filter((c) => c.status === "Closed").length,
    },
    {
      name: "Pending Compliance",
      value: complianceRecords.filter((c) => c.status === "Pending").length,
    },
    {
      name: "Completed Compliance",
      value: complianceRecords.filter((c) => c.status === "Approved").length,
    },
  ];

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

  function isComplianceRecord(
    item: Case | ComplianceRecord
  ): item is ComplianceRecord {
    return "compliance_number" in item;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Section: Cards + Pie Chart */}
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        {/* Left: Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
          {/* Cases Card */}
          <div className="p-5 bg-white shadow-xl rounded-lg border-l-8 border-green-500 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-500" />
                Cases
              </h3>
              <p className="text-3xl font-bold text-gray-900">{cases.length}</p>
              <p className="text-sm text-green-500 mt-1">Open & Active Cases</p>
            </div>
          </div>

          {/* Compliance Card */}
          <div className="p-5 bg-white shadow-xl rounded-lg border-l-8 border-yellow-500 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-yellow-500" />
                Compliance
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {complianceRecords.length}
              </p>
              <p className="text-sm text-yellow-500 mt-1">
                Pending & Submitted
              </p>
            </div>
          </div>

          {/* Total Records Card */}
          <div className="p-5 bg-white shadow-xl rounded-lg border-l-8 border-blue-500 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Total Records
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {cases.length + complianceRecords.length}
              </p>
              <p className="text-sm text-blue-500 mt-1">All Records Combined</p>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-lg shadow-xl p-4 w-full lg:w-1/3 h-52 flex flex-col">
          <ResponsiveContainer width="100%" height="100%">
            {pieData && pieData.length > 0 ? (
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-lg font-medium">
                {pieData ? "No data available" : "Loading chart..."}
              </div>
            )}
          </ResponsiveContainer>

          {/* Pie Chart Legend */}
          {pieData && pieData.length > 0 && (
            <div className="flex justify-around mt-2 text-sm font-medium">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4">
        This page displays all your legal cases and compliance records. You can
        filter by &quot;Cases&quot; or &quot;Compliance&quot;, search by title
        or number, and view details or download related documents.
      </p>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="flex gap-2">
          {(["All", "Cases", "Compliance"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === f
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-10 pr-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Title / Number</th>
              <th className="px-4 py-2 border">Type / Category</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Assigned Admin</th>
              <th className="px-4 py-2 border">Client</th>
              <th className="px-4 py-2 border">Created At</th>
              <th className="px-4 py-2 border">Updated At</th>
              <th className="px-4 py-2 border">Document</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={11}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  Loading data...
                </td>
              </tr>
            ) : (filter === "All"
                ? [...filteredCases, ...filteredCompliance]
                : filter === "Cases"
                ? filteredCases
                : filteredCompliance
              ).length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Info className="w-5 h-5" />
                    No records found.
                  </div>
                </td>
              </tr>
            ) : (
              (filter === "All"
                ? [...filteredCases, ...filteredCompliance]
                : filter === "Cases"
                ? filteredCases
                : filteredCompliance
              ).map((item, idx) => (
                <motion.tr
                  key={item.id}
                  className="hover:bg-gray-50"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <td className="px-4 py-2 border text-center">{idx + 1}</td>
                  <td className="px-4 py-2 border">
                    {"case_number" in item
                      ? `${item.case_number} - ${item.title}`
                      : `${item.compliance_number} - ${item.title}`}
                  </td>
                  <td className="px-4 py-2 border">
                    {"case_type" in item ? item.case_type : item.category}
                  </td>
                  <td className="px-4 py-2 border">
                    {item.description || "-"}
                  </td>
                  <td className="px-4 py-2 border">{item.status}</td>
                  <td className="px-4 py-2 border">
                    {"filed_date" in item
                      ? formatDate(item.filed_date)
                      : formatDate(item.due_date)}
                  </td>
                  <td className="px-4 py-2 border">
                    {"assigned_admin" in item
                      ? item.assigned_admin
                      : isComplianceRecord(item)
                      ? item.admin_name || "-"
                      : "-"}
                  </td>

                  <td className="px-4 py-2 border">
                    {item.user_full_name || "-"}
                  </td>
                  <td className="px-4 py-2 border">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-4 py-2 border">
                    {item.status === "Pending"
                      ? "No actions"
                      : formatDate(item.updated_at)}
                  </td>
                  <td className="px-4 py-2 border">
                    {item.document_url ? (
                      <a
                        href={item.document_url}
                        target="_blank"
                        className="text-blue-500 hover:underline"
                      >
                        View / Download
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
