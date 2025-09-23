"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  X,
  RefreshCw,
  Search,
  Edit,
  Trash,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Shield,
  Archive,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import supabase from "@/utils/Supabase";

type AdminData = {
  id: number;
  name: string;
  email: string;
  role: string;
} | null;

type Case = {
  id: number;
  case_number: string;
  title: string;
  case_type: string;
  status: string;
  filed_date: string;
  closed_date?: string;
  user_id?: number;
  assigned_admin?: number;
  userName?: string;
  adminName?: string;
  document_url?: string;
};

type CasesPageProps = {
  adminData: AdminData;
};

type ApprovedUser = {
  id: number;
  name: string;
};

export default function CasesPage({ adminData }: CasesPageProps) {
  type CaseForm = {
    case_number: string;
    title: string;
    description: string;
    case_type: string;
    filed_date: string;
    closed_date: string;
    status: string;
    document_url: string;
    user_id: number | null;
  };

  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);

  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCaseWizard, setShowCaseWizard] = useState<boolean>(false);
  const [caseStep, setCaseStep] = useState<number>(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);

  // Form state with user_id as null
  const [caseForm, setCaseForm] = useState<CaseForm>({
    case_number: "",
    title: "",
    description: "",
    case_type: "",
    filed_date: "",
    closed_date: "",
    status: "Open",
    document_url: "",
    user_id: null, // ✅ default null
  });

  // Approved Users/Clients
  useEffect(() => {
    const fetchApprovedUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, first_name, last_name")
        .eq("approval_status", "Approved");

      if (error) {
        console.error("Error fetching users:", error.message);
        return;
      }

      // ✅ Map to "id + full name"
      const mappedUsers =
        data?.map((u) => ({
          id: u.id,
          name: `${u.first_name} ${u.last_name}`,
        })) || [];

      setApprovedUsers(mappedUsers);
    };

    fetchApprovedUsers();
  }, []);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [caseTypeFilter, setCaseTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch Cases
  const fetchCases = async () => {
    setLoading(true);

    const { data: casesData, error: casesError } = await supabase
      .from("cases")
      .select("*");

    if (casesError) {
      console.error("Error fetching cases:", casesError.message || casesError);
      setLoading(false);
      return;
    }

    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, first_name, last_name");

    if (usersError) {
      console.error("Error fetching users:", usersError.message);
    }

    const usersMap = Object.fromEntries(
      usersData?.map((u) => [u.id, `${u.first_name} ${u.last_name}`]) || []
    );

    const { data: adminsData } = await supabase
      .from("admins")
      .select("id, name");
    const adminsMap = Object.fromEntries(
      adminsData?.map((a) => [a.id, a.name]) || []
    );

    const casesWithNames =
      casesData?.map((c) => ({
        ...c,
        userName: usersMap[c.user_id] || "-",
        adminName: adminsMap[c.assigned_admin] || "-",
      })) || [];

    setCases(casesWithNames);
    setLoading(false);
  };

  // Delete Case
  const deleteCase = async (id: number) => {
    const { error } = await supabase.from("cases").delete().eq("id", id);
    if (error) console.error(error);
    else fetchCases();
  };

  // Edit handler
  const handleEdit = (id: number) => {
    const selectedCase = cases.find((c) => c.id === id);
    if (!selectedCase) return;

    setCaseForm({
      case_number: selectedCase.case_number,
      title: selectedCase.title,
      description: selectedCase.description,
      case_type: selectedCase.case_type,
      filed_date: selectedCase.filed_date,
      closed_date: selectedCase.closed_date,
      status: selectedCase.status,
      document_url: selectedCase.document_url || "",
      user_id: selectedCase.user_id ?? null,
    });

    setEditingId(selectedCase.id); // ✅ mark as editing
    setCaseStep(1);
    setShowCaseWizard(true);
  };

  // Create handler
  const saveCase = async () => {
    if (!adminData) return setFormError("You must be logged in as admin.");
    if (!caseForm.document_url) return setFormError("Upload a file first.");

    setSaving(true);

    try {
      if (editingId) {
        // Update existing case
        const { error } = await supabase
          .from("cases")
          .update({
            ...caseForm,
            assigned_admin: adminData.id,
            user_id: caseForm.user_id ?? null,
          })
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // Create new case
        const { error } = await supabase.from("cases").insert([
          {
            ...caseForm,
            assigned_admin: adminData.id,
            user_id: caseForm.user_id ?? null,
          },
        ]);

        if (error) throw error;
      }

      fetchCases();
      setShowCaseWizard(false);
      setCaseStep(1);
      setEditingId(null); // reset edit mode

      // reset form after save
      setCaseForm({
        case_number: "",
        title: "",
        description: "",
        case_type: "",
        filed_date: "",
        closed_date: "",
        status: "Open",
        document_url: "",
        user_id: null,
      });

      setUploadedUrl("");
    } catch (err) {
      console.error(err);
      setFormError("Failed to save case.");
    } finally {
      setSaving(false);
    }
  };

  // Stepper Error Handler
  async function nextCaseStep() {
    setFormError(null);

    if (caseStep === 1) {
      if (!caseForm.case_number.trim())
        return setFormError("Case number is required.");
      if (!caseForm.title.trim())
        return setFormError("Case title is required.");
      if (!caseForm.description.trim())
        return setFormError("Description is required.");
      if (!caseForm.case_type.trim())
        return setFormError("Case type is required.");
      // Require selecting a client
      if (!caseForm.user_id)
        return setFormError("You must select a client for this case.");

      setCaseStep(2);
    } else if (caseStep === 2) {
      if (!caseForm.filed_date) return setFormError("Filed date is required.");
      if (
        caseForm.closed_date &&
        new Date(caseForm.closed_date) < new Date(caseForm.filed_date)
      ) {
        return setFormError("Closed date cannot be before filed date.");
      }

      setCaseStep(3);
    } else if (caseStep === 3) {
      if (!caseForm.document_url)
        return setFormError("You must upload a case document.");

      // If creating new, check duplicates
      if (!editingId) {
        const { data: existing, error } = await supabase
          .from("cases")
          .select("id")
          .eq("case_number", caseForm.case_number.trim())
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          return setFormError("Unable to validate case number. Try again.");
        }

        if (existing) {
          return setFormError("This case number already exists.");
        }
      }

      saveCase(); // ✅ now handles both
    }
  }

  useEffect(() => {
    fetchCases();
  }, []);

  // File handler
  const handleFileUpload = async (file?: File | null) => {
    try {
      setFormError(null);

      // Check if a file was provided
      if (!file) {
        setFormError("Please select a file before uploading.");
        return;
      }

      const filePath = `cases/${Date.now()}_${file.name}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("legal")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error(uploadError);
        setFormError("Failed to upload file. Please try again.");
        return;
      }

      // Get public URL
      const { data } = supabase.storage.from("legal").getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) {
        setFormError("Failed to get public URL.");
        return;
      }

      // ✅ Save URL
      setUploadedUrl(publicUrl);
      setCaseForm((prev) => ({
        ...prev,
        document_url: publicUrl,
      }));
    } catch (err) {
      console.error(err);
      setFormError("An unexpected error occurred.");
    }
  };

  // Search & Filters
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      caseTypeFilter === "All" || c.case_type === caseTypeFilter;
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Compute total pages
  const totalPages = Math.max(Math.ceil(filteredCases.length / pageSize), 1);

  // Reset page if filter changes and current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  // Slice for pagination
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  // Pagination navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // For pie chart
  const allStatuses = ["Open", "Closed", "Pending", "Dismissed"];

  const caseStatusCounts = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Fill missing statuses with 0
  const caseStatusData = allStatuses.map((status) => ({
    name: status,
    value: caseStatusCounts[status] || 0,
  }));

  const caseStatusColors: Record<string, string> = {
    Open: "#3b82f6", // blue
    Closed: "#10b981", // green
    Pending: "#f59e0b", // yellow
    Dismissed: "#ef4444", // red
  };

  // Fixed case types for cards
  const allCaseTypes = ["Civil", "Criminal", "Administrative", "Other"];

  // Fixed colors for each case type
  const caseTypeColors: Record<string, string> = {
    Civil: "#3b82f6", // blue
    Criminal: "#ef4444", // red
    Administrative: "#f59e0b", // amber
    Other: "#6b7280", // gray
  };

  const caseTypeCounts = cases.reduce((acc, c) => {
    acc[c.case_type] = (acc[c.case_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Fill missing case types with 0
  const caseTypeData = allCaseTypes.map((type) => ({
    type,
    count: caseTypeCounts[type] || 0,
  }));

  return (
    <div className="p-6">
      <div>
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Leftside Pie Chart by Status */}
          <div className="bg-gray-900 text-white shadow-lg rounded-xl p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-4">Cases by Status</h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={caseStatusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {caseStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        caseStatusColors[entry.name] ||
                        `hsl(${index * 60}, 70%, 50%)`
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937", // dark gray
                    borderRadius: "0.5rem",
                    color: "#ffffff",
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-3 w-full">
              {caseStatusData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor:
                        caseStatusColors[entry.name] || "#9ca3af",
                    }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rightside Cards by Case Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {caseTypeData.map((entry) => {
              // Choose icon based on type
              const iconMap: Record<string, any> = {
                Civil: FileText,
                Criminal: Gavel,
                Administrative: Shield,
                Other: Archive,
              };
              const Icon = iconMap[entry.type] || FileText;

              // Get border color (solid color, use first color of gradient if needed)
              const borderColor = caseTypeColors[entry.type]
                ? caseTypeColors[entry.type]
                    .split(",")[0]
                    .replace("linear-gradient(to right, ", "")
                : "#1f2937";

              return (
                <div
                  key={entry.type}
                  className="p-6 sm:p-8 rounded-lg bg-white flex items-center gap-6 shadow-xl"
                  style={{
                    borderLeft: `6px solid ${borderColor}`,
                  }}
                >
                  <Icon className="w-12 h-12" style={{ color: borderColor }} />
                  <div>
                    <p
                      className="text-lg sm:text-xl font-semibold"
                      style={{ color: borderColor }}
                    >
                      {entry.type}
                    </p>
                    <p
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ color: borderColor }}
                    >
                      {entry.count}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search and Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="flex-1 sm:flex-auto relative max-w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchCases}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => {
              setShowCaseWizard(true);
              setCaseStep(1);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Case
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2 mb-4">
        <select
          value={caseTypeFilter}
          onChange={(e) => setCaseTypeFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="All">All Types</option>
          <option value="Civil">Civil</option>
          <option value="Criminal">Criminal</option>
          <option value="Administrative">Administrative</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
          <option value="Appealed">Appealed</option>
          <option value="Dismissed">Dismissed</option>
        </select>
      </div>

      {/* Cases Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto bg-white rounded-lg shadow mt-4"
      >
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-2 border">Case Number</th>
              <th className="px-4 py-2 border">Title</th>
              <th className="px-4 py-2 border">Case Type</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Client</th>
              <th className="px-4 py-2 border">Assigned Admin</th>
              <th className="px-4 py-2 border">Filed Date</th>
              <th className="px-4 py-2 border">Closed Date</th>
              <th className="px-4 py-2 border">Document</th>
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
            ) : paginatedCases.length > 0 ? (
              paginatedCases.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{c.case_number}</td>
                  <td className="px-4 py-2 border">{c.title}</td>
                  <td className="px-4 py-2 border">{c.case_type}</td>
                  <td className="px-4 py-2 border">{c.status}</td>
                  <td className="px-4 py-2 border">{c.userName || "-"}</td>
                  <td className="px-4 py-2 border">{c.adminName || "-"}</td>
                  <td className="px-4 py-2 border">{c.filed_date}</td>
                  <td className="px-4 py-2 border">{c.closed_date || "-"}</td>
                  <td className="px-4 py-2 border text-center">
                    {c.document_url ? (
                      <a
                        href={c.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View / Download
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button
                      onClick={() => handleEdit(c.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                      title="Edit Case"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                      title="Delete Case"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  No records found.
                </td>
              </tr>
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

      {/* Case Wizard Modal */}
      <AnimatePresence>
        {showCaseWizard && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCaseWizard(false)}
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
                      Create Case
                    </h3>
                    <p className="text-xs text-gray-400">3-step guided setup</p>
                  </div>
                  <button
                    className="p-2 rounded hover:text-gray-600 cursor-pointer"
                    onClick={() => setShowCaseWizard(false)}
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
                              caseStep >= s
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-500 border-gray-300"
                            }`}
                          >
                            {caseStep > s ? (
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
                    {caseStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-3 sm:gap-4"
                      >
                        <label className="text-sm font-medium">
                          Case Number
                        </label>
                        <input
                          value={caseForm.case_number}
                          onChange={(e) =>
                            setCaseForm((f) => ({
                              ...f,
                              case_number: e.target.value,
                            }))
                          }
                          placeholder="e.g., CASE-2025-01"
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">Title</label>
                        <input
                          value={caseForm.title}
                          onChange={(e) =>
                            setCaseForm((f) => ({
                              ...f,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Case title"
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <textarea
                          value={caseForm.description}
                          onChange={(e) =>
                            setCaseForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Case description"
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">Case Type</label>
                        <select
                          value={caseForm.case_type}
                          onChange={(e) =>
                            setCaseForm((f) => ({
                              ...f,
                              case_type: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="">Select type</option>
                          <option value="Civil">Civil</option>
                          <option value="Criminal">Criminal</option>
                          <option value="Administrative">Administrative</option>
                          <option value="Other">Other</option>
                        </select>

                        <label className="text-sm font-medium">Client</label>
                        <select
                          value={
                            caseForm.user_id !== undefined
                              ? String(caseForm.user_id)
                              : ""
                          }
                          onChange={(e) =>
                            setCaseForm((f) => ({
                              ...f,
                              user_id: e.target.value
                                ? Number(e.target.value)
                                : null,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="">Select a client</option>
                          {approvedUsers.map((u) => (
                            <option key={u.id} value={String(u.id)}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </motion.div>
                    )}

                    {/* Step 2 - Dates & Status */}
                    {caseStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-3 sm:gap-4"
                      >
                        <label className="text-sm font-medium">
                          Filed Date
                        </label>
                        <input
                          type="date"
                          value={caseForm.filed_date}
                          onChange={(e) =>
                            setCaseForm((f) => ({
                              ...f,
                              filed_date: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">
                          Closed Date
                        </label>
                        <input
                          type="date"
                          value={caseForm.closed_date}
                          onChange={(e) =>
                            setCaseForm((f) => ({
                              ...f,
                              closed_date: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">Status</label>
                        <select
                          value={caseForm.status}
                          onChange={(e) =>
                            setCaseForm((f) => ({
                              ...f,
                              status: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                          <option value="Appealed">Appealed</option>
                          <option value="Dismissed">Dismissed</option>
                        </select>
                      </motion.div>
                    )}

                    {/* Step 3 - Upload File */}
                    {caseStep === 3 && (
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

                            // Check file size (max 1GB)
                            const maxSize = 1024 * 1024 * 1024;
                            if (file.size > maxSize) {
                              setFormError("File size exceeds 1GB limit.");
                              e.target.value = ""; // reset input
                              return;
                            }

                            // Check file type
                            const allowedTypes = [
                              "application/pdf",
                              "application/msword",
                              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                              "application/vnd.ms-excel",
                              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            ];
                            if (!allowedTypes.includes(file.type)) {
                              setFormError(
                                "Invalid file type. Please upload a PDF, Word, or Excel file."
                              );
                              e.target.value = ""; // reset input
                              return;
                            }

                            setFormError(null);
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
                    onClick={() => setCaseStep((s) => Math.max(1, s - 1))}
                    disabled={caseStep === 1}
                  >
                    Back
                  </button>
                  {caseStep < 3 ? (
                    <button
                      className="inline-flex items-center gap-1 sm:gap-2 rounded-lg bg-blue-600 text-white px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                      onClick={nextCaseStep}
                    >
                      Continue <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  ) : (
                    <button
                      className="inline-flex items-center gap-1 sm:gap-2 rounded-lg bg-green-600 text-white px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                      onClick={saveCase}
                      disabled={saving}
                    >
                      {saving
                        ? editingId
                          ? "Updating..."
                          : "Saving..."
                        : editingId
                        ? "Update Case"
                        : "Save Case"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 text-white px-6 py-4">
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>

            <div className="p-6">
              <p className="mb-4 text-gray-700">
                Are you sure you want to delete this case?
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

                    await deleteCase(deleteId);

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
