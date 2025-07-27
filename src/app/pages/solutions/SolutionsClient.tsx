"use client";

import { useEffect, useState } from "react";
import Footer from "@/comps/Footer";
import Navbar from "@/comps/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CalendarCheck, FileArchive, ShieldCheck, LogIn } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function SolutionsClient() {
  const facilities = [
    {
      src: "/assets/facilities/airport/1.png",
      title: "VIP Lounge",
      desc: "A luxurious space designed for executives, guests, and private briefings.",
    },
    {
      src: "/assets/facilities/airport/2.png",
      title: "Conference Room",
      desc: "Equipped with presentation tools and ideal for business meetings.",
    },
    {
      src: "/assets/facilities/airport/3.png",
      title: "Arrival Hall",
      desc: "Spacious and clean, ideal for organized guest reception or large events.",
    },
    {
      src: "/assets/facilities/airport/4.png",
      title: "Waiting Area",
      desc: "Modern design with relaxing ambiance for passengers and staff.",
    },
    {
      src: "/assets/facilities/airport/5.png",
      title: "Security Checkpoint Lounge",
      desc: "Professionally maintained with streamlined flow and comfort.",
    },
    {
      src: "/assets/facilities/airport/6.png",
      title: "Baggage Inspection Entry",
      desc: "Designated area for checking and inspecting passenger luggage to ensure safety and compliance.",
    },
  ];

  const roomFacilities = [
    {
      src: "/assets/facilities/room/1.png",
      title: "Elegant Suite",
      desc: "Designed for comfort and sophistication.",
    },
    {
      src: "/assets/facilities/room/2.png",
      title: "Modern Comfort",
      desc: "Equipped with the latest technology and design.",
    },
    {
      src: "/assets/facilities/room/3.png",
      title: "Family Room",
      desc: "Spacious and cozy for the whole family.",
    },
    {
      src: "/assets/facilities/room/4.jpg",
      title: "Business Deluxe",
      desc: "Ideal for working professionals needing style and function.",
    },
    {
      src: "/assets/facilities/room/5.jpg",
      title: "Presidential Suite",
      desc: "Top-tier luxury, privacy, and elegance for VIPs.",
    },
  ];

  const carFacilities = [
    {
      src: "/assets/facilities/cars/1Vios.jpg",
      title: "Toyota Vios",
      desc: "A reliable sedan for quick and efficient transport. Ideal for urban and city use.",
    },
    {
      src: "/assets/facilities/cars/2Grandia.jpg",
      title: "Toyota Grandia",
      desc: "Spacious and comfortable for group travel. Perfect for team outings and client visits.",
    },
    {
      src: "/assets/facilities/cars/3Innova.jpg",
      title: "Toyota Innova",
      desc: "Versatile for both official and field work. Comfortable for long drives and mixed terrain.",
    },
    {
      src: "/assets/facilities/cars/4Atlis.jpg",
      title: "Toyota Altis",
      desc: "A stylish executive car offering smooth rides for official errands and executive trips.",
    },
    {
      src: "/assets/facilities/cars/5Fortuner.jpg",
      title: "Toyota Fortuner",
      desc: "Powerful and spacious SUV suitable for long-distance travel, even on rugged routes.",
    },
  ];

  const documentImages = [
    {
      src: "/assets/documents/1.png",
      title: "Centralized Storage",
      desc: "All your business files and sensitive information are securely stored in a unified location, making access seamless and efficient.",
    },
    {
      src: "/assets/documents/2.png",
      title: "Version Control",
      desc: "Track changes and updates to every document to avoid confusion and improve collaboration across departments.",
    },
    {
      src: "/assets/documents/3.png",
      title: "Permission-Based Access",
      desc: "Ensure that only the right people have access to the right documents, protecting your sensitive data.",
    },
    {
      src: "/assets/documents/4.png",
      title: "Automated Workflow",
      desc: "Streamline document approvals, notifications, and filing with smart automation features.",
    },
    {
      src: "/assets/documents/5.png",
      title: "Cloud Backup & Recovery",
      desc: "Your data is always safe with our secure cloud storage. We automatically back up files in real time, so you never lose important information. If anything goes wrong—whether it’s accidental deletion or system failure—you can easily recover your data anytime, anywhere.",
    },
    {
      src: "/assets/documents/6.png",
      title: "Audit Logs & Compliance",
      desc: "We keep a full record of all user activity to help your business stay transparent, compliant, and protected. From login attempts to document edits, everything is logged. Our system supports regulatory checkings, making audits easier and faster.",
    },
  ];

  const legalItems = [
    {
      src: "/assets/legal/1.png",
      title: "Policy Management",
      desc: "Easily create, update, and distribute your internal policies. Ensure everyone stays informed with centralized access to all legal documents.",
    },
    {
      src: "/assets/legal/2.png",
      title: "Contract Oversight",
      desc: "Track and manage contracts from draft to signature. Stay ahead of renewals, obligations, and key deadlines with automated alerts.",
    },
    {
      src: "/assets/legal/3.png",
      title: "Legal Document Vault",
      desc: "Securely store all legal documents in one encrypted location. Quick search and filtering help you find what you need instantly.",
    },
    {
      src: "/assets/legal/4.png",
      title: "Regulatory Compliance",
      desc: "Stay compliant with changing laws and industry standards. Our system supports documentation for ISO, GDPR, HIPAA, and more.",
    },
  ];

  const visitorsItems = [
    {
      src: "/assets/visitors/1.png",
      title: "Visitor Registration",
      desc: "Easily register and log guests as they arrive. Capture essential details with speed and accuracy.",
    },
    {
      src: "/assets/visitors/2.png",
      title: "Digital Pass Issuance",
      desc: "Issue secure digital passes for visitors, ensuring fast, safe, and trackable access.",
    },
    {
      src: "/assets/visitors/3.png",
      title: "Real-Time Tracking",
      desc: "Monitor all visitor movements within your premises in real-time with detailed logs and alerts.",
    },
    {
      src: "/assets/visitors/4.png",
      title: "Visitor History",
      desc: "Keep a full archive of past visitors and their visit logs for auditing, reporting, or security review.",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % roomFacilities.length);
    }, 4000); // auto-slide every 4s
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-body flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <Navbar />

      {/* Services Hero Section */}
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
                  <span className="block">Streamlined</span>
                  <span className="block text-blue-100">
                    Administrative Services
                  </span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <p className="mt-4 text-lg text-blue-100 sm:mt-6 sm:max-w-xl">
                  Explore solutions, built to simplify your workflow.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative Checklist + Gear SVG */}
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <svg
            className="w-72 h-72 text-blue-200 opacity-15"
            fill="none"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M384 48H128C92.7 48 64 76.7 64 112v288c0 35.3 28.7 64 64 64h256c35.3 0 64-28.7 64-64V112c0-35.3-28.7-64-64-64zM128 80h256c17.7 0 32 14.3 32 32v16H96v-16c0-17.7 14.3-32 32-32zm256 352H128c-17.7 0-32-14.3-32-32V144h320v256c0 17.7-14.3 32-32 32zM160 192h64v32h-64v-32zm0 80h64v32h-64v-32zm0 80h64v32h-64v-32zm144-160h48v32h-48v-32zm0 80h48v32h-48v-32zm0 80h48v32h-48v-32z"
            />
          </svg>
        </div>
      </section>

      {/* Administrative Module */}
      <section className="bg-white dark:bg-gray-950 py-20 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto text-center">
          {/* Heading */}
          <motion.h2
            className="text-4xl font-bold mb-4 text-gray-900 dark:text-white"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6 }}
          >
            Administrative Module
          </motion.h2>

          <motion.p
            className="text-gray-600 dark:text-gray-300 mb-12 text-sm md:text-base max-w-3xl mx-auto"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our Administrative Module empowers institutions with modern tools to
            manage facilities, documents, legal operations, and visitor
            flows—all in one unified platform.
          </motion.p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left">
            {/* Facility Reservation */}
            <motion.div
              className="bg-gray-100 dark:bg-gray-900 p-6 rounded-2xl shadow-md"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <CalendarCheck className="text-blue-600 dark:text-blue-400 w-7 h-7 mb-3" />
              <h3 className="text-lg font-semibold mb-1">
                Facilities Reservation
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Reserve rooms, venues, or equipment efficiently with conflict
                detection and automated reminders.
              </p>
            </motion.div>

            {/* Document Management */}
            <motion.div
              className="bg-gray-100 dark:bg-gray-900 p-6 rounded-2xl shadow-md"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <FileArchive className="text-green-600 dark:text-green-400 w-7 h-7 mb-3" />
              <h3 className="text-lg font-semibold mb-1">
                Document Management
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Archive, retrieve, and organize documents securely with
                versioning and expiration control.
              </p>
            </motion.div>

            {/* Legal Management */}
            <motion.div
              className="bg-gray-100 dark:bg-gray-900 p-6 rounded-2xl shadow-md"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <ShieldCheck className="text-purple-600 dark:text-purple-400 w-7 h-7 mb-3" />
              <h3 className="text-lg font-semibold mb-1">Legal Management</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Manage legal files with secure access, digital signatures, and
                audit-ready workflows.
              </p>
            </motion.div>

            {/* Visitor Management */}
            <motion.div
              className="bg-gray-100 dark:bg-gray-900 p-6 rounded-2xl shadow-md"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <LogIn className="text-red-600 dark:text-red-400 w-7 h-7 mb-3" />
              <h3 className="text-lg font-semibold mb-1">Visitor Management</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Track visitors in real time with check-in/out logs, ID
                verification, and reporting tools.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Airport Facilities */}
      <section className="bg-gray-100 dark:bg-gray-900 py-20 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            className="text-4xl font-bold mb-6 text-gray-900 dark:text-white"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Airport Facilities
          </motion.h2>
          <motion.p
            className="text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto text-sm md:text-base"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover our premium airport spaces available for reservation—from
            elegant lounges to spacious halls, perfect for events, meetings, or
            operations.
          </motion.p>

          {/* Facilities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {facilities.map((facility, idx) => (
              <motion.div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 * idx }}
              >
                <div className="relative w-full h-48">
                  <Image
                    src={facility.src}
                    alt={facility.title}
                    fill
                    className="rounded-t-2xl object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                </div>
                <div className="p-4 text-left">
                  <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
                    {facility.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {facility.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Facilities */}
      <section className="relative w-full h-screen overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={roomFacilities[index].src}
            className="absolute w-full h-full top-0 left-0"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src={roomFacilities[index].src}
              alt={roomFacilities[index].title}
              fill
              className="object-cover"
              priority
            />
            {/* Text overlay */}
            <div className="absolute bottom-0 left-0 w-full bg-black/40 text-white px-4 sm:px-8 py-4 sm:py-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                {roomFacilities[index].title}
              </h2>
              <p className="text-xs sm:text-sm md:text-base leading-snug">
                {roomFacilities[index].desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        <div
          className={`
                absolute bottom-4
                flex gap-2 z-10
                transition-all duration-300
                sm:left-1/2 sm:transform sm:-translate-x-1/2
                right-4 sm:right-auto
            `}
        >
          {roomFacilities.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`
                    transition-all duration-300 rounded-full
                    ${i === index ? "bg-white" : "bg-gray-400"}
                    w-2 h-2 sm:w-3 sm:h-3
                `}
            />
          ))}
        </div>
      </section>

      {/* Transportation Facilities */}
      <section className="bg-white/79 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Our Transport Facilities
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Reliable vehicles ready to support all your official needs.
          </p>
        </div>

        {/* Scroll Wrapper */}
        <div className="relative w-full overflow-hidden">
          <div className="scroll-x">
            {[...carFacilities, ...carFacilities].map((car, index) => (
              <div
                key={index}
                className="min-w-[300px] bg-gray-50 rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >
                <img
                  src={car.src}
                  alt={car.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 text-left">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {car.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{car.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="w-full bg-blue-700 py-7 px-6 md:px-20">
        {/* Title and Text */}
        <div
          className="flex flex-col md:flex-row items-start gap-10 max-w-7xl mx-auto"
          style={{ minHeight: "70vh" }}
        >
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Discover the World with ViaVanta
            </h2>
            <p className="text-lg text-gray-300">
              At ViaVanta Travel and Tours, we believe that every journey should
              be as unique and unforgettable as the people taking it. Whether
              you're seeking adventure, relaxation, or cultural discovery —
              we're here to turn your travel dreams into reality.
            </p>
            <p className="text-base text-gray-300">
              From seamless itineraries to curated experiences, we go beyond
              booking flights and hotels. Our team of travel experts is
              passionate about crafting meaningful getaways that reflect your
              personality and preferences — no cookie-cutter trips here.
            </p>
            <p className="text-base text-gray-300">
              Secure, stress-free, and tailored for you — ViaVanta handles every
              detail so you can focus on the experience. Whether you're planning
              a romantic escape, a family holiday, or a corporate retreat, now
              is the perfect time to explore.
            </p>
            <p className="text-base text-gray-300">
              Don’t wait for someday. Make memories that matter —{" "}
              <span className="font-semibold text-white">
                book your next adventure with ViaVanta today.
              </span>
            </p>
          </div>

          {/* Right Side Images*/}
          <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
            {documentImages.slice(0, 4).map((img, index) => (
              <div
                key={index}
                className="relative w-full h-[180px] md:h-[220px] rounded-xl overflow-hidden shadow-md"
              >
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover rounded-xl"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Again for 2 Images */}
      <section className="w-full">
        {documentImages.slice(4, 6).map((img, idx) => (
          <div
            key={idx}
            className={`flex flex-col md:flex-row ${
              idx % 2 === 1 ? "md:flex-row-reverse" : ""
            } items-center w-full h-[50vh]`}
          >
            <div className="w-full h-full md:w-1/2 relative">
              <Image
                src={img.src}
                alt={img.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="w-full md:w-1/2 px-6 md:px-12 py-6">
              <h3 className="text-2xl md:text-3xl font-semibold mb-2">
                {img.title}
              </h3>
              <p className="text-gray-600 text-base md:text-lg">{img.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Legal Section */}
      <section className="bg-white/79 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Legal & Compliance
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Our Legal Management tools are built to simplify compliance and
            protect your organization. From policy distribution to document
            retention, everything is secure, centralized, and easy to manage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {legalItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 text-left">
                <h3 className="text-xl font-semibold text-gray-800">
                  {item.title}
                </h3>
                <p className="text-gray-600 mt-2 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visitor Section */}
      <section className="w-full">
        {[0, 2].map((startIndex, i) => (
          <div key={i} className="flex flex-col md:flex-row h-screen">
            {[0, 1].map((offset) => {
              const item = visitorsItems[startIndex + offset];
              return (
                <div
                  key={item.title}
                  className="w-full md:w-1/2 h-screen relative overflow-hidden"
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 bg-opacity-50 flex flex-col items-center justify-center text-center px-6">
                    <h3 className="text-white font-extrabold text-3xl mb-4">
                      {item.title}
                    </h3>
                    <p className="text-white text-lg max-w-md">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
