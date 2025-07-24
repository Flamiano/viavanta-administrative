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

      {/* Hero */}
      <section className="bg-blue-700 text-white py-30 text-center px-4">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Desk</h1>
          <p className="text-sm md:text-base text-white/90 max-w-2xl mx-auto">
            Need assistance? Our support team is ready to help you through
            phone, email, or live chat.
          </p>
        </motion.div>
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
