"use client";

import { useState, useEffect, useMemo } from "react";
import supabase from "@/utils/Supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Plus,
  X,
  Search,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Users,
  CheckCircle,
  Clock,
  Info,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type UsersPageProps = {
  adminData: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
};

interface User {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  birthday: string;
  age: number;
  contact_number: string;
  address: string;
  zipcode: string;
  email: string;
  password?: string;
  approval_status: "Pending" | "Approved" | "Declined";
  decline_reason?: string | null;
  visa_image_url?: string | null;
  passport_image_url?: string | null;
  valid_id_front_url?: string | null;
  valid_id_back_url?: string | null;
  approved_by_admin?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface FormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  birthday: string;
  age: number | "";
  contact_number: string;
  address: string;
  zipcode: string;
  email: string;
  password: string;
  confirm: string;
  approval_status: "Pending" | "Approved" | "Declined" | "";
}

const UsersPage: React.FC<UsersPageProps> = ({ adminData }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const adminId = adminData?.id;

  // States for Add User Modal
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    birthday: "",
    age: "",
    contact_number: "",
    address: "",
    zipcode: "",
    email: "",
    password: "",
    confirm: "",
    approval_status: "",
  });
  const resetForm = () => {
    setForm({
      first_name: "",
      middle_name: "",
      last_name: "",
      birthday: "",
      age: "",
      contact_number: "",
      address: "",
      zipcode: "",
      email: "",
      password: "",
      confirm: "",
      approval_status: "",
    });
    setStep(1);
    setFormError(null);
    setShowWizard(false);
  };

  //Filtering
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Pending" | "Approved" | "Declined"
  >("All");
  const [dateFilter, setDateFilter] = useState<string>(""); // YYYY-MM-DD

  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState<string | null>(null);

  // Edit Delete User Const
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [saveDisabled, setSaveDisabled] = useState(false);

  // Deleting
  // Ask to confirm delete
  const confirmDelete = (id: number) => {
    setDeleteId(id);
  };

  // Final delete
  const handleDeleteUser = async () => {
    if (!deleteId || !deleteReason.trim()) return;

    try {
      setDeleting(true); // start loading
      const userToDelete = users.find((u) => u.id === deleteId);

      // 1. Delete from DB
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", deleteId);
      if (error) throw error;

      // 2. Remove locally
      setUsers((prev) => prev.filter((u) => u.id !== deleteId));

      // 3. Send deletion email
      await fetch("/api/send-deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userToDelete.email,
          firstName: userToDelete.first_name,
          reason: deleteReason,
        }),
      });

      // 4. Reset states
      setDeleteId(null);
      setDeleteReason("");
      setShowEditModal(false);

      // Show success toast
      setDeleteSuccess("User deleted successfully!");
      setTimeout(() => setDeleteSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setDeleting(false); // stop loading
    }
  };

  // Editing
  const handleUpdateUser = async (id: number) => {
    try {
      // fetch current user to compare approval_status
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("approval_status, email")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // build update payload
      const updateData: any = {
        first_name: form.first_name,
        middle_name: form.middle_name,
        last_name: form.last_name,
        birthday: form.birthday,
        age: form.age,
        contact_number: form.contact_number,
        address: form.address,
        zipcode: form.zipcode,
        email: form.email,
        approval_status: form.approval_status || "Pending",
      };

      if (form.password && form.password.trim() !== "") {
        updateData.password = form.password;
      }

      // if approval is being granted now, attach admin ID + timestamp
      if (
        existingUser?.approval_status !== "Approved" &&
        updateData.approval_status === "Approved"
      ) {
        updateData.approved_by = adminId; // <-- from props
        updateData.approved_at = new Date().toISOString();
      }

      // push update to supabase
      const { data, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) throw error;

      // refresh users table
      await fetchUsers();

      // Send email only if newly approved
      if (
        existingUser?.approval_status !== "Approved" &&
        updateData.approval_status === "Approved"
      ) {
        await fetch("/api/send-approval", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: updateData.email,
            firstName: updateData.first_name,
          }),
        });
      }

      setUpdateSuccess("User updated successfully!");
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating user:", err);
      setUpdateSuccess("Failed to update user.");
    }
  };

  // Auto Fetch Users
  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers]);

  // For resolving storage URLs  (Bucket in Database)
  function getPublicUrl(path: string | null) {
    if (!path) return null;
    const { data } = supabase.storage.from("user-documents").getPublicUrl(path);
    return data.publicUrl;
  }

  async function fetchUsers() {
    try {
      setLoading(true);

      const { data, error } = await supabase.from("users").select(`
        *,
        approved_by_admin:approved_by (
          id,
          name,
          email
        )
      `);

      if (error) throw error;

      const usersWithImages = data?.map((u) => ({
        ...u,
        visa_image_url: u.visa_image_url
          ? getPublicUrl(u.visa_image_url)
          : null,
        passport_image_url: u.passport_image_url
          ? getPublicUrl(u.passport_image_url)
          : null,
        valid_id_front_url: u.valid_id_front_url
          ? getPublicUrl(u.valid_id_front_url)
          : null,
        valid_id_back_url: u.valid_id_back_url
          ? getPublicUrl(u.valid_id_back_url)
          : null,
      }));

      setUsers(usersWithImages || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Stepper navigation with validation
  async function nextStep() {
    setFormError(null);

    if (step === 1) {
      // Step 1: Personal Info
      if (!form.first_name.trim())
        return setFormError("First name is required.");
      if (!form.last_name.trim()) return setFormError("Last name is required.");
      if (!form.birthday) return setFormError("Birthday is required.");
      if (!form.age || form.age <= 0)
        return setFormError(
          "Please provide a valid birthday to calculate age."
        );

      setStep(2);
    } else if (step === 2) {
      // Step 2: Other Info
      if (!form.contact_number.trim())
        return setFormError("Contact number is required.");
      if (!form.address.trim()) return setFormError("Address is required.");
      if (!form.zipcode.trim()) return setFormError("Zip code is required.");

      setStep(3);
    } else if (step === 3) {
      // Step 3: Security
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
        return setFormError("Enter a valid email address.");
      if (!form.password || form.password.length < 6)
        return setFormError("Password must be at least 6 characters long.");
      if (form.password !== form.confirm)
        return setFormError("Passwords do not match.");

      // Check if email already exists in database
      const { data: existingUser, error: emailCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("email", form.email.trim().toLowerCase())
        .single();

      if (emailCheckError && emailCheckError.code !== "PGRST116") {
        return setFormError("Unable to validate email. Please try again.");
      }

      if (existingUser) {
        return setFormError("That email is already registered.");
      }

      setStep(4);
    }
  }

  function prevStep() {
    setFormError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  // 1. Filters first
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.first_name || ""} ${u.middle_name || ""} ${
        u.last_name || ""
      }`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
  }, [users, searchQuery]);

  // 2. Pagination setup
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // rows per page

  // 3. Total pages depends on filteredUsers
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // 4. Paginated slice
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // 5. Go to page handler
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  function formatBirthday(date: string) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Create User
  async function createUser() {
    if (form.password !== form.confirm) {
      setFormError("Passwords do not match.");
      return;
    }
    try {
      setCreating(true);
      setFormError(null);
      const { error } = await supabase.from("users").insert([
        {
          first_name: form.first_name,
          middle_name: form.middle_name,
          last_name: form.last_name,
          birthday: form.birthday,
          age: form.age,
          contact_number: form.contact_number,
          address: form.address,
          zipcode: form.zipcode,
          email: form.email,
          password: form.password,
          approval_status: "Approved", // Auto approve
          decline_reason: null, // clears any decline text
        },
      ]);
      if (error) throw error;

      setCreatedSuccess("User created successfully!");
      setShowWizard(false);
      fetchUsers();
      resetForm();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  }

  //Count of users, approved, pending
  const userCounts = useMemo(() => {
    const total = users.length;
    const approved = users.filter(
      (u) => u.approval_status === "Approved"
    ).length;
    const pending = users.filter((u) => u.approval_status === "Pending").length;
    return { total, approved, pending };
  }, [users]);

  return (
    <div className="p-6 bg-white">
      <p className="text-gray-600 mb-4">
        Manage all registered users here. You can search, filter by status or
        date, refresh the list, add new users, and view or edit existing user
        details. You are also responsible for approving user registrations so
        that they can log in to your website once approved.
      </p>

      {adminData && (
        <p className="mb-4 text-sm text-gray-500">
          Logged in as: <span className="font-medium">{adminData.name}</span> (
          {adminData.role})
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {/* Total Users */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-xl font-semibold">{userCounts.total}</p>
          </div>
        </div>

        {/* Approved Users */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-xl font-semibold">{userCounts.approved}</p>
          </div>
        </div>

        {/* Pending Users */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Clock className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-xl font-semibold">{userCounts.pending}</p>
          </div>
        </div>
      </div>

      {/* Search and Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        {/* Left: Search */}
        <div className="flex-1 sm:flex-auto relative max-w-full sm:max-w-xs">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        {/* Right: Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => {
              setShowWizard(true);
              setStep(1);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2 mb-4">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "All" | "Pending" | "Approved")
          }
          className="border rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
        </select>

        {/* Date Filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Full Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Contact</th>
              <th className="px-4 py-2 border hidden sm:table-cell">
                Birthday
              </th>
              <th className="px-4 py-2 border hidden sm:table-cell">Age</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Approved By</th>
              <th className="px-4 py-2 border">Approved At</th>
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
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Info className="w-5 h-5" />
                    No users found.
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user, idx) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-4 py-2 border">
                    {user.first_name} {user.middle_name} {user.last_name}
                  </td>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border">{user.contact_number}</td>
                  <td className="px-4 py-2 border hidden sm:table-cell">
                    {user.birthday}
                  </td>
                  <td className="px-4 py-2 border hidden sm:table-cell">
                    {user.age}
                  </td>
                  <td className="px-4 py-2 border">
                    {user.approval_status === "Approved" ? (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                        Approved
                      </span>
                    ) : user.approval_status === "Pending" ? (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                        {user.approval_status}
                      </span>
                    )}
                  </td>

                  {/* New columns */}
                  <td className="px-4 py-2 border">
                    {user.approved_by_admin ? user.approved_by_admin.name : "-"}
                  </td>
                  <td className="px-4 py-2 border">
                    {user.approved_at
                      ? new Date(user.approved_at).toLocaleString("en-PH", {
                          timeZone: "Asia/Manila",
                        })
                      : "-"}
                  </td>

                  <td className="px-4 py-2 border text-center">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setForm(user);
                        setShowEditModal(true);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
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

      {/* Add User Modal */}
      <AnimatePresence>
        {showWizard && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWizard(false)}
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
                      Create User Account
                    </h3>
                    <p className="text-xs text-gray-500">4-step guided setup</p>
                  </div>
                  <button
                    className="p-2 rounded hover:text-gray-600 cursor-pointer"
                    onClick={resetForm}
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="px-3 sm:px-6 py-4 flex-1 overflow-y-auto">
                  {/* Stepper */}
                  <div className="pb-4">
                    <ol className="flex items-center gap-2 text-xs">
                      {[1, 2, 3, 4].map((s) => (
                        <li key={s} className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border ${
                              step >= s
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-500 border-gray-300"
                            }`}
                          >
                            {step > s ? (
                              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              s
                            )}
                          </span>
                          <span className="hidden sm:inline">
                            {s === 1 && "Personal Info"}
                            {s === 2 && "Other Info"}
                            {s === 3 && "Security"}
                            {s === 4 && "Review"}
                          </span>
                          {s !== 4 && <span className="text-gray-300">—</span>}
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
                    {/* Step 1 */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-3 sm:gap-4"
                      >
                        <label className="text-sm font-medium">
                          First Name
                        </label>
                        <input
                          placeholder="e.g., John Roel"
                          value={form.first_name}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              first_name: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">
                          Middle Name
                        </label>
                        <input
                          placeholder="Optional"
                          value={form.middle_name}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              middle_name: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">Last Name</label>
                        <input
                          placeholder="e.g., Flamiano"
                          value={form.last_name}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              last_name: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">Birthday</label>
                        <input
                          type="date"
                          value={form.birthday}
                          onChange={(e) => {
                            const date = e.target.value;
                            const today = new Date();
                            const birthDate = new Date(date);
                            let age =
                              today.getFullYear() - birthDate.getFullYear();
                            const m = today.getMonth() - birthDate.getMonth();
                            if (
                              m < 0 ||
                              (m === 0 && today.getDate() < birthDate.getDate())
                            )
                              age--;
                            setForm((f) => ({ ...f, birthday: date, age }));
                          }}
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">Age</label>
                        <input
                          type="number"
                          value={form.age}
                          readOnly
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 bg-gray-100"
                        />
                      </motion.div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-3 sm:gap-4"
                      >
                        <label className="text-sm font-medium">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g., 09XXXXXXXXX"
                          value={form.contact_number}
                          maxLength={11}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              contact_number: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">Address</label>
                        <input
                          placeholder="Street, City"
                          value={form.address}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, address: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">Zip Code</label>
                        <input
                          placeholder="e.g., 1234"
                          value={form.zipcode}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, zipcode: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </motion.div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-3 sm:gap-4"
                      >
                        <label className="text-sm font-medium">Email</label>
                        <input
                          type="email"
                          placeholder="name@company.com"
                          value={form.email}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, email: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">Password</label>
                        <input
                          type="password"
                          placeholder="Minimum 6 characters"
                          value={form.password}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, password: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <label className="text-sm font-medium">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          placeholder="Re-enter password"
                          value={form.confirm}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, confirm: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </motion.div>
                    )}

                    {/* Step 4 */}
                    {step === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="rounded-lg border border-gray-200 p-3 sm:p-4 bg-gray-50">
                          <h4 className="font-medium mb-2 text-sm sm:text-base">
                            Review details
                          </h4>
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                              <dt className="text-gray-500">Name</dt>
                              <dd className="font-medium">
                                {form.first_name} {form.middle_name || ""}{" "}
                                {form.last_name}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Birthday</dt>
                              <dd className="font-medium">
                                {formatBirthday(form.birthday)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Age</dt>
                              <dd className="font-medium">{form.age}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Phone</dt>
                              <dd className="font-medium">
                                {form.contact_number}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Address</dt>
                              <dd className="font-medium">{form.address}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Zip Code</dt>
                              <dd className="font-medium">{form.zipcode}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Email</dt>
                              <dd className="font-medium">{form.email}</dd>
                            </div>
                          </dl>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sticky Footer */}
                <div className="px-3 sm:px-6 py-3 border-t bg-white flex items-center justify-between gap-2">
                  <button
                    className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-gray-300 px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                    onClick={prevStep}
                    disabled={step === 1 || creating}
                  >
                    Back
                  </button>
                  {step < 4 ? (
                    <button
                      className="inline-flex items-center gap-1 sm:gap-2 rounded-lg bg-blue-600 text-white px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                      onClick={nextStep}
                      disabled={creating}
                    >
                      Continue <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  ) : (
                    <button
                      className="inline-flex items-center gap-1 sm:gap-2 rounded-lg bg-green-600 text-white px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                      onClick={createUser}
                      disabled={creating}
                    >
                      {creating ? "Creating…" : "Create User"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Succe ss Toast - For Create, Update & Delete */}
      <AnimatePresence>
        {createdSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded"
          >
            {createdSuccess}
            <button
              className="ml-3 underline cursor-pointer"
              onClick={() => setCreatedSuccess(null)}
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {updateSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded"
          >
            {updateSuccess}
            <button
              className="ml-3 underline cursor-pointer"
              onClick={() => setUpdateSuccess(null)}
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {deleteSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2 rounded"
          >
            {deleteSuccess}
            <button
              className="ml-3 underline cursor-pointer"
              onClick={() => setDeleteSuccess(null)}
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit/Delete Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
            />

            {/* Edit User Modal */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 px-2 sm:px-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gray-900 text-white px-4 py-2 flex justify-between items-center flex-shrink-0 rounded-t-2xl">
                  <h2 className="text-base sm:text-lg font-semibold">
                    Edit User
                  </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-white hover:text-gray-600 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Form Content */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSaveDisabled(true);
                    await handleUpdateUser(selectedUser.id);
                    setSaveDisabled(false);
                  }}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <div className="p-4 flex-1 overflow-y-auto text-sm">
                    {/* Two-column only on desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* LEFT SIDE - Info */}
                      <div className="space-y-3">
                        {/* First Name */}
                        <div>
                          <label className="block text-gray-700 font-medium text-sm">
                            First Name
                          </label>
                          <input
                            value={form.first_name}
                            onChange={(e) =>
                              setForm({ ...form, first_name: e.target.value })
                            }
                            className="mt-1 w-full border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          />
                        </div>
                        {/* Last Name */}
                        <div>
                          <label className="block text-gray-700 font-medium">
                            Last Name
                          </label>
                          <input
                            value={form.last_name}
                            onChange={(e) =>
                              setForm({ ...form, last_name: e.target.value })
                            }
                            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-gray-700 font-medium">
                            Email
                          </label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                              setForm({ ...form, email: e.target.value })
                            }
                            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-gray-700 font-medium">
                            Phone Number
                          </label>
                          <input
                            maxLength={11}
                            value={form.contact_number}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                contact_number: e.target.value.replace(
                                  /\D/g,
                                  ""
                                ),
                              })
                            }
                            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-gray-700 font-medium">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              value={form.password || ""}
                              onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                              }
                              className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Leave it if you don’t want to change password.
                          </p>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block text-gray-700 font-medium">
                            Status
                          </label>

                          <select
                            value={form.approval_status || "Pending"}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                approval_status: e.target.value,
                              })
                            }
                            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Declined">Declined</option>
                          </select>
                          {/* Small gray text */}
                          <p className="text-xs text-gray-500 mt-1">
                            If approved, the user will receive an email
                            notification.
                          </p>
                        </div>
                      </div>

                      {/* RIGHT SIDE - Documents */}
                      <div className="space-y-4 md:max-h-[70vh] md:overflow-y-auto pr-2">
                        {/* VISA */}
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2">
                            Visa ID
                          </h3>
                          {selectedUser.visa_image_url ? (
                            <img
                              src={selectedUser.visa_image_url}
                              alt="Visa"
                              className="w-full max-h-72 object-contain rounded-lg"
                            />
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No Visa uploaded
                            </p>
                          )}
                        </div>

                        {/* PASSPORT */}
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2">
                            Passport ID
                          </h3>
                          {selectedUser.passport_image_url ? (
                            <img
                              src={selectedUser.passport_image_url}
                              alt="Passport"
                              className="w-full max-h-72 object-contain rounded-lg"
                            />
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No Passport uploaded
                            </p>
                          )}
                        </div>

                        {/* VALID ID FRONT & BACK */}
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2">
                            Valid IDs
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {selectedUser.valid_id_front_url ? (
                              <img
                                src={selectedUser.valid_id_front_url}
                                alt="Valid ID Front"
                                className="w-full max-h-40 object-contain rounded-lg border"
                              />
                            ) : (
                              <p className="text-gray-500 text-sm col-span-1">
                                No Front ID
                              </p>
                            )}
                            {selectedUser.valid_id_back_url ? (
                              <img
                                src={selectedUser.valid_id_back_url}
                                alt="Valid ID Back"
                                className="w-full max-h-40 object-contain rounded-lg border"
                              />
                            ) : (
                              <p className="text-gray-500 text-sm col-span-1">
                                No Back ID
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center border-t px-4 py-2 bg-gray-50 flex-wrap gap-2 flex-shrink-0 rounded-b-2xl">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => confirmDelete(selectedUser.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={saveDisabled}
                      className={`px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm cursor-pointer ${
                        saveDisabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {saveDisabled ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
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
                Please provide a reason for deleting this user. This reason will
                be sent to their email.
              </p>

              {/* Reason textarea */}
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full border rounded-lg p-2 mb-6 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                rows={3}
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={!deleteReason.trim() || deleting}
                  className={`px-3 py-1.5 rounded-lg transition text-sm cursor-pointer ${
                    !deleteReason.trim() || deleting
                      ? "bg-red-300 text-white opacity-50 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {!deleteReason.trim()
                    ? "Enter reason..."
                    : deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
