"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import supabase from "@/utils/Supabase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Info } from "lucide-react";

type UserDoc = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  address: string;
  zipcode: string | null;
  approval_status: "Approved" | "Declined" | "Pending";
  visa_image_url: string | null;
  passport_image_url: string | null;
  valid_id_front_url: string | null;
  valid_id_back_url: string | null;
  approved_by?: string | null;
};

type ArchivedDoc = {
  id: number;
  user_id?: number; // optional, for reference
  first_name: string;
  middle_name: string | null;
  last_name: string;
  birthday: string; // ISO string
  age: number | null;
  email: string;
  contact_number: string;
  address: string;
  zipcode: string;
  password: string;
  visa_image_url: string | null;
  passport_image_url: string | null;
  valid_id_front_url: string | null;
  valid_id_back_url: string | null;
  approval_status: "Approved" | "Declined" | "Pending";
  approved_by: number | null;
  approved_at: string | null;
  session_token: string | null;
  created_at: string;
  category: string;
  archived_at: string;
};

// Matches columns selected from "users"
type UserRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  address: string;
  zipcode: string | null;
  approval_status: "Approved" | "Declined" | "Pending";
  visa_image_url: string | null;
  passport_image_url: string | null;
  valid_id_front_url: string | null;
  valid_id_back_url: string | null;
  approved_by: number | null;
};

// Matches full archived_users_documents row
type ArchivedRow = ArchivedDoc;

// Admin Details
type DocumentsPageProps = {
  adminData: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
};

export default function DocumentsPage({ adminData }: DocumentsPageProps) {
  const [docs, setDocs] = useState<UserDoc[]>([]);
  // State for archive modal
  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [archivedDocs, setArchivedDocs] = useState<ArchivedDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<UserDoc | ArchivedDoc | null>(
    null
  );
  const [open, setOpen] = useState(false);

  // State for search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Archived"
  >("All");

  // Delete User
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [_deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Retrieve
  const [retrieveId, setRetrieveId] = useState<number | null>(null);
  const [retrieving, setRetrieving] = useState(false);

  // Filter Active users table (not archived)
  const filteredActiveDocs = useMemo(() => {
    return docs.filter((d) => {
      if (!d) return false;

      // Only Approved users
      if (d.approval_status !== "Approved") return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const fullName = `${d.first_name} ${d.last_name}`.toLowerCase();
        return fullName.includes(term) || d.email.toLowerCase().includes(term);
      }

      return true;
    });
  }, [docs, searchTerm]);

  // Filter Archived users table
  const filteredArchivedDocs = useMemo(() => {
    return archivedDocs.filter((d) => {
      if (!d) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const fullName = `${d.first_name} ${d.last_name}`.toLowerCase();
        return (
          fullName.includes(term) ||
          d.email.toLowerCase().includes(term) ||
          (d.category?.toLowerCase().includes(term) ?? false)
        );
      }
      return true;
    });
  }, [archivedDocs, searchTerm]);

  // Deleting
  // Ask to confirm delete
  const confirmDelete = (id: number) => {
    setDeleteId(id);
  };

  // Final delete
  const handleDeleteUser = async () => {
    if (!deleteId || !deleteReason.trim()) return;

    try {
      setDeleting(true);

      // Find the user from docs
      const userToDelete = docs.find((u) => u.id === deleteId);
      if (!userToDelete) throw new Error("User not found");

      // Delete from DB
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", deleteId);
      if (error) throw error;

      // Remove locally
      setDocs((prev) => prev.filter((u) => u.id !== deleteId));

      // Send deletion email
      await fetch("/api/send-deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userToDelete.email,
          firstName: userToDelete.first_name,
          reason: deleteReason,
        }),
      });

      // Reset states
      setDeleteId(null);
      setDeleteReason("");

      // Success toast
      setDeleteSuccess("User deleted successfully!");
      setTimeout(() => setDeleteSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setDeleting(false);
    }
  };

  // helper: get public URL for storage file
  const getPublicUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from("user-documents").getPublicUrl(path);
    return data?.publicUrl || null;
  };

  // Fetch Users
  useEffect(() => {
    const fetchDocs = async () => {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select(
          `
          id,
          first_name,
          last_name,
          email,
          contact_number,
          address,
          zipcode,
          approval_status,
          visa_image_url,
          passport_image_url,
          valid_id_front_url,
          valid_id_back_url,
          approved_by
        `
        )
        .eq("approval_status", "Approved");

      if (usersError) {
        console.error("Error fetching users:", usersError);
        return;
      }

      const { data: adminsData } = await supabase
        .from("admins")
        .select("id, name");

      const formatted: UserDoc[] =
        usersData?.map((u: UserRow) => {
          const admin = adminsData?.find((a) => a.id === u.approved_by);
          return {
            id: u.id,
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email,
            contact_number: u.contact_number,
            address: u.address,
            zipcode: u.zipcode,
            approval_status: u.approval_status,
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
            approved_by: admin?.name || null,
          };
        }) ?? [];

      setDocs(formatted || []);
    };

    const fetchArchived = async () => {
      const { data, error } = await supabase
        .from("archived_users_documents")
        .select("*")
        .order("archived_at", { ascending: false });

      if (error) {
        console.error("Error fetching archived:", error);
        return;
      }

      const formatted: ArchivedDoc[] =
        data?.map((d: ArchivedRow) => ({
          ...d,
          visa_image_url: d.visa_image_url
            ? getPublicUrl(d.visa_image_url)
            : null,
          passport_image_url: d.passport_image_url
            ? getPublicUrl(d.passport_image_url)
            : null,
          valid_id_front_url: d.valid_id_front_url
            ? getPublicUrl(d.valid_id_front_url)
            : null,
          valid_id_back_url: d.valid_id_back_url
            ? getPublicUrl(d.valid_id_back_url)
            : null,
        })) ?? [];

      setArchivedDocs(formatted || []);
    };

    // Initial fetch
    fetchDocs();
    fetchArchived();

    // Realtime subscription for users (Active Docs)
    const userChannel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => {
          fetchDocs(); // refresh whenever a user changes
        }
      )
      .subscribe();

    // Realtime subscription for archived docs
    const archivedChannel = supabase
      .channel("archived-users-docs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "archived_users_documents" },
        () => {
          fetchArchived(); // refresh whenever archived docs change
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(archivedChannel);
    };
  }, []);

  // Confirm archive
  const confirmArchive = (id: number) => {
    setArchiveId(id);
  };

  // Final archive
  const handleArchiveUser = async () => {
    if (!archiveId) return;

    try {
      setArchiving(true);

      // Get full user from DB
      const { data: fullUserData, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", archiveId)
        .single();

      if (fetchError || !fullUserData)
        throw new Error("Failed to fetch full user data");

      // Prepare archived object
      const archivedUser = {
        user_id: fullUserData.id,
        first_name: fullUserData.first_name,
        middle_name: fullUserData.middle_name,
        last_name: fullUserData.last_name,
        birthday: fullUserData.birthday,
        age: fullUserData.age,
        email: fullUserData.email,
        contact_number: fullUserData.contact_number,
        address: fullUserData.address,
        zipcode: fullUserData.zipcode,
        password: fullUserData.password,

        visa_image_url: fullUserData.visa_image_url,
        passport_image_url: fullUserData.passport_image_url,
        valid_id_front_url: fullUserData.valid_id_front_url,
        valid_id_back_url: fullUserData.valid_id_back_url,

        approval_status: fullUserData.approval_status,
        approved_by: fullUserData.approved_by,
        approved_at: fullUserData.approved_at,
        session_token: fullUserData.session_token,
        created_at: fullUserData.created_at,
        category: "User Documents",
        archived_at: new Date().toISOString(),
      };

      // Insert into archived table
      const { data: insertedData, error: archiveError } = await supabase
        .from("archived_users_documents")
        .insert([archivedUser])
        .select()
        .single();

      if (archiveError) throw archiveError;

      // Delete from users table
      await supabase.from("users").delete().eq("id", archiveId);

      // Update local state
      setDocs((prev) => prev.filter((u) => u.id !== archiveId));
      setArchivedDocs((prev) => [
        ...prev,
        {
          ...insertedData,
          visa_image_url: getPublicUrl(insertedData.visa_image_url),
          passport_image_url: getPublicUrl(insertedData.passport_image_url),
          valid_id_front_url: getPublicUrl(insertedData.valid_id_front_url),
          valid_id_back_url: getPublicUrl(insertedData.valid_id_back_url),
        },
      ]);
      // Send notification email
      await fetch("/api/send-archiving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fullUserData.email,
          firstName: fullUserData.first_name,
          documentTitle: `${fullUserData.first_name} ${fullUserData.last_name}'s Documents`,
          userId: fullUserData.id,
        }),
      });

      alert("User archived successfully!");

      // Close modals
      setArchiveId(null);
      setSelectedDoc(null);
      setOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Failed to archive user:", err.message);
        alert(`Failed to archive user: ${err.message}`);
      } else {
        console.error("Failed to archive user:", err);
        alert("Failed to archive user: Unknown error");
      }
    } finally {
      setArchiving(false);
    }
  };

  // Confirm retrieve
  const confirmRetrieve = (id: number) => {
    setRetrieveId(id);
  };

  // Final retrieve
  const handleRetrieveUser = async () => {
    if (!retrieveId) return;

    try {
      setRetrieving(true);

      // Get archived user
      const { data: archivedUser, error: fetchError } = await supabase
        .from("archived_users_documents")
        .select("*")
        .eq("id", retrieveId)
        .single();

      if (fetchError || !archivedUser)
        throw new Error("Archived user not found");

      // Restore to users
      const { error: upsertError } = await supabase.from("users").upsert(
        [
          {
            id: archivedUser.user_id,
            first_name: archivedUser.first_name,
            middle_name: archivedUser.middle_name,
            last_name: archivedUser.last_name,
            birthday: archivedUser.birthday,
            age: archivedUser.age,
            email: archivedUser.email,
            contact_number: archivedUser.contact_number,
            address: archivedUser.address,
            zipcode: archivedUser.zipcode,
            password: archivedUser.password,
            visa_image_url: archivedUser.visa_image_url,
            passport_image_url: archivedUser.passport_image_url,
            valid_id_front_url: archivedUser.valid_id_front_url,
            valid_id_back_url: archivedUser.valid_id_back_url,
            approval_status: archivedUser.approval_status,
            approved_by: archivedUser.approved_by,
            approved_at: archivedUser.approved_at,
            session_token: archivedUser.session_token,
            created_at: archivedUser.created_at,
          },
        ],
        { onConflict: "id" }
      );
      if (upsertError) throw upsertError;

      // Remove from archive
      await supabase
        .from("archived_users_documents")
        .delete()
        .eq("id", retrieveId);

      // Update local state
      setArchivedDocs((prev) => prev.filter((u) => u.id !== retrieveId));
      setDocs((prev) => [
        ...prev,
        {
          id: archivedUser.user_id,
          first_name: archivedUser.first_name,
          last_name: archivedUser.last_name,
          email: archivedUser.email,
          contact_number: archivedUser.contact_number,
          address: archivedUser.address,
          zipcode: archivedUser.zipcode,
          approval_status: archivedUser.approval_status,
          visa_image_url: getPublicUrl(archivedUser.visa_image_url),
          passport_image_url: getPublicUrl(archivedUser.passport_image_url),
          valid_id_front_url: getPublicUrl(archivedUser.valid_id_front_url),
          valid_id_back_url: getPublicUrl(archivedUser.valid_id_back_url),
          approved_by: archivedUser.approved_by,
        },
      ]);

      // Send retrieval email
      await fetch("/api/send-retrieval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: archivedUser.email,
          firstName: archivedUser.first_name,
          documentTitle: `${archivedUser.first_name} ${archivedUser.last_name}'s Documents`,
          userId: archivedUser.user_id,
        }),
      });

      alert("User retrieved successfully!");

      // Close modals
      setRetrieveId(null);
      setSelectedDoc(null);
      setOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Failed to retrieve user:", err.message);
        alert(`Failed to retrieve user: ${err.message}`);
      } else {
        console.error("Failed to retrieve user:", err);
        alert("Failed to retrieve user: Unknown error");
      }
    } finally {
      setRetrieving(false);
    }
  };

  // stats
  const totalDocs = docs.length;
  const approved = docs.filter((d) => d.approval_status === "Approved").length;
  const totalArchived = archivedDocs.length;

  const chartData = useMemo(
    () => [
      { name: "Approved", value: approved },
      { name: "Archived", value: totalArchived },
    ],
    [approved, totalArchived]
  );

  const COLORS = ["#22c55e", "#f87171"]; // green = Approved, red = Archived

  return (
    <div className="p-6 bg-white">
      {/* Instructions */}
      <p className="text-gray-600">
        Manage all user documents here. You can search, filter by category or
        status, refresh the list, archive documents, and view existing document
        details. You are also responsible for archiving documents so that users
        are notified and their access can be temporarily restricted if needed.
      </p>

      {adminData && (
        <p className="mt-4 text-sm text-gray-500">
          Logged in as: <span className="font-medium">{adminData.name}</span> (
          {adminData.role})
        </p>
      )}

      <div className="flex flex-col lg:flex-row w-full gap-6 py-10">
        {/* Left Side Tables */}
        <div className="bg-white rounded-2xl shadow-md p-4 lg:p-6 w-full">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="border rounded-lg px-3 py-2 flex-1 w-full sm:w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="border rounded-lg px-3 py-2 w-full sm:w-auto"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "All" | "Active" | "Archived")
              }
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Active Documents Table */}
          {(statusFilter === "Active" || statusFilter === "All") && (
            <>
              <h3 className="text-md font-semibold p-3">Active Documents</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="px-3 py-2 border">#</th>
                      <th className="px-3 py-2 border">Visa</th>
                      <th className="px-3 py-2 border">Passport</th>
                      <th className="px-3 py-2 border">Valid IDs</th>
                      <th className="px-3 py-2 border hidden sm:table-cell">
                        Status
                      </th>
                      <th className="px-3 py-2 border text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActiveDocs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Info className="w-5 h-5" />
                            No active documents.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredActiveDocs.map((doc, idx) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 border">{idx + 1}</td>

                          {/* VISA */}
                          <td className="px-3 py-2 border text-center">
                            {doc.visa_image_url ? (
                              <img
                                src={doc.visa_image_url}
                                alt="Visa"
                                className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded mx-auto cursor-pointer"
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setOpen(true);
                                }}
                              />
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>

                          {/* PASSPORT */}
                          <td className="px-3 py-2 border text-center">
                            {doc.passport_image_url ? (
                              <img
                                src={doc.passport_image_url}
                                alt="Passport"
                                className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded mx-auto cursor-pointer"
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setOpen(true);
                                }}
                              />
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>

                          {/* VALID IDs */}
                          <td className="px-3 py-2 border">
                            <div className="flex items-center gap-1 sm:gap-2 justify-center">
                              {doc.valid_id_front_url && (
                                <img
                                  src={doc.valid_id_front_url}
                                  alt="ID Front"
                                  className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded cursor-pointer"
                                  onClick={() => {
                                    setSelectedDoc(doc);
                                    setOpen(true);
                                  }}
                                />
                              )}
                              {doc.valid_id_back_url && (
                                <img
                                  src={doc.valid_id_back_url}
                                  alt="ID Back"
                                  className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded cursor-pointer"
                                  onClick={() => {
                                    setSelectedDoc(doc);
                                    setOpen(true);
                                  }}
                                />
                              )}
                              {!doc.valid_id_front_url &&
                                !doc.valid_id_back_url && (
                                  <span className="text-gray-400">N/A</span>
                                )}
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="px-3 py-2 border hidden sm:table-cell">
                            <span className="px-2 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                              Approved By {doc.approved_by || "N/A"}
                            </span>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-3 py-2 border text-center">
                            <button
                              className="px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer text-xs sm:text-sm"
                              onClick={() => {
                                setSelectedDoc(doc);
                                setOpen(true);
                              }}
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
            </>
          )}

          {/* Archived Documents Table */}
          {(statusFilter === "Archived" || statusFilter === "All") && (
            <>
              <h3 className="mt-6 text-md font-semibold p-3">
                Archived Documents
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="px-3 py-2 border">#</th>
                      <th className="px-3 py-2 border">Name</th>
                      <th className="px-3 py-2 border">Email</th>
                      <th className="px-3 py-2 border hidden sm:table-cell">
                        Category
                      </th>
                      <th className="px-3 py-2 border hidden sm:table-cell">
                        Archived At
                      </th>
                      <th className="px-3 py-2 border text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArchivedDocs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Info className="w-5 h-5" />
                            No archived documents.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredArchivedDocs.map((doc, idx) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 border">{idx + 1}</td>
                          <td className="px-3 py-2 border">
                            {doc.first_name} {doc.last_name}
                          </td>
                          <td className="px-3 py-2 border">{doc.email}</td>
                          <td className="px-3 py-2 border hidden sm:table-cell">
                            {doc.category}
                          </td>
                          <td className="px-3 py-2 border hidden sm:table-cell">
                            {new Date(doc.archived_at).toLocaleString("en-PH", {
                              timeZone: "Asia/Manila",
                            })}
                          </td>
                          <td className="px-3 py-2 border text-center">
                            <button
                              className="px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer text-xs sm:text-sm"
                              onClick={() => {
                                setSelectedDoc(doc);
                                setOpen(true);
                              }}
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
            </>
          )}
        </div>

        {/* Right Side Stats + Chart */}
        <div className="lg:w-1/4 w-full flex flex-col gap-4">
          <div className="bg-blue-500 text-white rounded-xl p-4 shadow">
            <h3 className="text-sm">Total Approved Users</h3>
            <p className="text-2xl font-bold">{totalDocs}</p>
          </div>
          <div className="bg-purple-500 text-white rounded-xl p-4 shadow">
            <h3 className="text-sm">Total Archived</h3>
            <p className="text-2xl font-bold">{totalArchived}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow h-56 flex flex-col">
            <h3 className="text-sm font-semibold mb-2">Documents Chart</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label // default labels
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Details Modal */}
        <AnimatePresence>
          {open && selectedDoc && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 bg-black/50 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />

              {/* Modal */}
              <motion.div
                className="fixed inset-0 flex items-center justify-center z-50 px-2 sm:px-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div
                  className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col
                        max-h-[90vh] md:max-h-full overflow-y-auto md:overflow-y-visible"
                >
                  {/* Header */}
                  <div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center rounded-t-2xl">
                    <h2 className="text-lg sm:text-xl font-semibold">
                      User Details
                    </h2>
                    <button
                      onClick={() => setOpen(false)}
                      className="text-white hover:text-gray-400 transition cursor-pointer text-xl"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* LEFT SIDE */}
                      <div className="space-y-6">
                        {/* Personal Information */}
                        <div className="bg-gray-50 border rounded-xl p-4 shadow-sm">
                          <h3 className="text-gray-700 font-semibold mb-3">
                            Personal Information
                          </h3>
                          <div className="space-y-2 text-gray-600">
                            <p>
                              <span className="font-medium">Name:</span>{" "}
                              {selectedDoc.first_name} {selectedDoc.last_name}
                            </p>
                            <p>
                              <span className="font-medium">Email:</span>{" "}
                              {selectedDoc.email}
                            </p>
                            <p>
                              <span className="font-medium">Contact:</span>{" "}
                              {selectedDoc.contact_number}
                            </p>
                            <p>
                              <span className="font-medium">Address:</span>{" "}
                              {selectedDoc.address}
                            </p>
                            <p>
                              <span className="font-medium">Zip Code:</span>{" "}
                              {selectedDoc.zipcode || "-"}
                            </p>
                            <p>
                              <span className="font-medium">Status:</span>{" "}
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  selectedDoc.approval_status === "Approved"
                                    ? "bg-green-100 text-green-700"
                                    : selectedDoc.approval_status === "Declined"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {selectedDoc.approval_status}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* VISA */}
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2">
                            Visa ID
                          </h3>
                          {selectedDoc.visa_image_url ? (
                            <img
                              src={selectedDoc.visa_image_url}
                              alt="Visa"
                              className="w-full max-h-72 object-contain rounded-lg border shadow-sm"
                            />
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No Visa uploaded
                            </p>
                          )}
                        </div>
                      </div>

                      {/* RIGHT SIDE */}
                      <div className="space-y-6">
                        {/* PASSPORT */}
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2">
                            Passport ID
                          </h3>
                          {selectedDoc.passport_image_url ? (
                            <img
                              src={selectedDoc.passport_image_url}
                              alt="Passport"
                              className="w-full max-h-72 object-contain rounded-lg border shadow-sm"
                            />
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No Passport uploaded
                            </p>
                          )}
                        </div>

                        {/* VALID IDS */}
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2">
                            Valid IDs
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {selectedDoc.valid_id_front_url ? (
                              <img
                                src={selectedDoc.valid_id_front_url}
                                alt="ID Front"
                                className="w-full max-h-40 object-contain rounded-lg border shadow-sm"
                              />
                            ) : (
                              <p className="text-gray-500 text-sm col-span-1">
                                No Front ID
                              </p>
                            )}

                            {selectedDoc.valid_id_back_url ? (
                              <img
                                src={selectedDoc.valid_id_back_url}
                                alt="ID Back"
                                className="w-full max-h-40 object-contain rounded-lg border shadow-sm"
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
                  <div className="flex justify-between items-center border-t px-4 py-3 bg-gray-50 rounded-b-2xl">
                    {/* Left Side */}
                    <div className="flex gap-3">
                      {/* Show Delete only if Active */}
                      {selectedDoc && !("archived_at" in selectedDoc) && (
                        <button
                          onClick={() => confirmDelete(selectedDoc.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium shadow-sm cursor-pointer"
                        >
                          Delete
                        </button>
                      )}

                      <button
                        onClick={() => setOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium shadow-sm cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    {/* Right Side */}
                    <div className="flex gap-3">
                      {/* Archive if Active */}
                      {selectedDoc && !("archived_at" in selectedDoc) && (
                        <button
                          onClick={() => confirmArchive(selectedDoc.id)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium shadow-sm cursor-pointer"
                        >
                          Archive User
                        </button>
                      )}

                      {/* Retrieve if Archived */}
                      {selectedDoc && "archived_at" in selectedDoc && (
                        <button
                          onClick={() => confirmRetrieve(selectedDoc.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm cursor-pointer"
                        >
                          Retrieve User
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Archive Confirmation Modal */}
        {archiveId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg w-full max-w-md shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gray-600 text-white px-6 py-4">
                <h3 className="text-lg font-semibold">Confirm Archive</h3>
              </div>

              <div className="p-6">
                <p className="mb-4 text-gray-700">
                  Are you sure you want to archive this user? Their account will
                  be unavailable for{" "}
                  <span className="font-semibold">2 weeks</span> while archived.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setArchiveId(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleArchiveUser}
                    disabled={archiving}
                    className={`px-3 py-1.5 rounded-lg transition text-sm cursor-pointer ${
                      archiving
                        ? "bg-gray-400 text-white opacity-50 cursor-not-allowed"
                        : "bg-gray-600 text-white hover:bg-gray-700"
                    }`}
                  >
                    {archiving ? "Archiving..." : "Archive User"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  Please provide a reason for deleting this user. This reason
                  will be sent to their email.
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

        {/* Retrieve Confirmation Modal */}
        {retrieveId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg w-full max-w-md shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-green-600 text-white px-6 py-4">
                <h3 className="text-lg font-semibold">Confirm Retrieve</h3>
              </div>

              <div className="p-6">
                <p className="mb-6 text-gray-700">
                  Are you sure you want to retrieve this archived user? They
                  will be restored to the active users list.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setRetrieveId(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRetrieveUser}
                    disabled={retrieving}
                    className={`px-3 py-1.5 rounded-lg transition text-sm cursor-pointer ${
                      retrieving
                        ? "bg-green-300 text-white opacity-50 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {retrieving ? "Retrieving..." : "Retrieve"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
