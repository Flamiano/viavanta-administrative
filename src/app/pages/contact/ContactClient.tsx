"use client";

import Navbar from "@/comps/Navbar";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/comps/Footer";
import Threads from "@/comps/reactbits/Threads";

// Animations
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

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQGroup {
  title: string;
  items: FAQItem[];
}

const faqGroups: FAQGroup[] = [
  {
    title: "Facilities Reservation",
    items: [
      {
        question: "How do I reserve a facility?",
        answer:
          "Log in to your account, go to Facilities, and choose the facility you want to reserve.",
      },
      {
        question: "What are the available facilities for reservation?",
        answer:
          "Conference rooms, computer labs, audio-visual rooms, and more.",
      },
      {
        question: "Can I cancel or reschedule my reservation?",
        answer:
          'Yes, go to your Reservations and click "Edit" or "Cancel" depending on the status.',
      },
    ],
  },
  {
    title: "Document Management (Archiving)",
    items: [
      {
        question: "How do I upload documents for archiving?",
        answer: "Go to Documents > Upload and follow the instructions.",
      },
      {
        question: "Are my documents secure in the system?",
        answer:
          "Yes, all documents are encrypted and stored securely in our cloud system.",
      },
      {
        question: "Can I retrieve deleted documents?",
        answer: "Only admins can retrieve deleted documents within 30 days.",
      },
    ],
  },
  {
    title: "Legal Management",
    items: [
      {
        question: "Who can access legal files?",
        answer: "Only authorized personnel can access legal files.",
      },
      {
        question: "Is there an approval process for legal submissions?",
        answer:
          "Yes, all legal files must go through a review and approval process.",
      },
      {
        question: "Can legal documents be edited after submission?",
        answer: "No, once submitted, only admins can request edits.",
      },
    ],
  },
  {
    title: "Visitor Management",
    items: [
      {
        question: "How do I log a visitor?",
        answer:
          "Go to Visitor Logs and fill out the form with the visitor’s details.",
      },
      {
        question: "Can I see a record of past visitors?",
        answer:
          "Yes, under the History tab, you can view previous visitor logs.",
      },
      {
        question: "How long is visitor data stored?",
        answer:
          "Visitor data is stored for 1 year before it is archived or deleted.",
      },
    ],
  },
];

export default function ContactClient() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="font-body flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <Navbar />

      {/* Contact Hero Section */}
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
                  <span className="block">Get in Touch</span>
                  <span className="block text-blue-100">
                    We&apos;re Here to Help
                  </span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <p className="mt-4 text-lg text-blue-100 sm:mt-6 sm:max-w-xl">
                  Reach out to our team for support, inquiries, or
                  collaboration. We value your connection.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative Contact SVG (Envelope with waves) */}
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <svg
            className="w-72 h-72 text-blue-200 opacity-15"
            fill="none"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30 60c0-5 4-9 9-9h122c5 0 9 4 9 9v80c0 5-4 9-9 9H39c-5 0-9-4-9-9V60zm9 0l61 43 61-43"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M50 150c15-10 85-10 100 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="5 5"
            />
          </svg>
        </div>
      </section>

      <section className="py-16 bg-gray-900">
        <div className="rounded-2xl shadow-xl p-8 sm:p-10 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Frequently Asked Questions
          </h2>

          {faqGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-10">
              <h3 className="text-2xl font-semibold text-blue-400 mb-4">
                {group.title}
              </h3>
              <div className="space-y-4">
                {group.items.map((item, itemIndex) => {
                  const id = `${groupIndex}-${itemIndex}`;
                  const isOpen = activeId === id;

                  return (
                    <div
                      key={id}
                      className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                        isOpen
                          ? "border-blue-500 shadow-md"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <button
                        onClick={() => toggle(id)}
                        className="flex justify-between items-center w-full p-5 text-left bg-gray-800 rounded-xl"
                      >
                        <span className="text-white font-medium">
                          {item.question}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-gray-400"
                        >
                          ▼
                        </motion.span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-5 pb-4 text-gray-300"
                          >
                            {item.answer}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-blue-800 text-white py-20 px-6 text-center mb-0">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          variants={slideRight}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-xl md:text-2xl font-semibold mb-2">
            Need Assistance?
          </h2>
          <p className="text-sm md:text-base text-gray-300">
            Our team is here to help you with any inquiries regarding our
            administrative system. Feel free to reach out to us for support,
            suggestions, or clarifications.
          </p>
        </motion.div>
      </section>

      {/* Contact Form */}
      <section className="relative w-full h-[700px] text-black bg-white/79 mb-0 md:mb-8 lg:mb-15">
        <Threads amplitude={1} distance={0} enableMouseInteraction={true} />
        <motion.div
          className="absolute inset-0 flex items-center justify-center px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          variants={fadeInUp}
        >
          <div className="w-full max-w-5xl border border-black rounded-xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
              <p className="mb-4 text-gray-500 text-sm leading-relaxed">
                For questions, clarifications, or feedback about our
                administrative system, please fill out the form below.
              </p>
              <form className="space-y-3">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full rounded-md bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full rounded-md bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    className="w-full rounded-md bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Write your message here..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 transition px-5 py-2 rounded-md text-sm font-semibold"
                >
                  Submit Inquiry
                </button>
              </form>
            </div>

            <motion.div
              className="hidden md:flex justify-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              variants={slideLeft}
            >
              <Image
                src="/assets/1.jpg"
                alt="Contact illustration"
                width={350}
                height={250}
                className="rounded-lg shadow-lg object-cover"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
