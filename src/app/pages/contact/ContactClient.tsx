"use client";

import Navbar from "@/comps/Navbar";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Phone, Mail } from "lucide-react";
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
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setActiveIndex((prev) => (prev === id ? null : id));
  };

  return (
    <div className="font-body flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <Navbar />

      {/* Contact Us Section */}
      <motion.section
        className="flex flex-col justify-center items-center h-[400px] bg-blue-800 text-white px-4 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        variants={fadeInUp}
      >
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Contact Us</h1>
        <p className="text-[14px] mb-2 flex items-center justify-center">
          <Phone className="text-white h-4" /> +63 912 345 6789
        </p>
        <p className="text-[14px] flex items-center justify-center gap-1">
          <Mail className="text-white h-4" /> support@viavanta.com
        </p>
      </motion.section>

      {/* FAQs Section */}
      <motion.section
        className="text-dark py-16 px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        variants={fadeInUp}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions (FAQs)
          </h2>

          {faqGroups.map((group, groupIndex) => (
            <motion.div
              key={groupIndex}
              className="mb-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
              variants={slideLeft}
            >
              <h3 className="text-xl font-semibold mb-4">{group.title}</h3>
              <div className="space-y-4">
                {group.items.map((faq, faqIndex) => {
                  const id = `${groupIndex}-${faqIndex}`;
                  const isOpen = activeIndex === id;

                  return (
                    <div
                      key={id}
                      className="border rounded-md bg-white shadow-sm"
                    >
                      <button
                        onClick={() => toggleFAQ(id)}
                        className="w-full flex justify-between items-center px-4 py-3 text-left text-black"
                      >
                        <span className="font-medium">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.8 }}
                            className="px-4 pb-4 text-gray-700"
                          >
                            {faq.answer}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Info Section */}
      <section className="bg-blue-800 text-white py-20 px-6 text-center mb-0 md:mb-10 lg:mb-15">
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
      <section className="relative w-full h-[600px] text-white mb-0 md:mb-8 lg:mb-15">
        <Threads amplitude={1} distance={0} enableMouseInteraction={true} />
        <motion.div
          className="absolute inset-0 flex items-center justify-center px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          variants={fadeInUp}
        >
          <div className="w-full max-w-5xl border border-white rounded-xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
              <p className="mb-4 text-gray-300 text-sm leading-relaxed">
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
