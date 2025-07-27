"use client";

import Footer from "@/comps/Footer";
import Navbar from "@/comps/Navbar";
import Head from "next/head";

export default function TermsAndConditionsPage() {
  return (
    <div className="font-body flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <Navbar />

      <Head>
        <title>Terms & Conditions - ViaVanta</title>
        <meta
          name="description"
          content="Terms and Conditions for using ViaVanta Administrative Solutions"
        />
      </Head>

      <div className="min-h-screen bg-white/79">
        {/* Hero Section */}
        <div className="relative bg-blue-700 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
                <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                  <div className="sm:text-center lg:text-left">
                    <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                      <span className="block">Terms & Conditions</span>
                      <span className="block text-blue-100">
                        Your Agreement with ViaVanta
                      </span>
                    </h1>
                    <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                      Please read these terms carefully before using our
                      services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Background SVG */}
          <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
            <svg
              className="w-64 h-64 text-blue-400 opacity-20"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Terms Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-8 sm:p-10">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
                Terms & Conditions
              </h2>

              <div className="w-full bg-blue-700 p-4 rounded-lg mb-8">
                <h3 className="text-2xl font-bold text-white text-center">
                  Your Use of Our Platform
                </h3>
              </div>

              <div className="prose prose-lg text-gray-700 space-y-6">
                <p>
                  By accessing or using ViaVanta’s website and services, you
                  agree to abide by our terms and conditions. These rules ensure
                  a safe, transparent, and effective experience for all users.
                </p>

                <p>
                  You may not misuse the platform, including attempting to
                  access restricted areas, interfere with service functionality,
                  or reverse-engineer our software. All user data must be
                  accurate and kept up-to-date.
                </p>

                <p>
                  ViaVanta reserves the right to suspend or terminate your
                  account if we believe you’ve violated these terms, or engaged
                  in behavior that harms our platform, users, or partners.
                </p>

                <p>
                  These terms may be updated occasionally. We’ll notify you of
                  significant changes, and your continued use of our services
                  constitutes acceptance of those changes.
                </p>

                <p>
                  For questions or concerns regarding our Terms, reach out to us
                  at:
                  <br />
                  <a
                    href="mailto:support@viavanta.com"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    support@viavanta.com
                  </a>
                  <br />
                  or call{" "}
                  <a
                    href="tel:+639123456789"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    +63 912 345 6789
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
