"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import supabase from "@/utils/Supabase";
import { useRouter } from "next/navigation";

export default function ForgotResetPage() {
  const [step, setStep] = useState<"otp" | "reset">("otp");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Auto-submit when OTP length is 6
  useEffect(() => {
    if (otp.length === 6 && !loading) {
      handleVerifyOtpAuto();
    }
  }, [otp]);

  // Verify OTP (auto or manual)
  const handleVerifyOtpAuto = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const { data: user } = await supabase
      .from("users")
      .select("id, otp_code, otp_attempts")
      .eq("otp_code", otp)
      .single();

    if (!user) {
      setErrorMsg("Invalid OTP. Please check again.");
      setLoading(false);
      return;
    }

    if (user.otp_attempts >= 3) {
      setErrorMsg("Too many failed attempts. Please request a new OTP.");
      setLoading(false);
      return;
    }

    if (otp !== user.otp_code) {
      await supabase
        .from("users")
        .update({ otp_attempts: user.otp_attempts + 1 })
        .eq("id", user.id);
      setErrorMsg("Incorrect OTP. Please try again.");
      setLoading(false);
      return;
    }

    setSuccessMsg("OTP verified! You can now reset your password.");
    setTimeout(() => {
      setStep("reset");
      setSuccessMsg(null);
    }, 1000);

    setLoading(false);
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("otp_code", otp)
      .single();

    if (!user) {
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    await supabase
      .from("users")
      .update({
        password,
        otp_code: null,
        otp_attempts: 0,
      })
      .eq("id", user.id);

    setSuccessMsg("Password reset successfully!");
    setTimeout(() => {
      router.push("/auth/login");
    }, 2000);
  };

  return (
    <div
      className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/logo/logo-white-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/5"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo/logo-white-bg.png"
            alt="Logo"
            width={120}
            height={120}
            className="w-24 sm:w-32 h-auto object-contain"
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-2">
          {step === "otp" ? "Verify OTP" : "Reset Password"}
        </h2>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Forms */}
        {step === "otp" ? (
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // restrict to digits only
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest font-semibold text-lg"
              maxLength={6}
              required
              disabled={loading}
            />

            <motion.button
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              type="button"
              onClick={handleVerifyOtpAuto}
              disabled={loading}
              className={`w-full py-2 rounded-lg font-medium transition-all text-white
                ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed opacity-75"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Lock
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <motion.button
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-medium transition-all text-white
                ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed opacity-75"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
            >
              {loading ? "Redirecting..." : "Reset Password"}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
