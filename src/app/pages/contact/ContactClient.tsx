"use client";

import Navbar from "@/comps/Navbar";
import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Footer from "@/comps/Footer";
import DarkVeil from "@/comps/reactbits/DarkVeil";
import { Users } from "lucide-react";

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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.message) {
      setError("All fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSuccess("Your inquiry has been sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (err) {
      setError("Failed to send. Please try again.");
    }
  };

  return (
    <div className="font-body flex flex-col min-h-screen text-gray-900 dark:text-white overflow-hidden">
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

      {/* FAQ Section */}
      <section className="py-16 bg-gray-900">
        <div className="rounded-2xl shadow-xl p-8 sm:p-10 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {faqGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
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
                        className={`border rounded-xl overflow-hidden transition-colors duration-300 ${
                          isOpen
                            ? "border-blue-500 shadow-md"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <button
                          onClick={() => toggle(id)}
                          className="flex justify-between items-center w-full p-5 text-left bg-gray-800"
                        >
                          <span className="text-white font-medium">
                            {item.question}
                          </span>
                          <span
                            className={`text-gray-400 transform transition-transform duration-300 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          >
                            ▼
                          </span>
                        </button>

                        <div
                          className={`px-5 text-gray-300 overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen ? "max-h-40 py-4" : "max-h-0 py-0"
                          }`}
                        >
                          {item.answer}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className=" bg-white text-black py-20 px-6 text-center mb-0">
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
          <p className="text-sm md:text-base text-gray-500">
            Our team is here to help you with any inquiries regarding our
            administrative system. Feel free to reach out to us for support,
            suggestions, or clarifications.
          </p>
        </motion.div>
      </section>

      {/* Contact Form */}
      <section className="relative w-full h-[700px] text-white mb-0 md:mb-8 lg:mb-15">
        <div className="absolute inset-0 z-0">
          <DarkVeil />
        </div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center px-4 z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          variants={fadeInUp}
        >
          <div className="w-full max-w-5xl border border-white rounded-xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
              <p className="mb-4 text-gray-400 text-sm leading-relaxed">
                For questions, clarifications, or feedback about our
                administrative system, please fill out the form below.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

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
                    value={formData.name}
                    onChange={handleChange}
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
                    value={formData.email}
                    onChange={handleChange}
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
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-md bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Write your message here..."
                    required
                  />
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

      {/* Testimonials Section */}
      <section className="py-20 bg-white text-black">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">
            What Our <span className="text-blue-700">Users Say</span>
          </h2>

          {(() => {
            const testimonials = [
              {
                name: "Anna D.",
                role: "HR Manager",
                feedback:
                  "Reaching out to ViaVanta’s support team is always quick and easy. Responses are clear, friendly, and incredibly helpful.",
              },
              {
                name: "Michael S.",
                role: "Legal Officer",
                feedback:
                  "The contact system is seamless — I can send inquiries anytime and get updates fast. It makes collaboration so much smoother.",
              },
              {
                name: "Sarah L.",
                role: "Project Coordinator",
                feedback:
                  "Submitting questions through the contact form was effortless. I appreciated how professional and prompt the feedback was.",
              },
              {
                name: "James R.",
                role: "Operations Lead",
                feedback:
                  "I value how accessible ViaVanta’s team is. Whether it’s clarifications or technical issues, I know I’ll get a reliable response.",
              },
            ];

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {testimonials.map((t, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 p-6 rounded-xl shadow-md hover:shadow-lg transition"
                  >
                    <div className="flex justify-center mb-4">
                      <Users className="text-blue-600 w-8 h-8" />
                    </div>
                    <p className="text-gray-700 italic mb-4">“{t.feedback}”</p>
                    <h4 className="font-semibold">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      <Footer />
    </div>
  );
}
