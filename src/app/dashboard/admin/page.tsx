"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import supabase from "@/utils/Supabase";
import Image from "next/image";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
} from "recharts";

import {
  LayoutDashboard,
  Users,
  FileText,
  File,
  Settings as SettingsIcon,
  LogOut,
  User,
  Lock,
  Menu,
  ChevronsLeft,
  ChevronsRight,
  X,
  ShieldCheck,
  Info,
  CheckCircle,
  Clock,
  Archive,
  Camera,
  MessageSquare,
} from "lucide-react";
import UsersPage from "./UsersPage";
import FacilitiesPage from "./FacilitiesPage";
import DocumentsPage from "./DocumentsPage";
import AdminMessage from "./AdminMessage";
import VisitorsPage from "./VisitorsPage";
import LegalPage from "./legal/LegalPage";
import AdminFooter from "@/comps/user-admin-footer/page";

// Users
type User = {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  birthday: string;
  age?: number;
  email: string;
  contact_number: string;
  address: string;
  zipcode: string;
  approval_status: "Approved" | "Declined" | "Pending";
  created_at: string;
};

// Facility reservations
type FacilityReservation = {
  id: number;
  user_id: number;
  facility_id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
};

// Visitors
type Visitor = {
  id: number;
  name: string;
  contact_number?: string;
  purpose?: string;
  visit_date: string;
  check_in?: string;
  check_out?: string;
  status: "Expected" | "Checked-in" | "Checked-out" | "Cancelled";
  remarks?: "Late" | "Rescheduled" | "VIP" | "Follow-up Needed" | "No Show";
};

// Contracts
type Contract = {
  id: number;
  contract_number: string;
  title: string;
  description?: string;
  contract_type: "Employment" | "Service" | "Lease" | "Partnership" | "Other";
  start_date: string;
  end_date?: string;
  status: "Pending Approval" | "Active" | "Expired" | "Terminated";
  created_at: string;
};

// Cases
type CaseRecord = {
  id: number;
  case_number: string;
  title: string;
  description?: string;
  case_type: "Civil" | "Criminal" | "Administrative" | "Other";
  status: "Open" | "In Progress" | "Closed" | "Appealed" | "Dismissed";
  filed_date: string;
  closed_date?: string;
};

// Compliance records
type ComplianceRecord = {
  id: number;
  compliance_number: string;
  category: "Regulatory" | "Financial" | "Operational" | "Other";
  title: string;
  description?: string;
  due_date: string;
  status: "Pending" | "Submitted" | "Approved" | "Rejected" | "Overdue";
  created_at: string;
};

// Define menu item type
type MenuItem = {
  name: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  items?: MenuItem[];
};

export default function AdminDashboard() {
  const router = useRouter();
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminData, setAdminData] = useState<{
    id: number;
    name: string;
    email: string;
    role: string;
    profile_url?: string;
  } | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Map titles for each tab
  const titles: Record<string, string> = {
    Dashboard: "Admin",
    Users: "Users",
    Reservation: "Reservations",
    Documents: "Documents",
    Visitors: "Visitors",
    Legal: "Legal",
    Settings: "Settings",
    Messages: "Messages",
  };

  useEffect(() => {
    // Use layout.tsx template: "ViaVanta - %s"
    const tabTitle = titles[active] || "";
    document.title = tabTitle ? `ViaVanta - ${tabTitle}` : "ViaVanta";
  }, [active]);

  // Password change state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [_message, setMessage] = useState("");

  // Profile Upload
  const handleProfileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !adminData) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage("File too large! Max 5MB allowed.");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${adminData.id}-${Date.now()}.${fileExt}`;
    const filePath = `admin/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-picture")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setMessage("Upload failed: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("profile-picture")
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    // ✅ Set preview but don’t update DB yet
    setProfileImage(publicUrl);
    setPendingImage(publicUrl);
    setMessage("Image successfully added, click Update Profile to save.");
  };

  // Load admin from localStorage + fetch fresh data from DB
  useEffect(() => {
    const fetchAdmin = async () => {
      // get stored admin from localStorage
      const storedAdmin = localStorage.getItem("adminData");
      if (!storedAdmin) return;

      const parsedAdmin = JSON.parse(storedAdmin);
      const adminId = parsedAdmin.id;

      // fetch latest admin data from DB
      const { data, error } = await supabase
        .from("admins")
        .select("id, name, email, role, profile_url")
        .eq("id", adminId)
        .single();

      if (error) {
        console.error("Fetch admin error:", error);
        return;
      }

      // update state + keep localStorage fresh
      setAdminData(data);
      localStorage.setItem("adminData", JSON.stringify(data));

      if (data.profile_url) {
        setProfileImage(data.profile_url);
      }
    };

    fetchAdmin();
  }, []);

  // Tabs
  const [activeTab, setActiveTab] = useState<"information" | "security">(
    "information"
  );

  // Loading
  const [loading, setLoading] = useState(false);

  // Dashboard state
  const [usersToday, setUsersToday] = useState(0);
  const [usersTodayNew, setUsersTodayNew] = useState(0);
  const [facilitiesToday, setFacilitiesToday] = useState(0);
  const [facilitiesTodayNew, setFacilitiesTodayNew] = useState(0);
  const [visitorsToday, setVisitorsToday] = useState(0);
  const [visitorsTodayNew, setVisitorsTodayNew] = useState(0);
  const [pendingDocuments, setPendingDocuments] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  const [contractsCount, setContractsCount] = useState(0);
  const [casesCount, setCasesCount] = useState(0);
  const [complianceCount, setComplianceCount] = useState(0);

  // Lists for tables
  const [usersTodayList, setUsersTodayList] = useState<User[]>([]);
  const [facilitiesTodayList, setFacilitiesTodayList] = useState<
    FacilityReservation[]
  >([]);
  const [visitorsTodayList, setVisitorsTodayList] = useState<Visitor[]>([]);
  const [_contractsTodayList, setContractsTodayList] = useState<Contract[]>([]);
  const [_casesTodayList, setCasesTodayList] = useState<CaseRecord[]>([]);
  const [_complianceTodayList, setComplianceTodayList] = useState<
    ComplianceRecord[]
  >([]);

  // Chart states
  const [lineData, setLineData] = useState<
    { date: string; users: number; facilities: number; visitors: number }[]
  >([]);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

  // Fetching 3 circle components (Approved, Archived, Pending)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { count: approvedUsers } = await supabase
          .from("users")
          .select("id", { count: "exact" })
          .eq("approval_status", "Approved");
        setApprovedCount(approvedUsers || 0);

        const { count: pendingUsers } = await supabase
          .from("users")
          .select("id", { count: "exact" })
          .eq("approval_status", "Pending");
        setPendingCount(pendingUsers || 0);

        const { count: archivedUsers } = await supabase
          .from("archived_users_documents")
          .select("id", { count: "exact" });
        setArchivedCount(archivedUsers || 0);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Existing code for approved/pending/archived…

        // Contracts count
        const { count: contracts } = await supabase
          .from("contracts")
          .select("id", { count: "exact" });
        setContractsCount(contracts || 0);

        // Cases count
        const { count: cases } = await supabase
          .from("cases")
          .select("id", { count: "exact" });
        setCasesCount(cases || 0);

        // Compliance count
        const { count: compliance } = await supabase
          .from("compliance_records")
          .select("id", { count: "exact" });
        setComplianceCount(compliance || 0);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch Today’s Data (Users, Facilities, Visitors, Contracts, Cases, Compliance)
  useEffect(() => {
    if (!adminData) return;

    const fetchDashboardData = async () => {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      try {
        // USERS
        const { data: allUsers } = await supabase
          .from<User>("users")
          .select("*");
        setUsersToday(allUsers?.length || 0);

        const { data: newUsers } = await supabase
          .from<User>("users")
          .select("*")
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString());
        setUsersTodayNew(newUsers?.length || 0);
        setUsersTodayList(newUsers || []);

        // FACILITIES
        const { data: allFacilities } = await supabase
          .from<FacilityReservation>("facility_reservations")
          .select("*");
        setFacilitiesToday(allFacilities?.length || 0);

        const { data: newFacilities } = await supabase
          .from<FacilityReservation>("facility_reservations")
          .select("*")
          .gte("reservation_date", startOfDay.toISOString())
          .lte("reservation_date", endOfDay.toISOString());
        setFacilitiesTodayNew(newFacilities?.length || 0);
        setFacilitiesTodayList(newFacilities || []);

        // VISITORS
        const { data: allVisitors } = await supabase
          .from<Visitor>("visitors")
          .select("*");
        setVisitorsToday(allVisitors?.length || 0);

        const { data: newVisitors } = await supabase
          .from<Visitor>("visitors")
          .select("*")
          .gte("visit_date", startOfDay.toISOString())
          .lte("visit_date", endOfDay.toISOString());
        setVisitorsTodayNew(newVisitors?.length || 0);
        setVisitorsTodayList(newVisitors || []);

        // CONTRACTS
        const { data: allContracts } = await supabase
          .from<Contract>("contracts")
          .select("*");
        setContractsCount(allContracts?.length || 0);

        const { data: newContracts } = await supabase
          .from<Contract>("contracts")
          .select("*")
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString());
        setContractsTodayList(newContracts || []);

        // CASES
        const { data: allCases } = await supabase
          .from<CaseRecord>("cases")
          .select("*");
        setCasesCount(allCases?.length || 0);

        const { data: newCases } = await supabase
          .from<CaseRecord>("cases")
          .select("*")
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString());
        setCasesTodayList(newCases || []);

        // COMPLIANCE
        const { data: allCompliance } = await supabase
          .from<ComplianceRecord>("compliance_records")
          .select("*");
        setComplianceCount(allCompliance?.length || 0);

        const { data: newCompliance } = await supabase
          .from<ComplianceRecord>("compliance_records")
          .select("*")
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString());
        setComplianceTodayList(newCompliance || []);

        // PENDING USERS
        const { count: pendingCount } = await supabase
          .from<User>("users")
          .select("id", { count: "exact" })
          .eq("approval_status", "Pending");
        setPendingDocuments(pendingCount || 0);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [adminData]);

  // Line Chart Data (Last 7 Days) with Contracts, Cases, Compliance
  useEffect(() => {
    if (!adminData) return;

    const fetchLineData = async () => {
      try {
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(today.getDate() - (6 - i));
          return d;
        });

        const promises = last7Days.map(async (day) => {
          const startOfDay = new Date(day.setHours(0, 0, 0, 0)).toISOString();
          const endOfDay = new Date(
            day.setHours(23, 59, 59, 999)
          ).toISOString();

          const [
            usersRes,
            facilitiesRes,
            visitorsRes,
            contractsRes,
            casesRes,
            complianceRes,
          ] = await Promise.all([
            supabase
              .from("users")
              .select("id", { count: "exact" })
              .gte("created_at", startOfDay)
              .lte("created_at", endOfDay),
            supabase
              .from("facility_reservations")
              .select("id", { count: "exact" })
              .gte("reservation_date", startOfDay)
              .lte("reservation_date", endOfDay),
            supabase
              .from("visitors")
              .select("id", { count: "exact" })
              .gte("visit_date", startOfDay)
              .lte("visit_date", endOfDay),
            supabase
              .from("contracts")
              .select("id", { count: "exact" })
              .gte("created_at", startOfDay)
              .lte("created_at", endOfDay),
            supabase
              .from("cases")
              .select("id", { count: "exact" })
              .gte("created_at", startOfDay)
              .lte("created_at", endOfDay),
            supabase
              .from("compliance_records")
              .select("id", { count: "exact" })
              .gte("created_at", startOfDay)
              .lte("created_at", endOfDay),
          ]);

          return {
            date: new Date(day).toLocaleDateString("en-US", {
              month: "numeric",
              day: "numeric",
            }),
            users: usersRes.count || 0,
            facilities: facilitiesRes.count || 0,
            visitors: visitorsRes.count || 0,
            contracts: contractsRes.count || 0,
            cases: casesRes.count || 0,
            compliance: complianceRes.count || 0,
          };
        });

        const resolved = await Promise.all(promises);
        setLineData(resolved);
      } catch (error) {
        console.error("Error fetching line chart data:", error);
      }
    };

    fetchLineData();
  }, [adminData]);

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
    if (typeof window !== "undefined") {
      const savedActive = localStorage.getItem("activePage");
      if (savedActive) setActive(savedActive);
    }
  }, []);

  // Check authentication
  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (!storedAdmin) {
      router.replace("/auth/login-admin");
      return;
    }
    try {
      const admin = JSON.parse(storedAdmin);
      if (!admin || !["admin", "master"].includes(admin.role)) {
        router.replace("/auth/login-admin");
        return;
      }
      setAdminData({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      });
      setNewName(admin.name);
      setCheckingAuth(false);
    } catch {
      router.replace("/auth/login-admin");
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin");
      localStorage.removeItem("activePage");
    }
    router.replace("/auth/login-admin");
  };

  const handleUpdateProfile = async () => {
    if (!adminData) return;

    setLoading(true);

    try {
      const updates: Partial<{ name: string; profile_url: string }> = {};

      if (newName !== adminData.name) updates.name = newName;
      if (pendingImage) updates.profile_url = pendingImage;

      if (currentPassword && newPassword) {
        if (newPassword !== confirmPassword) {
          setMessage("New password and confirmation do not match.");
          setLoading(false);
          return;
        }

        // Change password logic (example, adjust based on your DB)
        const { error: pwError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (pwError) {
          setMessage("Password update failed: " + pwError.message);
          setLoading(false);
          return;
        }
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("admins")
          .update(updates)
          .eq("id", adminData.id);

        if (error) {
          setMessage("Update failed: " + error.message);
        } else {
          setMessage("Profile updated successfully!");
          const updatedAdmin = { ...adminData, ...updates };
          setAdminData(updatedAdmin);
          localStorage.setItem("adminData", JSON.stringify(updatedAdmin));
          setPendingImage(null);
        }
      }

      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
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
        { name: "Users", icon: Users },
        { name: "Messages", icon: MessageSquare },
        {
          name: "Module",
          icon: Menu, // any parent needs an icon
          items: [
            { name: "Reservation", icon: FileText },
            { name: "Documents", icon: File },
            { name: "Legal", icon: ShieldCheck },
            { name: "Visitors", icon: User },
          ],
        },
      ],
    },
  ];

  const bottomMenu: MenuItem[] = [
    { name: "Settings", icon: SettingsIcon },
    { name: "Logout", icon: LogOut },
  ];

  const expandedWidth = 265;
  const collapsedWidth = 72;
  const sidebarWidth = sidebarCollapsed ? collapsedWidth : expandedWidth;

  const handleMenuClick = (name: string) => {
    // Immediately update the title
    const titles: Record<string, string> = {
      Dashboard: "Admin",
      Users: "Users",
      Reservation: "Reservations",
      Documents: "Documents",
      Visitors: "Visitors",
      Legal: "Legal",
      Settings: "Settings",
      Messages: "Messages",
    };
    const tabTitle = titles[name] || "";
    document.title = tabTitle ? `ViaVanta - ${tabTitle}` : "ViaVanta";

    // Show loading for 1 second before changing content
    setLoading(true);
    setTimeout(() => {
      setActive(name); // content changes after 1s
      setLoading(false);
      localStorage.setItem("activePage", name);
      if (sidebarOpen) setSidebarOpen(false);
    }, 1000);
  };

  // Sidebar Style
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
        onClick={() =>
          name === "Logout" ? setShowLogoutModal(true) : handleMenuClick(name)
        }
        className={`
        flex items-center gap-3 py-3 px-4 transition cursor-pointer
        ${isDesktop ? "rounded-l-3xl w-[calc(100%+4px)]" : "rounded-md w-full"} 
        ${
          isActive
            ? "bg-white text-gray-900 font-semibold"
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
        <h1 className="font-bold text-xl truncate">Admin Staff</h1>
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
              alt="Viavanta Logo"
              width={sidebarCollapsed ? 40 : 120}
              height={40}
              className="object-contain transition-all duration-300"
            />
          </div>

          {/* Menu */}
          <nav className="flex flex-col flex-grow px-1 mt-4">
            {menuGroups.map(
              (
                group: { label: string | null; items: MenuItem[] },
                i: number
              ) => (
                <div key={i} className="mb-6 last:mb-0">
                  {group.label && !sidebarCollapsed && (
                    <p className="px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide select-none">
                      {group.label}
                    </p>
                  )}
                  {group.items.map((item) =>
                    item.items
                      ? item.items.map((sub) =>
                          renderMenuItem(sub.name, sub.icon, true)
                        )
                      : renderMenuItem(item.name, item.icon, true)
                  )}
                </div>
              )
            )}
          </nav>

          {/* Bottom Menu */}
          <div className="border-t border-gray-800 px-1 py-3 mb-4">
            {bottomMenu.map(({ name, icon }) =>
              renderMenuItem(name, icon, true)
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
                    Admin Staff
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
                      {group.label && !sidebarCollapsed && (
                        <p className="px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide select-none">
                          {group.label}
                        </p>
                      )}
                      {group.items.map((item) =>
                        item.items
                          ? item.items.map((sub) =>
                              renderMenuItem(sub.name, sub.icon, true)
                            )
                          : renderMenuItem(item.name, item.icon, true)
                      )}
                    </div>
                  ))}
                </nav>

                {/* Bottom Menu */}
                <div className="border-t border-gray-800 px-1 py-3 mb-4">
                  {bottomMenu.map((item) =>
                    renderMenuItem(item.name, item.icon, true)
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className="flex-1 overflow-auto min-h-screen pt-6 pb-6 px-4 lg:pr-6"
          style={
            {
              "--sidebar-width": sidebarWidth + "px",
              "--sidebar-gap": "16px",
            } as React.CSSProperties
          }
        >
          <style jsx>{`
            main {
              transition: padding-left 0.3s;
            }
            @media (max-width: 1023px) {
              main {
                padding-left: 1rem;
                padding-right: 1rem;
              }
            }
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
            className="h-full relative"
          >
            {/* Loading overlay for mobile */}
            {loading && (
              <div className="fixed inset-0 bg-white flex items-center justify-center z-50 lg:hidden">
                <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-gray-200 rounded-full animate-spin"></div>
              </div>
            )}

            {/* Loading overlay for desktop */}
            {loading && (
              <div className="absolute inset-0 bg-white items-center justify-center z-40 hidden lg:flex">
                <div className="w-20 h-20 border-4 border-t-blue-500 border-b-blue-500 border-gray-200 rounded-full animate-spin"></div>
              </div>
            )}

            {/* Main content */}
            {!loading && (
              <>
                <h1 className="flex justify-between items-center text-3xl font-bold sticky top-0 z-20 pt-2 pb-2 px-4 border-b border-gray-200 bg-white">
                  {/* Leftside Active page name and Arrow */}
                  <div className="flex items-center gap-3">
                    {/* Collapse/Expand Button */}
                    <div className="relative hidden lg:flex group">
                      <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        aria-label={
                          sidebarCollapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
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
                      onClick={() => setActive("Settings")}
                    >
                      {adminData?.profile_url ? (
                        <img
                          src={adminData.profile_url}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border border-gray-300"
                        />
                      ) : (
                        <User className="w-10 h-10 text-gray-600 rounded-full p-2 bg-gray-200" />
                      )}

                      {/* Tooltip with admin name */}
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        {adminData?.name || "Profile"}
                      </span>
                    </div>
                  </div>
                </h1>

                {active === "Dashboard" && (
                  <div className="p-6 space-y-6">
                    {/* Top 4 cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {/* Users Card */}
                      <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white rounded-2xl shadow-md p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Users className="w-5 h-5" />
                            Users Count
                          </div>
                          {usersTodayNew > 0 && (
                            <div className="bg-white text-indigo-600 text-xs font-semibold px-2 py-1 rounded-full">
                              +{usersTodayNew}
                            </div>
                          )}
                        </div>
                        <p className="text-2xl font-bold mt-2">{usersToday}</p>
                      </div>

                      {/* Facilities Card */}
                      <div className="bg-gradient-to-r from-green-600 to-green-400 text-white rounded-2xl shadow-md p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="w-5 h-5" />
                            Facilities Reserved Count
                          </div>
                          {facilitiesTodayNew > 0 && (
                            <div className="bg-white text-green-600 text-xs font-semibold px-2 py-1 rounded-full">
                              +{facilitiesTodayNew}
                            </div>
                          )}
                        </div>
                        <p className="text-2xl font-bold mt-2">
                          {facilitiesToday}
                        </p>
                      </div>

                      {/* Visitors Card */}
                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-white rounded-2xl shadow-md p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <User className="w-5 h-5" />
                            Visitors Count
                          </div>
                          {visitorsTodayNew > 0 && (
                            <div className="bg-white text-yellow-500 text-xs font-semibold px-2 py-1 rounded-full">
                              +{visitorsTodayNew}
                            </div>
                          )}
                        </div>
                        <p className="text-2xl font-bold mt-2">
                          {visitorsToday}
                        </p>
                      </div>

                      {/* Pending Documents Card */}
                      <div className="bg-gradient-to-r from-red-600 to-red-400 text-white rounded-2xl shadow-md p-4 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <File className="w-5 h-5" />
                          Pending Documents
                        </div>
                        <p className="text-2xl font-bold mt-2">
                          {pendingDocuments}
                        </p>
                      </div>
                    </div>
                    {/* Top 3 cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                      {/* Contracts Card */}
                      <div className="p-5 bg-white shadow rounded-lg border-l-8 border-blue-500 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Contracts
                          </h3>
                          <p className="text-3xl font-bold text-gray-900">
                            {contractsCount}
                          </p>
                        </div>
                      </div>

                      {/* Cases Card */}
                      <div className="p-5 bg-white shadow rounded-lg border-l-8 border-green-500 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            Cases
                          </h3>
                          <p className="text-3xl font-bold text-gray-900">
                            {casesCount}
                          </p>
                        </div>
                      </div>

                      {/* Compliance Card */}
                      <div className="p-5 bg-white shadow rounded-lg border-l-8 border-yellow-500 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-yellow-500" />
                            Compliance
                          </h3>
                          <p className="text-3xl font-bold text-gray-900">
                            {complianceCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Top Area Graph */}
                      <div className="bg-gray-900 rounded-2xl p-4 shadow-md w-full">
                        <h3 className="text-white font-semibold mb-4">
                          Activity Overview
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                          {lineData.length > 0 ? (
                            <AreaChart data={lineData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#374151"
                              />
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

                              <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.3}
                              />
                              <Area
                                type="monotone"
                                dataKey="facilities"
                                stroke="#82ca9d"
                                fill="#82ca9d"
                                fillOpacity={0.3}
                              />
                              <Area
                                type="monotone"
                                dataKey="visitors"
                                stroke="#ffc658"
                                fill="#ffc658"
                                fillOpacity={0.3}
                              />
                              <Area
                                type="monotone"
                                dataKey="contracts"
                                stroke="#00bcd4"
                                fill="#00bcd4"
                                fillOpacity={0.3}
                              />
                              <Area
                                type="monotone"
                                dataKey="cases"
                                stroke="#f97316"
                                fill="#f97316"
                                fillOpacity={0.3}
                              />
                              <Area
                                type="monotone"
                                dataKey="compliance"
                                stroke="#9333ea"
                                fill="#9333ea"
                                fillOpacity={0.3}
                              />
                            </AreaChart>
                          ) : (
                            <div className="text-center py-8 text-gray-400">
                              Loading chart...
                            </div>
                          )}
                        </ResponsiveContainer>
                      </div>

                      {/* Main dashboard area */}
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Analytics Section */}
                        <div className="w-full lg:w-1/4 bg-gray-900 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
                          {/* Top Bar Chart */}
                          <div className="w-full">
                            <h3 className="text-white font-semibold text-lg mb-4 text-center">
                              Category Comparison
                            </h3>
                            <ResponsiveContainer width="100%" height={220}>
                              <BarChart
                                data={[
                                  { name: "Visitors", value: visitorsToday },
                                  { name: "Users", value: usersToday },
                                  {
                                    name: "Facilities",
                                    value: facilitiesToday,
                                  },
                                ]}
                                barCategoryGap="20%"
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#374151"
                                />
                                <XAxis
                                  dataKey="name"
                                  stroke="#9ca3af"
                                  tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                  stroke="#9ca3af"
                                  tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#1f2937",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "#fff",
                                  }}
                                  labelStyle={{ color: "#fff" }}
                                />
                                <Bar
                                  dataKey="value"
                                  fill="#3b82f6"
                                  radius={[8, 8, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Bottom Row: Pie + RadialBar */}
                          <div className="flex flex-col gap-8 items-center justify-center">
                            {/* Pie Chart */}
                            <div className="flex flex-col items-center">
                              <h3 className="text-white font-semibold text-lg mb-2 text-center">
                                Today&apos;s Overview
                              </h3>
                              <span className="text-gray-400 text-sm mb-3">
                                {new Date().toLocaleDateString([], {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>

                              <PieChart width={220} height={220}>
                                <Pie
                                  data={[
                                    { name: "Visitors", value: visitorsToday },
                                    { name: "Users", value: usersToday },
                                    {
                                      name: "Facilities",
                                      value: facilitiesToday,
                                    },
                                  ]}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  labelLine={false}
                                  label={({ name, value }) =>
                                    `${name} (${(
                                      (value /
                                        (usersToday +
                                          visitorsToday +
                                          facilitiesToday || 1)) *
                                      100
                                    ).toFixed(0)}%)`
                                  }
                                >
                                  {[
                                    visitorsToday,
                                    usersToday,
                                    facilitiesToday,
                                  ].map((_, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
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
                                />
                                <Legend
                                  verticalAlign="bottom"
                                  align="center"
                                  wrapperStyle={{ color: "#fff", fontSize: 12 }}
                                />
                              </PieChart>
                            </div>

                            {/* RadialBar Chart */}
                            <div className="flex flex-col items-center">
                              <h3 className="text-white font-semibold text-lg mb-3 text-center">
                                Proportions
                              </h3>
                              <ResponsiveContainer width={220} height={220}>
                                <RadialBarChart
                                  cx="50%"
                                  cy="50%"
                                  innerRadius="20%"
                                  outerRadius="90%"
                                  barSize={14}
                                  data={[
                                    {
                                      name: "Visitors",
                                      value: visitorsToday,
                                      fill: COLORS[0],
                                    },
                                    {
                                      name: "Users",
                                      value: usersToday,
                                      fill: COLORS[1],
                                    },
                                    {
                                      name: "Facilities",
                                      value: facilitiesToday,
                                      fill: COLORS[2],
                                    },
                                  ]}
                                >
                                  <RadialBar
                                    minAngle={15}
                                    background
                                    clockWise
                                    dataKey="value"
                                  />
                                  <Legend
                                    iconSize={12}
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    wrapperStyle={{
                                      color: "#fff",
                                      fontSize: 12,
                                    }}
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
                          </div>
                        </div>

                        {/* Right side Users, Facilities, Visitors tables */}
                        <div className="lg:w-3/4 space-y-6">
                          {/* Status Overview Circles */}
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            {/* Approved */}
                            <div className="flex flex-col items-center justify-center rounded-full p-6 shadow-md bg-gradient-to-br from-green-400 to-green-600 text-white">
                              <CheckCircle className="w-6 h-6 mb-2" />
                              <span className="font-bold text-xl">
                                {approvedCount}
                              </span>
                              <span className="text-sm font-medium">
                                Approved
                              </span>
                            </div>

                            {/* Pending */}
                            <div className="flex flex-col items-center justify-center rounded-full p-6 shadow-md bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
                              <Clock className="w-6 h-6 mb-2" />
                              <span className="font-bold text-xl">
                                {pendingCount}
                              </span>
                              <span className="text-sm font-medium">
                                Pending
                              </span>
                            </div>

                            {/* Archived */}
                            <div className="flex flex-col items-center justify-center rounded-full p-6 shadow-md bg-gradient-to-br from-gray-400 to-gray-700 text-white">
                              <Archive className="w-6 h-6 mb-2" />
                              <span className="font-bold text-xl">
                                {archivedCount}
                              </span>
                              <span className="text-sm font-medium">
                                Archived
                              </span>
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              These circles summarize the overall status of
                              requests and records for today.{" "}
                              <span className="font-semibold text-green-600">
                                Approved
                              </span>{" "}
                              shows the number of requests successfully
                              validated,{" "}
                              <span className="font-semibold text-yellow-600">
                                Pending
                              </span>{" "}
                              indicates items still awaiting review or action,
                              and{" "}
                              <span className="font-semibold text-gray-600">
                                Archived
                              </span>{" "}
                              represents entries that have been closed or stored
                              for reference. This quick overview helps you
                              assess daily activity at a glance before diving
                              into the detailed tables below.
                            </p>
                          </div>

                          {/* Users Table */}
                          <div className="overflow-x-auto bg-white rounded-lg shadow">
                            <div className="px-4 py-2 bg-gray-100 border-b flex items-center justify-between">
                              <span className="font-semibold text-gray-800">
                                Users Registered Today
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
                                </tr>
                              </thead>
                              <tbody>
                                {usersTodayList.length > 0 ? (
                                  usersTodayList.map((user, idx) => (
                                    <tr
                                      key={user.id}
                                      className="hover:bg-gray-100"
                                    >
                                      <td className="px-4 py-2 border">
                                        {idx + 1}
                                      </td>
                                      <td className="px-4 py-2 border">
                                        {user.first_name} {user.last_name}
                                      </td>
                                      <td className="px-4 py-2 border">
                                        {user.email}
                                      </td>
                                      <td className="px-4 py-2 border">
                                        {user.approval_status === "Approved" ? (
                                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                                            Approved
                                          </span>
                                        ) : user.approval_status ===
                                          "Pending" ? (
                                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                                            Pending
                                          </span>
                                        ) : (
                                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                                            {user.approval_status}
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={4}
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

                          {/* Facilities Table */}
                          <div className="overflow-x-auto bg-white rounded-lg shadow">
                            <div className="px-4 py-2 bg-gray-100 border-b flex items-center justify-between">
                              <span className="font-semibold text-gray-800">
                                Facilities Reserved Today
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
                                  <th className="px-4 py-2 border">Facility</th>
                                  <th className="px-4 py-2 border">User</th>
                                  <th className="px-4 py-2 border">Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                {facilitiesTodayList.length > 0 ? (
                                  facilitiesTodayList.map((res, idx) => (
                                    <tr
                                      key={res.id}
                                      className="hover:bg-gray-100"
                                    >
                                      <td className="px-4 py-2 border">
                                        {idx + 1}
                                      </td>
                                      <td className="px-4 py-2 border">
                                        {res.car_unit}
                                      </td>
                                      <td className="px-4 py-2 border">
                                        {res.user_name}
                                      </td>
                                      <td className="px-4 py-2 border">
                                        {res.start_time} - {res.end_time}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={4}
                                      className="text-center py-4 bg-blue-50 text-blue-700 rounded-lg"
                                    >
                                      <div className="flex items-center justify-center gap-2">
                                        <Info className="w-5 h-5" />
                                        No reservations found.
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Visitors Table */}
                          <div className="overflow-x-auto bg-white rounded-lg shadow">
                            <div className="px-4 py-2 bg-gray-100 border-b flex items-center justify-between">
                              <span className="font-semibold text-gray-800">
                                Visitors Today
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
                                  <th className="px-4 py-2 border">Contact</th>
                                  <th className="px-4 py-2 border">Purpose</th>
                                  <th className="px-4 py-2 border">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {visitorsTodayList.length > 0 ? (
                                  visitorsTodayList.map((v, idx) => (
                                    <tr
                                      key={v.id}
                                      className="hover:bg-gray-100"
                                    >
                                      <td className="px-4 py-2 border">
                                        {idx + 1}
                                      </td>
                                      <td className="px-4 py-2 border">
                                        {v.name}
                                      </td>
                                      <td className="px-4 py-2 border">
                                        {v.contact_number}
                                      </td>
                                      <td className="px-4 py-2 border">
                                        {v.purpose}
                                      </td>
                                      <td className="px-4 py-2 border">
                                        {v.status}
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
                                        No visitors today.
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {active === "Users" && <UsersPage adminData={adminData} />}
                {active === "Messages" && (
                  <AdminMessage adminData={adminData} />
                )}
                {active === "Reservation" && (
                  <FacilitiesPage adminData={adminData} />
                )}
                {active === "Documents" && (
                  <DocumentsPage adminData={adminData} />
                )}
                {active === "Visitors" && (
                  <VisitorsPage adminData={adminData} />
                )}
                {active === "Legal" && <LegalPage adminData={adminData} />}

                {active === "Settings" && adminData && (
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
                            <span className="text-base font-semibold">
                              Account
                            </span>
                          </div>
                          <p
                            className={`text-xs pl-7 text-left ${
                              activeTab === "information"
                                ? "text-gray-300"
                                : "text-gray-500"
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
                            <span className="text-base font-semibold">
                              Security
                            </span>
                          </div>
                          <p
                            className={`text-xs pl-7 ${
                              activeTab === "security"
                                ? "text-gray-300"
                                : "text-gray-500"
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
                                {adminData?.name}
                              </p>
                              <p className="text-gray-500 text-sm tracking-wide">
                                {adminData?.role.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          {pendingImage && (
                            <p className="text-xs text-green-600 mt-2">
                              Image successfully added, click{" "}
                              <span className="font-medium">
                                Update Profile
                              </span>{" "}
                              to save.
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
                                value={adminData.email}
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
                                value={adminData.role}
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
                              onChange={(e) =>
                                setCurrentPassword(e.target.value)
                              }
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
                              Use at least 8 characters with a mix of letters &
                              numbers.
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
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
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
                            newName !== adminData.name ||
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
                              newName !== adminData.name ||
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
                )}
              </>
            )}
            <AdminFooter />
          </motion.div>
        </main>
      </div>
    </>
  );
}
