"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench,
  Car,
  Star,
  Crown,
} from "lucide-react";
import supabase from "@/utils/Supabase";

type Facility = {
  id: number;
  category: "VIP" | "Premium" | "Standard";
  car_unit: string;
  driver_name: string;
  driver_number: string;
  plate_number: string;
  pickup_location: string;
  capacity: number;
  description: string;
  status: "Available" | "Under Maintenance" | "Reserved";
  created_at: string;
  admin_id?: number; // FK admin
  admins?: {
    id: number;
    name: string;
    email: string;
  } | null;
};

type ReservationUser = {
  id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  contact_number: string;
  address: string;
};

type FacilityReservation = {
  id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  users: ReservationUser;
};

// Admin Details
type FacilitiesPageProps = {
  adminData: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
};

export default function FacilitiesPage({ adminData }: FacilitiesPageProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState<Partial<Facility>>({});
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Wizard state
  const [step, setStep] = useState<number>(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);

  //Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  //View Modal Traveler
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<FacilityReservation | null>(null);

  //Admin Details
  const adminId = adminData?.id;

  // Reset wizard when modal opens
  useEffect(() => {
    if (modalOpen) {
      setStep(1);
      setFormError(null);
    }
  }, [modalOpen]);

  // Fetch facilities
  const fetchFacilities = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("facilities")
      .select(
        `
      *,
      admins!facilities_admin_id_fkey (id, name, email),
      facility_reservations (
        id,
        reservation_date,
        start_time,
        end_time,
        created_at,
        users (
          id,
          first_name,
          middle_name,
          last_name,
          email,
          contact_number,
          address
        )
      )
    `
      )
      .order("id", { ascending: true });

    if (error) console.error(error);
    else setFacilities(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchFacilities();

    const facilitySub = supabase
      .channel("facility-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "facilities" },
        fetchFacilities
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "facility_reservations" },
        fetchFacilities
      )
      .subscribe();

    return () => {
      supabase.removeChannel(facilitySub);
    };
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, []);

  // Handle form input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "capacity"
          ? Number(value)
          : name === "driver_number"
          ? value.replace(/\D/g, "") // only numbers
          : value,
    }));
  };

  // Validations
  const validateStep1 = () => {
    if (!formData.category) return "Category is required.";
    if (!formData.car_unit || !formData.car_unit.trim())
      return "Car unit is required.";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.driver_name || !formData.driver_name.trim())
      return "Driver name is required.";
    if (!formData.driver_number || !/^[0-9]+$/.test(formData.driver_number))
      return "Valid driver number is required.";
    if (!formData.plate_number || !formData.plate_number.trim())
      return "Plate number is required.";

    // Check uniqueness: disallow same plate_number for different drivers
    const duplicate = facilities.find(
      (f) =>
        f.plate_number.toLowerCase() === formData.plate_number?.toLowerCase() &&
        f.id !== editingFacility?.id // allow current facility when editing
    );
    if (duplicate) {
      return `Plate number "${formData.plate_number}" is already assigned to ${duplicate.driver_name}.`;
    }

    if (!formData.pickup_location || !formData.pickup_location.trim())
      return "Pickup location is required.";
    if (formData.capacity == null || Number.isNaN(formData.capacity))
      return "Capacity is required.";
    if ((formData.capacity as number) < 1)
      return "Capacity must be at least 1.";
    if (!formData.status) return "Status is required.";
    return null;
  };

  const resetForm = () => {
    setModalOpen(false);
    setEditingFacility(null);
    setFormData({});
    setFormError(null);
    setStep(1);
  };

  // Submit add/update
  const handleSubmit = async () => {
    setFormError(null);
    const err =
      step === 1 ? validateStep1() : step === 2 ? validateStep2() : null;
    if (err) return setFormError(err);

    setCreating(true);
    try {
      if (editingFacility) {
        const { error } = await supabase
          .from("facilities")
          .update(formData)
          .eq("id", editingFacility.id);
        if (error) return setFormError(error.message);
      } else {
        const { error } = await supabase.from("facilities").insert([
          {
            ...formData,
            status: formData.status ?? "Available",
            admin_id: adminId, //creator of facilities
          },
        ]);
        if (error) return setFormError(error.message);
      }
      resetForm();
      fetchFacilities();
    } finally {
      setCreating(false);
    }
  };

  // Delete handler Modal
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (deleteId !== null) {
      const { error } = await supabase
        .from("facilities")
        .delete()
        .eq("id", deleteId);
      if (error) console.error(error);
      fetchFacilities();
    }
    setIsDeleteOpen(false);
    setDeleteId(null);
  };

  // Search + filter
  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      f.car_unit.toLowerCase().includes(search.toLowerCase()) ||
      f.driver_name.toLowerCase().includes(search.toLowerCase()) ||
      f.driver_number.includes(search) ||
      f.plate_number.toLowerCase().includes(search.toLowerCase()) ||
      f.pickup_location.toLowerCase().includes(search.toLowerCase()) ||
      (f.description?.toLowerCase() || "").includes(search.toLowerCase());

    const matchesCategory =
      filterCategory === "All" || f.category === filterCategory;

    const matchesStatus = filterStatus === "All" || f.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Status counts (Available, Reserved, Under Maintenance)
  const statusCounts = facilities.reduce(
    (acc, f) => {
      if (f.status === "Available") acc.Available++;
      else if (f.status === "Reserved") acc.Reserved++;
      else if (f.status === "Under Maintenance") acc.UnderMaintenance++;
      return acc;
    },
    { Available: 0, Reserved: 0, UnderMaintenance: 0 }
  );

  // Category counts (VIP, Premium, Standard)
  const categoryCounts = facilities.reduce(
    (acc, f) => {
      if (f.category === "VIP") acc.VIP++;
      else if (f.category === "Premium") acc.Premium++;
      else if (f.category === "Standard") acc.Standard++;
      return acc;
    },
    { VIP: 0, Premium: 0, Standard: 0 }
  );

  return (
    <div className="p-6">
      {/* Page description */}
      <p className="text-gray-600 w-full mb-4">
        Manage all transport facilities including car units, drivers, and
        availability. Use the search and filter options to quickly find
        facilities, and add or update details as needed.
      </p>

      {adminData && (
        <p className="mb-4 text-sm text-gray-500">
          Logged in as: <span className="font-medium">{adminData.name}</span> (
          {adminData.role})
        </p>
      )}

      {/* 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Available */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm font-medium">Available</h3>
            <p className="text-2xl font-bold text-green-400">
              {statusCounts.Available}
            </p>
          </div>
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        {/* Reserved */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm font-medium">Reserved</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {statusCounts.Reserved}
            </p>
          </div>
          <Clock className="w-10 h-10 text-yellow-500" />
        </div>

        {/* Under Maintenance */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm font-medium">
              Under Maintenance
            </h3>
            <p className="text-2xl font-bold text-red-400">
              {statusCounts.UnderMaintenance}
            </p>
          </div>
          <Wrench className="w-10 h-10 text-red-500" />
        </div>
      </div>

      {/* 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* VIP */}
        <div
          className="p-6 sm:p-8 rounded-lg bg-white flex items-center justify-between shadow-xl"
          style={{ borderLeft: "6px solid #f59e0b" }} // yellow
        >
          <div>
            <h3 className="text-sm font-medium" style={{ color: "#f59e0b" }}>
              VIP ₱15,000
            </h3>
            <p className="text-2xl font-bold" style={{ color: "#f59e0b" }}>
              {categoryCounts.VIP}
            </p>
          </div>
          <Crown className="w-10 h-10" style={{ color: "#f59e0b" }} />
        </div>

        {/* Premium */}
        <div
          className="p-6 sm:p-8 rounded-lg bg-white flex items-center justify-between shadow-xl"
          style={{ borderLeft: "6px solid #6366f1" }} // indigo
        >
          <div>
            <h3 className="text-sm font-medium" style={{ color: "#6366f1" }}>
              Premium ₱10,000
            </h3>
            <p className="text-2xl font-bold" style={{ color: "#6366f1" }}>
              {categoryCounts.Premium}
            </p>
          </div>
          <Star className="w-10 h-10" style={{ color: "#6366f1" }} />
        </div>

        {/* Standard */}
        <div
          className="p-6 sm:p-8 rounded-lg bg-white flex items-center justify-between shadow-xl"
          style={{ borderLeft: "6px solid #10b981" }} // emerald
        >
          <div>
            <h3 className="text-sm font-medium" style={{ color: "#10b981" }}>
              Standard ₱5,000
            </h3>
            <p className="text-2xl font-bold" style={{ color: "#10b981" }}>
              {categoryCounts.Standard}
            </p>
          </div>
          <Car className="w-10 h-10" style={{ color: "#10b981" }} />
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 w-full">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="flex items-center border rounded-lg px-2 w-full sm:w-64">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1 outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border rounded-lg px-3 py-1 w-full sm:w-auto cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="VIP">VIP</option>
            <option value="Premium">Premium</option>
            <option value="Standard">Standard</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-1 w-full sm:w-auto cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 w-full sm:w-auto cursor-pointer"
        >
          <Plus size={18} /> Add Facility
        </button>
      </div>

      {/* Facilities Card List */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredFacilities.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No facilities found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFacilities.map((facility) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative bg-black backdrop-blur-lg border border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition p-5 flex flex-col"
            >
              {/* Header */}
              <div className="relative mb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-1 sm:gap-3">
                  <span className="text-xs sm:text-sm text-gray-200">
                    Driver:
                  </span>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-100">
                    {facility.driver_name}
                  </h2>
                </div>

                {/* Category badge pinned top-right */}
                <span
                  className={`absolute top-0 right-0 px-2 py-1 text-xs rounded-full font-medium
                  ${
                    facility.category === "VIP"
                      ? "bg-purple-800/40 text-purple-300"
                      : facility.category === "Premium"
                      ? "bg-blue-800/40 text-blue-300"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {facility.category}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-1 text-sm text-gray-300 flex-1">
                <p>
                  <span className="font-medium text-gray-200">Car Unit:</span>{" "}
                  {facility.car_unit}
                </p>
                <p>
                  <span className="font-medium text-gray-200">Number:</span>{" "}
                  {facility.driver_number}
                </p>
                <p>
                  <span className="font-medium text-gray-200">Plate:</span>{" "}
                  {facility.plate_number}
                </p>
                <p>
                  <span className="font-medium text-gray-200">Pickup:</span>{" "}
                  {facility.pickup_location}
                </p>
                <p>
                  <span className="font-medium text-gray-200">Capacity:</span>{" "}
                  {facility.capacity}
                </p>
                <p className="mt-2">
                  <span className="font-medium text-gray-200">
                    Description:
                  </span>{" "}
                  <span className="block mt-1 bg-gray-800/40 text-gray-300 px-3 py-2 rounded-lg">
                    {facility.description}
                  </span>
                </p>
              </div>

              {/* Footer section (always at bottom) */}
              <div className="mt-4 flex flex-col gap-2">
                {/* Created by */}
                <div className="bg-gray-800/40 px-3 py-2 rounded-lg text-xs text-gray-300">
                  <span className="font-medium text-gray-200">Created By:</span>{" "}
                  {facility.admins?.name ?? "Unknown"}
                </div>

                {/* Status + Actions */}
                <div className="flex items-center justify-between">
                  {/* Status badge + View Client */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium
                      ${
                        facility.status === "Available"
                          ? "bg-green-800/40 text-green-300"
                          : facility.status === "Reserved"
                          ? "bg-yellow-800/40 text-yellow-300"
                          : "bg-red-800/40 text-red-300"
                      }`}
                    >
                      {facility.status}
                    </span>

                    {facility.status === "Reserved" &&
                      Array.isArray(facility.facility_reservations) &&
                      facility.facility_reservations.length > 0 && (
                        <button
                          onClick={() => {
                            const firstReservation =
                              facility.facility_reservations?.[0];
                            if (firstReservation) {
                              setSelectedReservation(firstReservation);
                              setViewModalOpen(true);
                            }
                          }}
                          className="px-2 py-1 text-xs rounded-lg bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 transition cursor-pointer"
                        >
                          View
                        </button>
                      )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingFacility(facility);
                        setFormData(facility);
                        setModalOpen(true);
                      }}
                      className="p-2 rounded-full bg-yellow-900/40 text-yellow-300 hover:bg-yellow-800/60 transition cursor-pointer"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(facility.id)}
                      className="p-2 rounded-full bg-red-900/40 text-red-300 hover:bg-red-800/60 transition cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Facility Modal (Wizard Style) */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setModalOpen(false);
                setEditingFacility(null);
                setFormData({});
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
                      {editingFacility ? "Edit Facility" : "Add Facility"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {editingFacility
                        ? "Update facility details"
                        : "Step-by-step setup"}
                    </p>
                  </div>
                  <button
                    className="p-2 rounded hover:text-gray-600 cursor-pointer"
                    onClick={() => {
                      setModalOpen(false);
                      setEditingFacility(null);
                      setFormData({});
                    }}
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Body (Steps) */}
                <div className="px-3 sm:px-6 py-4 flex-1 overflow-y-auto">
                  {/* Stepper */}
                  <div className="pb-4">
                    <ol className="flex items-center gap-2 text-xs">
                      {[1, 2, 3].map((s) => (
                        <li key={s} className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border ${
                              step >= s
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-500 border-gray-300"
                            }`}
                          >
                            {step > s ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              s
                            )}
                          </span>
                          <span className="hidden sm:inline">
                            {s === 1 && "Basic Info"}
                            {s === 2 && "Details"}
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
                    {/* Step 1 */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-3"
                      >
                        <label className="text-sm font-medium">Category</label>
                        <select
                          name="category"
                          value={formData.category || ""}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-2 py-2"
                        >
                          <option value="">Select Category</option>
                          <option value="VIP">VIP</option>
                          <option value="Premium">Premium</option>
                          <option value="Standard">Standard</option>
                        </select>

                        <label className="text-sm font-medium">
                          Car Unit{" "}
                          <small className="block text-gray-500">
                            All our cars are{" "}
                            <span className="font-semibold">Toyota</span> (Vios,
                            Grandia, Innova, Altis, Fortuner)
                          </small>
                        </label>
                        <input
                          type="text"
                          name="car_unit"
                          placeholder="e.g., Vios, Innova, Fortuner"
                          value={formData.car_unit || ""}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-2 py-2"
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
                        className="grid gap-3"
                      >
                        <label className="text-sm font-medium">
                          Driver Name
                        </label>
                        <input
                          type="text"
                          name="driver_name"
                          placeholder="e.g., John Roel Flamiano"
                          value={formData.driver_name || ""}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-2 py-2"
                        />

                        <label className="text-sm font-medium">
                          Driver Number
                        </label>
                        <input
                          type="text"
                          name="driver_number"
                          placeholder="e.g., 09123456789"
                          value={formData.driver_number || ""}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-2 py-2"
                        />

                        <label className="text-sm font-medium">
                          Plate Number
                        </label>
                        <input
                          type="text"
                          name="plate_number"
                          placeholder="e.g., ABC-1234"
                          value={formData.plate_number || ""}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-2 py-2"
                        />

                        <label className="text-sm font-medium">
                          Pickup Location
                        </label>
                        <input
                          type="text"
                          name="pickup_location"
                          placeholder="e.g., Airport"
                          value={formData.pickup_location || ""}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-2 py-2"
                        />

                        <label className="text-sm font-medium">Capacity</label>
                        <input
                          type="number"
                          name="capacity"
                          placeholder="e.g., 12"
                          value={formData.capacity || ""}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-2 py-2"
                        />

                        <label className="text-sm font-medium">
                          Select Status
                        </label>
                        <select
                          name="status"
                          value={formData.status || ""}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-2 py-2"
                        >
                          <option value="" disabled>
                            Select Status
                          </option>
                          <option value="Available">Available</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Under Maintenance">
                            Under Maintenance
                          </option>
                        </select>

                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <input
                          type="text"
                          name="description"
                          placeholder="Message..."
                          value={formData.description || ""}
                          onChange={handleChange}
                          className="w-full border rounded-lg px-2 py-2"
                        />
                      </motion.div>
                    )}

                    {/* Step 3 - Review */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        <h4 className="font-medium mb-2">Review Details</h4>
                        <ul className="text-sm space-y-1">
                          <li>
                            <strong>Category:</strong> {formData.category}
                          </li>
                          <li>
                            <strong>Car Unit:</strong> {formData.car_unit}
                          </li>
                          <li>
                            <strong>Driver:</strong> {formData.driver_name}
                          </li>
                          <li>
                            <strong>Driver:</strong> {formData.driver_number}
                          </li>
                          <li>
                            <strong>Plate:</strong> {formData.plate_number}
                          </li>
                          <li>
                            <strong>Pickup:</strong> {formData.pickup_location}
                          </li>
                          <li>
                            <strong>Capacity:</strong> {formData.capacity}
                          </li>
                          <li>
                            <strong>Status:</strong> {formData.status}
                          </li>
                          <li>
                            <strong>Description:</strong> {formData.description}
                          </li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer Buttons */}
                <div className="px-3 sm:px-6 py-3 border-t bg-white flex items-center justify-between gap-2">
                  <button
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                    onClick={() => setStep(step - 1)}
                    disabled={step === 1}
                  >
                    Back
                  </button>
                  {step < 3 ? (
                    <button
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      onClick={() => {
                        let err: string | null = null;
                        if (step === 1) err = validateStep1();
                        if (step === 2) err = validateStep2();

                        if (err) {
                          setFormError(err); // show validation error
                        } else {
                          setFormError(null);
                          setStep(step + 1); // move to next step only if valid
                        }
                      }}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                      onClick={handleSubmit}
                    >
                      {editingFacility ? "Update Facility" : "Save Facility"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal View Traveler or Client */}
      <AnimatePresence>
        {viewModalOpen && selectedReservation && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewModalOpen(false)}
            />

            {/* Client Info Modal */}
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
                    Client Information
                  </h2>
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="text-white hover:text-gray-600 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* LEFT SIDE – User Info */}
                    <div className="space-y-3">
                      <p>
                        <span className="font-medium text-gray-700">Name:</span>{" "}
                        <br />
                        {selectedReservation.users.first_name}{" "}
                        {selectedReservation.users.middle_name || ""}{" "}
                        {selectedReservation.users.last_name}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">
                          Email:
                        </span>{" "}
                        <br />
                        {selectedReservation.users.email}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">
                          Contact:
                        </span>{" "}
                        <br />
                        {selectedReservation.users.contact_number}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">
                          Address:
                        </span>{" "}
                        <br />
                        {selectedReservation.users.address}
                      </p>
                    </div>

                    {/* RIGHT SIDE – Reservation Info */}
                    <div className="space-y-3">
                      <p>
                        <span className="font-medium text-gray-700">
                          Reservation Date:
                        </span>{" "}
                        <br />
                        {selectedReservation.reservation_date}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Time:</span>{" "}
                        <br />
                        {selectedReservation.start_time} –{" "}
                        {selectedReservation.end_time}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">
                          Reserved At:
                        </span>{" "}
                        <br />
                        {new Date(
                          selectedReservation.created_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center border-t px-4 py-2 bg-gray-50 flex-wrap gap-2 flex-shrink-0 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setViewModalOpen(false)}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 text-white px-6 py-4">
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="mb-4 text-gray-700">
                Are you sure you want to delete this facility?
              </p>

              {/* Footer */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
