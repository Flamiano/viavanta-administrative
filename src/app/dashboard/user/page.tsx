"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Settings,
  FileText,
  Home,
  Building,
  User,
  Mail,
  Lock,
  Info,
  MessageSquare,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/utils/Supabase";
import FacilitiesPage from "./FacilitiesPage";
import LegalPage from "./LegalPage";
import MessagePage from "./MessagePage";
import AdminFooter from "@/comps/user-admin-footer/page";

// ---------- Types ----------
interface ApprovedBy {
  id: number;
  name: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  session_token: string;
  approved_by?: ApprovedBy | null;
  approved_by_name?: string | null;
  visa_image_url?: string | null;
  passport_image_url?: string | null;
  valid_id_front_url?: string | null;
  valid_id_back_url?: string | null;
  reserved_facilities_count?: number;
  cases_count?: number;
  compliances_count?: number;
  activity_data?: ActivityRecord[];
  records?: UserRecord[];
  birthday?: string | null;
  age?: number | null;
  contact_number?: string | null;
  address?: string | null;
  zipcode?: string | null;
  approval_status?: "Pending" | "Approved" | "Declined" | null;
  approved_at?: string | null;
  created_at?: string | null;
}

interface Facility {
  category: string;
  car_unit: string;
  plate_number: string;
  pickup_location: string;
  driver_name: string;
  driver_number: string;
  description?: string;
}

interface Reservation {
  id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
  facilities: Facility;
}

interface CaseRecord {
  filed_date: string;
}

interface FacilityReservation {
  reservation_date: string;
}

interface ComplianceRecord {
  due_date: string;
}

interface ActivityRecord {
  date: string;
  facilities: number;
  cases: number;
  compliances: number;
}

interface UserRecord {
  id: number;
  name: string;
  type: string;
  status: string;
  date: string;
  description?: string;
}

export default function UserDashboardPage() {
  const router = useRouter();

  // States
  const [time, setTime] = useState<string>("");
  const [active, setActive] = useState("Dashboard");
  const [userData, setUserData] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pageTitles = useMemo(
    () => ({
      Dashboard: "Users",
      Facilities: "Facilities",
      Legal: "Legal",
      Settings: "Settings",
    }),
    []
  );

  useEffect(() => {
    let tabTitle = "";

    switch (active) {
      case "Dashboard":
        tabTitle = "Users";
        break;
      case "Facilities":
        tabTitle = "Facilities";
        break;
      case "Legal":
        tabTitle = "Legal";
        break;
      case "Settings":
        tabTitle = "Settings";
        break;
      default:
        tabTitle = "";
    }

    document.title = tabTitle ? `ViaVanta - ${tabTitle}` : "ViaVanta";
  }, [active]);

  // Profile update form states
  const [newName, setNewName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // State for Settings page TAB
  const [activeTab, setActiveTab] = useState<"information" | "security">(
    "information"
  );

  // For active reservation
  const [myReservation, setMyReservation] = useState<Reservation | null>(null);

  // State for logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Persist active tab
  useEffect(() => {
    const savedActive = localStorage.getItem("activeTab");
    if (savedActive) setActive(savedActive);
  }, []);

  useEffect(() => {
    localStorage.setItem("activeTab", active);
  }, [active]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!userId || !sessionToken) {
        router.push("/auth/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select(
            `
            *,
            approved_by (
              id,
              name
            )
          `
          )
          .eq("id", Number(userId))
          .single();

        if (error || !data) {
          console.error("User not found:", error);
          localStorage.clear();
          router.push("/auth/login");
          return;
        }

        if (!data.session_token || data.session_token !== sessionToken) {
          localStorage.clear();
          router.push("/auth/login");
          return;
        }

        const getFileUrl = (path: string | null) => {
          if (!path) return null;
          const { data: fileData } = supabase.storage
            .from("user-documents")
            .getPublicUrl(path);
          return fileData?.publicUrl || null;
        };

        const { count: reservedFacilitiesCount } = await supabase
          .from("facility_reservations")
          .select("*", { count: "exact" })
          .eq("user_id", Number(userId));

        const { count: casesCount } = await supabase
          .from("cases")
          .select("*", { count: "exact" })
          .eq("user_id", Number(userId));

        const { count: compliancesCount } = await supabase
          .from("compliance_records")
          .select("*", { count: "exact" })
          .eq("user_id", Number(userId));

        const { data: recentCases } = await supabase
          .from("cases")
          .select("filed_date")
          .eq("user_id", Number(userId))
          .order("filed_date", { ascending: true })
          .limit(30);

        const { data: recentFacilities } = await supabase
          .from("facility_reservations")
          .select("reservation_date")
          .eq("user_id", Number(userId))
          .order("reservation_date", { ascending: true })
          .limit(30);

        const { data: recentCompliances } = await supabase
          .from("compliance_records")
          .select("due_date")
          .eq("user_id", Number(userId))
          .order("due_date", { ascending: true })
          .limit(30);

        const activityData: ActivityRecord[] = [];
        const casesArray: CaseRecord[] = recentCases || [];
        const facilitiesArray: FacilityReservation[] = recentFacilities || [];
        const compliancesArray: ComplianceRecord[] = recentCompliances || [];

        const dates = new Set<string>();
        casesArray.forEach((c) => dates.add(c.filed_date));
        facilitiesArray.forEach((f) => dates.add(f.reservation_date));
        compliancesArray.forEach((c) => dates.add(c.due_date));

        const sortedDates = Array.from(dates).sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );

        sortedDates.forEach((date) => {
          activityData.push({
            date: new Date(date).toLocaleDateString(),
            facilities: facilitiesArray.filter(
              (f) => f.reservation_date === date
            ).length,
            cases: casesArray.filter((c) => c.filed_date === date).length,
            compliances: compliancesArray.filter((c) => c.due_date === date)
              .length,
          });
        });

        const userDataWithAdminAndDocs: User = {
          ...data,
          approved_by_name: data.approved_by?.name || null,
          visa_image_url: getFileUrl(data.visa_image_url),
          passport_image_url: getFileUrl(data.passport_image_url),
          valid_id_front_url: getFileUrl(data.valid_id_front_url),
          valid_id_back_url: getFileUrl(data.valid_id_back_url),
          reserved_facilities_count: reservedFacilitiesCount || 0,
          cases_count: casesCount || 0,
          compliances_count: compliancesCount || 0,
          activity_data: activityData,
        };

        setUserData(userDataWithAdminAndDocs);
        setNewName(`${data.first_name} ${data.last_name}`);
      } catch (err) {
        console.error("Error fetching user:", err);
        localStorage.clear();
        router.push("/auth/login");
      } finally {
        setCheckingAuth(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Fetch active reservation
  useEffect(() => {
    const fetchActiveReservation = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const today = new Date().toISOString().split("T")[0];

        const { data, error } = await supabase
          .from("facility_reservations")
          .select(`*, facilities (*)`)
          .eq("user_id", Number(userId))
          .gte("reservation_date", today)
          .order("reservation_date", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Supabase error:", error);
          setMyReservation(null);
        } else {
          setMyReservation(data as Reservation | null);
        }
      } catch (err) {
        console.error("Error fetching active reservation:", err);
        setMyReservation(null);
      }
    };

    fetchActiveReservation();
  }, []);

  // Scroll detection for mobile navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Profile update
  const handleUpdateProfile = () => {
    if (newPassword && newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setMessage("Profile updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Checking access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-lg shadow-xl w-96 overflow-hidden"
            >
              <div className="bg-red-600 text-white px-6 py-4">
                <h2 className="text-xl font-semibold">Confirm Logout</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to logout?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    disabled={loggingOut}
                    className={`px-4 py-2 rounded-md border transition ${
                      loggingOut
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 hover:bg-gray-100 cursor-pointer"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setLoggingOut(true);
                      setTimeout(() => {
                        localStorage.clear();
                        router.push("/auth/login");
                      }, 2000);
                    }}
                    disabled={loggingOut}
                    className={`px-4 py-2 rounded-md text-white transition ${
                      loggingOut
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 cursor-pointer"
                    }`}
                  >
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-full px-6 py-3 flex items-center justify-between sticky top-0 z-50 transition-colors ${
          scrolled
            ? "bg-gray-900 text-white shadow-md"
            : "bg-white text-gray-800"
        }`}
      >
        {/* Logo and Active Tab */}
        <div className="flex items-center gap-3 transition-all duration-300">
          <Image
            src={
              scrolled ? "/logo/logo-dark-bg.png" : "/logo/logo-white-bg.png"
            }
            alt="Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain transition-all duration-300"
          />
          <span
            className={`font-bold text-lg transition-colors duration-300 ${
              scrolled ? "text-white" : "text-gray-800"
            }`}
          >
            User {active}
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { name: "Dashboard", Icon: Home },
            { name: "Facilities", Icon: Building },
            { name: "Legal", Icon: FileText },
            { name: "Settings", Icon: Settings },
          ].map(({ name, Icon }) => (
            <button
              key={name}
              onClick={() => setActive(name)}
              className={`flex items-center gap-1 cursor-pointer transition ${
                active === name
                  ? "text-blue-500 font-semibold"
                  : scrolled
                  ? "text-white hover:text-blue-300"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              <Icon size={18} /> {name}
            </button>
          ))}

          <div className="h-6 w-px bg-gray-300 mx-2" />

          <button
            onClick={() => setShowLogoutModal(true)}
            className={`flex items-center gap-1 font-semibold transition cursor-pointer ${
              scrolled
                ? "text-red-400 hover:text-red-300"
                : "text-red-600 hover:text-red-700"
            }`}
          >
            <LogOut size={18} /> Logout
          </button>

          {/* Location + Time */}
          <div className="flex flex-col items-end text-right ml-4">
            <span className="font-mono text-sm">{time}</span>
            <span className="text-xs text-gray-400">Quezon City, PH</span>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative w-8 h-8 flex flex-col justify-center items-center"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 2 } : { rotate: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="block h-1 w-8 bg-current rounded"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -2 } : { rotate: 0, y: 5 }}
              transition={{ duration: 0.3 }}
              className="block h-1 w-8 bg-current rounded"
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden fixed top-16 left-0 right-0 z-40 bg-gray-900 text-white shadow-lg px-6 py-4 space-y-4`}
          >
            {[
              { name: "Dashboard", Icon: Home },
              { name: "Facilities", Icon: Building },
              { name: "Legal", Icon: FileText },
              { name: "Settings", Icon: Settings },
            ].map(({ name, Icon }) => (
              <button
                key={name}
                onClick={() => {
                  setActive(name);
                  setMenuOpen(false);
                }}
                className={`flex items-center gap-2 w-full text-left transition ${
                  active === name
                    ? "text-blue-400 font-semibold"
                    : "hover:text-blue-300"
                }`}
              >
                <Icon size={18} /> {name}
              </button>
            ))}

            <button
              onClick={() => setShowLogoutModal(true)}
              className={`flex items-center gap-1 font-semibold transition cursor-pointer ${
                scrolled
                  ? "text-red-400 hover:text-red-300"
                  : "text-red-600 hover:text-red-700"
              }`}
            >
              <LogOut size={18} /> Logout
            </button>

            {/* Location + Time */}
            <div className="pt-2 border-t border-gray-700 text-right">
              <span className="block font-mono text-sm">{time}</span>
              <span className="block text-xs text-gray-400">
                Quezon City, PH
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Content ===== */}

      <div className="p-6">
        {/* Dashboard */}
        {active === "Dashboard" && userData && (
          <div className="mt-4 space-y-6 max-w-full">
            {/* Welcome Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-600 flex items-center gap-4">
              <Home className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-lg text-gray-700">
                  Welcome back,{" "}
                  <span className="font-medium">{userData.email}</span>!
                </p>
                <p className="text-sm text-gray-500">
                  Today is {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Active Reservation Card */}
            {myReservation ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-l-8 border-blue-500 p-5 rounded-lg shadow-xl w-full mt-4"
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

                  {/* Description */}
                  <div className="mt-4">
                    <p>
                      <span className="font-medium">📝 Description:</span>{" "}
                      {myReservation.facilities.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-6 text-blue-700 bg-blue-100 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <Info className="w-5 h-5" />
                  No active reservations.
                </div>
              </div>
            )}

            {/* User Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                <p className="text-sm text-gray-500">Reserved Facilities</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {userData.reserved_facilities_count || 0}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                <p className="text-sm text-gray-500">Cases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {userData.cases_count || 0}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                <p className="text-sm text-gray-500">Compliances</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {userData.compliances_count || 0}
                </p>
              </div>
            </div>

            {/* Activity Line Chart - Styled */}
            <div className="bg-gray-900 rounded-2xl p-4 shadow-md w-full">
              <h3 className="text-white font-semibold mb-4">
                Activity Overview
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                {userData?.activity_data &&
                userData.activity_data.length > 0 ? (
                  <LineChart data={userData.activity_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend wrapperStyle={{ color: "#fff" }} />
                    <Line
                      type="monotone"
                      dataKey="facilities"
                      stroke="#4ade80"
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cases"
                      stroke="#facc15"
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="compliances"
                      stroke="#f87171"
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    {userData?.activity_data
                      ? "No data available"
                      : "Loading chart..."}
                  </div>
                )}
              </ResponsiveContainer>
            </div>

            {/* User Records Table - Styled */}
            <div className="overflow-x-auto bg-white rounded-lg shadow w-full">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-4 py-2 border">#</th>
                    <th className="px-4 py-2 border">Name</th>
                    <th className="px-4 py-2 border">Type</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.records?.length ? (
                    userData.records.map((item: UserRecord, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border text-center">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2 border">{item.name}</td>
                        <td className="px-4 py-2 border">{item.type}</td>
                        <td className="px-4 py-2 border">{item.status}</td>
                        <td className="px-4 py-2 border">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Info className="w-5 h-5" />
                          No records found.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Facilities */}
        {active === "Facilities" && userData && (
          <FacilitiesPage userData={userData} />
        )}

        {/* Legal Page */}
        {active === "Legal" && userData && <LegalPage userData={userData} />}

        {active === "Settings" && userData && (
          <div className="mt-6 w-full px-6">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-300 mb-6">
              <button
                onClick={() => setActiveTab("information")}
                className={`px-4 py-2 font-medium rounded-t-md transition border-b-2 cursor-pointer ${
                  activeTab === "information"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "text-gray-600 hover:text-gray-900 border-transparent"
                }`}
              >
                Account Info
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`px-4 py-2 font-medium rounded-t-md transition border-b-2 cursor-pointer ${
                  activeTab === "security"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "text-gray-600 hover:text-gray-900 border-transparent"
                }`}
              >
                Security
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-6 w-full">
              {/* Message */}
              {message && (
                <p
                  className={`text-sm ${
                    message.includes("successfully")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}

              {activeTab === "information" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                  {/* Name */}
                  <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <User className="w-6 h-6 text-indigo-600" />
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">Name</label>
                        <input
                          type="text"
                          className="w-full border px-3 py-2 rounded-md"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      This is your full name. You can update it if it has
                      changed.
                    </p>
                  </div>

                  {/* Email */}
                  <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <Mail className="w-6 h-6 text-indigo-600" />
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full border px-3 py-2 rounded-md"
                          value={userData.email}
                          disabled
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      This is your registered email. You cannot change it here.
                    </p>
                  </div>

                  {/* Birthday */}
                  <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <User className="w-6 h-6 text-indigo-600" />
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">
                          Birthday
                        </label>
                        <input
                          type="date"
                          className="w-full border px-3 py-2 rounded-md"
                          value={userData?.birthday || ""}
                          disabled
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your date of birth is used to calculate your age
                      automatically.
                    </p>
                  </div>

                  {/* Age */}
                  <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <User className="w-6 h-6 text-indigo-600" />
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">Age</label>
                        <input
                          type="number"
                          className="w-full border px-3 py-2 rounded-md"
                          value={userData?.age || ""}
                          disabled
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your age is calculated based on your birthday.
                    </p>
                  </div>

                  {/* Contact Number */}
                  <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <Mail className="w-6 h-6 text-indigo-600" />
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">
                          Contact Number
                        </label>
                        <input
                          type="text"
                          className="w-full border px-3 py-2 rounded-md"
                          value={userData?.contact_number || ""}
                          disabled
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your contact number helps us reach you regarding bookings
                      or updates.
                    </p>
                  </div>

                  {/* Address */}
                  <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <Building className="w-6 h-6 text-indigo-600" />
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          className="w-full border px-3 py-2 rounded-md"
                          value={userData?.address || ""}
                          disabled
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your address is used for official records and verification
                      purposes.
                    </p>
                  </div>

                  {/* Zipcode */}
                  <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <Building className="w-6 h-6 text-indigo-600" />
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">
                          Zipcode
                        </label>
                        <input
                          type="text"
                          className="w-full border px-3 py-2 rounded-md"
                          value={userData?.zipcode || ""}
                          disabled
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your postal code is used for verification and
                      correspondence.
                    </p>
                  </div>
                  {/* Uploaded Documents */}
                  <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-4">
                    <h3 className="font-semibold text-gray-700">
                      Uploaded Documents
                    </h3>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Visa */}
                      <div className="flex flex-col items-center">
                        {userData.visa_image_url ? (
                          <img
                            src={userData.visa_image_url}
                            alt="Visa"
                            className="w-full h-32 object-contain rounded-md shadow-md"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-md text-gray-400 text-sm">
                            No Visa uploaded
                          </div>
                        )}
                        <span className="mt-1 text-sm font-medium">Visa</span>
                      </div>

                      {/* Passport */}
                      <div className="flex flex-col items-center">
                        {userData.passport_image_url ? (
                          <img
                            src={userData.passport_image_url}
                            alt="Passport"
                            className="w-full h-32 object-contain rounded-md shadow-md"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-md text-gray-400 text-sm">
                            No Passport uploaded
                          </div>
                        )}
                        <span className="mt-1 text-sm font-medium">
                          Passport
                        </span>
                      </div>

                      {/* Valid ID Front */}
                      <div className="flex flex-col items-center">
                        {userData.valid_id_front_url ? (
                          <img
                            src={userData.valid_id_front_url}
                            alt="Valid ID Front"
                            className="w-full h-32 object-contain rounded-md shadow-md"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-md text-gray-400 text-sm">
                            No Front ID
                          </div>
                        )}
                        <span className="mt-1 text-sm font-medium">
                          Valid ID (Front)
                        </span>
                      </div>

                      {/* Valid ID Back */}
                      <div className="flex flex-col items-center">
                        {userData.valid_id_back_url ? (
                          <img
                            src={userData.valid_id_back_url}
                            alt="Valid ID Back"
                            className="w-full h-32 object-contain rounded-md shadow-md"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-md text-gray-400 text-sm">
                            No Back ID
                          </div>
                        )}
                        <span className="mt-1 text-sm font-medium">
                          Valid ID (Back)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Approval Info */}
                  <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-2">
                    <label className="font-semibold">Approval Status</label>
                    <p
                      className={`font-medium ${
                        userData.approval_status === "Approved"
                          ? "text-green-600"
                          : userData.approval_status === "Declined"
                          ? "text-red-600"
                          : "text-yellow-500"
                      }`}
                    >
                      {userData.approval_status}
                    </p>

                    <div>
                      Approved By: {userData.approved_by_name || "N/A"} <br />
                      Approved At:{" "}
                      {userData.approved_at
                        ? new Date(userData.approved_at).toLocaleString()
                        : "N/A"}
                    </div>

                    <p>
                      Registered At:{" "}
                      {userData.created_at
                        ? new Date(userData.created_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                  {/* Current Password */}
                  <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <Lock className="w-6 h-6 text-indigo-600" />
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full border px-3 py-2 rounded-md"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter your current password to confirm changes to your
                      account.
                    </p>
                  </div>

                  {/* New Password */}
                  <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <Lock className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full border px-3 py-2 rounded-md"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Choose a strong password with at least 8 characters.
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <Lock className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <label className="block font-semibold mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full border px-3 py-2 rounded-md"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Re-enter your new password to make sure it matches.
                    </p>
                  </div>
                </div>
              )}

              {/* Update Button */}
              <button
                className={`mt-4 w-full lg:w-auto py-2 px-6 rounded-md transition ${
                  newName !== `${userData.first_name} ${userData.last_name}` ||
                  currentPassword ||
                  newPassword ||
                  confirmPassword
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                onClick={handleUpdateProfile}
                disabled={
                  !(
                    newName !==
                      `${userData.first_name} ${userData.last_name}` ||
                    currentPassword ||
                    newPassword ||
                    confirmPassword
                  )
                }
              >
                Update Profile
              </button>
            </div>
          </div>
        )}

        {active === "Message" && userData && (
          <MessagePage userData={userData} />
        )}
      </div>

      {/* Floating Message Button */}
      {active !== "Message" && (
        <button
          onClick={() => setActive("Message")}
          className="fixed bottom-6 right-6 bg-gray-900 border-2 border-white shadow-xl text-white rounded-full p-4 flex items-center justify-center hover:bg-gray-800 transition cursor-pointer"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
      <AdminFooter />
    </div>
  );
}
