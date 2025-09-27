"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import supabase from "@/utils/Supabase";
import { PostgrestError } from "@supabase/supabase-js"; // add this at the top

type AdminData = {
  id: number;
  name: string;
  email: string;
  role: string;
} | null;

type ComplianceRecord = {
  id: number;
  compliance_number: string;
  category: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
  user_id?: number;
  user?: { id: number; first_name: string; last_name: string; email: string };
  admin?: { id: number; name: string; email: string };
};

type SupabaseComplianceRecord = {
  id: number;
  compliance_number: string;
  category: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  admin?: { id: number; name: string; email: string } | null;
  user_id?: number;
};

type CompliancePageProps = {
  adminData: AdminData;
};

export default function CompliancePage({ adminData }: CompliancePageProps) {
  const [compliance, setCompliance] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<
    { id: number; first_name: string; last_name: string; email: string }[]
  >([]);
  // Modal state
  const [showComplianceWizard, setShowComplianceWizard] = useState(false);
  const [complianceStep, setComplianceStep] = useState(1);

  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit State
  const [editId, setEditId] = useState<number | null>(null);

  // Filters / Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Stepper error handler
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Compliance form
  const [complianceForm, setComplianceForm] = useState({
    compliance_number: "",
    title: "",
    description: "",
    category: "",
    due_date: "",
    status: "Pending",
    document_url: "",
    user_id: undefined as number | undefined,
  });

  // Fetch Client names
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email");

    if (error) {
      console.error("Error fetching users:", error.message);
    } else if (data) {
      setUsers(data);
    }
  };

  // For previewing uploaded file
  const [uploadedUrl, setUploadedUrl] = useState("");

  // Fetch Compliance
  const fetchCompliance = async () => {
    setLoading(true);

    const response = await supabase.from("compliance_records").select(`
      id,
      compliance_number,
      category,
      title,
      description,
      due_date,
      status,
      document_url,
      created_at,
      updated_at,
      user:user_id (
        id,
        first_name,
        last_name,
        email
      ),
      admin:admin_id (
        id,
        name,
        email
      )
    `);

    const data = response.data as (SupabaseComplianceRecord | null)[] | null;
    const error: PostgrestError | null = response.error;

    if (error) {
      console.error("Error fetching compliance:", error);
    } else if (data) {
      const records = data.filter(
        (r): r is SupabaseComplianceRecord => r !== null
      );

      const formattedData: ComplianceRecord[] = records.map((record) => ({
        id: record.id,
        compliance_number: record.compliance_number,
        category: record.category,
        title: record.title,
        description: record.description,
        due_date: record.due_date,
        status: record.status,
        document_url: record.document_url ?? "",
        created_at: record.created_at,
        updated_at: record.updated_at,
        user: record.user ?? undefined,
        admin: record.admin ?? undefined,
        user_id: record.user?.id ?? record.user_id,
      }));

      setCompliance(formattedData);
    }

    setLoading(false);
  };

  // Delete Compliance and its file
  const deleteCompliance = async (id: number, fileUrl?: string) => {
    try {
      if (fileUrl) {
        // Extract path relative to bucket
        const match = fileUrl.match(/compliance\/(.+)$/);
        const filePath = match ? match[1] : null;

        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("compliance")
            .remove([filePath]);

          if (storageError) {
            console.error("Failed to delete file:", storageError.message);
          } else {
            console.log("File deleted successfully");
          }
        }
      }

      // Delete compliance record
      const { error: dbError } = await supabase
        .from("compliance_records")
        .delete()
        .eq("id", id);

      if (dbError) {
        console.error("Failed to delete compliance:", dbError.message);
      } else {
        console.log("Compliance deleted successfully");
        fetchCompliance(); // refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompliance();
    fetchUsers();
  }, []);

  // Stepper modal validations
  async function nextComplianceStep() {
    setFormError(null);

    if (complianceStep === 1) {
      if (!complianceForm.compliance_number.trim())
        return setFormError("Compliance number is required.");

      if (!/^[A-Za-z0-9\-_]+$/.test(complianceForm.compliance_number.trim()))
        return setFormError(
          "Compliance number can only contain letters, numbers, dashes, or underscores."
        );

      if (!complianceForm.user_id)
        return setFormError("You must assign this compliance to a user.");

      if (!complianceForm.title.trim())
        return setFormError("Compliance title is required.");

      if (complianceForm.title.trim().length < 3)
        return setFormError("Compliance title must be at least 3 characters.");

      if (!complianceForm.description.trim())
        return setFormError("Description is required.");

      if (complianceForm.description.trim().length < 10)
        return setFormError("Description must be at least 10 characters long.");

      if (!complianceForm.category.trim())
        return setFormError("Category is required.");

      setComplianceStep(2);
    } else if (complianceStep === 2) {
      if (!complianceForm.due_date)
        return setFormError("Due date is required.");

      const dueDate = new Date(complianceForm.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(dueDate.getTime()))
        return setFormError("Invalid due date format.");

      if (dueDate < today)
        return setFormError("Due date cannot be in the past.");

      if (!complianceForm.status) return setFormError("Status is required.");

      setComplianceStep(3);
    } else if (complianceStep === 3) {
      if (!complianceForm.document_url)
        return setFormError("You must upload a compliance document.");

      // Check if compliance number already exists
      const { data: existing, error } = await supabase
        .from("compliance_records")
        .select("id")
        .eq("compliance_number", complianceForm.compliance_number.trim())
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Supabase validation error:", error);
        return setFormError("Unable to validate compliance number. Try again.");
      }

      if (existing) {
        return setFormError("This compliance number already exists.");
      }

      // All good → save
      createCompliance();
    }
  }

  // Create Compliance
  const createCompliance = async () => {
    if (!adminData) return setFormError("You must be logged in as admin.");
    if (!complianceForm.document_url)
      return setFormError("Upload a file first.");

    setSaving(true);

    const payload = {
      ...complianceForm,
      status: complianceForm.status || "Pending",
      admin_id: adminData.id,
    };

    const { error } = await supabase
      .from("compliance_records")
      .insert([payload]);

    if (error) {
      console.error("Insert error:", error);
      setFormError("Failed to create compliance record.");
      setSaving(false);
      return;
    }

    fetchCompliance();
    setShowComplianceWizard(false);
    resetComplianceForm();
    setSaving(false);
  };

  // Upload file
  const handleFileUpload = async (file: File) => {
    try {
      const filePath = `compliance/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("legal") // bucket name
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setFormError("Failed to upload file. Please try again.");
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("legal")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        setFormError("Failed to get public URL.");
        return;
      }

      // Clear errors because everything went fine
      setFormError(null);

      // Save uploaded URL in state
      setUploadedUrl(publicUrlData.publicUrl);
      setComplianceForm((prev) => ({
        ...prev,
        document_url: publicUrlData.publicUrl,
      }));
    } catch (err) {
      console.error("Unexpected error:", err);
      setFormError("An unexpected error occurred.");
    }
  };

  // Edit handler
  const handleEdit = (id: number) => {
    const record = compliance.find((c) => c.id === id);
    if (!record) return;

    setComplianceForm({
      compliance_number: record.compliance_number,
      title: record.title,
      description: record.description,
      category: record.category,
      due_date: record.due_date,
      status: record.status,
      document_url: record.document_url || "",
      user_id: record.user?.id || record.user_id,
    });

    setUploadedUrl(record.document_url || "");
    setComplianceStep(1);
    setShowComplianceWizard(true);
    setEditId(id);
  };

  // Save updated compliance and status
  const updateCompliance = async (id: number) => {
    if (!adminData) return setFormError("You must be logged in as admin.");

    setSaving(true);

    const payload = {
      ...complianceForm,
      updated_at: new Date().toISOString(), // set updated_at
      admin_id: adminData.id,
    };

    const { error } = await supabase
      .from("compliance_records")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      setFormError("Failed to update compliance record.");
      setSaving(false);
      return;
    }

    fetchCompliance(); // refresh the table
    setShowComplianceWizard(false);
    resetComplianceForm();
    setSaving(false);
  };

  // ResetForm
  const resetComplianceForm = () => {
    setComplianceForm({
      compliance_number: "",
      title: "",
      description: "",
      category: "",
      due_date: "",
      status: "Pending",
      document_url: "",
      user_id: undefined,
    });
    setComplianceStep(1);
    setUploadedUrl("");
    setFormError(null);
  };

  // Search + Filters
  const filteredCompliance = compliance.filter((c) => {
    const matchesSearch =
      c.compliance_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || c.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.max(
    Math.ceil(filteredCompliance.length / pageSize),
    1
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginatedCompliance = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCompliance.slice(start, start + pageSize);
  }, [filteredCompliance, currentPage, pageSize]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Statuses
  const allComplianceStatuses = [
    "Pending",
    "Submitted",
    "Approved",
    "Rejected",
    "Overdue",
  ];

  const complianceStatusCounts = compliance.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const complianceStatusData = allComplianceStatuses.map((status) => ({
    name: status,
    value: complianceStatusCounts[status] || 0,
  }));

  const complianceStatusColors: Record<string, string> = {
    Pending: "#f59e0b", // yellow
    Submitted: "#3b82f6", // blue
    Approved: "#22c55e", // green
    Rejected: "#ef4444", // red
    Overdue: "#ef4444", // red
  };

  // For cards
  const pendingCompliance = complianceStatusCounts["Pending"] || 0;
  const submittedCompliance = complianceStatusCounts["Submitted"] || 0;
  const approvedCompliance = complianceStatusCounts["Approved"] || 0;
  const rejectedCompliance = complianceStatusCounts["Rejected"] || 0;
  const overdueCompliance = complianceStatusCounts["Overdue"] || 0;

  return (
    <div className="p-6">
      {/* Pie Chart and Compliance Status Cards */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Pie Chart */}
        <div className="bg-gray-900 text-white shadow-lg rounded-xl p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Compliance by Status</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={complianceStatusData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {complianceStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      complianceStatusColors[
                        entry.name as keyof typeof complianceStatusColors
                      ]
                    }
                  />
                ))}
              </Pie>

              {/* Tooltip */}
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
            {complianceStatusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor:
                      complianceStatusColors[
                        entry.name as keyof typeof complianceStatusColors
                      ],
                  }}
                />
                <span className="text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Pending */}
          <div
            className="p-6 sm:p-8 rounded-lg bg-white flex items-center gap-6 shadow-xl"
            style={{ borderLeft: "6px solid #f59e0b" }}
          >
            <AlertCircle className="w-12 h-12" style={{ color: "#f59e0b" }} />
            <div>
              <p
                className="text-lg sm:text-xl font-semibold"
                style={{ color: "#f59e0b" }}
              >
                Pending
              </p>
              <p
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "#f59e0b" }}
              >
                {pendingCompliance}
              </p>
            </div>
          </div>

          {/* Submitted */}
          <div
            className="p-6 sm:p-8 rounded-lg bg-white flex items-center gap-6 shadow-xl"
            style={{ borderLeft: "6px solid #3b82f6" }}
          >
            <ArrowRight className="w-12 h-12" style={{ color: "#3b82f6" }} />
            <div>
              <p
                className="text-lg sm:text-xl font-semibold"
                style={{ color: "#3b82f6" }}
              >
                Submitted
              </p>
              <p
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "#3b82f6" }}
              >
                {submittedCompliance}
              </p>
            </div>
          </div>

          {/* Approved */}
          <div
            className="p-6 sm:p-8 rounded-lg bg-white flex items-center gap-6 shadow-xl"
            style={{ borderLeft: "6px solid #22c55e" }}
          >
            <CheckCircle2 className="w-12 h-12" style={{ color: "#22c55e" }} />
            <div>
              <p
                className="text-lg sm:text-xl font-semibold"
                style={{ color: "#22c55e" }}
              >
                Approved
              </p>
              <p
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "#22c55e" }}
              >
                {approvedCompliance}
              </p>
            </div>
          </div>

          {/* Rejected / Overdue */}
          <div
            className="p-6 sm:p-8 rounded-lg bg-white flex items-center gap-6 shadow-xl"
            style={{ borderLeft: "6px solid #ef4444" }}
          >
            <X className="w-12 h-12" style={{ color: "#ef4444" }} />
            <div>
              <p
                className="text-lg sm:text-xl font-semibold"
                style={{ color: "#ef4444" }}
              >
                Rejected / Overdue
              </p>
              <p
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "#ef4444" }}
              >
                {rejectedCompliance + overdueCompliance}
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
            placeholder="Search compliance..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchCompliance}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => {
              setEditId(null);
              setShowComplianceWizard(true);
              setComplianceStep(1);
              resetComplianceForm();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Compliance
          </button>
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2 mb-4">
        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="All">All Categories</option>
          <option value="Regulatory">Regulatory</option>
          <option value="Financial">Financial</option>
          <option value="Operational">Operational</option>
          <option value="Other">Other</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>
      {/* Compliance Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto bg-white rounded-lg shadow mt-4"
      >
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-2 border">Compliance No.</th>
              <th className="px-4 py-2 border">Title</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Client</th>
              <th className="px-4 py-2 border">Assigned Admin</th>
              <th className="px-4 py-2 border">Due Date</th>
              <th className="px-4 py-2 border">Document</th>
              <th className="px-4 py-2 border">Created At</th>
              <th className="px-4 py-2 border">Updated At</th>
              <th className="px-4 py-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={13}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  Loading records...
                </td>
              </tr>
            ) : paginatedCompliance.length > 0 ? (
              paginatedCompliance.map((c, idx) => (
                <tr
                  key={c.id}
                  className={`hover:bg-gray-50 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-2 border">{c.compliance_number}</td>
                  <td className="px-4 py-2 border">{c.title}</td>
                  <td className="px-4 py-2 border max-w-xs truncate">
                    {c.description}
                  </td>
                  <td className="px-4 py-2 border">{c.category}</td>
                  <td className="px-4 py-2 border">{c.status}</td>
                  <td
                    className="px-4 py-2 border max-w-xs truncate"
                    title={
                      c.user
                        ? `${c.user.first_name} ${c.user.last_name} (${c.user.email})`
                        : ""
                    }
                  >
                    {c.user ? `${c.user.first_name} ${c.user.last_name}` : "-"}
                  </td>
                  <td
                    className="px-4 py-2 border max-w-xs truncate"
                    title={c.admin ? `${c.admin.name} (${c.admin.email})` : ""}
                  >
                    {c.admin ? c.admin.name : "-"}
                  </td>

                  <td className="px-4 py-2 border">
                    {c.due_date
                      ? new Date(c.due_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border text-center">
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
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border">
                    {c.status === "Pending"
                      ? "No actions"
                      : c.updated_at
                      ? new Date(c.updated_at).toLocaleString()
                      : "No actions"}
                  </td>
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button
                      onClick={() => handleEdit(c.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={13}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  No compliance records found.
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

      {/* Compliance Wizard Modal */}
      <AnimatePresence>
        {showComplianceWizard && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowComplianceWizard(false);
                resetComplianceForm();
              }}
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
                      {editId
                        ? "Edit Compliance Record"
                        : "Create Compliance Record"}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {editId
                        ? "Update existing compliance details"
                        : "3-step guided setup"}
                    </p>
                  </div>
                  <button
                    className="p-2 rounded hover:text-gray-300 cursor-pointer"
                    onClick={() => {
                      setShowComplianceWizard(false);
                      resetComplianceForm();
                    }}
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
                              complianceStep >= s
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-500 border-gray-300"
                            }`}
                          >
                            {complianceStep > s ? (
                              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              s
                            )}
                          </span>
                          <span className="hidden sm:inline">
                            {s === 1 && "Details"}
                            {s === 2 && "Due Date & Status"}
                            {s === 3 && "Upload Document"}
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
                    {/* Step 1 - Details */}
                    {complianceStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-3 sm:gap-4"
                      >
                        <label className="text-sm font-medium">
                          Compliance Number
                        </label>
                        <input
                          value={complianceForm.compliance_number}
                          onChange={(e) =>
                            setComplianceForm((f) => ({
                              ...f,
                              compliance_number: e.target.value,
                            }))
                          }
                          placeholder="e.g., CMP-2025-001"
                          className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-600"
                        />
                        <label className="text-sm font-medium">
                          Assign to User
                        </label>
                        <select
                          value={complianceForm.user_id || ""}
                          onChange={(e) =>
                            setComplianceForm((f) => ({
                              ...f,
                              user_id: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="">Unassigned</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.first_name} {u.last_name}
                            </option>
                          ))}
                        </select>

                        <label className="text-sm font-medium">Title</label>
                        <input
                          value={complianceForm.title}
                          onChange={(e) =>
                            setComplianceForm((f) => ({
                              ...f,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Compliance title"
                          className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-600"
                        />

                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <textarea
                          value={complianceForm.description}
                          onChange={(e) =>
                            setComplianceForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Compliance description"
                          className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-600"
                        />

                        <label className="text-sm font-medium">Category</label>
                        <select
                          value={complianceForm.category}
                          onChange={(e) =>
                            setComplianceForm((f) => ({
                              ...f,
                              category: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="">Select Category</option>
                          <option value="Regulatory">Regulatory</option>
                          <option value="Financial">Financial</option>
                          <option value="Operational">Operational</option>
                          <option value="Other">Other</option>
                        </select>
                      </motion.div>
                    )}

                    {/* Step 2 - Due Date & Status */}
                    {complianceStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-3 sm:gap-4"
                      >
                        <label className="text-sm font-medium">Due Date</label>
                        <input
                          type="date"
                          value={complianceForm.due_date}
                          onChange={(e) =>
                            setComplianceForm((f) => ({
                              ...f,
                              due_date: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-600"
                        />

                        <label className="text-sm font-medium">Status</label>
                        <select
                          value={complianceForm.status}
                          onChange={(e) =>
                            setComplianceForm((f) => ({
                              ...f,
                              status: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </motion.div>
                    )}

                    {/* Step 3 - Upload */}
                    {complianceStep === 3 && (
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
                          accept=".pdf,.docx,.xlsx,.jpg,.png"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleFileUpload(e.target.files[0])
                          }
                          className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-600"
                        />
                        {uploadedUrl && (
                          <a
                            href={uploadedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-sm"
                          >
                            Preview Uploaded File
                          </a>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sticky Footer */}
                <div className="px-3 sm:px-6 py-3 border-t bg-white flex items-center justify-between gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                    onClick={() => setComplianceStep((s) => Math.max(1, s - 1))}
                    disabled={complianceStep === 1}
                  >
                    Back
                  </button>
                  {complianceStep < 3 ? (
                    <button
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                      onClick={nextComplianceStep}
                    >
                      Continue <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  ) : (
                    <button
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm hover:bg-green-700 disabled:opacity-50"
                      onClick={() => {
                        if (editId) {
                          updateCompliance(editId); // update
                        } else {
                          createCompliance(); // create new
                        }
                      }}
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : editId
                        ? "Update Compliance"
                        : "Save Compliance"}
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
                Are you sure you want to delete this compliance record? This
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

                    const record = compliance.find((c) => c.id === deleteId);

                    await deleteCompliance(deleteId, record?.document_url);

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
