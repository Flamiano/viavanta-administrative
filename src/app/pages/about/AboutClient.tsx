"use client";

import Navbar from "@/comps/Navbar";
import Footer from "@/comps/Footer";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Target,
  Eye,
  Layers,
  ShieldCheck,
  Users,
  Settings2,
  CalendarCheck,
  FileArchive,
  LogIn,
} from "lucide-react";
import DarkVeil from "@/comps/reactbits/DarkVeil";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const slideLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};

const slideRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

export default function AboutClient() {
  return (
    <div className="font-body flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <Navbar />

      {/* About Hero Section */}
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
                  <span className="block">Centralized System</span>
                  <span className="block text-blue-100">for Admin Control</span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <p className="mt-4 text-lg text-blue-100 sm:mt-6 sm:max-w-xl">
                  Our system unifies document, legal, facility, and visitor
                  management into one powerful platform.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative Gear + Nodes SVG */}
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <svg
            className="w-72 h-72 text-blue-200 opacity-15"
            fill="none"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M487.4 315.7l-37.5-21.6c2.2-14.4 2.2-29.3 0-43.7l37.5-21.6c9.1-5.3 13-16.4 9.1-26.4-11.6-29.3-29.2-56-51.2-78l-1.4-1.4c-7.2-7.2-18-9.2-26.7-4.4l-37.5 21.6c-11.3-9.3-23.8-17.2-37.3-23.3V60.1c0-10.5-6.8-19.8-16.7-22.7-31.3-9.5-64.9-11-97.2 0-9.9 2.9-16.7 12.2-16.7 22.7v43.4c-13.5 6.1-26 14-37.3 23.3l-37.5-21.6c-8.7-4.9-19.5-2.8-26.7 4.4l-1.4 1.4c-22 22-39.6 48.7-51.2 78-3.9 10-0.1 21.1 9.1 26.4l37.5 21.6c-2.2 14.4-2.2 29.3 0 43.7l-37.5 21.6c-9.1 5.3-13 16.4-9.1 26.4 11.6 29.3 29.2 56 51.2 78l1.4 1.4c7.2 7.2 18 9.2 26.7 4.4l37.5-21.6c11.3 9.3 23.8 17.2 37.3 23.3v43.4c0 10.5 6.8 19.8 16.7 22.7 31.3 9.5 64.9 11 97.2 0 9.9-2.9 16.7-12.2 16.7-22.7v-43.4c13.5-6.1 26-14 37.3-23.3l37.5 21.6c8.7 4.9 19.5 2.8 26.7-4.4l1.4-1.4c22-22 39.6-48.7 51.2-78 3.9-10 .1-21.1-9.1-26.4zM256 336c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80z"
            />
          </svg>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-20 px-6 bg-white dark:bg-gray-950 text-center">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gray-100 dark:bg-gray-900 shadow-lg rounded-2xl p-8 text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-blue-600 dark:text-blue-400 w-6 h-6" />
              <h2 className="text-2xl font-bold">Our Mission</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
              Our mission is to simplify and digitalize everyday administrative
              processes by delivering a streamlined platform that enhances
              efficiency across departments. We aim to help institutions
              increase their productivity and foster collaboration by removing
              unnecessary complexity and improving digital interactions.
            </p>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-gray-100 dark:bg-gray-900 shadow-lg rounded-2xl p-8 text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-green-600 dark:text-green-400 w-6 h-6" />
              <h2 className="text-2xl font-bold">Our Vision</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
              We envision becoming the trusted standard in digital
              transformation for administrative operations. Our goal is to
              empower organizations with intuitive tools that promote smart
              decision making and foster positive user engagement while
              embracing the future of paperless systems and connected
              technologies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-blue-800 text-white py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center">
          {/* Heading */}
          <motion.h2
            className="text-4xl font-bold mb-4"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Story
          </motion.h2>

          {/* Two-column layout */}
          <div className="grid md:grid-cols-2 gap-10 text-left">
            <motion.p
              className="text-lg opacity-90"
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              At ViaVanta we believe in transforming complexity into clarity.
              What started as a simple idea to improve the flow of
              administrative tasks has grown into a platform trusted by
              organizations of all sizes.
            </motion.p>

            <motion.p
              className="text-lg opacity-90"
              variants={slideRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Our journey is powered by a diverse team of developers legal
              advisors and systems architects. Together we designed ViaVanta to
              be more than just a system it is a digital partner for your daily
              operations.
            </motion.p>

            <motion.p
              className="text-lg opacity-90"
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              From document workflows to secure access controls our tools are
              engineered with a user first approach. Every feature is created to
              ensure clarity transparency and productivity within your
              institution.
            </motion.p>

            <motion.p
              className="text-lg opacity-90"
              variants={slideRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              We continue to grow with your needs. Your challenges shape our
              roadmap and your success fuels our purpose. Whether you manage a
              local office or a large organization we are here to support and
              scale with you.
            </motion.p>
          </div>

          {/* Cards Section */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              className="bg-white/10 p-6 rounded-2xl shadow-md text-left"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Layers size={36} className="mb-4 text-white" />
              <h3 className="text-xl font-semibold mb-2">Modular Design</h3>
              <p className="opacity-90">
                Our platform is built with flexibility in mind, allowing for
                customizable workflows tailored to your team&#39;s needs.
              </p>
            </motion.div>

            <motion.div
              className="bg-white/10 p-6 rounded-2xl shadow-md text-left"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <ShieldCheck size={36} className="mb-4 text-white" />
              <h3 className="text-xl font-semibold mb-2">
                Enterprise Security
              </h3>
              <p className="opacity-90">
                We prioritize data security with encryption, role-based access
                control, and secure backups at every layer.
              </p>
            </motion.div>

            <motion.div
              className="bg-white/10 p-6 rounded-2xl shadow-md text-left"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Users size={36} className="mb-4 text-white" />
              <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
              <p className="opacity-90">
                Empower teams to collaborate in real-time with integrated
                communication and document sharing tools.
              </p>
            </motion.div>

            <motion.div
              className="bg-white/10 p-6 rounded-2xl shadow-md text-left"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Settings2 size={36} className="mb-4 text-white" />
              <h3 className="text-xl font-semibold mb-2">Smart Automation</h3>
              <p className="opacity-90">
                Reduce manual tasks with smart triggers, notifications, and
                rule-based automation built into the system.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 dark:bg-gray-900 py-16 px-6">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold mb-12">System Highlights</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
            {/* Feature 1 */}
            <div className="flex gap-4 items-start">
              <CalendarCheck className="text-blue-600 w-7 h-7 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  Facility Reservation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reserve rooms and equipment in real-time with automatic
                  conflict detection and reminders.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 items-start">
              <FileArchive className="text-green-600 w-7 h-7 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  Document Archiving
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Secure upload, organization, and retrieval of important files
                  with built-in expiration rules.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4 items-start">
              <ShieldCheck className="text-purple-600 w-7 h-7 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  Legal File Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ensure compliance and traceability with version tracking,
                  role-based access, and review workflows.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4 items-start">
              <LogIn className="text-red-600 w-7 h-7 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-1">Visitor Logging</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time visitor registration and historical reports to
                  improve security and planning.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/*About ViaVanta and Purpose */}
      <section className="min-h-screen px-6 sm:px-12 py-25 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6 py-10">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6"
            >
              <h1 className="text-5xl font-extrabold">ViaVanta</h1>
              <p className="text-sm text-gray-200 sm:text-right mt-2 sm:mt-0 sm:ml-4">
                Built by{" "}
                <span className="font-semibold text-[var(--color-accent)]">
                  ViaVanta Team
                </span>
              </p>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="text-lg text-white/90 leading-relaxed mb-2"
            >
              At ViaVanta, we believe in transforming the way administrative
              systems function by creating modern, reliable, and intelligent
              digital platforms. Our vision is to empower institutions to
              operate more efficiently with tools that are flexible, secure, and
              built for the future.
            </motion.p>

            {[
              "ViaVanta Administrative is your unified platform for digitalized administrative operations from facility reservations to legal records and visitor management.",
              "We streamline your workflows, eliminate redundancies, and deliver centralized control with maximum security.",
              "ViaVanta brings intelligent organization to every task, making your processes smooth, consistent, and productive.",
              "Built for institutions, schools, government offices, and large organizations—our platform ensures real-time collaboration and dependable data management.",
              "With encrypted infrastructure and built-in audit trails, data protection and accountability become your default standard.",
              "Scalable architecture means ViaVanta grows with your needs whether you manage a single office or multiple departments.",
              "Our system integrates effortlessly with your current tools so transitions are smooth and adoption is fast.",
            ].map((text, i) => (
              <motion.p
                key={i}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
                className="text-lg text-white/90 leading-relaxed mb-2"
              >
                {text}
              </motion.p>
            ))}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                Core Capabilities
              </h2>
              <ul className="space-y-2 text-sm text-white/80">
                <li>✓ Facilities Reservation</li>
                <li>✓ Document Management</li>
                <li>✓ Legal Management</li>
                <li>✓ Visitor Management</li>
                <li>✓ Real-time Monitoring</li>
                <li>✓ Secured Access Controls</li>
              </ul>
            </motion.div>

            <motion.div
              variants={slideRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                Technology Stack
              </h2>
              <ul className="space-y-2 text-sm text-white/80">
                <li>✓ Cloud-Native Infrastructure</li>
                <li>✓ Encrypted Data Storage</li>
                <li>✓ API-First Architecture</li>
                <li>✓ Cross-Platform Compatibility</li>
                <li>✓ Real-time Notifications</li>
                <li>✓ Role-Based Access Control</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="relative w-full z-10 py-24 px-4 sm:px-10 text-center overflow-hidden">
        {/* DarkVeil as background */}
        <div className="absolute inset-0 z-0">
          <DarkVeil />
        </div>

        <motion.div
          className="relative z-10 max-w-7xl mx-auto text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          variants={slideLeft}
        >
          <h2 className="text-4xl font-bold mb-16">Meet the Team</h2>

          {/* Row 1: 2 members */}
          <motion.div
            className="flex justify-center flex-wrap gap-8 sm:gap-16 md:gap-24 lg:gap-32 mb-9 md:mb-24"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Member 1 */}
            <div className="flex flex-col items-center text-center max-w-[250px] w-full">
              <Image
                src="/assets/1.jpg"
                alt="John Roel R.Flamiano"
                width={140}
                height={140}
                className="rounded-full mb-4 object-cover w-[120px] h-[120px] sm:w-[140px] sm:h-[140px]"
              />
              <h3 className="text-xl font-semibold">John Roel R. Flamiano</h3>
              <p className="text-sm text-gray-300">Team Leader & Developer</p>
            </div>

            {/* Member 2 */}
            <div className="flex flex-col items-center text-center max-w-[250px] w-full">
              <Image
                src="/assets/1.jpg"
                alt="Jaymark N. Dadivas"
                width={140}
                height={140}
                className="rounded-full mb-4 object-cover w-[120px] h-[120px] sm:w-[140px] sm:h-[140px]"
              />
              <h3 className="text-xl font-semibold">Jaymark N. Dadivas</h3>
              <p className="text-sm text-gray-300">
                System QA / Programmer Support
              </p>
            </div>
          </motion.div>

          {/* Row 2: 3 members */}
          <motion.div
            className="flex justify-center flex-wrap gap-8 sm:gap-12 md:gap-20 lg:gap-32"
            variants={slideRight}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Member 3 */}
            <div className="flex flex-col items-center text-center max-w-[250px] w-full">
              <Image
                src="/assets/1.jpg"
                alt="Jomar C. Barte"
                width={140}
                height={140}
                className="rounded-full mb-4 object-cover w-[120px] h-[120px] sm:w-[140px] sm:h-[140px]"
              />
              <h3 className="text-xl font-semibold">Jomar C. Barte</h3>
              <p className="text-sm text-gray-300">UI/UX Designer</p>
            </div>

            {/* Member 4 */}
            <div className="flex flex-col items-center text-center max-w-[250px] w-full">
              <Image
                src="/assets/1.jpg"
                alt="Russel M. Realto"
                width={140}
                height={140}
                className="rounded-full mb-4 object-cover w-[120px] h-[120px] sm:w-[140px] sm:h-[140px]"
              />
              <h3 className="text-xl font-semibold">Russel M. Realto</h3>
              <p className="text-sm text-gray-300">Señorito</p>
            </div>

            {/* Member 5 */}
            <div className="flex flex-col items-center text-center max-w-[250px] w-full">
              <Image
                src="/assets/1.jpg"
                alt="Bianca Mae D. Cañaveral"
                width={140}
                height={140}
                className="rounded-full mb-4 object-cover w-[120px] h-[120px] sm:w-[140px] sm:h-[140px]"
              />
              <h3 className="text-xl font-semibold">Bianca Mae D. Cañaveral</h3>
              <p className="text-sm text-gray-300">Documentation & Support</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
