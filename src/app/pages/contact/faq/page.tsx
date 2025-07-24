"use client";

import { useState } from "react";
import Head from "next/head";
import Navbar from "@/comps/Navbar";
import Footer from "@/comps/Footer";

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

export default function FAQPage() {
  const [active, setActive] = useState<string | null>(null);

  const toggle = (id: string) => {
    setActive(active === id ? null : id);
  };

  return (
    <div className="font-body flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <Navbar />
      <Head>
        <title>FAQs - ViaVanta Administrative</title>
        <meta
          name="description"
          content="Frequently asked questions about ViaVanta Administrative"
        />
      </Head>

      <div>
        {/* Hero */}
        <div className="relative bg-blue-600 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-30 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
              Have Questions?
            </h1>
            <p className="mt-4 text-lg text-blue-100">
              Everything you need to know about the ViaVanta Administrative
              Platform.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-2xl shadow-xl p-8 sm:p-10">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Frequently Asked Questions
            </h2>

            {faqGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-10">
                <h3 className="text-2xl font-semibold text-blue-700 mb-4">
                  {group.title}
                </h3>
                <div className="space-y-4">
                  {group.items.map((item, itemIndex) => {
                    const id = `${groupIndex}-${itemIndex}`;
                    const isOpen = active === id;

                    return (
                      <div
                        key={id}
                        className={`border-2 rounded-xl transition-all duration-200 ${
                          isOpen
                            ? "border-blue-400 shadow-md"
                            : "border-gray-100 hover:border-blue-200"
                        }`}
                      >
                        <button
                          onClick={() => toggle(id)}
                          className={`flex justify-between items-center w-full p-6 text-left focus:outline-none ${
                            isOpen ? "bg-gray-800 rounded-xl" : "bg-transparent"
                          }`}
                        >
                          <h4 className="text-lg font-medium text-white">
                            {item.question}
                          </h4>
                          <svg
                            className={`h-5 w-5 transform transition-transform duration-200 ${
                              isOpen
                                ? "rotate-180 text-gray-500"
                                : "rotate-0 text-gray-400"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6 text-gray-600">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl text-center text-white py-12 px-6">
            <h3 className="text-2xl font-bold mb-2">Need More Help?</h3>
            <p className="text-blue-100 mb-6">
              Reach out to our support team for any additional questions.
            </p>
            <a
              href="mailto:support@viavanta.com"
              className="inline-block bg-white text-blue-700 font-medium py-3 px-6 rounded-md hover:bg-blue-50 transition"
            >
              Contact Support
            </a>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
