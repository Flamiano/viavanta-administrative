"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/comps/Navbar";
import Footer from "@/comps/Footer";
import DarkVeil from "@/comps/reactbits/DarkVeil";
import { Code, Brain, Users } from "lucide-react";

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

export default function TeamPage() {
  return (
    <div className="font-body flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <Navbar />

      {/* Team Hero Section */}
      <div className="relative bg-blue-700 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
              <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                      <span className="block">Meet the Team</span>
                      <span className="block text-blue-100">
                        Driven by Innovation & Unity
                      </span>
                    </h1>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                  >
                    <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                      We are BSIT 31007 students majoring in Information
                      Management, united in building an efficient system through
                      teamwork, dedication, and innovation.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Abstract Lines SVG */}
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <svg
            className="w-72 h-72 text-blue-300 opacity-20"
            fill="none"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 50 C70 20, 130 20, 150 50 S170 130, 150 150 70 170, 50 150 30 80, 50 50"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* About Us Section */}
      <section className="py-20 px-6 text-white">
        <p className="max-w-6xl mx-auto text-center text-base md:text-[30px] text-gray-600 mb-12">
          Meet the minds behind the system. A passionate team of IT students
          with a vision to transform digital processes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="bg-gray-100 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 text-center">
            <div className="flex justify-center mb-4">
              <Code className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-black">
              Passionate Developers
            </h3>
            <p className="text-sm text-gray-700">
              We thrive on building clean, scalable, and intuitive systems that
              solve real-world challenges.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-100 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 text-center">
            <div className="flex justify-center mb-4">
              <Users className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-black">
              Team-Oriented
            </h3>
            <p className="text-sm text-gray-700">
              Collaboration is at the heart of our work—every project is a team
              effort driven by shared goals.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-gray-100 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 text-center">
            <div className="flex justify-center mb-4">
              <Brain className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-black">
              Innovative Thinkers
            </h3>
            <p className="text-sm text-gray-700">
              We approach problems with creativity and logic, using technology
              as a tool to innovate and improve systems.
            </p>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="relative w-full z-10 py-24 px-4 sm:px-10 text-center overflow-hidden">
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

          {/* Row 1 */}
          <motion.div
            className="flex justify-center flex-wrap gap-8 sm:gap-16 md:gap-24 lg:gap-32 mb-9 md:mb-24"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <TeamMember
              name="John Roel R. Flamiano"
              role="Team Leader & Developer"
              image="/team/roel.jpg"
            />
            <TeamMember
              name="Jaymark N. Dadivas"
              role="System QA / Programmer Support"
              image="/team/jaymark.jpg"
            />
          </motion.div>

          {/* Row 2 */}
          <motion.div
            className="flex justify-center flex-wrap gap-8 sm:gap-12 md:gap-20 lg:gap-32"
            variants={slideRight}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <TeamMember
              name="Jomar C. Barte"
              role="UI/UX Designer"
              image="/team/jomar.jpg"
            />
            <TeamMember
              name="Russel M. Realto"
              role="Documentation Support"
              image="/team/russel.jpg"
            />
            <TeamMember
              name="Bianca Mae D. Cañaveral"
              role="Documentation Writer"
              image="/team/bianca.jpg"
            />
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

function TeamMember({
  name,
  role,
  image,
}: {
  name: string;
  role: string;
  image: string;
}) {
  return (
    <div className="flex flex-col items-center text-center max-w-[250px] w-full">
      <Image
        src={image}
        alt={name}
        width={140}
        height={140}
        className="rounded-full mb-4 object-cover w-[120px] h-[120px] sm:w-[140px] sm:h-[140px]"
      />
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-sm text-gray-300">{role}</p>
    </div>
  );
}
