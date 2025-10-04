"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      // Show success message
      setSuccessMsg("OTP has been sent to your email.");

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = `/auth/forgot-reset?email=${encodeURIComponent(
          email
        )}`;
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/logo/logo-white-bg.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/5"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white shadow-xl rounded-2xl p-6 sm:p-8 max-h-screen overflow-y-auto"
      >
        {/* Back Arrow */}
        <Link
          href="/auth/login"
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
          Forgot Password
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 text-center mb-6 sm:mb-8">
          Enter your registered email to receive a 6-digit OTP for password
          reset.
        </p>

        {/* Animated Messages */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-sm sm:text-base
                ${
                  loading
                    ? "bg-gradient-to-r from-blue-400 to-blue-500 cursor-not-allowed opacity-80"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                Sending...
              </>
            ) : (
              "Send OTP"
            )}
          </motion.button>
        </form>

        {/* Back to Login */}
        <p className="text-xs sm:text-sm text-center text-gray-600 mt-6">
          Remembered your password?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Go back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
