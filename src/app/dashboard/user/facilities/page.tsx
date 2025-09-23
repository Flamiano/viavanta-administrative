"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Star,
  Car,
  Info,
  Phone,
  Users,
  MapPin,
  BadgeInfo,
  CheckCircle,
  XCircle,
  Wrench,
  Filter,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Image from "next/image";
import supabase from "@/utils/Supabase";

interface FacilitiesPageProps {
  userData: any;
}

export default function FacilitiesPage({ userData }: FacilitiesPageProps) {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [myReservation, setMyReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // for silent polling

  //Filtering
  const [selectedFilter, setSelectedFilter] = useState<
    "All" | "VIP" | "Premium" | "Standard"
  >("All");

  // modal + selection states
  const [showModal, setShowModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // generate times 08:00 → 17:00 in 1h steps
  const availableTimes = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8; // 08:00 → 17:00
    return `${hour.toString().padStart(2, "0")}:00:00`;
  });

  // Fetch facilities and user's reservation
  useEffect(() => {
    let interval: NodeJS.Timer;

    const fetchData = async (isRefresh = false) => {
      if (!isRefresh && loading) {
        setLoading(true);
      }
      if (isRefresh) {
        setRefreshing(true);
      }

      try {
        // Facilities
        const { data: facilitiesData, error: facilitiesError } = await supabase
          .from("facilities")
          .select("*")
          .order("category", { ascending: true });
        if (facilitiesError) console.error(facilitiesError);
        setFacilities(facilitiesData || []);

        // User reservation
        if (userData?.id) {
          const { data: reservationData, error: reservationError } =
            await supabase
              .from("facility_reservations")
              .select(`*, facilities(*)`)
              .eq("user_id", userData.id)
              .limit(1)
              .maybeSingle();

          if (reservationError) console.error(reservationError);

          if (reservationData?.facilities?.status === "Reserved") {
            setMyReservation(reservationData);
          } else {
            setMyReservation(null);
          }
        }
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    };

    // First load
    fetchData();

    // Poll silently every 5 sec
    interval = setInterval(() => fetchData(true), 5000);

    return () => clearInterval(interval);
  }, [userData]);

  // open modal
  const handleReserve = (facility: any) => {
    if (!userData) return alert("Login required!");
    if (myReservation) return alert("You already have an active reservation!");
    setSelectedFacility(facility);
    setShowModal(true);
  };

  // confirm reservation
  const confirmReservation = async () => {
    if (!selectedTime || !selectedFacility) return;

    const today = new Date().toISOString().split("T")[0];

    // calculate end time = start + 1h
    const [h, m, s] = selectedTime.split(":").map(Number);
    const endHour = (h + 1).toString().padStart(2, "0");
    const endTime = `${endHour}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;

    // Insert reservation
    const { data: reservationInsert, error: reservationError } = await supabase
      .from("facility_reservations")
      .insert({
        user_id: userData.id,
        facility_id: selectedFacility.id,
        reservation_date: today,
        start_time: selectedTime,
        end_time: endTime,
      })
      .select(`*, facilities(*)`)
      .maybeSingle();

    if (reservationError) return alert("Failed to reserve.");

    // Update facility status
    await supabase
      .from("facilities")
      .update({ status: "Reserved" })
      .eq("id", selectedFacility.id);

    setMyReservation(reservationInsert);
    setFacilities((prev) =>
      prev.map((f) =>
        f.id === selectedFacility.id ? { ...f, status: "Reserved" } : f
      )
    );

    // reset modal
    setShowModal(false);
    setSelectedFacility(null);
    setSelectedTime("");
    alert("Reservation successful!");
  };

  // helper to load images
  const getCarImage = (name: string) => {
    const images: Record<string, string> = {
      vios: "/assets/facilities/cars/1Vios.jpg",
      grandia: "/assets/facilities/cars/2Grandia.jpg",
      innova: "/assets/facilities/cars/3Innova.jpg",
      altis: "/assets/facilities/cars/4Atlis.jpg",
      fortuner: "/assets/facilities/cars/5Fortuner.jpg",
    };
    const key = Object.keys(images).find((k) => name.toLowerCase().includes(k));
    return key ? images[key] : "/assets/facilities/default.jpg";
  };

  if (loading)
    return (
      <p className="text-center py-8 text-gray-500">Loading facilities...</p>
    );

  const availableCounts = facilities.reduce(
    (acc, f) => {
      if (f.status === "Available") {
        if (f.category === "VIP") acc.vip++;
        else if (f.category === "Premium") acc.premium++;
        else if (f.category === "Standard") acc.standard++;
      }
      return acc;
    },
    { vip: 0, premium: 0, standard: 0 }
  );

  const COLORS = ["#FACC15", "#3B82F6", "#22C55E"];
  const pieData = [
    { name: "VIP", value: availableCounts.vip },
    { name: "Premium", value: availableCounts.premium },
    { name: "Standard", value: availableCounts.standard },
  ];

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Reservation Modal */}
        {showModal && selectedFacility && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-blue-600 px-6 py-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Reserve {selectedFacility.category} –{" "}
                  {selectedFacility.car_unit}
                </h2>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Notify / Info Text */}
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    Each reservation lasts{" "}
                    <span className="font-medium">1 hour</span>. For example, if
                    you choose <span className="font-medium">1:00 PM</span>, it
                    will end at <span className="font-medium">2:00 PM</span>.
                    The driver will be waiting at your selected pickup time.
                    <br />
                    You can only have{" "}
                    <span className="font-medium">
                      one active reservation
                    </span>{" "}
                    at a time. If needed, your reservation can be{" "}
                    <span className="font-medium">canceled/undone</span> before
                    it starts.
                  </p>
                </div>

                <label className="block mb-3 text-sm font-medium text-gray-700">
                  Select Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-6 text-gray-800 focus:ring focus:ring-blue-200 focus:outline-none"
                >
                  <option value="">-- Choose a time slot --</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedFacility(null);
                      setSelectedTime("");
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium w-full sm:w-auto cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReservation}
                    disabled={!selectedTime}
                    className={`px-4 py-2 rounded-lg font-medium w-full sm:w-auto ${
                      selectedTime
                        ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Confirm Reservation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Left Column Active Reservation + Available Facilities */}
        <div className="lg:w-3/4 space-y-6">
          {myReservation && myReservation.facilities ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Reservation Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-l-8 border-blue-500 p-5 rounded-lg shadow-xl w-full"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Your Active Reservation
                  </h2>
                  <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                    Reserved
                  </span>
                </div>

                {/* Facility Info */}
                <div className="space-y-2 text-gray-700">
                  <p className="text-base font-medium">
                    {myReservation.facilities.category} ·{" "}
                    {myReservation.facilities.car_unit}
                  </p>
                  <p className="text-sm text-gray-500">
                    Plate No:{" "}
                    <span className="font-medium">
                      {myReservation.facilities.plate_number}
                    </span>
                  </p>
                </div>

                {/* Reservation Details */}
                <div className="mt-4 text-sm text-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">📅 Date:</span>{" "}
                        {myReservation.reservation_date}
                      </p>
                      <p>
                        <span className="font-medium">⏰ Time:</span>{" "}
                        {myReservation.start_time} - {myReservation.end_time}
                      </p>
                      <p>
                        <span className="font-medium">📍 Pickup:</span>{" "}
                        {myReservation.facilities.pickup_location}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">🧑‍✈️ Driver Name:</span>{" "}
                        {myReservation.facilities.driver_name}
                      </p>
                      <p>
                        <span className="font-medium">📞 Driver Number:</span>{" "}
                        {myReservation.facilities.driver_number}
                      </p>
                    </div>
                  </div>

                  {/* Description always full width */}
                  <div className="mt-4">
                    <p>
                      <span className="font-medium">📝 Description:</span>{" "}
                      {myReservation.facilities.description}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Availability Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
                {[
                  {
                    name: "VIP",
                    count: availableCounts.vip,
                    price: "₱15,000",
                    borderColor: "border-yellow-500",
                    icon: <Crown className="w-5 h-5 text-yellow-500" />,
                    textColor: "text-yellow-500",
                  },
                  {
                    name: "Premium",
                    count: availableCounts.premium,
                    price: "₱10,000",
                    borderColor: "border-blue-500",
                    icon: <Star className="w-5 h-5 text-blue-500" />,
                    textColor: "text-blue-500",
                  },
                  {
                    name: "Standard",
                    count: availableCounts.standard,
                    price: "₱5,000",
                    borderColor: "border-green-500",
                    icon: <Car className="w-5 h-5 text-green-500" />,
                    textColor: "text-green-500",
                  },
                ].map((cat) => (
                  <div
                    key={cat.name}
                    className={`p-5 bg-white shadow-xl rounded-lg border-l-8 ${cat.borderColor} flex items-center justify-between`}
                  >
                    <div>
                      <h3
                        className={`text-lg font-semibold text-gray-700 flex items-center gap-2`}
                      >
                        {cat.icon}
                        {cat.name}
                      </h3>
                      <p className="text-3xl font-bold text-gray-900">
                        {cat.count}
                      </p>
                      <p className={`text-sm mt-1 ${cat.textColor}`}>
                        Price: {cat.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Full-width Availability Cards (if no reservation)
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8 w-full max-w-5xl mx-auto">
              {[
                {
                  name: "VIP",
                  count: availableCounts.vip,
                  price: "₱15,000",
                  borderColor: "border-yellow-500",
                  icon: Crown,
                  textColor: "text-yellow-500",
                },
                {
                  name: "Premium",
                  count: availableCounts.premium,
                  price: "₱10,000",
                  borderColor: "border-blue-500",
                  icon: Star,
                  textColor: "text-blue-500",
                },
                {
                  name: "Standard",
                  count: availableCounts.standard,
                  price: "₱5,000",
                  borderColor: "border-green-500",
                  icon: Car,
                  textColor: "text-green-500",
                },
              ].map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.name}
                    className={`p-6 bg-white shadow-xl rounded-lg border-l-8 ${cat.borderColor} flex flex-col items-center justify-center`}
                  >
                    <Icon className={`w-10 h-10 mb-3 ${cat.textColor}`} />
                    <span className="text-lg font-semibold text-gray-700">
                      {cat.name}
                    </span>
                    <span className="text-3xl font-bold text-gray-900">
                      {cat.count}
                    </span>
                    <span className={`text-sm mt-2 ${cat.textColor}`}>
                      Price: {cat.price}
                    </span>
                  </div>
                );
              })}

              {/* Pie Chart Card */}
              <div className="p-6 bg-white shadow-xl rounded-lg border-l-8 border-purple-500 flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Facility Usage
                </h3>

                <div className="w-36 h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "VIP", value: availableCounts.vip },
                          { name: "Premium", value: availableCounts.premium },
                          { name: "Standard", value: availableCounts.standard },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={50}
                        label
                      >
                        <Cell key="VIP" fill="#FACC15" />
                        <Cell key="Premium" fill="#3B82F6" />
                        <Cell key="Standard" fill="#22C55E" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex justify-around mt-2 text-sm font-medium w-full">
                  {[
                    { name: "VIP", color: "#FACC15" },
                    { name: "Premium", color: "#3B82F6" },
                    { name: "Standard", color: "#22C55E" },
                  ].map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      ></span>
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filter Buttons */}
          <div className="relative">
            <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar px-2 snap-x snap-mandatory">
              {[
                {
                  label: "All",
                  value: "All",
                  icon: Filter,
                  color: "text-gray-600",
                  count: facilities.filter((f) => f.status === "Available")
                    .length,
                },
                {
                  label: "VIP",
                  value: "VIP",
                  icon: Crown,
                  color: "text-yellow-500",
                  count: facilities.filter(
                    (f) => f.status === "Available" && f.category === "VIP"
                  ).length,
                },
                {
                  label: "Premium",
                  value: "Premium",
                  icon: Star,
                  color: "text-indigo-500",
                  count: facilities.filter(
                    (f) => f.status === "Available" && f.category === "Premium"
                  ).length,
                },
                {
                  label: "Standard",
                  value: "Standard",
                  icon: Car,
                  color: "text-emerald-500",
                  count: facilities.filter(
                    (f) => f.status === "Available" && f.category === "Standard"
                  ).length,
                },
              ].map(({ label, value, icon: Icon, color, count }) => (
                <button
                  key={value}
                  onClick={() => setSelectedFilter(value as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition cursor-pointer whitespace-nowrap snap-start ${
                    selectedFilter === value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span>
                    {label} ({count})
                  </span>
                </button>
              ))}
            </div>

            {/* Scroll hint (fade on right side) */}
            <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
          </div>

          {/* List of Available Facilities */}
          {facilities.filter((f) => {
            if (selectedFilter === "All") {
              return f.status === "Available";
            }
            return f.status === "Available" && f.category === selectedFilter;
          }).length > 0 ? (
            <div className="grid gap-6">
              {facilities
                .filter((f) => {
                  if (selectedFilter === "All") {
                    return f.status === "Available";
                  }
                  return (
                    f.status === "Available" && f.category === selectedFilter
                  );
                })
                .map((facility) => {
                  const Icon =
                    facility.category === "VIP"
                      ? Crown
                      : facility.category === "Premium"
                      ? Star
                      : Car;

                  const colorClasses =
                    facility.category === "VIP"
                      ? "text-yellow-400"
                      : facility.category === "Premium"
                      ? "text-indigo-400"
                      : "text-emerald-400";

                  return (
                    <motion.div
                      key={facility.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-900 text-gray-100 rounded-2xl shadow-lg overflow-hidden border border-gray-800"
                    >
                      {/* Top section with image */}
                      <div className="sm:flex">
                        <div className="sm:w-1/3 relative h-40 sm:h-auto">
                          <Image
                            src={getCarImage(facility.car_unit)}
                            alt={facility.car_unit}
                            fill
                            className="object-cover w-full h-full"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-5 flex flex-col justify-between">
                          <div>
                            {/* Title */}
                            <div className="flex items-center gap-2 mb-3">
                              <Icon className={`w-6 h-6 ${colorClasses}`} />
                              <h3
                                className={`text-lg sm:text-xl font-bold ${colorClasses}`}
                              >
                                {facility.category} · {facility.car_unit}
                              </h3>
                            </div>

                            {/* Details */}
                            <ul className="space-y-1 text-sm text-gray-300">
                              <li className="flex items-center gap-2">
                                <BadgeInfo className="w-4 h-4 text-gray-400" />
                                <span>
                                  <span className="font-medium">Plate:</span>{" "}
                                  {facility.plate_number}
                                </span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>
                                  <span className="font-medium">Capacity:</span>{" "}
                                  {facility.capacity} passengers
                                </span>
                              </li>
                              <li className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>
                                  <span className="font-medium">Pickup:</span>{" "}
                                  {facility.pickup_location}
                                </span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>
                                  <span className="font-medium">Driver:</span>{" "}
                                  {facility.driver_name} (
                                  {facility.driver_number})
                                </span>
                              </li>
                              {facility.description && (
                                <li className="flex items-center gap-2">
                                  <BadgeInfo className="w-4 h-4 text-gray-400" />
                                  <span>{facility.description}</span>
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Action button */}
                          <motion.button
                            whileHover={{ scale: myReservation ? 1 : 1.02 }}
                            whileTap={{ scale: myReservation ? 1 : 0.98 }}
                            disabled={!!myReservation}
                            onClick={() => handleReserve(facility)}
                            className={`mt-4 w-full sm:w-fit px-4 py-2 rounded-lg font-semibold transition ${
                              myReservation
                                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                            }`}
                          >
                            {myReservation
                              ? "You have active reserved"
                              : "Reserve Facility"}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          ) : (
            // Infos about no facilities
            <div className="flex flex-col items-center justify-center text-center p-6 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg">
              <Info className="w-8 h-8 mb-2 text-blue-500" />
              <p className="font-medium">
                No facilities available at the moment.
              </p>
              <p className="text-sm text-blue-600">
                Please check back later or try a different filter.
              </p>
            </div>
          )}
        </div>

        {/* Right Column Rooms / Other Facility Details */}
        <div className="lg:w-1/4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Rooms / Facilities
          </h3>

          {facilities.length > 0 ? (
            facilities.map((f, index) => {
              // Map facility status to icons + colors
              let statusIcon;
              if (f.status === "Available") {
                statusIcon = <CheckCircle className="w-4 h-4 text-green-500" />;
              } else if (f.status === "Reserved") {
                statusIcon = <XCircle className="w-4 h-4 text-red-500" />;
              } else {
                statusIcon = <Wrench className="w-4 h-4 text-yellow-500" />;
              }

              // Pick image based on index or facility id
              const imageSrc = `/assets/facilities/room/${index + 1}${
                index + 1 <= 3 ? ".png" : ".jpg"
              }`;

              return (
                <div
                  key={f.id}
                  className="bg-gray-900 text-white rounded-lg shadow overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <img
                    src={imageSrc}
                    alt={f.category}
                    className="w-full h-32 object-cover"
                  />

                  {/* Content */}
                  <div className="p-4 flex flex-col space-y-2">
                    <span className="font-medium text-gray-200">
                      {f.category} - Car Unit: {f.car_unit}
                    </span>
                    <p className="text-xs text-gray-400">
                      {f.description ||
                        "A comfortable facility perfect for travelers."}
                    </p>
                    <div className="flex items-center space-x-2 text-xs">
                      {statusIcon}
                      <span className="text-gray-300">{f.status}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 text-sm">No rooms/facilities found.</p>
          )}
        </div>
      </div>
    </>
  );
}
