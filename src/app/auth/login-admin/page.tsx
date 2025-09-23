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

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alreadyLoggedInAdmin, setAlreadyLoggedInAdmin] =
    useState<Admin | null>(null);

  // Check if admin is already logged in
  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (!storedAdmin) return;

    try {
      const admin: Admin = JSON.parse(storedAdmin);
      if (admin && ["admin", "master"].includes(admin.role)) {
        setAlreadyLoggedInAdmin(admin);
      }
    } catch (err) {
      console.error("Error checking admin session:", err);
    }
  }, []);

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
      const { data: admin, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (error || !admin) {
        setErrorMsg("No account found with that email.");
        return;
      }

      if (admin.password !== password) {
        setErrorMsg("Incorrect password.");
        return;
      }

      // Optional: Role check if needed
      if (!["admin", "master"].includes(admin.role)) {
        setErrorMsg("Unauthorized role.");
        return;
      }

      // Generate session token
      const newToken = generateToken();
      await supabase
        .from("admins")
        .update({ session_token: newToken, updated_at: new Date() })
        .eq("id", admin.id);

      localStorage.setItem(
        "admin",
        JSON.stringify({
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          session_token: newToken,
        })
      );

      router.push("/dashboard/admin");
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
        {/* Already logged-in */}
        {alreadyLoggedInAdmin && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-center">
            <span>
              You are currently logged in as{" "}
              <strong>{alreadyLoggedInAdmin.name}</strong>. Go to{" "}
              <button
                onClick={() => router.push("/dashboard/admin")}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Dashboard
              </button>
              .
            </span>
          </div>
        )}

        {/* Back Arrow */}
        <Link
          href="/"
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors md:hidden"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>

        {/* Logo */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <Image
            src="/logo/logo-white-bg.png"
            alt="Logo"
            width={120}
            height={120}
            className="w-24 sm:w-32 h-auto object-contain"
            priority
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-1">
          Admin Login
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 text-center mb-6 sm:mb-8">
          Sign in to continue
        </p>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
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
          Master Login?{" "}
          <Link
            href="/auth/login-master"
            className="text-blue-600 hover:underline font-medium"
          >
            Go here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
