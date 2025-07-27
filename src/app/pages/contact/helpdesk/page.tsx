"use client";

import Footer from "@/comps/Footer";
import Navbar from "@/comps/Navbar";
import { motion } from "framer-motion";
import { Phone, Mail, MessageCircle, Info } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function HelpDeskPage() {
  return (
    <div className="font-body flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <Navbar />

      {/* Help Desk Hero Section */}
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
                  <span className="block">Help Desk</span>
                  <span className="block text-purple-100">
                    We're Here to Assist You
                  </span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <p className="mt-4 text-lg text-purple-100 sm:mt-6 sm:max-w-xl">
                  Need assistance? Our support team is ready to help you through
                  phone, email, or live chat.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative Help Icon SVG */}
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <svg
            className="w-72 h-72 text-purple-200 opacity-15"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 
      10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 
      12.9 12 13.5 12 15h-2v-.5c0-1 .45-1.75 
      1.17-2.42l1.24-1.26A1.49 1.49 0 0013 9.5c0-.83-.67-1.5-1.5-1.5S10 
      8.67 10 9.5H8c0-1.66 1.34-3 3-3s3 1.34 
      3 3c0 .79-.31 1.5-.93 2.08z"
            />
          </svg>
        </div>
      </section>

      {/* Support Cards */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Call Us */}
          <motion.div
            className="border rounded-xl p-6 text-center shadow hover:shadow-lg transition"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Phone className="w-10 h-10 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Call Us</h3>
            <p className="text-gray-600 text-sm mt-2">
              Talk directly with a support specialist. Available 9 AM to 6 PM.
            </p>
            <p className="mt-4 text-green-700 font-medium">+63 912 345 6789</p>
          </motion.div>

          {/* Email Us */}
          <motion.div
            className="border rounded-xl p-6 text-center shadow hover:shadow-lg transition"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Mail className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Email Us</h3>
            <p className="text-gray-600 text-sm mt-2">
              Send your concerns to our inbox. Expect a reply within 24 hours.
            </p>
            <p className="mt-4 text-blue-700 font-medium">
              support@yourdomain.com
            </p>
          </motion.div>

          {/* Live Chat */}
          <motion.div
            className="border rounded-xl p-6 text-center shadow hover:shadow-lg transition"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <MessageCircle className="w-10 h-10 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Live Chat</h3>
            <p className="text-gray-600 text-sm mt-2">
              Chat with our virtual assistant for quick help and answers.
            </p>
            <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition">
              Start Chat
            </button>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="relative z-10 py-20 px-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Info className="w-10 h-10 text-gray-800 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Need More Help?</h2>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Check our FAQs or submit a ticket through our support portal.
            </p>
            <a
              href="/support"
              className="inline-block mt-6 bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition"
            >
              Go to Support Center
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
