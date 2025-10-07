"use client";

import { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Calendar,
  Hourglass,
  Phone,
  Home,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import supabase from "@/utils/Supabase";

type Step = 1 | 2 | 3 | 4 | 5;

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  // Agreement
  const [agree, setAgree] = useState(false);

  // Form
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState(""); // yyyy-mm-dd
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visaFile, setVisaFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdSuccess, setCreatedSuccess] = useState<string | null>(null);

  //For File Input
  const visaInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);
  const idFrontInputRef = useRef<HTMLInputElement>(null);
  const idBackInputRef = useRef<HTMLInputElement>(null);

  const age = useMemo(() => {
    if (!birthday) return "";
    const b = new Date(birthday);
    if (isNaN(b.getTime())) return "";
    const now = new Date();
    let a = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
    return a.toString();
  }, [birthday]);

  function validateEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function resetForm() {
    setStep(1);
    setPreviewFile(null);

    // Agreement
    setAgree(false);

    // Form fields
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setBirthday("");
    setEmail("");
    setContact("");
    setAddress("");
    setZipCode("");
    setPassword("");
    setConfirm("");

    // Files (state)
    setVisaFile(null);
    setPassportFile(null);
    setIdFrontFile(null);
    setIdBackFile(null);

    // Files (inputs)
    if (visaInputRef.current) visaInputRef.current.value = "";
    if (passportInputRef.current) passportInputRef.current.value = "";
    if (idFrontInputRef.current) idFrontInputRef.current.value = "";
    if (idBackInputRef.current) idBackInputRef.current.value = "";

    // UI
    setFormError(null);
  }

  async function nextStep() {
    setFormError(null);

    if (step === 1) {
      // Step 1: Agreement
      if (!agree)
        return setFormError("You must accept the agreement to continue.");
      setStep(2);
    } else if (step === 2) {
      // Step 2: Personal Info
      if (!firstName.trim()) return setFormError("First name is required.");
      if (!lastName.trim()) return setFormError("Last name is required.");
      setStep(3);
    } else if (step === 3) {
      // Step 3: Other Info
      if (!birthday) return setFormError("Birthday is required.");

      // Check if age is at least 18
      const birthDate = new Date(birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      if (
        age < 18 ||
        (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))
      ) {
        return setFormError("You must be at least 18 years old.");
      }

      if (!address.trim()) return setFormError("Address is required.");
      if (!zipCode.trim()) return setFormError("Zip code is required.");
      setStep(4);
    } else if (step === 4) {
      // Step 4: Important Info
      if (!email || !validateEmail(email))
        return setFormError("Enter a valid email address.");

      // Contact number validation: 11 digits and starts with "09"
      if (!contact.trim()) return setFormError("Contact number is required.");
      if (!/^09\d{9}$/.test(contact.trim()))
        return setFormError(
          "Contact number must be 11 digits and start with '09'."
        );

      // Check file uploads
      if (!visaFile) return setFormError("Visa picture is required.");
      if (!passportFile) return setFormError("Passport picture is required.");
      if (!idFrontFile) return setFormError("Valid ID (Front) is required.");
      if (!idBackFile) return setFormError("Valid ID (Back) is required.");

      // Check if email already exists
      const { data: existingUser, error: emailCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (emailCheckError && emailCheckError.code !== "PGRST116") {
        return setFormError("Unable to validate email. Please try again.");
      }

      if (existingUser) {
        return setFormError("That email is already registered.");
      }

      setStep(5);
    }
  }

  function prevStep() {
    setFormError(null);
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  async function submit() {
    setFormError(null);

    if (password.length < 6)
      return setFormError("Password must be at least 6 characters.");
    if (password !== confirm) return setFormError("Passwords do not match.");

    setSubmitting(true);

    try {
      // 1. Insert user
      const { data: userData, error: insertError } = await supabase
        .from("users")
        .insert({
          first_name: firstName.trim(),
          middle_name: middleName.trim() || null,
          last_name: lastName.trim(),
          birthday,
          age: age ? Number(age) : null,
          email: email.trim().toLowerCase(),
          contact_number: contact.trim(),
          address: address.trim(),
          zipcode: zipCode.trim(),
          password,
        })
        .select("id, email, first_name")
        .single();
      if (insertError) throw insertError;

      const userId = userData.id;

      // 2. Upload files
      async function uploadFile(
        file: File | null,
        folder: string,
        name: string
      ) {
        if (!file) return null;
        const ext = file.name.split(".").pop();
        const filePath = `${folder}/${userId}_${name}.${ext}`;
        const { data, error } = await supabase.storage
          .from("user-documents")
          .upload(filePath, file, { upsert: true });
        if (error) {
          console.error("Upload failed:", error.message);
          return null;
        }
        return data.path;
      }

      const visaPath = await uploadFile(visaFile, "visa", "visa");
      const passportPath = await uploadFile(
        passportFile,
        "passport",
        "passport"
      );
      const idFrontPath = await uploadFile(idFrontFile, "ids", "id_front");
      const idBackPath = await uploadFile(idBackFile, "ids", "id_back");

      // 3. Update user with file paths
      await supabase
        .from("users")
        .update({
          visa_image_url: visaPath,
          passport_image_url: passportPath,
          valid_id_front_url: idFrontPath,
          valid_id_back_url: idBackPath,
        })
        .eq("id", userId);

      // 4. Send confirmation email via backend API
      await fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          firstName: userData.first_name,
        }),
      });

      setCreatedSuccess(
        "Account created successfully. Confirmation email sent!"
      );
      resetForm();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/logo/logo-white-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/5" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl bg-white shadow-lg rounded-2xl p-6 sm:p-8 max-h-screen overflow-y-auto"
      >
        {/* Back to Home Arrow (mobile) */}
        <Link
          href="/"
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors md:hidden"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>

        {/* Logo */}
        <div className="flex justify-center mb-4 sm:mb-4">
          <Image
            src="/logo/logo-white-bg.png"
            alt="Logo"
            width={120}
            height={120}
            className="w-24 sm:w-32 h-auto object-contain"
            priority
          />
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-1">
          Create an Account
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 text-center mb-6 sm:mb-5">
          Follow the steps to complete your registration
        </p>

        {/* Stepper */}
        <div className="px-2 sm:px-4 mb-4 sm:mb-6">
          <ol className="flex items-center justify-center gap-2 text-xs">
            {[
              { n: 1, label: "Agreement" },
              { n: 2, label: "Personal Info" },
              { n: 3, label: "Other Info" },
              { n: 4, label: "Important Info" },
              { n: 5, label: "Review & Security" },
            ].map(({ n, label }) => (
              <li key={n} className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${
                    step >= n
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-500 border-gray-300"
                  }`}
                >
                  {n}
                </span>
                <span className="hidden sm:inline">{label}</span>
                {n !== 5 && <span className="text-gray-300">—</span>}
              </li>
            ))}
          </ol>
        </div>

        {/* Error banner */}
        {formError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-5">
          {/* Step 1: Agreement */}
          {step === 1 && (
            <div className="space-y-4 overflow-hidden">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="mb-2 font-medium">User Agreement</p>
                <p className="mb-2">
                  By creating an account, you agree to our Terms of Service and
                  Privacy Policy. We collect your name, contact information, and
                  address for account management and service delivery purposes.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    You are responsible for maintaining the confidentiality of
                    your password.
                  </li>
                  <li>Do not share credentials with others.</li>
                  <li>You can request data deletion or updates anytime.</li>
                </ul>
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>I have read and agree to the terms above.</span>
              </label>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="text-sm font-medium">First Name</label>
                <div className="relative mt-1">
                  <User
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Firstname"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Middle Name */}
              <div>
                <label className="text-sm font-medium">Middle Name</label>
                <div className="relative mt-1">
                  <User
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                  <input
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Middlename (optional)"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <div className="relative mt-1">
                  <User
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Lastname"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Other Information */}
          {step === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Birthday */}
              <div>
                <label className="text-sm font-medium">
                  Birthday (Month/Day/Year)
                </label>
                <div className="relative mt-1">
                  <Calendar
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="text-sm font-medium">Age</label>
                <div className="relative mt-1">
                  <Hourglass
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    value={age}
                    readOnly
                    placeholder="Auto-Calculate"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
              </div>

              {/* Address (full width) */}
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <div className="relative mt-1">
                  <Home
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, Province"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Zip Code */}
              <div>
                <label className="text-sm font-medium">Zip Code</label>
                <div className="relative mt-1">
                  <MapPin
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                  <input
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="e.g., 1001"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Important Information */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative mt-1">
                    <Mail
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Contact # */}
                <div>
                  <label className="text-sm font-medium">Contact #</label>
                  <div className="relative mt-1">
                    <Phone
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="tel"
                      value={contact}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 11) setContact(value);
                      }}
                      maxLength={11}
                      placeholder="e.g., 0917..."
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Visa Upload */}
              <div>
                <label className="text-sm font-medium">Visa Image</label>
                <div className="text-xs text-gray-500">Example:</div>

                {/* Example Image */}
                <Image
                  src="/assets/documents/VISA.png"
                  alt="Visa Example"
                  width={400}
                  height={250}
                  priority
                  className="mt-2 w-full rounded-lg border bg-gray-50"
                />

                {/* Upload Input with Eye */}
                <div className="relative mt-3">
                  <input
                    ref={visaInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setVisaFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-600 cursor-pointer border rounded p-2 pr-10"
                  />
                  {visaFile && (
                    <button
                      type="button"
                      onClick={() => setPreviewFile(visaFile)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Passport Upload */}
              <div>
                <label className="text-sm font-medium">Passport Image</label>
                <div className="text-xs text-gray-500">Example:</div>

                {/* Example Image */}
                <Image
                  src="/assets/documents/PASSPORT.png"
                  alt="Passport Example"
                  width={400}
                  height={250}
                  priority
                  className="mt-2 w-full rounded-lg border bg-gray-50"
                />

                {/* Upload Input with Eye */}
                <div className="relative mt-3">
                  <input
                    ref={passportInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setPassportFile(e.target.files?.[0] || null)
                    }
                    className="block w-full text-sm text-gray-600 cursor-pointer border rounded p-2 pr-10"
                  />
                  {passportFile && (
                    <button
                      type="button"
                      onClick={() => setPreviewFile(passportFile)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Valid ID Front & Back */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  Valid ID :
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Front */}
                  <div>
                    <span className="text-xs text-gray-500">Front</span>
                    <div className="relative mt-1">
                      <input
                        ref={idFrontInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setIdFrontFile(e.target.files?.[0] || null)
                        }
                        className="block w-full text-sm text-gray-600 cursor-pointer border rounded p-2 pr-10"
                      />
                      {idFrontFile && (
                        <button
                          type="button"
                          onClick={() => setPreviewFile(idFrontFile)}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Back */}
                  <div>
                    <span className="text-xs text-gray-500">Back</span>
                    <div className="relative mt-1">
                      <input
                        ref={idBackInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setIdBackFile(e.target.files?.[0] || null)
                        }
                        className="block w-full text-sm text-gray-600 cursor-pointer border rounded p-2 pr-10"
                      />
                      {idBackFile && (
                        <button
                          type="button"
                          onClick={() => setPreviewFile(idBackFile)}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Preview */}
              {previewFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                  <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-4">
                    <button
                      onClick={() => setPreviewFile(null)}
                      className="mb-2 px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-600 cursor-pointer"
                    >
                      Close
                    </button>
                    <img
                      src={URL.createObjectURL(previewFile)}
                      alt="Preview"
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500">
                * Please upload clear images. Accepted IDs: Passport, Driver’s
                License, UMID, PhilHealth, SSS, Postal ID, or other
                government-issued IDs.
              </p>
            </div>
          )}

          {/* Step 5: Review & Security */}
          {step === 5 && (
            <div className="space-y-4">
              {/* Password & Confirm */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative mt-1">
                    <Lock
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative mt-1">
                    <Lock
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="password"
                      placeholder="Re-enter password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Review details */}
              <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Review details</h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Name</dt>
                    <dd className="font-medium">
                      {[firstName, middleName, lastName]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Birthday</dt>
                    <dd className="font-medium">
                      {birthday ? new Date(birthday).toLocaleDateString() : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Age</dt>
                    <dd className="font-medium">{age || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Email</dt>
                    <dd className="font-medium">{email || "—"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">Address</dt>
                    <dd className="font-medium">
                      {address
                        ? `${address} ${zipCode ? `(${zipCode})` : ""}`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Contact #</dt>
                    <dd className="font-medium">{contact || "—"}</dd>
                  </div>
                </dl>
              </div>

              <p className="text-xs text-gray-500">
                By clicking “Create Account”, you confirm the information is
                accurate and agree to the terms.
              </p>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={step === 1 || submitting}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Back
          </button>

          {step < 5 ? (
            <button
              onClick={nextStep}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-5 py-2 text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-5 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create Account"}
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-gray-400 text-xs sm:text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Login Link */}
        <p className="text-xs sm:text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </motion.div>

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
                className="ml-2 text-white/80 hover:text-white"
                onClick={() => setCreatedSuccess(null)}
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
