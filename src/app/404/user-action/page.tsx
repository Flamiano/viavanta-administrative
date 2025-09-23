"use client";

import React from "react";
import { useRouter } from "next/navigation";

const UserAction404 = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-gray-700 text-lg mb-6">
          Another browser recently logged into your account, so this browser has
          been automatically logged out.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push("/auth/login")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Login Again
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAction404;
