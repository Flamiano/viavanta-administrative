"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/utils/Supabase";

type User = {
  id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  birthday: string; // Supabase returns DATE as string
  age?: number | null;
  email: string;
  contact_number: string;
  address: string;
  zipcode: string;
  password: string;
  visa_image_url?: string | null;
  passport_image_url?: string | null;
  valid_id_front_url?: string | null;
  valid_id_back_url?: string | null;
  approval_status: "Approved" | "Declined" | "Pending";
  approved_by?: number | null;
  approved_at?: string | null; // timestamp from Supabase
  session_token?: string | null;
  created_at: string; // timestamp
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alreadyLoggedInUser, setAlreadyLoggedInUser] = useState<User | null>(
    null
  );

  // Check if this browser/session is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", Number(userId))
          .single<User>();

        if (data) {
          setAlreadyLoggedInUser(data);
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };

    checkSession();
  }, []);

  function generateToken() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // fallback for older browsers
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (fetchError || !user) {
        setErrorMsg("No account found with that email.");
        return;
      }

      if (user.password !== password) {
        setErrorMsg("Incorrect password.");
        return;
      }

      if (user.approval_status !== "Approved") {
        setErrorMsg(
          user.approval_status === "Pending"
            ? "Your account is still pending approval."
            : "Your account has been declined."
        );
        return;
      }

      // 🔑 Invalidate previous session
      const newToken = generateToken();
      await supabase
        .from("users")
        .update({ session_token: newToken })
        .eq("id", user.id);

      // Save to localStorage
      localStorage.setItem("userId", user.id.toString());
      localStorage.setItem("sessionToken", newToken);

      // Redirect
      router.push("/dashboard/user");
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
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/5"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8 max-h-screen overflow-y-auto"
      >
        {/* Already logged-in message */}
        {alreadyLoggedInUser && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-center">
            <span>
              You are currently logged in as{"  "}
              <strong>
                {alreadyLoggedInUser.first_name} {alreadyLoggedInUser.last_name}
              </strong>
              . Go to{" "}
              <button
                onClick={() => router.push("/dashboard/user")}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Dashboard
              </button>
              .
            </span>
          </div>
        )}

        {/* Back to Home Arrow */}
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
          Welcome Back
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 text-center mb-6 sm:mb-8">
          Please sign in to continue
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

          <div className="text-right">
            <Link
              href="/auth/forgot"
              className="text-xs sm:text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
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
          Don’t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
