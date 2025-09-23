"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Lightbulb, Mail, PlaneTakeoff, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { name: "Home", icon: Home, href: "/" },
  { name: "About", icon: User, href: "/pages/about" },
  { name: "Solutions", icon: Lightbulb, href: "/pages/solutions" },
  { name: "Contact", icon: Mail, href: "/pages/contact" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.innerWidth <= 768) {
        setIsVisible(window.scrollY < lastScrollY || window.scrollY < 50);
        lastScrollY = window.scrollY;
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = setTimeout(() => setIsVisible(true), 200);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, []);

  return (
    <>
      {isMounted && (
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{
            y: isVisible ? 0 : -80,
            opacity: isVisible ? 1 : 0.8,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl px-4"
        >
          <div className="bg-black text-white shadow-lg rounded-full px-4 py-2 flex justify-between items-center">
            {/* Logo */}
            <div className="text-white text-sm sm:text-base font-bold">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo/logo-dark-bg.png"
                  alt="ViaVanta Logo"
                  width={32}
                  height={32}
                  className="h-6 sm:h-8 w-auto"
                  priority
                />
                <span>ViaVanta</span>
                <PlaneTakeoff className="h-4 sm:h-5 text-blue-500" />
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex gap-5 sm:gap-7 items-center relative">
              {navItems.map(({ name, icon: Icon, href }) => {
                const isActive = pathname === href;
                return (
                  <Link key={name} href={href} className="relative group">
                    <motion.div
                      whileTap={{ scale: 0.9, rotate: 5 }}
                      whileHover={{ scale: 1.1 }}
                      className={`p-2 rounded-full transition duration-300 ${
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-white hover:bg-gray-700"
                      }`}
                    >
                      <Icon size={20} />
                    </motion.div>
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] px-2 py-[1px] bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
                      {name}
                    </div>
                  </Link>
                );
              })}

              {/* Auth Icon */}
              <div className="relative group">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  className="p-2 rounded-full cursor-pointer hover:bg-gray-700"
                >
                  <LogIn size={20} />
                </motion.div>

                {/* Auth Dropdown on hover */}
                <div
                  className="absolute right-0 mt-2 w-32 bg-black text-white rounded-lg shadow-xl flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto
                border border-gray-900 ring-1 ring-gray-800"
                >
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 hover:bg-gray-900"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 hover:bg-gray-900"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Hamburger */}
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
                className="md:hidden mt-2 bg-black text-white border border-gray-700 rounded-xl px-4 py-4 shadow-lg flex flex-col gap-4"
              >
                {navItems.map(({ name, icon: Icon, href }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={name}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-2 text-sm transition duration-300 ${
                        isActive ? "text-blue-500" : "hover:text-blue-400"
                      }`}
                    >
                      <Icon size={18} />
                      {name}
                    </Link>
                  );
                })}

                {/* Mobile Auth Buttons */}
                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 text-center"
                  >
                    Register
                  </Link>
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
