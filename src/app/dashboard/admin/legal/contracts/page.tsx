"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  X,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  FileText,
  CalendarCheck,
  Trash,
  Edit,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import supabase from "@/utils/Supabase";

type AdminData = {
  id: number;
  name: string;
  email: string;
  role: string;
} | null;

type Contract = {
  id: number;
  contract_number: string;
  title: string;
  description: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  status: string;
  document_url?: string;
  created_at?: string;
  updated_at?: string;
  admin_id?: number;
  admin?: {
    id: number;
    name: string;
    email: string;
  } | null;
};

type ContractsPageProps = {
  adminData: AdminData;
};

export default function ContractsPage({ adminData }: ContractsPageProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showContractWizard, setShowContractWizard] = useState(false);
  const [contractStep, setContractStep] = useState(1);

  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters / Search
  const [searchQuery, setSearchQuery] = useState("");
  const [contractTypeFilter, setContractTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Stepper error handler
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Contract form
  const [contractForm, setContractForm] = useState({
    contract_number: "",
    title: "",
    description: "",
    contract_type: "",
    start_date: "",
    end_date: "",
    status: "Pending",
    document_url: "",
  });

  // For previewing uploaded file
  const [uploadedUrl, setUploadedUrl] = useState("");

  // Fetch Contracts
  const fetchContracts = async () => {
    setLoading(true);

    const { data, error } = await supabase.from("contracts").select(`
      *,
      admins (
        id,
        name,
        email
      )
    `);

    if (error) {
      console.error("Error fetching contracts:", error);
    } else if (data) {
      setContracts(data as Contract[]);
    }

    setLoading(false);
  };

  // Delete Contract and its file
  const deleteContract = async (id: number, fileUrl?: string) => {
    try {
      // 1️⃣ Delete file from Supabase Storage if URL exists
      if (fileUrl) {
        // Extract path relative to bucket
        // e.g. fileUrl = "https://xyz.supabase.co/storage/v1/object/public/legal/contracts/123_file.pdf"
        // we want "contracts/123_file.pdf"
        const match = fileUrl.match(/legal\/(.+)$/);
        const filePath = match ? match[1] : null;

        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("legal")
            .remove([filePath]);

          if (storageError) {
            console.error("Failed to delete file:", storageError.message);
          } else {
            console.log("File deleted successfully");
          }
        }
      }

      // 2️⃣ Delete contract record from database
      const { error: dbError } = await supabase
        .from("contracts")
        .delete()
        .eq("id", id);

      if (dbError) {
        console.error("Failed to delete contract:", dbError.message);
      } else {
        console.log("Contract deleted successfully");
        fetchContracts(); // refresh the list
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Stepper modal
  async function nextContractStep() {
    setFormError(null);

    if (contractStep === 1) {
      if (!contractForm.contract_number.trim())
        return setFormError("Contract number is required.");
      if (!contractForm.title.trim())
        return setFormError("Contract title is required.");
      if (!contractForm.description.trim())
        return setFormError("Description is required.");
      if (!contractForm.contract_type.trim())
        return setFormError("Contract type is required.");

      setContractStep(2);
    } else if (contractStep === 2) {
      if (!contractForm.start_date)
        return setFormError("Start date is required.");
      if (!contractForm.end_date) return setFormError("End date is required.");
      if (new Date(contractForm.end_date) <= new Date(contractForm.start_date))
        return setFormError("End date must be after start date.");

      setContractStep(3);
    } else if (contractStep === 3) {
      if (!contractForm.document_url)
        return setFormError("You must upload a contract document.");

      // Check if contract number already exists
      const { data: existing, error } = await supabase
        .from("contracts")
        .select("id")
        .eq("contract_number", contractForm.contract_number.trim())
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        return setFormError("Unable to validate contract number. Try again.");
      }

      if (existing) {
        return setFormError("This contract number already exists.");
      }

      createContract();
    }
  }

  // Create Contract
  const createContract = async () => {
    if (!adminData) return setFormError("You must be logged in as admin.");
    if (!contractForm.document_url) return setFormError("Upload a file first.");

    setSaving(true);

    const payload = {
      ...contractForm,
      status: contractForm.status || "Pending Approval",
      admin_id: adminData.id,
    };

    const { error } = await supabase.from("contracts").insert([payload]);

    if (error) {
      console.error("Insert error:", error);
      setFormError("Failed to create contract.");
      setSaving(false);
      return;
    }

    fetchContracts();
    setShowContractWizard(false); // close modal
    setContractStep(1);
    setContractForm({
      contract_number: "",
      title: "",
      description: "",
      contract_type: "",
      start_date: "",
      end_date: "",
      status: "Pending Approval",
      document_url: "",
    });
    setUploadedUrl("");
    setSaving(false);
  };

  // Upload file to Supabase and save full public URL
  const handleFileUpload = async (file: File) => {
    try {
      const filePath = `contracts/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("legal")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setFormError("Failed to upload file. Please try again.");
        return;
      }

      // Get public URL
      const { data } = supabase.storage.from("legal").getPublicUrl(filePath);

      if (!data?.publicUrl) {
        setFormError("Failed to get public URL.");
        return;
      }

      // Save URL in state & form
      setUploadedUrl(data.publicUrl);
      setContractForm((prev) => ({
        ...prev,
        document_url: data.publicUrl,
      }));
    } catch (err) {
      console.error(err);
      setFormError("An unexpected error occurred.");
    }
  };

  // Edit handler
  const handleEdit = (id: number) => {
    const contract = contracts.find((c) => c.id === id);
    if (!contract) return;

    // Populate the form with existing contract data
    setContractForm({
      contract_number: contract.contract_number,
      title: contract.title,
      description: contract.description,
      contract_type: contract.contract_type,
      start_date: contract.start_date,
      end_date: contract.end_date,
      status: contract.status,
      document_url: contract.document_url || "",
    });

    // Show modal and go to first step
    setContractStep(1);
    setShowContractWizard(true);
  };

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchesSearch =
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contract_number?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        contractTypeFilter === "All"
          ? true
          : c.contract_type === contractTypeFilter;

      const matchesStatus =
        statusFilter === "All" ? true : c.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [contracts, searchQuery, contractTypeFilter, statusFilter]);

  // Compute total pages after filtering
  const totalPages = Math.max(
    Math.ceil(filteredContracts.length / pageSize),
    1
  );

  // Reset current page if filter changes and current page exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  // Slice for pagination
  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredContracts.slice(start, start + pageSize);
  }, [filteredContracts, currentPage, pageSize]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const contractTypeColors = {
    Employment: "#4ade80", // green
    Service: "#60a5fa", // blue
    Lease: "#facc15", // yellow
    Partnership: "#f472b6", // pink
    Other: "#a78bfa", // purple
  };

  // Compute data for pie chart
  const contractTypeData = Object.entries(
    filteredContracts.reduce((acc: Record<string, number>, c) => {
      acc[c.contract_type] = (acc[c.contract_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Compute counts for cards
  const pendingContracts = filteredContracts.filter(
    (c) => c.status === "Pending Approval"
  ).length;

  const activeContracts = filteredContracts.filter(
    (c) => c.status === "Active"
  ).length;

  const expiredContracts = filteredContracts.filter(
    (c) => c.status === "Expired"
  ).length;

  const terminatedContracts = filteredContracts.filter(
    (c) => c.status === "Terminated"
  ).length;

  return (
    <div className="p-6">
      {/* Pie Chart and Card Comps */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Pie Chart */}
        <div className="bg-gray-900 text-white shadow-lg rounded-xl p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Contracts by Type</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contractTypeData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {contractTypeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      contractTypeColors[
                        entry.name as keyof typeof contractTypeColors
                      ]
                    }
                  />
                ))}
              </Pie>

              {/* Tooltip */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937", // dark gray
                  borderRadius: "0.5rem", // rounded corners
                  color: "#ffffff", // white text
                  padding: "0.5rem 1rem", // spacing inside tooltip
                  fontSize: "0.875rem", // readable font size
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Color Legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-3 w-full">
            {contractTypeData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor:
                      contractTypeColors[
                        entry.name as keyof typeof contractTypeColors
                      ],
                  }}
                />
                <span className="text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rightside 4 Cards by Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Pending Approval */}
          <div
            className="p-6 sm:p-8 rounded-lg bg-white flex items-center gap-6 shadow-xl"
            style={{ borderLeft: "6px solid #f59e0b" }} // yellow
          >
            <FileText className="w-12 h-12" style={{ color: "#f59e0b" }} />
            <div>
              <p
                className="text-lg sm:text-xl font-semibold"
                style={{ color: "#f59e0b" }}
              >
                Pending Approval
              </p>
              <p
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "#f59e0b" }}
              >
                {pendingContracts}
              </p>
            </div>
          </div>

          {/* Active */}
          <div
            className="p-6 sm:p-8 rounded-lg bg-white flex items-center gap-6 shadow-xl"
            style={{ borderLeft: "6px solid #22c55e" }} // green
          >
            <CalendarCheck className="w-12 h-12" style={{ color: "#22c55e" }} />
            <div>
              <p
                className="text-lg sm:text-xl font-semibold"
                style={{ color: "#22c55e" }}
              >
                Active
              </p>
              <p
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "#22c55e" }}
              >
                {activeContracts}
              </p>
            </div>
          </div>

          {/* Expired */}
          <div
            className="p-6 sm:p-8 rounded-lg bg-white flex items-center gap-6 shadow-xl"
            style={{ borderLeft: "6px solid #ef4444" }} // red
          >
            <CheckCircle2 className="w-12 h-12" style={{ color: "#ef4444" }} />
            <div>
              <p
                className="text-lg sm:text-xl font-semibold"
                style={{ color: "#ef4444" }}
              >
                Expired
              </p>
              <p
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "#ef4444" }}
              >
                {expiredContracts}
              </p>
            </div>
          </div>

          {/* Terminated */}
          <div
            className="p-6 sm:p-8 rounded-lg bg-white flex items-center gap-6 shadow-xl"
            style={{ borderLeft: "6px solid #6b7280" }} // gray
          >
            <Briefcase className="w-12 h-12" style={{ color: "#6b7280" }} />
            <div>
              <p
                className="text-lg sm:text-xl font-semibold"
                style={{ color: "#6b7280" }}
              >
                Terminated
              </p>
              <p
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "#6b7280" }}
              >
                {terminatedContracts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="flex-1 sm:flex-auto relative max-w-full sm:max-w-xs">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchContracts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => {
              setShowContractWizard(true);
              setContractStep(1);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Contract
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2 mb-4">
        {/* Contract Type Filter */}
        <select
          value={contractTypeFilter}
          onChange={(e) => setContractTypeFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="All">All Types</option>
          <option value="Employment">Employment</option>
          <option value="Service">Service</option>
          <option value="Lease">Lease</option>
          <option value="Partnership">Partnership</option>
          <option value="Other">Other</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Terminated">Terminated</option>
        </select>
      </div>

      {/* Contracts Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto bg-white rounded-lg shadow mt-6"
      >
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-2 border">Contract No.</th>
              <th className="px-4 py-2 border">Title</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Duration</th>

              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Document</th>
              <th className="px-4 py-2 border">Added By</th>
              <th className="px-4 py-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={10}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  Loading records...
                </td>
              </tr>
            ) : filteredContracts.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  No contracts found.
                </td>
              </tr>
            ) : (
              paginatedContracts.map((c, i) => (
                <motion.tr
                  key={i}
                  className="hover:bg-gray-50 whitespace-nowrap"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <td className="px-4 py-2 border">{c.contract_number}</td>
                  <td className="px-4 py-2 border">{c.title}</td>
                  <td className="px-4 py-2 border max-w-xs truncate">
                    {c.description}
                  </td>
                  <td className="px-4 py-2 border">{c.contract_type}</td>
                  <td className="px-4 py-2 border">
                    {c.start_date || c.end_date
                      ? `${
                          c.start_date
                            ? new Date(c.start_date).toLocaleDateString()
                            : "—"
                        } 
                        - 
                        ${
                          c.end_date
                            ? new Date(c.end_date).toLocaleDateString()
                            : "—"
                        }`
                      : "—"}
                  </td>
                  <td className="px-4 py-2 border">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        c.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : c.status === "Pending Approval"
                          ? "bg-yellow-100 text-yellow-700"
                          : c.status === "Expired"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">
                    {c.document_url ? (
                      <a
                        href={c.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        View / Download
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2 border">{c.admins?.name || "NA"}</td>
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button
                      onClick={() => handleEdit(c.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                      title="Edit Contract"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                      title="Delete Contract"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50 flex items-center"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`px-3 py-1 border rounded ${
              page === currentPage ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => goToPage(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="px-3 py-1 border rounded disabled:opacity-50 flex items-center"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Contract Wizard Modal */}
      <AnimatePresence>
        {showContractWizard && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContractWizard(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="w-full max-w-xs sm:max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gray-900 text-white px-4 sm:px-6 py-3 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">
                      Create Contract
                    </h3>
                    <p className="text-xs text-gray-500">3-step guided setup</p>
                  </div>
                  <button
                    className="p-2 rounded hover:text-gray-600 cursor-pointer"
                    onClick={() => setShowContractWizard(false)}
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="px-3 sm:px-6 py-4 flex-1 overflow-y-auto">
                  {/* Stepper */}
                  <div className="pb-4">
                    <ol className="flex items-center gap-2 text-xs">
                      {[1, 2, 3].map((s) => (
                        <li key={s} className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border ${
                              contractStep >= s
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-500 border-gray-300"
                            }`}
                          >
                            {contractStep > s ? (
                              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              s
                            )}
                          </span>
                          <span className="hidden sm:inline">
                            {s === 1 && "Basic Info"}
                            {s === 2 && "Dates & Status"}
                            {s === 3 && "Upload File"}
                          </span>
                          {s !== 3 && <span className="text-gray-300">—</span>}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Error Banner */}
                  {formError && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {/* Step 1 - Basic Info */}
                    {contractStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-3 sm:gap-4"
                      >
                        <label className="text-sm font-medium">
                          Contract Number
                        </label>
                        <input
                          value={contractForm.contract_number}
                          onChange={(e) =>
                            setContractForm((f) => ({
                              ...f,
                              contract_number: e.target.value,
                            }))
                          }
                          placeholder="e.g., CNT-2025-001"
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">Title</label>
                        <input
                          value={contractForm.title}
                          onChange={(e) =>
                            setContractForm((f) => ({
                              ...f,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Contract title"
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <textarea
                          value={contractForm.description}
                          onChange={(e) =>
                            setContractForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Contract description"
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">Type</label>
                        <select
                          value={contractForm.contract_type}
                          onChange={(e) =>
                            setContractForm((f) => ({
                              ...f,
                              contract_type: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="">Select type</option>
                          <option value="Employment">Employment</option>
                          <option value="Service">Service</option>
                          <option value="Lease">Lease</option>
                          <option value="Partnership">Partnership</option>
                          <option value="Other">Other</option>
                        </select>
                      </motion.div>
                    )}

                    {/* Step 2 - Dates */}
                    {contractStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-3 sm:gap-4"
                      >
                        <label className="text-sm font-medium">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={contractForm.start_date}
                          onChange={(e) =>
                            setContractForm((f) => ({
                              ...f,
                              start_date: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">End Date</label>
                        <input
                          type="date"
                          value={contractForm.end_date}
                          onChange={(e) =>
                            setContractForm((f) => ({
                              ...f,
                              end_date: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">Status</label>
                        <select
                          value={contractForm.status}
                          onChange={(e) =>
                            setContractForm((f) => ({
                              ...f,
                              status: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="Pending Approval">
                            Pending Approval
                          </option>
                          <option value="Active">Active</option>
                          <option value="Expired">Expired</option>
                          <option value="Terminated">Terminated</option>
                        </select>
                      </motion.div>
                    )}

                    {/* Step 3 - Upload File */}
                    {contractStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-3 sm:gap-4"
                      >
                        <label className="text-sm font-medium">
                          Upload Document
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Clear previous error
                            setFormError("");

                            // Upload file
                            await handleFileUpload(file);
                          }}
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        {formError && (
                          <div className="text-sm text-red-600 mt-2">
                            {formError}
                          </div>
                        )}

                        {uploadedUrl && (
                          <div className="text-sm text-green-600 mt-2">
                            File uploaded successfully!
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sticky Footer */}
                <div className="px-3 sm:px-6 py-3 border-t bg-white flex items-center justify-between gap-2">
                  <button
                    className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-gray-300 px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                    onClick={() => setContractStep((s) => Math.max(1, s - 1))}
                    disabled={contractStep === 1}
                  >
                    Back
                  </button>
                  {contractStep < 3 ? (
                    <button
                      className="inline-flex items-center gap-1 sm:gap-2 rounded-lg bg-blue-600 text-white px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                      onClick={nextContractStep}
                    >
                      Continue <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  ) : (
                    <button
                      className="inline-flex items-center gap-1 sm:gap-2 rounded-lg bg-green-600 text-white px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                      onClick={createContract}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Contract"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 text-white px-6 py-4">
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>

            <div className="p-6">
              <p className="mb-4 text-gray-700">
                Are you sure you want to delete this contract?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!deleteId) return;
                    setDeleting(true);

                    // Find the contract to get its file URL
                    const contract = contracts.find((c) => c.id === deleteId);
                    await deleteContract(deleteId, contract?.document_url);

                    setDeleting(false);
                    setDeleteId(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-white cursor-pointer ${
                    deleting
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  } transition`}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
