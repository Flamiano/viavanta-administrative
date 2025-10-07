"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/utils/Supabase";

export type Admin = {
  id: number;
  profile_url?: string | null;
  name: string;
  email: string;
  password: string;
  role: "admin" | "master";
  created_by?: number | null;
  created_at: string; // timestamp
  updated_at: string; // timestamp
  session_token?: string | null;
};

export default function MasterAdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alreadyLoggedInAdmin, setAlreadyLoggedInAdmin] =
    useState<Admin | null>(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (!storedAdmin) return;

    try {
      const admin = JSON.parse(storedAdmin);
      if (admin && admin.role === "admin") {
        // Staff/admin is logged in
        setAlreadyLoggedInAdmin(admin);
      } else if (admin && admin.role === "master") {
        // Master is already logged in
        router.push("/dashboard/master-admin");
      }
    } catch (err) {
      console.error("Error checking admin session:", err);
    }
  }, [router]);

  const handleLogoutAdmin = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin"); // clear any existing admin/staff session
    }
    setAlreadyLoggedInAdmin(null); // hide the warning
  };

  function generateToken() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data: master, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .eq("role", "master")
        .single();

      if (error || !master) {
        setErrorMsg("No Master Admin account found with that email.");
        return;
      }

      if (master.password !== password) {
        setErrorMsg("Incorrect password.");
        return;
      }

      const newToken = generateToken();
      await supabase
        .from("admins")
        .update({ session_token: newToken, updated_at: new Date() })
        .eq("id", master.id);

      localStorage.setItem(
        "admin",
        JSON.stringify({
          id: master.id,
          name: master.name,
          email: master.email,
          role: master.role,
          session_token: newToken,
        })
      );

      router.push("/dashboard/master-admin");
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/logo/logo-white-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/5"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8 max-h-screen overflow-y-auto"
      >
        {alreadyLoggedInAdmin && alreadyLoggedInAdmin.role === "admin" && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-center">
            <span>
              You are currently logged in as{" "}
              <strong>{alreadyLoggedInAdmin.name}</strong> (Staff/Admin). Please{" "}
              <button
                onClick={handleLogoutAdmin}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                log out
              </button>{" "}
              first before logging in as Master.
            </span>
          </div>
        )}

        <Link
          href="/"
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors md:hidden"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>

        <div className="flex justify-center mb-4 sm:mb-6">
          <Image
            src="/logo/logo-white-bg.png"
            alt="Master Admin Logo"
            width={120}
            height={120}
            className="w-24 sm:w-32 h-auto object-contain"
            priority
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-1">
          Master Admin Login
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 text-center mb-6 sm:mb-8">
          Sign in to continue
        </p>

        {errorMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 sm:py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 sm:py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        <div className="flex items-center my-4 sm:my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-3 text-gray-400 text-xs sm:text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <p className="text-xs sm:text-sm text-center text-gray-600">
          Staff login?{" "}
          <Link
            href="/auth/login-admin"
            className="text-blue-600 hover:underline font-medium"
          >
            Go here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
