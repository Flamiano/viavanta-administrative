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

      {/* Hero Section */}
      <motion.section
        className="flex flex-col justify-center items-center h-[400px] bg-blue-700 text-white px-4 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        variants={fadeInUp}
      >
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Careers at AdvenTours
        </h1>
        <p className="text-sm md:text-base max-w-2xl">
          Join a team that&apos;s passionate about innovation, travel, and creating
          unforgettable digital experiences.
        </p>
      </motion.section>

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
            Whether you&apos;re a creative, developer, or team lead — we have a place
            for you.
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

// Components
function JobCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-100 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-black">{title}</h3>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  );
}

function Perk({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center max-w-[250px] w-full">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  );
}
