"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Lightbulb, Mail, PlaneTakeoff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Home", icon: Home, href: "/" },
  { name: "About", icon: User, href: "/pages/about" },
  { name: "Solutions", icon: Lightbulb, href: "/pages/solutions" },
  { name: "Contact", icon: Mail, href: "/pages/contact" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isMounted && (
        <motion.nav
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl px-4"
        >
          <div className="bg-white/5 backdrop-blur-md shadow-2xl border border-white/10 rounded-full px-4 py-2 flex justify-between items-center">
            {/* Left: Logo */}
            <div className="text-white text-sm sm:text-base font-bold">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo/logo-dark-bg.png"
                  alt="ViaVanta Logo"
                  width={32}
                  height={32}
                  className="h-6 sm:h-8 w-auto"
                />
                <span>ViaVanta</span>

                {/* Right-side airplane icon */}
                <PlaneTakeoff className="h-4 sm:h-5" />
              </Link>
            </div>

            {/* Right: Desktop Nav */}
            <div className="hidden md:flex gap-5 sm:gap-7 items-center">
              {navItems.map(({ name, icon: Icon, href }) => {
                const isActive = pathname === href;

                return (
                  <Link key={name} href={href} className="relative group">
                    <motion.div
                      whileTap={{ scale: 0.9, rotate: 5 }}
                      whileHover={{ scale: 1.1 }}
                      className={`p-2 rounded-full transition duration-300 ${
                        isActive ? "bg-white/20 text-blue-400" : "text-white"
                      } hover:bg-white/10`}
                    >
                      <Icon size={20} />
                    </motion.div>

                    {/* Tooltip */}
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] px-2 py-[1px] bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
                      {name}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Right: Mobile Hamburger */}
            <div
              className="md:hidden flex flex-col justify-center items-center w-6 h-6 cursor-pointer relative"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <motion.span
                animate={{
                  rotate: isMenuOpen ? 45 : 0,
                  y: isMenuOpen ? 0 : -4,
                }}
                className="absolute w-4 h-[2px] bg-white rounded origin-center"
              />
              <motion.span
                animate={{
                  rotate: isMenuOpen ? -45 : 0,
                  y: isMenuOpen ? 0 : 4,
                }}
                className="absolute w-4 h-[2px] bg-white rounded origin-center"
              />
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden mt-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-4 shadow-lg"
              >
                <div className="flex flex-col gap-4 items-start">
                  {navItems.map(({ name, icon: Icon, href }) => {
                    const isActive = pathname === href;

                    return (
                      <Link
                        key={name}
                        href={href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-2 text-sm transition duration-300 ${
                          isActive ? "text-blue-400" : "text-white"
                        } hover:text-blue-300`}
                      >
                        <Icon size={18} />
                        {name}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      )}
    </>
  );
};

export default Navbar;
