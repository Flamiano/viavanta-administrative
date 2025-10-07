"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  ShieldCheck,
  LogOut,
  Menu,
  ChevronsLeft,
  ChevronsRight,
  X,
  Pencil,
  Trash2,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  Shield,
  UserCog,
  User,
  Lock,
  Camera,
  Briefcase,
  ClipboardList,
  MessageCircle,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";

import supabase from "@/utils/Supabase";

type Activity = {
  id: number;
  action: string;
  user_id: number;
  created_at: string;
};

type UserStatus = {
  status: string;
  value: number;
};

type LegalCount = {
  name: string;
  value: number;
  fill: string;
};

type MenuItem = {
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  items?: MenuItem[];
};

type User = {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  birthday: string;
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
};

type ActivitySummary = {
  date: string;
  admins: number;
  users: number;
  visitors: number;
  messages: number;
};

export default function MasterAdminDashboard() {
  const router = useRouter();
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [masterData, setMasterData] = useState<{
    id: number;
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [adminsCount, setAdminsCount] = useState<number>(0);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [visitorsToday, setVisitorsToday] = useState<number>(0);
  const [recentMessagesCount, setRecentMessagesCount] = useState<number>(0);
  const [activityData, setActivityData] = useState<ActivitySummary[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [usersByStatus, setUsersByStatus] = useState<UserStatus[]>([]);
  const [legalCounts, setLegalCounts] = useState<LegalCount[]>([]);
  const LEGAL_COLORS = ["#82ca9d", "#8884d8", "#f97316"];

  // Legal Counts
  useEffect(() => {
    const fetchLegalCounts = async () => {
      const { count: contracts } = await supabase
        .from("contracts")
        .select("*", { count: "exact" });
      const { count: cases } = await supabase
        .from("cases")
        .select("*", { count: "exact" });
      const { count: compliance } = await supabase
        .from("compliance_records")
        .select("*", { count: "exact" });

      setLegalCounts([
        { name: "Contracts", value: contracts || 0, fill: LEGAL_COLORS[0] },
        { name: "Cases", value: cases || 0, fill: LEGAL_COLORS[1] },
        { name: "Compliance", value: compliance || 0, fill: LEGAL_COLORS[2] },
      ]);
    };

    fetchLegalCounts();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Top counts
        const { count: adminsCountResult } = await supabase
          .from("admins")
          .select("*", { count: "exact" });
        const { count: usersCountResult } = await supabase
          .from("users")
          .select("*", { count: "exact" });
        const today = new Date().toISOString().split("T")[0];
        const { count: visitorsCount } = await supabase
          .from("visitors")
          .select("*", { count: "exact" })
          .eq("visit_date", today);
        const { count: messagesCount } = await supabase
          .from("messages")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(10);

        setAdminsCount(adminsCountResult || 0);
        setUsersCount(usersCountResult || 0);
        setVisitorsToday(visitorsCount || 0);
        setRecentMessagesCount(messagesCount || 0);

        // Sample activity data (last 7 days)
        const last7Days = Array.from({ length: 7 })
          .map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const formatted = date.toISOString().split("T")[0];
            return {
              date: formatted,
              admins: Math.floor(Math.random() * 5),
              users: Math.floor(Math.random() * 10),
              visitors: Math.floor(Math.random() * 8),
              messages: Math.floor(Math.random() * 12),
            };
          })
          .reverse();
        setActivityData(last7Days);

        // Fetch recent users
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (usersError) {
          console.error("Error fetching recent users:", usersError.message);
        } else {
          setRecentUsers(usersData || []);
        }

        // Users by Status (Approved, Declined, Pending)
        const { data: statusData, error: statusError } = await supabase
          .from("users")
          .select("approval_status, id");

        if (statusError) {
          console.error(
            "Error fetching user status data:",
            statusError.message
          );
        } else if (statusData) {
          const statusCounts: Record<string, number> = {};
          statusData.forEach((u) => {
            const status = u.approval_status || "Pending"; // fallback if null
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });

          const chartData: UserStatus[] = Object.entries(statusCounts).map(
            ([status, value]) => ({ status, value })
          );
          setUsersByStatus(chartData);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  //Time
  const [currentTime, setCurrentTime] = useState(new Date());
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: "long",
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });

  //Time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // update every second

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load active page from localStorage
    if (typeof window !== "undefined") {
      const savedActive = localStorage.getItem("activePage");
      if (savedActive) setActive(savedActive);
    }
  }, []);

  // Check authentication
  useEffect(() => {
    const storedMaster = localStorage.getItem("admin");

    if (!storedMaster) {
      router.replace("/auth/login-master");
      return;
    }

    try {
      const master = JSON.parse(storedMaster);
      if (!master || master.role !== "master") {
        router.replace("/auth/login-master");
        return;
      }
      setMasterData({
        id: master.id,
        name: master.name,
        email: master.email,
        role: master.role,
      });
      setCheckingAuth(false);
    } catch {
      router.replace("/auth/login-master");
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin");
      localStorage.removeItem("activePage");
    }
    router.replace("/auth/login-master");
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Checking access...
      </div>
    );
  }

  const menuGroups: { label: string | null; items: MenuItem[] }[] = [
    {
      label: null,
      items: [
        { name: "Dashboard", icon: LayoutDashboard },
        { name: "Admins", icon: UserCheck },
        { name: "Users", icon: Users },
        { name: "Reports", icon: FileText },
        { name: "Security", icon: ShieldCheck },
      ],
    },
  ];

  const bottomMenu: MenuItem[] = [{ name: "Logout", icon: LogOut }];

  const expandedWidth = 265;
  const collapsedWidth = 72;
  const sidebarWidth = sidebarCollapsed ? collapsedWidth : expandedWidth;

  const handleMenuClick = (name: string) => {
    setActive(name);
    if (typeof window !== "undefined") {
      localStorage.setItem("activePage", name);
    }
    if (sidebarOpen) setSidebarOpen(false);
  };

  // Sidebar Menu Item
  const renderMenuItem = (
    name: string,
    Icon: MenuItem["icon"],
    isDesktop = false
  ) => {
    const isActive = active === name;

    // Special case for Logout
    if (name === "Logout") {
      return (
        <button
          key={name}
          onClick={() => setShowLogoutModal(true)}
          className={`
          flex items-center gap-3 w-full py-3 px-4 transition cursor-pointer
          ${isDesktop ? "rounded-l-xl" : "rounded-md"}
          ${
            isActive
              ? isDesktop
                ? "bg-white text-gray-900 font-semibold"
                : "bg-gray-200 text-gray-900 font-semibold"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          }
        `}
          title={isDesktop && sidebarCollapsed ? name : undefined}
        >
          <Icon className="w-5 h-5 shrink-0" />
          {!sidebarCollapsed && <span className="truncate">{name}</span>}
        </button>
      );
    }

    // Regular menu items
    return (
      <button
        key={name}
        onClick={() => handleMenuClick(name)}
        className={`
        flex items-center gap-3 py-3 px-4 transition cursor-pointer
        ${isDesktop ? "rounded-l-3xl w-[calc(100%+4px)]" : "rounded-md w-full"}
        ${
          isActive
            ? isDesktop
              ? "bg-white text-gray-900 font-semibold"
              : "bg-white text-gray-900 font-semibold"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }
      `}
        title={isDesktop && sidebarCollapsed ? name : undefined}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {!sidebarCollapsed && <span className="truncate">{name}</span>}
      </button>
    );
  };

  return (
    <>
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
              {/* Header */}
              <div className="bg-red-600 text-white px-6 py-4">
                <h2 className="text-xl font-semibold">Confirm Logout</h2>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to logout?
                </p>

                {/* Actions */}
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
                    onClick={async () => {
                      setLoggingOut(true);

                      // Wait for 2 seconds before actual logout
                      setTimeout(() => {
                        handleLogout();
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

      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between lg:hidden">
        <button
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(true)}
          className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-xl truncate">Master Admin</h1>
      </header>

      <div className="min-h-screen flex bg-white">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarWidth }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="hidden lg:flex flex-col bg-gray-900 shadow-lg overflow-y-auto custom-scrollbar"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: sidebarWidth,
            zIndex: 1,
          }}
        >
          {/* Header with Logo */}
          <div className="flex items-center justify-center p-6 border-b border-gray-800 select-none">
            <Image
              src="/logo/logo-dark-bg.png"
              alt="ViaVanta Logo"
              width={sidebarCollapsed ? 40 : 120}
              height={40}
              className="object-contain transition-all duration-300"
            />
          </div>

          {/* Menu */}
          <nav className="flex flex-col flex-grow px-1 mt-4">
            {menuGroups.map((group, i) => (
              <div key={i} className="mb-6 last:mb-0">
                {group.label && !sidebarCollapsed && (
                  <p className="px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide select-none">
                    {group.label}
                  </p>
                )}
                {group.items.map((item: MenuItem) =>
                  item.items
                    ? item.items.map((sub: MenuItem) =>
                        renderMenuItem(sub.name, sub.icon, false)
                      )
                    : renderMenuItem(item.name, item.icon, false)
                )}
              </div>
            ))}
          </nav>

          {/* Bottom Menu */}
          <div className="border-t border-gray-800 px-1 py-3 mb-4">
            {bottomMenu.map(({ name, icon: Icon }) =>
              renderMenuItem(name, Icon, true)
            )}
          </div>
        </motion.aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />

              {/* Sidebar Panel */}
              <motion.aside
                className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 shadow-lg overflow-y-auto custom-scrollbar lg:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b select-none">
                  <span className="font-bold text-xl text-white">
                    Master Admin
                  </span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                    className="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Menu */}
                <nav className="flex flex-col flex-grow px-1 mt-4">
                  {menuGroups.map((group, i) => (
                    <div key={i} className="mb-6 last:mb-0">
                      {group.label && (
                        <p className="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide select-none">
                          {group.label}
                        </p>
                      )}
                      {group.items.map((item: MenuItem) =>
                        item.items
                          ? item.items.map((sub: MenuItem) =>
                              renderMenuItem(sub.name, sub.icon, false)
                            )
                          : renderMenuItem(item.name, item.icon, false)
                      )}
                    </div>
                  ))}
                </nav>

                {/* Bottom Menu */}
                <div className="border-t border-gray-200 px-1 py-3 mb-4">
                  {bottomMenu.map(({ name, icon: Icon }) =>
                    renderMenuItem(name, Icon, true)
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className="flex-1 overflow-auto min-h-screen pt-6 pb-6 px-4 lg:pr-6"
          style={{
            ...({
              "--sidebar-width": `${sidebarWidth}px`,
              "--sidebar-gap": "16px",
            } as React.CSSProperties),
          }}
        >
          <style jsx>{`
            main {
              transition: padding-left 0.3s;
            }
            /* Mobile */
            @media (max-width: 1023px) {
              main {
                padding-left: 1rem; /* 16px */
                padding-right: 1rem;
              }
            }
            /* Desktop */
            @media (min-width: 1024px) {
              main {
                padding-left: calc(var(--sidebar-width) + var(--sidebar-gap));
              }
            }
          `}</style>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {masterData?.role === "master" && (
              <h1 className="flex justify-between items-center text-3xl font-bold sticky top-0 z-20 pt-2 pb-2 px-4 border-b border-gray-200 bg-white">
                {/* Leftside Active page name and Arrow */}
                <div className="flex items-center gap-3">
                  {/* Collapse/Expand Button */}
                  <div className="relative hidden lg:flex group">
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      aria-label={
                        sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                      }
                      className="bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800 rounded-full shadow p-1 cursor-pointer"
                    >
                      {sidebarCollapsed ? (
                        <ChevronsRight className="w-6 h-6" />
                      ) : (
                        <ChevronsLeft className="w-6 h-6" />
                      )}
                    </button>

                    {/* Tooltip */}
                    <span className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      {sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
                    </span>
                  </div>

                  {/* Active Page Title */}
                  <span>{active}</span>
                </div>

                {/* Right side Date, Time and Profile */}
                <div className="hidden lg:flex items-center gap-4">
                  {/* Date & Time */}
                  <div className="text-right font-semibold">
                    <span className="text-lg">{formattedDate}</span>
                    <span className="ml-4 text-lg">{formattedTime}</span>
                  </div>

                  {/* Profile Icon */}
                  <div
                    className="relative group flex items-center gap-2 cursor-pointer"
                    onClick={() => setActive("Security")}
                  >
                    <User className="w-10 h-10 text-gray-600 rounded-full p-2 bg-gray-200" />

                    {/* Tooltip */}
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      {masterData?.name || "Profile"}
                    </span>
                  </div>
                </div>
              </h1>
            )}

            {/* Dashboard */}
            {active === "Dashboard" && (
              <div className="p-6 space-y-6">
                {/* Top 4 Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Admins */}
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white rounded-2xl shadow-md p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <UserCheck className="w-5 h-5" />
                        Admins Count
                      </div>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {adminsCount || 0}
                    </p>
                  </div>

                  {/* Users */}
                  <div className="bg-gradient-to-r from-green-600 to-green-400 text-white rounded-2xl shadow-md p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Users className="w-5 h-5" />
                        Users Count
                      </div>
                    </div>
                    <p className="text-2xl font-bold mt-2">{usersCount || 0}</p>
                  </div>

                  {/* Visitors */}
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-white rounded-2xl shadow-md p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <User className="w-5 h-5" />
                        Visitors Today
                      </div>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {visitorsToday || 0}
                    </p>
                  </div>

                  {/* Messages */}
                  <div className="bg-gradient-to-r from-red-600 to-red-400 text-white rounded-2xl shadow-md p-4 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MessageCircle className="w-5 h-5" />
                      Recent Messages
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {recentMessagesCount || 0}
                    </p>
                  </div>
                </div>

                {/* Activity Graph */}
                <div className="bg-gray-900 rounded-2xl p-4 shadow-md w-full mt-6">
                  <h3 className="text-white font-semibold mb-4">
                    Activity Overview
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={activityData}>
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
                        dataKey="admins"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#82ca9d"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="visitors"
                        stroke="#ffc658"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="messages"
                        stroke="#f97316"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent Users Table */}
                <div className="overflow-x-auto bg-white rounded-lg shadow mt-6">
                  <div className="px-4 py-2 bg-gray-100 border-b flex items-center justify-between">
                    <span className="font-semibold text-gray-800">
                      Recent Users
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date().toLocaleDateString([], {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-900 text-white">
                      <tr>
                        <th className="px-4 py-2 border">#</th>
                        <th className="px-4 py-2 border">Name</th>
                        <th className="px-4 py-2 border">Email</th>
                        <th className="px-4 py-2 border">Status</th>
                        <th className="px-4 py-2 border">Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.length > 0 ? (
                        recentUsers.map((user, idx) => (
                          <tr key={user.id} className="hover:bg-gray-100">
                            <td className="px-4 py-2 border">{idx + 1}</td>
                            <td className="px-4 py-2 border">
                              {[
                                user.first_name,
                                user.middle_name,
                                user.last_name,
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            </td>
                            <td className="px-4 py-2 border">{user.email}</td>
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
                            <td className="px-4 py-2 border">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-4 bg-blue-50 text-blue-700 rounded-lg"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Info className="w-5 h-5" />
                              No users found.
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* RadialBarChart & PieChart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Legal Overview RadialBarChart */}
                  <div className="flex flex-col items-center justify-center bg-gray-900 rounded-2xl p-6 shadow-md w-full h-[320px]">
                    <h3 className="text-white font-semibold text-lg mb-4 text-center">
                      Legal Overview
                    </h3>
                    <ResponsiveContainer width={250} height={250}>
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="20%"
                        outerRadius="90%"
                        barSize={14}
                        data={legalCounts}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <RadialBar background dataKey="value" />
                        <Legend
                          iconSize={12}
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ color: "#fff", fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Users by Status PieChart */}
                  <div className="flex flex-col items-center justify-center bg-gray-900 rounded-2xl p-6 shadow-md w-full h-[320px]">
                    <h3 className="text-white font-semibold text-lg mb-4 text-center">
                      Users by Status
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={usersByStatus}
                          dataKey="value"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {usersByStatus.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.status === "Approved"
                                  ? "#4ade80" // green
                                  : entry.status === "Declined"
                                  ? "#f87171" // red
                                  : "#facc15" // yellow
                              }
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          itemStyle={{ color: "#fff" }}
                        />
                        <Legend wrapperStyle={{ color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {active === "Admins" && <AdminsPage />}
            {active === "Users" && <UsersPage />}
            {active === "Reports" && <ReportsPage />}
            {active === "Security" && <SecurityPage />}
          </motion.div>
        </main>
      </div>
    </>
  );
}

// ============================ Admins Page ============================

type AdminRow = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "master" | string;
  created_at: string | null;
};

function AdminsPage() {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState<string | null>(null);
  const [masterAdmin, setMasterAdmin] = useState<AdminRow | null>(null);

  const [roleFilter, setRoleFilter] = useState<"All" | "admin" | "master">(
    "All"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredAdmins = useMemo(() => {
    let result = rows;
    if (roleFilter !== "All") {
      result = result.filter((r) => r.role === roleFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((r) =>
        [r.name, r.email, r.role].some((v) =>
          String(v).toLowerCase().includes(q)
        )
      );
    }
    return result;
  }, [rows, roleFilter, search]);

  const totalPages = Math.ceil(filteredAdmins.length / pageSize) || 1;
  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }

  useEffect(() => {
    fetchAdmins();
    fetchMaster();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    const { data, error } = await supabase
      .from("admins")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setRows([]);
    } else {
      setRows((data as AdminRow[]) ?? []);
    }
    setLoading(false);
  }

  // Fetch the master admin
  async function fetchMaster() {
    const { data, error } = await supabase
      .from("admins")
      .select("id, name, email, role")
      .eq("role", "master")
      .single();

    if (error) {
      console.error("Failed to fetch master:", error);
      setMasterAdmin(null);
    } else {
      setMasterAdmin(data as AdminRow);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchAdmins();
    setRefreshing(false);
  }

  // Reset Modal
  function resetWizard() {
    setForm({ name: "", email: "", password: "", confirm: "" });
    setStep(1);
    setFormError(null);
    setCreating(false);
  }

  function resetEdit() {
    setEditingAdmin(null);
    setEditForm({
      name: "",
      currentPassword: "",
      password: "",
      confirmPassword: "",
    });
    setEditError(null);
    setSavingEdit(false);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.email, r.role].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  function nextStep() {
    setFormError(null);
    if (step === 1) {
      if (!form.name.trim()) return setFormError("Name is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        return setFormError("Enter a valid email address.");
      setStep(2);
    } else if (step === 2) {
      if (form.password.length < 6)
        return setFormError("Password must be at least 6 characters.");
      if (form.password !== form.confirm)
        return setFormError("Passwords do not match.");
      setStep(3);
    }
  }

  function prevStep() {
    setFormError(null);
    setStep((s) => (s === 3 ? 2 : 1));
  }

  async function createAdmin() {
    setFormError(null);
    setCreating(true);
    // Role automatically admin; created_by left NULL (DB handles it)
    const { error } = await supabase.from("admins").insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password, // NOTE: consider hashing later
      role: "admin",
    });
    if (error) {
      setFormError(
        error.message.includes("duplicate") || error.message.includes("unique")
          ? "Email already exists."
          : `Failed to create admin: ${error.message}`
      );
      setCreating(false);
      return;
    }
    setCreating(false);
    setCreatedSuccess("Admin account created successfully.");
    setShowWizard(false);
    setForm({ name: "", email: "", password: "", confirm: "" });
    setStep(1);
    await fetchAdmins();
  }

  // For edit/delete
  const [editingAdmin, setEditingAdmin] = useState<AdminRow | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingAdmin, setDeletingAdmin] = useState<AdminRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Handle Edit save
  async function saveEdit() {
    setEditError("");

    if (!editForm.name.trim()) {
      setEditError("Name is required.");
      return;
    }

    // If any password field is filled, require all three fields
    if (
      editForm.currentPassword ||
      editForm.password ||
      editForm.confirmPassword
    ) {
      if (!editForm.currentPassword.trim()) {
        setEditError("Current password is required.");
        return;
      }
      if (!editForm.password.trim()) {
        setEditError("New password is required.");
        return;
      }
      if (editForm.password.trim() !== editForm.confirmPassword.trim()) {
        setEditError("New passwords do not match.");
        return;
      }

      // Check if current password is correct
      const { data: adminData, error: fetchError } = await supabase
        .from("admins")
        .select("password")
        .eq("id", editingAdmin?.id)
        .single();

      if (fetchError) {
        setEditError("Failed to verify current password.");
        return;
      }

      if (adminData.password !== editForm.currentPassword.trim()) {
        setEditError("Current password is incorrect.");
        return;
      }
    }

    setSavingEdit(true);

    // Prepare updates
    const updates: Partial<
      AdminRow & { password?: string; updated_at?: string }
    > = {
      name: editForm.name.trim(),
      updated_at: new Date().toISOString(),
    };

    if (editForm.password.trim()) {
      updates.password = editForm.password.trim();
    }

    // Update in DB
    const { error } = await supabase
      .from("admins")
      .update(updates)
      .eq("id", editingAdmin?.id);

    setSavingEdit(false);

    if (error) {
      setEditError("Failed to update admin.");
      return;
    }

    setEditingAdmin(null);
    await fetchAdmins();
  }

  // Handle Delete confirm
  async function confirmDelete() {
    if (!deletingAdmin) return;
    setDeleting(true);

    const { error } = await supabase
      .from("admins")
      .delete()
      .eq("id", deletingAdmin.id);

    setDeleting(false);
    setDeletingAdmin(null);

    if (!error) {
      await fetchAdmins();
    }
  }

  return (
    <div className="p-6 bg-white">
      {/* Page intro */}
      <p className="text-gray-600 mb-4">
        Manage all registered <span className="font-medium">admins</span> here.
        You can search, filter by role, refresh the list, add new admin
        accounts, and update or delete existing ones. This section helps you
        organize who has administrative access to the system.
      </p>

      {masterAdmin && (
        <p className="mb-4 text-sm text-gray-500">
          Logged in as: <span className="font-medium">{masterAdmin.name}</span>{" "}
          ({masterAdmin.role})
        </p>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {/* Total Admins */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Admins</p>
            <p className="text-xl font-semibold">{rows.length}</p>
          </div>
        </div>

        {/* Master Admins */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-full">
            <Shield className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Master Admins</p>
            <p className="text-xl font-semibold">
              {rows.filter((r) => r.role === "master").length}
            </p>
          </div>
        </div>

        {/* Regular Admins */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-full">
            <UserCog className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Admins</p>
            <p className="text-xl font-semibold">
              {rows.filter((r) => r.role === "admin").length}
            </p>
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
            placeholder="Search admins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        {/* Right: Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Admin
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2 mb-4">
        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value as "All" | "admin" | "master")
          }
          className="border rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="All">All Roles</option>
          <option value="admin">Admin</option>
          <option value="master">Master</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border hidden sm:table-cell">Created</th>
              <th className="px-4 py-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  Loading admins...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Info className="w-5 h-5" />
                    No admins found.
                  </div>
                </td>
              </tr>
            ) : (
              paginatedAdmins.map((r, idx) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-4 py-2 border">{r.name}</td>
                  <td className="px-4 py-2 border">{r.email}</td>
                  <td className="px-4 py-2 border">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        r.role === "master"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {r.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 border hidden sm:table-cell">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString("en-PH")
                      : "—"}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <div className="inline-flex gap-2">
                      <button
                        className="p-2 rounded-lg cursor-pointer bg-green-600 hover:bg-green-700"
                        title="Edit"
                        onClick={() => {
                          setEditingAdmin(r);
                          setEditForm({
                            name: r.name,
                            currentPassword: "",
                            password: "",
                            confirmPassword: "",
                          });
                        }}
                      >
                        <Pencil className="w-4 h-4 text-white" />
                      </button>
                      <button
                        className="p-2 rounded-lg cursor-pointer bg-red-600 hover:bg-red-700"
                        title="Delete"
                        onClick={() => setDeletingAdmin(r)}
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
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

      {/* Add Admin Modal */}
      <AnimatePresence>
        {showWizard && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                resetWizard();
                setShowWizard(false);
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
                      Create Admin Account
                    </h3>
                    <p className="text-xs text-gray-400">3-step guided setup</p>
                  </div>
                  <button
                    className="p-2 rounded hover:text-gray-400 cursor-pointer"
                    onClick={() => {
                      resetWizard();
                      setShowWizard(false);
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
                            {s === 1 && "Basic Info"}
                            {s === 2 && "Security"}
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
                        className="grid gap-3 sm:gap-4"
                      >
                        <label className="text-sm font-medium">Full Name</label>
                        <input
                          placeholder="e.g., John Roel Flamiano"
                          value={form.name}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, name: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />

                        <label className="text-sm font-medium">Email</label>
                        <input
                          type="email"
                          placeholder="name@company.com"
                          value={form.email}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, email: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />

                        <label className="text-sm font-medium">Role</label>
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-medium">
                            Admin (automatic)
                          </span>
                        </div>
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
                        <label className="text-sm font-medium">Password</label>
                        <input
                          type="password"
                          placeholder="Minimum 6 characters"
                          value={form.password}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, password: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                                {form.name || "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Email</dt>
                              <dd className="font-medium">
                                {form.email || "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Role</dt>
                              <dd>
                                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 text-indigo-700 px-2.5 py-0.5 text-xs font-medium">
                                  Admin
                                </span>
                              </dd>
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
                  {step < 3 ? (
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
                      onClick={createAdmin}
                      disabled={creating}
                    >
                      {creating ? "Creating…" : "Create Admin"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {createdSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 shadow-lg">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">{createdSuccess}</span>
              <button
                className="ml-2 text-white/80 hover:text-white cursor-pointer"
                onClick={() => setCreatedSuccess(null)}
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Admin Modal */}
      <AnimatePresence>
        {editingAdmin && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                resetEdit(); // reset form + close
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
                  <h3 className="font-semibold text-sm sm:text-base">
                    Edit Admin
                  </h3>
                  <button
                    className="p-2 rounded hover:text-gray-400 cursor-pointer"
                    onClick={resetEdit}
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-3 sm:px-6 py-4 flex-1 overflow-y-auto">
                  {editError && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{editError}</span>
                    </div>
                  )}

                  {/* Name */}
                  <div className="mb-4">
                    <label className="text-sm font-medium">Name</label>
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  {/* Current Password */}
                  <div className="mb-4">
                    <label className="text-sm font-medium">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={editForm.currentPassword || ""}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  {/* New Password */}
                  <div className="mb-4">
                    <label className="text-sm font-medium">
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      value={editForm.password}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, password: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={editForm.confirmPassword || ""}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-3 sm:px-6 py-3 border-t bg-white flex items-center justify-end gap-2">
                  <button
                    className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-gray-300 px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 cursor-pointer"
                    onClick={resetEdit}
                    disabled={savingEdit}
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex items-center gap-1 sm:gap-2 rounded-lg bg-indigo-600 text-white px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                    onClick={saveEdit}
                    disabled={savingEdit}
                  >
                    {savingEdit ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deletingAdmin && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingAdmin(null)}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="bg-white rounded-lg w-full max-w-md shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-red-600 text-white px-6 py-4">
                  <h3 className="text-lg font-semibold">Confirm Delete</h3>
                </div>

                {/* Body */}
                <div className="p-6">
                  <p className="mb-6 text-gray-700">
                    Are you sure you want to permanently delete{" "}
                    <span className="font-medium">{deletingAdmin.name}</span>?
                    This action cannot be undone.
                  </p>

                  {/* Footer buttons */}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setDeletingAdmin(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================ Users Page ============================

type UserRow = {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  birthday: string;
  age: number | null;
  email: string;
  contact_number: string;
  address: string;
  zipcode: string;
  created_at: string | null;
};

function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const pageSize = 10;

  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [masterAdmin, setMasterAdmin] = useState<{
    id: number;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // Fetch the master admin
  async function fetchMaster() {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("id, name, email, role")
        .eq("role", "master")
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch master:", error.message);
        setMasterAdmin(null);
      } else {
        setMasterAdmin(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching master:", err);
      setMasterAdmin(null);
    }
  }
  useEffect(() => {
    fetchMaster();
  }, []);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, first_name, middle_name, last_name, birthday, age, email, contact_number, address, zipcode, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setRows([]);
    } else {
      setRows((data as UserRow[]) ?? []);
    }
    setLoading(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Format date like "Monday, August 13, 2025"
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Build table rows
    const tableRows = filtered
      .map(
        (r) => `
          <tr>
            <td>${r.first_name} ${r.middle_name ? r.middle_name + " " : ""}${
          r.last_name
        }</td>
            <td>${r.email}</td>
            <td>${r.contact_number}</td>
            <td>${r.address}</td>
            <td>${
              r.created_at ? new Date(r.created_at).toLocaleString() : "—"
            }</td>
          </tr>`
      )
      .join("");

    // Write print HTML
    printWindow.document.write(`
      <html>
        <head>
          <title>Users - ViaVanta Agency</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #000;
            }
            /* Header layout */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .header-left {
              font-size: 14px;
            }
            .header-center {
              text-align: center;
              flex: 1;
            }
            .header-center img {
              width: 80px;
              display: block;
              margin: 0 auto 5px;
            }
            .header-center h2,
            .header-center h3 {
              margin: 2px 0;
              font-weight: bold;
            }
            .header-right {
              font-size: 18px;
              font-weight: bold;
              text-align: right;
            }
            /* Table styling */
            table {
              border-collapse: collapse;
              width: 100%;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">${formattedDate}</div>
            <div class="header-center">
              <img src="${window.location.origin}/logo/logo-white-bg.png" alt="Logo" />
              <h2>TRAVEL & TOURS</h2>
              <h2>MANAGEMENT SYSTEM</h2>
              <h3>ADMINISTRATIVE</h3>
            </div>
            <div class="header-right">ALL USERS</div>
          </div>
  
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  // Filtering and Pagination
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let filteredRows = rows;

    // Search
    if (q) {
      filteredRows = filteredRows.filter((r) =>
        [r.first_name, r.middle_name, r.last_name, r.email]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    // Month filter
    if (month) {
      filteredRows = filteredRows.filter((r) => {
        if (!r.created_at) return false;
        return new Date(r.created_at).getMonth() + 1 === parseInt(month);
      });
    }

    // Year filter
    if (year) {
      filteredRows = filteredRows.filter((r) => {
        if (!r.created_at) return false;
        return new Date(r.created_at).getFullYear() === parseInt(year);
      });
    }

    return filteredRows;
  }, [rows, search, month, year]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }

  return (
    <div className="p-6 bg-white">
      {/* Page intro */}
      <p className="text-gray-600 mb-4">
        Manage all registered <span className="font-medium">users</span> here.
        You can search, filter by registration date, refresh the list, and
        export user records. This section helps you organize your client
        database.
      </p>

      {masterAdmin && (
        <p className="mb-4 text-sm text-gray-500">
          Logged in as: <span className="font-medium">{masterAdmin.name}</span>{" "}
          ({masterAdmin.role})
        </p>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {/* Total Users */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Users</p>
            <p className="text-xl font-semibold">{rows.length}</p>
          </div>
        </div>

        {/* With Email */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-full">
            <UserCog className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Users w/ Email</p>
            <p className="text-xl font-semibold">
              {rows.filter((r) => r.email).length}
            </p>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-full">
            <Shield className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">New This Month</p>
            <p className="text-xl font-semibold">
              {
                rows.filter((r) => {
                  if (!r.created_at) return false;
                  const d = new Date(r.created_at);
                  const now = new Date();
                  return (
                    d.getMonth() === now.getMonth() &&
                    d.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </p>
          </div>
        </div>
      </div>

      {/* Search and Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        {/* Search */}
        <div className="flex-1 sm:flex-auto relative max-w-full sm:max-w-xs">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-green-600 hover:bg-green-700 cursor-pointer transition text-white"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2 mb-4">
        {/* Month filter */}
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="">All Months</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        {/* Year filter */}
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border rounded-lg px-3 py-2 cursor-pointer"
        >
          <option value="">All Years</option>
          {[...new Set(rows.map((r) => new Date(r.created_at!).getFullYear()))]
            .sort((a, b) => b - a)
            .map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
        </select>

        {/* Result count */}
        <div className="text-sm text-gray-500 ml-auto">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </div>
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
              <th className="px-4 py-2 border hidden sm:table-cell">Address</th>
              <th className="px-4 py-2 border hidden sm:table-cell">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading || refreshing ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-4 text-blue-700 bg-blue-100"
                >
                  Loading users...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-blue-700 bg-blue-100"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Info className="w-5 h-5" />
                    No results found.
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((r, idx) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-4 py-3 border font-medium text-gray-800">
                    {`${r.first_name}${
                      r.middle_name ? " " + r.middle_name : ""
                    } ${r.last_name}`}
                  </td>
                  <td className="px-4 py-3 border text-gray-700">{r.email}</td>
                  <td className="px-4 py-3 border text-gray-700">
                    {r.contact_number}
                  </td>
                  <td className="px-4 py-3 border text-gray-700 hidden sm:table-cell">
                    {r.address}
                  </td>
                  <td className="px-4 py-3 border text-gray-600 hidden sm:table-cell">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString("en-PH")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
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
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================ Reports Page ============================

// Reusable KPI card
function KpiCard({
  icon,
  title,
  value,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-gray-900 text-white rounded-2xl shadow-md p-4 flex items-center gap-3">
      <div className={`p-3 rounded-full ${iconBg}`}>
        <div className={`${iconColor}`}>{icon}</div>
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

// Reusable chart wrapper
function ChartCard<T>({
  title,
  data,
  children,
}: {
  title: string;
  data: T[];
  children: React.ReactElement; // ✅ more specific
}) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="relative w-full h-[250px]">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center py-3 px-6 text-blue-700 bg-blue-100 rounded-lg flex items-center gap-2">
              <Info className="w-5 h-5" />
              No data available
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// Types
type UserApprovalRow = { approval_status: string; count: number };
type VisitorRow = { status: string; total: number };
type ReservationRow = { month: string; total: number };
type MessageRow = { month: string; total: number };
type ContractRow = {
  id: number;
  contract_number: string;
  title: string;
  end_date: string | null;
  status: string;
};
type ApprovalAgg = Record<string, number>;
type VisitorAgg = Record<string, number>;
type MonthAgg = Record<string, number>;

// Colors for approval
const approvalColors: Record<string, string> = {
  Approved: "#22c55e",
  Pending: "#eab308",
};

// Colors for visitor statuses
const visitorColors: Record<string, string> = {
  Expected: "#3b82f6",
  "Checked-in": "#22c55e",
  "Checked-out": "#9333ea",
  Cancelled: "#ef4444",
};

function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("this_month");

  // Data states
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [activeContracts, setActiveContracts] = useState(0);
  const [openCases, setOpenCases] = useState(0);
  const [pendingCompliances, setPendingCompliances] = useState(0);

  const [usersByApproval, setUsersByApproval] = useState<UserApprovalRow[]>([]);
  const [visitorsByStatus, setVisitorsByStatus] = useState<VisitorRow[]>([]);
  const [monthlyReservations, setMonthlyReservations] = useState<
    ReservationRow[]
  >([]);
  const [messagesByMonth, setMessagesByMonth] = useState<MessageRow[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<ContractRow[]>([]);
  const [masterAdmin, setMasterAdmin] = useState<{
    id: number;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // Print Handler
  function handlePrintGraphs() {
    const kpiSection = `
    <div class="kpi-container">
      <h3>Key Performance Indicators</h3>
      <div class="kpi-row">
        <div>Users ${totalUsers}</div>
        <div>Visitors ${totalVisitors}</div>
        <div>Contracts ${activeContracts}</div>
        <div>Open Cases ${openCases}</div>
        <div>Pending Compliances ${pendingCompliances}</div>
      </div>
    </div>
  `;

    const tableSection = document.querySelector("#print-table");

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // 🔹 Merge Analytical Tables
    const analyticalTables = `
    <h3>Analytical Data</h3>

    <!-- Users by Approval -->
    <h4>Users by Approval Status</h4>
    <table>
      <thead><tr><th>Status</th><th>Count</th></tr></thead>
      <tbody>
        ${usersByApproval
          .map(
            (row) =>
              `<tr><td>${row.approval_status}</td><td>${row.count}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>

    <!-- Visitors -->
    <h4>Visitors by Status</h4>
    <table>
      <thead><tr><th>Status</th><th>Total</th></tr></thead>
      <tbody>
        ${visitorsByStatus
          .map((row) => `<tr><td>${row.status}</td><td>${row.total}</td></tr>`)
          .join("")}
      </tbody>
    </table>

    <!-- Reservations -->
    <h4>Monthly Reservations</h4>
    <table>
      <thead><tr><th>Month</th><th>Total</th></tr></thead>
      <tbody>
        ${monthlyReservations
          .map((row) => `<tr><td>${row.month}</td><td>${row.total}</td></tr>`)
          .join("")}
      </tbody>
    </table>

    <!-- Messages -->
    <h4>Messages Per Month</h4>
    <table>
      <thead><tr><th>Month</th><th>Total</th></tr></thead>
      <tbody>
        ${messagesByMonth
          .map((row) => `<tr><td>${row.month}</td><td>${row.total}</td></tr>`)
          .join("")}
      </tbody>
    </table>
  `;

    printWindow.document.write(`
    <html>
      <head>
        <title>System Report - Travel & Tours</title>
        <style>
          body {
            font-family: "Times New Roman", Times, serif;
            margin: 40px;
            color: #000;
            font-size: 12px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .header-left { font-size: 14px; }
          .header-center { text-align: center; flex: 1; }
          .header-center img { width: 80px; display: block; margin: 0 auto 5px; }
          .header-center h2, .header-center h3 { margin: 2px 0; font-weight: bold; }
          .header-right { font-size: 18px; font-weight: bold; text-align: right; color: red; }
          h3 { margin: 14px 0 6px; }
          h4 { margin: 12px 0 6px; color: #1f2937; }

          /* KPI Row */
          .kpi-row {
            display: flex;
            gap: 30px;
            margin: 10px 0 20px;
            font-size: 14px;
            font-weight: bold;
          }

          /* Table Styling */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
            font-size: 12px;
          }
          th {
            background: #2563eb !important; /* blue-600 */
            color: #fff !important;
            padding: 6px;
            text-align: left;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          td {
            border: 1px solid #ccc;
            padding: 6px;
          }
          tr:nth-child(even) {
            background: #f9fafb !important; /* gray-50 */
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          tr:hover {
            background: #f3f4f6 !important; /* gray-100 */
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div class="header-left">${formattedDate}</div>
          <div class="header-center">
            <img src="${
              window.location.origin
            }/logo/logo-white-bg.png" alt="Logo" />
            <h2>TRAVEL & TOURS</h2>
            <h2>MANAGEMENT SYSTEM</h2>
            <h3>ADMINISTRATIVE</h3>
          </div>
          <div class="header-right">SYSTEM REPORT</div>
        </div>

        <!-- KPI Section -->
        ${kpiSection}

        <!-- Analytical Data -->
        ${analyticalTables}

        <!-- Expiring Contracts -->
        <div>
          <h3>Upcoming Expiring Contracts</h3>
          ${tableSection ? tableSection.innerHTML : ""}
        </div>

        <!-- Signature Section -->
        <div style="margin-top:60px; text-align:left;">
          <div style="border-top:1px solid #000; width:150px;"></div>
          <p style="margin-top:6px; font-size:12px; font-weight:bold;">
            Signature over printed name
          </p>
          <p style="font-size:12px;">Master Administrator</p>
        </div>
      </body>
    </html>
  `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  // Fetch the master admin
  async function fetchMaster() {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("id, name, email, role")
        .eq("role", "master")
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch master:", error.message);
        setMasterAdmin(null);
      } else {
        setMasterAdmin(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching master:", err);
      setMasterAdmin(null);
    }
  }
  useEffect(() => {
    fetchMaster();
  }, []);

  // Fetch all reports
  async function fetchReports() {
    setLoading(true);

    try {
      // Total Users
      const { count: usersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });
      setTotalUsers(usersCount || 0);

      // Users by approval
      const { data: usersData } = await supabase
        .from("users")
        .select("approval_status");
      const approvalAgg: ApprovalAgg = (usersData || []).reduce(
        (acc: ApprovalAgg, u: { approval_status?: string }) => {
          const status = u.approval_status || "Pending";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {}
      );
      setUsersByApproval(
        Object.keys(approvalAgg).map((status) => ({
          approval_status: status,
          count: approvalAgg[status],
        }))
      );

      // Total Visitors
      const { count: visitorsCount } = await supabase
        .from("visitors")
        .select("*", { count: "exact", head: true });
      setTotalVisitors(visitorsCount || 0);

      // Visitors by status
      const { data: visitorsData } = await supabase
        .from("visitors")
        .select("status");
      const visitorsAgg: VisitorAgg = (visitorsData || []).reduce(
        (acc: VisitorAgg, v: { status?: string }) => {
          const s = v.status || "Expected";
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        },
        {}
      );
      setVisitorsByStatus(
        Object.keys(visitorsAgg).map((s) => ({
          status: s,
          total: visitorsAgg[s],
        }))
      );

      // Active Contracts
      const { count: activeCount } = await supabase
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .eq("status", "Active");
      setActiveContracts(activeCount || 0);

      // Expiring Contracts (next 30 days)
      const { data: expiring } = await supabase
        .from("contracts")
        .select("id, contract_number, title, end_date, status")
        .not("end_date", "is", null)
        .lte(
          "end_date",
          new Date(new Date().setDate(new Date().getDate() + 30)).toISOString()
        );
      setExpiringContracts((expiring as ContractRow[]) || []);

      // Open Cases
      const { count: openCount } = await supabase
        .from("cases")
        .select("*", { count: "exact", head: true })
        .eq("status", "Open");
      setOpenCases(openCount || 0);

      // Pending Compliances
      const { count: compCount } = await supabase
        .from("compliance_records")
        .select("*", { count: "exact", head: true })
        .eq("status", "Pending");
      setPendingCompliances(compCount || 0);

      // Monthly Reservations
      const { data: reservations } = await supabase
        .from("facility_reservations")
        .select("reservation_date");
      const resAgg: MonthAgg = (reservations || []).reduce(
        (acc: MonthAgg, r: { reservation_date: string }) => {
          const month = new Date(r.reservation_date).toLocaleString("default", {
            month: "short",
          });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        },
        {}
      );
      setMonthlyReservations(
        Object.keys(resAgg).map((m) => ({ month: m, total: resAgg[m] }))
      );

      // Messages per Month
      const { data: messages } = await supabase
        .from("messages")
        .select("created_at");
      const msgAgg: MonthAgg = (messages || []).reduce(
        (acc: MonthAgg, m: { created_at: string }) => {
          const month = new Date(m.created_at).toLocaleString("default", {
            month: "short",
          });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        },
        {}
      );
      setMessagesByMonth(
        Object.keys(msgAgg).map((m) => ({ month: m, total: msgAgg[m] }))
      );
    } catch (err) {
      console.error("Error fetching reports:", err);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchReports();
  }, [range]);

  return (
    <div className="p-6 bg-white">
      {/* Page intro */}
      <p className="text-gray-600 mb-4">
        View and analyze key <span className="font-medium">reports</span> across
        your system. This section provides KPIs, charts, and contract insights
        to help you monitor users, visitors, reservations, and messages. Use the
        filters above to adjust the date range and keep track of expiring
        contracts effectively.
      </p>

      {masterAdmin && (
        <p className="mb-4 text-sm text-gray-500">
          Logged in as: <span className="font-medium">{masterAdmin.name}</span>{" "}
          ({masterAdmin.role})
        </p>
      )}

      {/* Filters + Print */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label htmlFor="range" className="text-sm font-medium text-gray-600">
          Filter by:
        </label>
        <select
          id="range"
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="7days">Last 7 Days</option>
          <option value="this_month">This Month</option>
          <option value="custom">Custom</option>
        </select>

        {/* Print button */}
        <button
          onClick={handlePrintGraphs}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Print Report
        </button>
      </div>

      {/* KPI Cards */}
      <div
        id="print-kpi"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <KpiCard
          icon={<Users size={24} />}
          title="Users"
          value={totalUsers}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <KpiCard
          icon={<ClipboardList size={24} />}
          title="Visitors"
          value={totalVisitors}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <KpiCard
          icon={<FileText size={24} />}
          title="Contracts"
          value={activeContracts}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <KpiCard
          icon={<Briefcase size={24} />}
          title="Open Cases"
          value={openCases}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <KpiCard
          icon={<MessageCircle size={24} />}
          title="Pending Compliances"
          value={pendingCompliances}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Charts */}
      <div id="print-charts" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users by Approval */}
        <div className="chart-item">
          <ChartCard<UserApprovalRow>
            title="Users by Approval Status"
            data={usersByApproval}
          >
            <PieChart>
              <Pie
                data={usersByApproval}
                dataKey="count"
                nameKey="approval_status"
                label
              >
                {usersByApproval.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={approvalColors[entry.approval_status] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ChartCard>
        </div>
        <div className="chart-item">
          {/* Visitors by Status */}
          <ChartCard title="Visitors by Status" data={visitorsByStatus}>
            <BarChart data={visitorsByStatus}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="total"
                label={{ position: "top" }}
                radius={[4, 4, 0, 0]}
              >
                {visitorsByStatus.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={visitorColors[entry.status] || "#8884d8"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        </div>

        <div className="chart-item">
          {/* Monthly Reservations */}
          <ChartCard title="Monthly Reservations" data={monthlyReservations}>
            <LineChart data={monthlyReservations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#9333ea" />
            </LineChart>
          </ChartCard>
        </div>
        <div className="chart-item">
          {/* Messages Per Month */}
          <ChartCard title="Messages Per Month" data={messagesByMonth}>
            <BarChart data={messagesByMonth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#f43f5e" />
            </BarChart>
          </ChartCard>
        </div>
      </div>

      {/* Table: Upcoming Expiring Contracts */}
      <div
        id="print-table"
        className="overflow-x-auto bg-white rounded-lg shadow mt-4"
      >
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Contract #</th>
              <th className="px-4 py-2 border">Title</th>
              <th className="px-4 py-2 border hidden sm:table-cell">
                End Date
              </th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  Loading contracts...
                </td>
              </tr>
            ) : expiringContracts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-4 text-blue-700 bg-blue-100 rounded-lg"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Info className="w-5 h-5" />
                    No expiring contracts in the next 30 days.
                  </div>
                </td>
              </tr>
            ) : (
              expiringContracts.map((c, idx) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{idx + 1}</td>
                  <td className="px-4 py-2 border">{c.contract_number}</td>
                  <td className="px-4 py-2 border">{c.title}</td>
                  <td className="px-4 py-2 border hidden sm:table-cell">
                    {c.end_date
                      ? new Date(c.end_date).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-2 border">
                    {c.status === "Active" ? (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                        Active
                      </span>
                    ) : c.status === "Pending" ? (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                        {c.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================ Security Page ============================

type MasterRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string | null;
  profile_url: string | null;
};

function SecurityPage() {
  const [masterAdmin, setMasterAdmin] = useState<MasterRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"information" | "security">(
    "information"
  );

  // Editable states
  const [newName, setNewName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState(false);

  // Fetch master admin
  async function fetchMaster() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("id, name, email, role, created_at, profile_url")
        .eq("role", "master")
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch master:", error.message);
        setMasterAdmin(null);
      } else {
        setMasterAdmin(data);
        setNewName(data?.name || "");
      }
    } catch (err) {
      console.error("Unexpected error fetching master:", err);
      setMasterAdmin(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMaster();
  }, []);

  function handleProfileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
        setPendingImage(true);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleUpdateProfile() {
    // TODO: implement update logic (name, password, profile image upload)
    console.log("Updating profile with:", {
      newName,
      currentPassword,
      newPassword,
      confirmPassword,
      profileImage,
    });
  }

  if (loading) {
    return (
      <p className="text-blue-700 bg-blue-100 rounded-lg p-3 text-sm">
        Loading master admin...
      </p>
    );
  }

  if (!masterAdmin) {
    return (
      <p className="text-red-600 bg-red-100 rounded-lg p-3 text-sm">
        No master admin found.
      </p>
    );
  }

  return (
    <div className="mt-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12 lg:h-screen">
      {/* Sidebar */}
      <div className="space-y-6">
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("information")}
            className={`flex flex-col items-start gap-1 px-3 py-2 rounded-md cursor-pointer transition ${
              activeTab === "information"
                ? "bg-gray-900 text-white"
                : "text-black hover:bg-gray-900 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="text-base font-semibold">Account</span>
            </div>
            <p
              className={`text-xs pl-7 text-left ${
                activeTab === "information" ? "text-gray-300" : "text-gray-500"
              }`}
            >
              Manage your public profile and private information
            </p>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex flex-col items-start gap-1 px-3 py-2 rounded-md cursor-pointer transition ${
              activeTab === "security"
                ? "bg-gray-900 text-white"
                : "text-black hover:bg-gray-900 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span className="text-base font-semibold">Security</span>
            </div>
            <p
              className={`text-xs pl-7 ${
                activeTab === "security" ? "text-gray-300" : "text-gray-500"
              }`}
            >
              Manage your password
            </p>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-10 h-screen overflow-y-auto pr-4">
        {activeTab === "information" && (
          <>
            {/* Profile */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-indigo-600"
                  />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center rounded-full border-4 border-indigo-600 bg-gray-200">
                    <User className="w-14 h-14 text-gray-500" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileUpload}
                  />
                </label>
              </div>
              <div>
                <p className="text-black font-semibold text-2xl">
                  {newName || masterAdmin.name}
                </p>
                <p className="text-gray-500 text-sm tracking-wide">
                  {masterAdmin.role.toUpperCase()}
                </p>
              </div>
            </div>
            {pendingImage && (
              <p className="text-xs text-green-600 mt-2">
                Image successfully added, click{" "}
                <span className="font-medium">Update Profile</span> to save.
              </p>
            )}

            {/* Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-md bg-gray-100"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <p className="text-gray-500 text-xs mt-1">
                  Enter your updated display name.
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border px-3 py-2 rounded-md bg-gray-100"
                  value={masterAdmin.email}
                  disabled
                />
                <p className="text-gray-500 text-xs mt-1">
                  Your email cannot be changed.
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Role
                </label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-md bg-gray-100"
                  value={masterAdmin.role}
                  disabled
                />
                <p className="text-gray-500 text-xs mt-1">
                  Your role is assigned by the system.
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Current Password
              </label>
              <input
                type="password"
                className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <p className="text-gray-500 text-xs mt-1">
                Enter your existing password.
              </p>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-gray-500 text-xs mt-1">
                Use at least 8 characters with a mix of letters & numbers.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <p className="text-gray-500 text-xs mt-1">
                Re-enter the new password to confirm.
              </p>
            </div>
          </div>
        )}

        {/* Update Button */}
        <div className="flex justify-end pt-6">
          <button
            className={`py-2 px-8 rounded-md font-medium transition cursor-pointer ${
              newName !== masterAdmin.name ||
              currentPassword ||
              newPassword ||
              confirmPassword ||
              pendingImage
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleUpdateProfile}
            disabled={
              !(
                newName !== masterAdmin.name ||
                currentPassword ||
                newPassword ||
                confirmPassword ||
                pendingImage
              )
            }
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}
