"use client";

import React, { useState, useEffect, useMemo } from "react";
import supabase from "@/utils/Supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Info,
  Edit,
  Trash2,
  X,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  XCircle,
  Star,
} from "lucide-react";

// ---------- Types ----------
type AdminData = {
  id: number;
  name: string;
  email: string;
  role: string;
} | null;

type Visitor = {
  id: number;
  name: string;
  contact_number: string;
  purpose: string;
  visit_date: string;
  check_in: string | null;
  check_out: string | null;
  status: "Expected" | "Checked-in" | "Checked-out" | "Cancelled";
  remarks:
    | "Late"
    | "Rescheduled"
    | "VIP"
    | "Follow-up Needed"
    | "No Show"
    | null;
  logged_by: number | null; // references admins.id
  admin_name?: string; // fetched from join
};

type VisitorForm = {
  name: string;
  contact_number: string;
  purpose: string;
  visit_date: string;
  status: Visitor["status"];
  remarks: Visitor["remarks"];
};

const initialVisitorForm: VisitorForm = {
  name: "",
  contact_number: "",
  purpose: "",
  visit_date: "",
  status: "Expected",
  remarks: null,
};

// ---------- Badge ----------
const Badge = ({ text }: { text: string }) => {
  const colors: Record<string, string> = {
    Expected: "bg-yellow-100 text-yellow-800",
    "Checked-in": "bg-green-100 text-green-800",
    "Checked-out": "bg-blue-100 text-blue-800",
    Cancelled: "bg-red-100 text-red-800",
    Late: "bg-orange-100 text-orange-800",
    Rescheduled: "bg-purple-100 text-purple-800",
    VIP: "bg-pink-100 text-pink-800",
    "Follow-up Needed": "bg-indigo-100 text-indigo-800",
    "No Show": "bg-gray-200 text-gray-800",
    default: "bg-sky-100 text-sky-800",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
        colors[text] || colors.default
      }`}
    >
      <Filter className="w-3 h-3" />
      {text}
    </span>
  );
};

// ---------- Modal ----------
const VisitorsModal = ({
  show,
  onClose,
  onSave,
  editingVisitor,
}: {
  show: boolean;
  onClose: () => void;
  onSave: (data: VisitorForm) => void;
  editingVisitor?: Visitor | null;
}) => {
  // Initial state
  const [form, setForm] = useState<VisitorForm>(initialVisitorForm);

  // Reset form whenever editingVisitor changes
  useEffect(() => {
    if (editingVisitor) {
      setForm({
        name: editingVisitor.name ?? "",
        contact_number: editingVisitor.contact_number ?? "",
        purpose: editingVisitor.purpose ?? "",
        visit_date: editingVisitor.visit_date
          ? new Date(editingVisitor.visit_date).toISOString().split("T")[0]
          : "",
        status: editingVisitor.status ?? "",
        remarks: editingVisitor.remarks ?? "", // ✅ ALWAYS string
      });
    } else {
      setForm(initialVisitorForm);
    }
  }, [editingVisitor]);

  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  const reset = () => {
    setForm(initialVisitorForm);
    setStep(1);
    setFormError(null);
    onClose();
  };

  const handleSave = () => {
    if (!form.name || !form.visit_date) {
      setFormError("Name and Visit Date are required.");
      return;
    }
    onSave(form);
    reset();
  };

  // Stepper navigation with validation
  async function nextStep() {
    setFormError(null);

    if (step === 1) {
      // Step 1: Basic Info
      if (!form.name.trim()) return setFormError("Full name is required.");
      if (!form.contact_number.trim())
        return setFormError("Contact number is required.");
      if (!/^(09\d{9}|(\+63)\d{10})$/.test(form.contact_number.trim()))
        return setFormError("Enter a valid Philippine contact number.");

      setStep(2);
    } else if (step === 2) {
      // Step 2: Visit Details
      if (!form.purpose.trim()) return setFormError("Purpose is required.");
      if (!form.visit_date) return setFormError("Visit date is required.");

      // Check if date is in the past
      const today = new Date().toISOString().split("T")[0];
      if (form.visit_date < today)
        return setFormError("Visit date cannot be in the past.");

      if (!form.status) return setFormError("Status is required.");

      setStep(3);
    } else if (step === 3) {
      // Step 3: Review (final submission validation if needed)
      if (
        !form.name.trim() ||
        !form.contact_number.trim() ||
        !form.purpose.trim()
      )
        return setFormError(
          "Please complete all required fields before review."
        );

      setStep(4);
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gray-900 text-white px-4 sm:px-6 py-3 border-b flex items-center justify-between">
                <h3 className="font-semibold text-base">
                  {editingVisitor ? "Edit Visitor" : "Add Visitor"}
                </h3>
                <button
                  className="p-2 rounded hover:text-gray-400 cursor-pointer"
                  onClick={reset}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-3 sm:px-6 py-4 flex-1 overflow-y-auto">
                {/* Stepper */}
                <div className="pb-4">
                  <ol className="flex items-center gap-2 text-xs">
                    {[1, 2, 3].map((s) => (
                      <li key={s} className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${
                            step >= s
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-500 border-gray-300"
                          }`}
                        >
                          {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                        </span>
                        <span className="hidden sm:inline">
                          {s === 1 && "Basic Info"}
                          {s === 2 && "Visit Details"}
                          {s === 3 && "Review"}
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
                  {/* Step 1: Basic Info */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2 }}
                      className="grid gap-3"
                    >
                      <label className="text-sm font-medium">Full Name</label>
                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="e.g., Juan Dela Cruz"
                        className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      />

                      <label className="text-sm font-medium">
                        Contact Number
                      </label>
                      <input
                        value={form.contact_number}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            contact_number: e.target.value,
                          }))
                        }
                        placeholder="e.g., 09123456789"
                        className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </motion.div>
                  )}

                  {/* Step 2: Visit Details */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2 }}
                      className="grid gap-3"
                    >
                      <label className="text-sm font-medium">Purpose</label>
                      <input
                        value={form.purpose}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, purpose: e.target.value }))
                        }
                        placeholder="e.g., Business Meeting"
                        className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      />

                      <label className="text-sm font-medium">Visit Date</label>
                      <input
                        type="date"
                        value={form.visit_date}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, visit_date: e.target.value }))
                        }
                        className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      />

                      <label className="text-sm font-medium">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            status: e.target.value as Visitor["status"],
                          }))
                        }
                        className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="Expected">Expected</option>
                        <option value="Checked-in">Checked-in</option>
                        <option value="Checked-out">Checked-out</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <label className="text-sm font-medium">Remarks</label>
                      <select
                        value={form.remarks ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            remarks: e.target.value
                              ? (e.target.value as Visitor["remarks"])
                              : null, // ✅ allow null
                          }))
                        }
                        className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="">—</option>
                        <option value="Late">Late</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="VIP">VIP</option>
                        <option value="Follow-up Needed">
                          Follow-up Needed
                        </option>
                        <option value="No Show">No Show</option>
                      </select>
                    </motion.div>
                  )}

                  {/* Step 3: Review */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="rounded-lg border p-4 bg-gray-50">
                        <h4 className="font-medium mb-2">Review Visitor</h4>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <dt className="text-gray-500">Name</dt>
                            <dd className="font-medium">{form.name}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Contact</dt>
                            <dd className="font-medium">
                              {form.contact_number}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Purpose</dt>
                            <dd className="font-medium">{form.purpose}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Visit Date</dt>
                            <dd className="font-medium">{form.visit_date}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Status</dt>
                            <dd className="font-medium">{form.status}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Remarks</dt>
                            <dd className="font-medium">
                              {form.remarks ?? "—"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-3 sm:px-6 py-3 border-t bg-white flex items-center justify-between gap-2">
                <button
                  className="rounded-lg border cursor-pointer border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={step === 1}
                >
                  Back
                </button>
                {step < 3 ? (
                  <button
                    className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 cursor-pointer"
                    onClick={nextStep}
                  >
                    Continue <ArrowRight className="inline w-4 h-4 ml-1" />
                  </button>
                ) : (
                  <button
                    className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm hover:bg-green-700 cursor-pointer"
                    onClick={handleSave}
                  >
                    {editingVisitor ? "Update Visitor" : "Create Visitor"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ---------- Page ----------
type VisitorsPageProps = {
  adminData: AdminData;
};

type VisitorWithAdmin = Visitor & {
  admins?: { id: number; name: string } | null;
};

const VisitorsPage: React.FC<VisitorsPageProps> = ({ adminData }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [remarksFilter, setRemarksFilter] = useState<string>("");
  const [dateFilter] = useState("");
  const [search, setSearch] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [_deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);

  // Fetch visitors + admin who logged them
  async function fetchVisitors() {
    setLoading(true);

    const { data, error } = await supabase
      .from("visitors")
      .select(`*, admins:logged_by (id, name)`)
      .order("visit_date", { ascending: false });

    if (error) {
      console.error("Error fetching visitors:", error.message);
    } else {
      const formatted: Visitor[] = ((data as VisitorWithAdmin[]) || []).map(
        (v) => ({
          id: v.id,
          name: v.name,
          contact_number: v.contact_number,
          purpose: v.purpose,
          visit_date: v.visit_date,
          check_in: v.check_in,
          check_out: v.check_out,
          status: v.status,
          remarks: v.remarks,
          logged_by: v.logged_by,
          admin_name: v.admins?.name || "—",
        })
      );
      setVisitors(formatted);
    }

    setLoading(false);
  }

  // Fetch on mount
  useEffect(() => {
    fetchVisitors();
  }, []);

  // Filtering + Search
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const statusMatch = statusFilter ? v.status === statusFilter : true;
      const remarksMatch = remarksFilter ? v.remarks === remarksFilter : true;
      const dateMatch = dateFilter
        ? new Date(v.visit_date).toISOString().split("T")[0] === dateFilter
        : true;
      const searchMatch = search
        ? v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.contact_number.includes(search) ||
          v.purpose.toLowerCase().includes(search.toLowerCase())
        : true;

      return statusMatch && remarksMatch && dateMatch && searchMatch;
    });
  }, [visitors, statusFilter, remarksFilter, dateFilter, search]);

  // Pagination
  const totalPages = Math.ceil(filteredVisitors.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredVisitors.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // handle save (add/update)
  const handleSaveVisitor = async (form: VisitorForm) => {
    try {
      if (editingVisitor) {
        // Update in Supabase
        const { error } = await supabase
          .from("visitors")
          .update({
            name: form.name,
            contact_number: form.contact_number,
            purpose: form.purpose,
            visit_date: form.visit_date,
            status: form.status,
            remarks: form.remarks,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingVisitor.id);

        if (error) throw error;
      } else {
        // Insert new visitor
        const { error } = await supabase.from("visitors").insert([
          {
            ...form,
            check_in: null,
            check_out: null,
            logged_by: adminData?.id || null,
          },
        ]);

        if (error) throw error;
      }

      // Always refresh after save
      await fetchVisitors();
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error saving visitor:", err.message);
      } else {
        console.error("Unexpected error:", err);
      }
    }
  };

  // handle delete
  const handleDeleteVisitor = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);

      const { error } = await supabase
        .from("visitors")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      // update local state
      setVisitors((prev) => prev.filter((item) => item.id !== deleteId));

      // reset modal state
      setDeleteId(null);
      setDeleteReason("");
      // handleDeleteVisitor
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error deleting visitor:", err.message);
      } else {
        console.error("Unexpected error:", err);
      }
    } finally {
      setDeleting(false);
    }
  };

  // Group counts by status and remarks
  const statusCounts = useMemo(() => {
    return {
      expected: visitors.filter((v) => v.status === "Expected").length,
      checkedIn: visitors.filter((v) => v.status === "Checked-in").length,
      checkedOut: visitors.filter((v) => v.status === "Checked-out").length,
      cancelled: visitors.filter((v) => v.status === "Cancelled").length,
    };
  }, [visitors]);

  const remarksCounts = useMemo(() => {
    return {
      vip: visitors.filter((v) => v.remarks === "VIP").length,
      late: visitors.filter((v) => v.remarks === "Late").length,
    };
  }, [visitors]);

  return (
    <div className="p-6">
      <p className="text-gray-600 mb-4">
        Manage all visitor records here. You can search, filter by status or
        remarks, and review visit details such as purpose, date, and check-in or
        check-out times. You are also responsible for logging new visitors and
        keeping track of who created each record for accountability.
      </p>

      {adminData && (
        <p className="mb-4 text-sm text-gray-500">
          Logged in as: <span className="font-medium">{adminData.name}</span> (
          {adminData.role})
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {/* Expected Visitors */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Clock className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Expected</p>
            <p className="text-xl font-semibold">{statusCounts.expected}</p>
          </div>
        </div>

        {/* Checked-in Visitors */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-full">
            <LogIn className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Checked-in</p>
            <p className="text-xl font-semibold">{statusCounts.checkedIn}</p>
          </div>
        </div>

        {/* Checked-out Visitors */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <LogOut className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Checked-out</p>
            <p className="text-xl font-semibold">{statusCounts.checkedOut}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {/* Cancelled Visitors */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-full">
            <XCircle className="text-red-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="text-xl font-semibold">{statusCounts.cancelled}</p>
          </div>
        </div>

        {/* VIP Visitors */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-pink-100 rounded-full">
            <Star className="text-pink-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">VIP</p>
            <p className="text-xl font-semibold">{remarksCounts.vip}</p>
          </div>
        </div>

        {/* Late Visitors */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-full">
            <AlertCircle className="text-orange-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Late</p>
            <p className="text-xl font-semibold">{remarksCounts.late}</p>
          </div>
        </div>
      </div>

      {/* Search and Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        {/* Leftside Search */}
        <div className="flex-1 sm:flex-auto relative max-w-full sm:max-w-xs">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search visitors..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        {/* Rightside Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchVisitors}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={() => {
              setEditingVisitor(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Visitor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2 mb-4">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="Expected">Expected</option>
          <option value="Checked-in">Checked-in</option>
          <option value="Checked-out">Checked-out</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Remarks Filter */}
        <select
          value={remarksFilter}
          onChange={(e) => {
            setRemarksFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="">All Remarks</option>
          <option value="Late">Late</option>
          <option value="Rescheduled">Rescheduled</option>
          <option value="VIP">VIP</option>
          <option value="Follow-up Needed">Follow-up Needed</option>
          <option value="No Show">No Show</option>
        </select>

        {/* Date Filter */}
        <input
          type="date"
          onChange={(e) => {
            const dateValue = e.target.value;
            setVisitors((prev) =>
              prev.filter((v) => v.visit_date.startsWith(dateValue))
            );
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 cursor-pointer"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Contact</th>
              <th className="px-4 py-2 border">Purpose</th>
              <th className="px-4 py-2 border">Visit Date</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Remarks</th>
              <th className="px-4 py-2 border">Logged By</th>
              <th className="px-4 py-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  Loading visitors...
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Info className="w-5 h-5" />
                    No visitors found.
                  </div>
                </td>
              </tr>
            ) : (
              currentData.map((v, idx) => (
                <motion.tr
                  key={v.id}
                  className="hover:bg-gray-50"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <td className="px-4 py-2 border text-center">
                    {startIndex + idx + 1}
                  </td>
                  <td className="px-4 py-2 border">{v.name}</td>
                  <td className="px-4 py-2 border">{v.contact_number}</td>
                  <td className="px-4 py-2 border">
                    <Badge text={v.purpose} type="purpose" />
                  </td>
                  <td className="px-4 py-2 border">{v.visit_date}</td>
                  <td className="px-4 py-2 border">
                    <Badge text={v.status} type="status" />
                  </td>
                  <td className="px-4 py-2 border">
                    {v.remarks ? (
                      <Badge text={v.remarks} type="remarks" />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2 border">{v.admin_name}</td>
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingVisitor(v);
                        setShowModal(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => setDeleteId(v.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      {/* Modal */}
      <VisitorsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveVisitor}
        editingVisitor={editingVisitor}
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 text-white px-6 py-4">
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>

            <div className="p-6">
              <p className="mb-6 text-gray-700">
                Are you sure you want to permanently delete this visitor? This
                action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVisitor}
                  disabled={deleting}
                  className={`px-4 py-2 rounded-lg transition text-sm cursor-pointer ${
                    deleting
                      ? "bg-red-300 text-white opacity-50 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorsPage;
