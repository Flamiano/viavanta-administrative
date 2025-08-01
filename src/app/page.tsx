"use client";

import Navbar from "@/comps/Navbar";
import Footer from "@/comps/Footer";
import Image from "next/image";
import {
  FaGoogle,
  FaFacebook,
  FaGithub,
  FaYoutube,
  FaSlack,
  FaBolt,
} from "react-icons/fa";
import { CalendarCheck, FolderSearch, Scale, BadgeCheck } from "lucide-react";
import InfiniteMenu from "@/comps/reactbits/InifiniteMenu";
import { motion } from "framer-motion";

export default function Home() {
  const icons = [
    <FaGoogle key="google" />,
    <FaFacebook key="facebook" />,
    <FaGithub key="github" />,
    <FaYoutube key="youtube" />,
    <FaSlack key="slack" />,
    <FaBolt key="bolt" />,
  ];

  const items = [
    {
      image: "/assets/1.jpg",
      link: "https://google.com/",
      title: "Facilities Reservation",
      description:
        "Easily book and manage meeting rooms, venues, and resources with ViaVanta’s Facilities Reservation system.",
    },
    {
      image: "/assets/2.jpg",
      link: "https://google.com/",
      title: "Document Management",
      description:
        "Securely store, organize, and retrieve important documents with our smart archiving system.",
    },
    {
      image: "/assets/3.jpg",
      link: "https://google.com/",
      title: "Legal Management",
      description:
        "Track legal cases, manage contracts, and ensure compliance with our Legal Management dashboard.",
    },
    {
      image: "/assets/4.jpg",
      link: "https://google.com/",
      title: "Visitor Management",
      description:
        "Digitally monitor and log all visitor activities for enhanced safety and transparency.",
    },
    {
      image: "/assets/5.jpg",
      link: "https://google.com/",
      title: "Travel Analytics",
      description:
        "Make informed decisions using real-time insights into tours, bookings, and passenger trends.",
    },
    {
      image: "/assets/6.jpg",
      link: "https://google.com/",
      title: "Booking Management",
      description:
        "Centralized control for handling user bookings, schedules, and trip types seamlessly.",
    },
    {
      image: "/assets/7.jpg",
      link: "https://google.com/",
      title: "Customer Engagement",
      description:
        "Boost satisfaction with tools for direct communication, surveys, and personalized promotions.",
    },
    {
      image: "/assets/8.jpg",
      link: "https://google.com/",
      title: "Smart Dashboard",
      description:
        "An intuitive interface that gives administrators a full overview of system activity and usage.",
    },
    {
      image: "/assets/9.jpg",
      link: "https://google.com/",
      title: "User Access Control",
      description:
        "Set role-based access and permissions for streamlined operations and enhanced security.",
    },
    {
      image: "/assets/10.jpg",
      link: "https://google.com/",
      title: "Scalable System",
      description:
        "ViaVanta grows with you — ready for expansion without compromising performance.",
    },
  ];

  // Animation Framer Variants
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

  return (
    <div className="font-body flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6 sm:px-12 gap-5">
        {/* Slide Left Title */}
        <motion.div
          className="max-w-4xl"
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4 }}
          variants={slideLeft}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            Welcome to{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Administrative
            </span>
          </h1>
        </motion.div>

        {/* Fade In Paragraphs */}
        <motion.div
          className="max-w-4xl"
          initial="hidden"
          animate="visible"
          transition={{ duration: 1, delay: 0.2 }}
          variants={fadeInUp}
        >
          <p className="mt-4 text-md sm:text-lg text-gray-600 dark:text-gray-300">
            A platform designed to streamline and simplify the way you manage
            your travel and tour operations.
          </p>
          <p className="mt-2 text-sm sm:text-lg text-gray-500 dark:text-gray-400">
            From scheduling and resource tracking to real-time analytics and
            customer engagement, ViaVanta empowers administrators with
            intelligent tools for better decision-making.
          </p>
          <p className="mt-2 text-sm sm:text-lg text-gray-500 dark:text-gray-400">
            Secure, fast, and built for scale — your digital command center is
            here.
          </p>
        </motion.div>

        {/* Slide Right Buttons */}
        <motion.div
          className="flex flex-row flex-wrap justify-center gap-4 w-full max-w-md"
          initial="hidden"
          animate="visible"
          transition={{ duration: 1, delay: 0.4 }}
          variants={slideRight}
        >
          <a
            href="#"
            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow"
          >
            Get Started
          </a>
          <a
            href="#"
            className="flex-1 text-center border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold px-6 py-3 rounded-full shadow"
          >
            Learn More
          </a>
        </motion.div>
      </section>

      {/* Background Video Section */}
      <section className="relative h-[300px] w-full overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="/videos/1000005256.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
        >
          Sorry, your browser does not support embedded videos.
        </video>
      </section>

      {/* Module Section */}
      <section className="bg-blue-950 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            variants={fadeInUp}
          >
            <span className="text-blue-400">Administrative</span> Module
          </motion.h2>

          <motion.p
            className="mb-12 text-gray-300 max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            variants={fadeInUp}
          >
            ViaVanta empowers administrators with essential tools to manage,
            organize, and streamline core operations — all in one secure
            platform.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Facilities Reservation */}
            <motion.div
              className="bg-blue-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              variants={slideLeft}
            >
              <div className="text-blue-400 text-4xl mb-4 flex justify-center">
                <CalendarCheck
                  size={40}
                  className="text-blue-400 mb-4 mx-auto"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Facilities Reservation
              </h3>
              <p className="text-gray-300 text-sm">
                Easily manage booking of conference rooms, event halls, or any
                facility with real-time scheduling and conflict prevention.
              </p>
            </motion.div>

            {/* Document Management */}
            <motion.div
              className="bg-blue-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              variants={fadeInUp}
            >
              <div className="text-blue-400 text-4xl mb-4 flex justify-center">
                <FolderSearch
                  size={40}
                  className="text-blue-400 mb-4 mx-auto"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Document Management
              </h3>
              <p className="text-gray-300 text-sm">
                Organize, archive, and retrieve important documents securely.
                Never lose vital files with our efficient archiving system.
              </p>
            </motion.div>

            {/* Legal Management */}
            <motion.div
              className="bg-blue-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              variants={slideRight}
            >
              <div className="text-blue-400 text-4xl mb-4 flex justify-center">
                <Scale size={40} className="text-blue-400 mb-4 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Legal Management</h3>
              <p className="text-gray-300 text-sm">
                Track legal cases, contracts, and compliance workflows to
                maintain proper documentation and reduce liability.
              </p>
            </motion.div>

            {/* Visitor Management */}
            <motion.div
              className="bg-blue-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              variants={slideLeft}
            >
              <div className="text-blue-400 text-4xl mb-4 flex justify-center">
                <BadgeCheck size={40} className="text-blue-400 mb-4 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visitor Management</h3>
              <p className="text-gray-300 text-sm">
                Register, monitor, and manage guest access with ease while
                enhancing security and ensuring a smooth visitor experience.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reservation Section */}
      <motion.section
        className="py-20"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Text Content */}
          <motion.div variants={slideLeft}>
            <h2 className="text-4xl font-bold mb-4">
              Exclusive Condo Facilities Reservation
            </h2>
            <p className="text-lg text-gray-300">
              Discover comfort and convenience with our premium condo
              accommodations—available exclusively for ViaVanta Administrative
              Travel and Tours clients. Ideal for executives, guests, and
              private events, our facilities ensure a relaxing and productive
              stay.
            </p>
            <p className="mt-4 text-gray-400 text-sm">
              Reserve your space today and enjoy top-tier amenities in a secure
              and professional setting.
            </p>
          </motion.div>

          {/* Image Content */}
          <motion.div
            className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg"
            variants={slideRight}
          >
            <Image
              src="/assets/facilities/condo/1.jpg"
              alt="ViaVanta Condo Facility"
              fill
              priority
              className="object-cover w-full h-full"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Document Management Section */}
      <motion.section
        className="py-20 bg-white dark:bg-gray-950"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Image Content on the Left */}
          <motion.div
            className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg"
            variants={slideLeft}
          >
            <Image
              src="/assets/documents/6.png"
              alt="Document Management System"
              fill
              priority
              className="object-cover w-full h-full"
            />
          </motion.div>

          {/* Text Content on the Right */}
          <motion.div variants={slideRight}>
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Streamlined Document Management
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Organize, access, and manage important administrative files with
              ease. Our Document Management system ensures that your records are
              secure, searchable, and readily available.
            </p>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Eliminate the hassle of paperwork and enjoy the efficiency of
              digitized records at your fingertips.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Legal Management Section */}
      <motion.section
        className="py-20 bg-white dark:bg-gray-950"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Text Content on the Left */}
          <motion.div variants={slideLeft}>
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Comprehensive Legal Management
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Stay compliant and protected with our Legal Management system. We
              ensure that all administrative operations follow regulatory
              standards while maintaining transparency and accountability.
            </p>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              From contracts to legal documents, everything is organized,
              secure, and easily accessible.
            </p>
          </motion.div>

          {/* Image Content on the Right */}
          <motion.div
            className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg"
            variants={slideRight}
          >
            <Image
              src="/assets/legal/4.png"
              alt="Legal Management System"
              fill
              priority
              className="object-cover w-full h-full"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Visitor Management Section */}
      <motion.section
        className="py-20 bg-white dark:bg-gray-950"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Image Content on the Left */}
          <motion.div
            className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg"
            variants={slideLeft}
          >
            <Image
              src="/assets/visitors/1.png"
              alt="Visitor Management System"
              fill
              priority
              className="object-cover w-full h-full"
            />
          </motion.div>

          {/* Text Content on the Right */}
          <motion.div variants={slideRight}>
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Smart Visitor Management
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Track, manage, and welcome your guests with efficiency. Our
              Visitor Management system offers secure check-in processes,
              real-time logs, and visitor history to ensure a safe and organized
              environment.
            </p>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Empower your front desk with digital tools that streamline visitor
              handling and boost your professional image.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="bg-blue-800 py-20 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Why <span className="text-blue-300">Choose ViaVanta?</span>
          </h2>
          <p className="text-gray-200 mb-12 max-w-2xl mx-auto">
            ViaVanta is your trusted digital partner for modernizing
            administrative processes with speed, transparency, and intelligent
            design.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature 1 - Slide Left */}
            <motion.div
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-blue-900 p-6 rounded-2xl shadow-md hover:shadow-lg"
            >
              <div className="text-blue-300 text-4xl mb-4 flex justify-center">
                <i className="lucide lucide-shield-check" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure by Design</h3>
              <p className="text-gray-200 text-sm">
                Data encryption, role-based access, and audit logs ensure
                sensitive data stays protected 24/7.
              </p>
            </motion.div>

            {/* Feature 2 - Fade In Up */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-blue-900 p-6 rounded-2xl shadow-md hover:shadow-lg"
            >
              <div className="text-blue-300 text-4xl mb-4 flex justify-center">
                <i className="lucide lucide-layout-dashboard" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Unified Dashboard</h3>
              <p className="text-gray-200 text-sm">
                View, manage, and act on critical modules from one intuitive
                dashboard interface.
              </p>
            </motion.div>

            {/* Feature 3 - Slide Right */}
            <motion.div
              variants={slideRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-blue-900 p-6 rounded-2xl shadow-md hover:shadow-lg"
            >
              <div className="text-blue-300 text-4xl mb-4 flex justify-center">
                <i className="lucide lucide-bolt" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Responsive</h3>
              <p className="text-gray-200 text-sm">
                Optimized for both desktop and mobile, ViaVanta responds fast no
                matter the device.
              </p>
            </motion.div>

            {/* Feature 4 - Slide Left */}
            <motion.div
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-blue-900 p-6 rounded-2xl shadow-md hover:shadow-lg"
            >
              <div className="text-blue-300 text-4xl mb-4 flex justify-center">
                <i className="lucide lucide-settings" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customizable Tools</h3>
              <p className="text-gray-200 text-sm">
                Tailor features and modules to fit your organization’s workflow
                and policies.
              </p>
            </motion.div>

            {/* Feature 5 - Fade In Up */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-blue-900 p-6 rounded-2xl shadow-md hover:shadow-lg"
            >
              <div className="text-blue-300 text-4xl mb-4 flex justify-center">
                <i className="lucide lucide-users" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                User-Centric Design
              </h3>
              <p className="text-gray-200 text-sm">
                Built with users in mind — clean UI, smooth navigation, and
                accessible design for all.
              </p>
            </motion.div>

            {/* Feature 6 - Slide Right */}
            <motion.div
              variants={slideRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-blue-900 p-6 rounded-2xl shadow-md hover:shadow-lg"
            >
              <div className="text-blue-300 text-4xl mb-4 flex justify-center">
                <i className="lucide lucide-cloud-check" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cloud-Based Access</h3>
              <p className="text-gray-200 text-sm">
                Manage operations from anywhere — all you need is a device and
                internet connection.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* InfiniteMenu Images 1-10 */}
      <section className="w-full">
        <div className="w-full h-[600px] md:h-[700px] lg:h-[800px] relative">
          <InfiniteMenu items={items} />
        </div>
      </section>

      {/* Auto-Scrolling Icon Carousel */}
      <section className="py-12 overflow-hidden">
        <div className="relative w-full overflow-hidden">
          <div
            className="flex text-white text-7xl whitespace-nowrap animate-[marquee_15s_linear_infinite]"
            style={{ width: "max-content" }}
          >
            {Array(6)
              .fill(icons)
              .flat()
              .map((icon, index) => (
                <div key={index} className="flex-shrink-0 mx-8">
                  {icon}
                </div>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
