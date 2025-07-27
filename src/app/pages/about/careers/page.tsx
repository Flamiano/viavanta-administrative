"use client";

import { motion } from "framer-motion";
import Navbar from "@/comps/Navbar";
import Footer from "@/comps/Footer";
import Threads from "@/comps/reactbits/Threads";
import { Briefcase, Send, Users } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function CareersPage() {
  return (
    <div className="font-body flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <Navbar />

      {/* Careers Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 py-24 sm:py-32 lg:max-w-2xl lg:w-full">
            <div className="px-4 sm:px-6 lg:px-8 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                  <span className="block">Careers at</span>
                  <span className="block text-blue-100">AdvenTours</span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <p className="mt-4 text-lg text-blue-100 sm:mt-6 sm:max-w-xl">
                  Join a team that&apos;s passionate about innovation, travel,
                  and creating unforgettable digital experiences.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative Teamwork SVG */}
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <svg
            className="w-72 h-72 text-blue-200 opacity-15"
            fill="currentColor"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M104 112a56 56 0 11112 0 56 56 0 01-112 0zm240 0a56 56 0 11112 0 56 56 0 01-112 0zM104 296a56 56 0 11112 0 56 56 0 01-112 0zm240 0a56 56 0 11112 0 56 56 0 01-112 0zM256 464c-48.6 0-88-39.4-88-88s39.4-88 88-88 88 39.4 88 88-39.4 88-88 88z" />
          </svg>
        </div>
      </section>

      {/* Professional Career Feature Section */}
      <section className="relative py-20 px-6 bg-white text-black z-10">
        {/* Threads Background */}
        <div className="absolute inset-0 z-0">
          <Threads />
        </div>

        {/* Content Container */}
        <motion.div
          className="relative max-w-6xl mx-auto z-10 text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl md:text-4xl font-bold">Open Opportunities</h2>
          <p className="text-gray-600 mt-4 text-base md:text-lg">
            Whether you&apos;re a creative, developer, or team lead — we have a
            place for you.
          </p>
        </motion.div>

        {/* Grid of Roles */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Role 1 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            variants={fadeInUp}
            className="space-y-4 text-center"
          >
            <Briefcase className="h-10 w-10 text-blue-600 mx-auto" />
            <h3 className="text-xl font-semibold">Software Developers</h3>
            <p className="text-sm text-gray-700">
              Write clean, efficient, and scalable code. Collaborate with peers
              to build secure and user-centered applications.
            </p>
          </motion.div>

          {/* Role 2 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            variants={fadeInUp}
            className="space-y-4 text-center"
          >
            <Send className="h-10 w-10 text-green-600 mx-auto" />
            <h3 className="text-xl font-semibold">Digital Marketers</h3>
            <p className="text-sm text-gray-700">
              Develop campaigns, boost engagement, and grow our digital presence
              across platforms.
            </p>
          </motion.div>

          {/* Role 3 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            variants={fadeInUp}
            className="space-y-4 text-center"
          >
            <Users className="h-10 w-10 text-purple-600 mx-auto" />
            <h3 className="text-xl font-semibold">Team Leaders</h3>
            <p className="text-sm text-gray-700">
              Lead with impact. Empower teams, manage projects, and help align
              tech with purpose.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
