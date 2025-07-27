"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const currentYear = new Date().getFullYear();

// Animation Framer Variants
const slideLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};

const slideRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

export default function Footer() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;
  const linkClass = (href: string) =>
    `transition-colors duration-200 ${
      isActive(href)
        ? "text-blue-600 dark:text-blue-400 font-semibold"
        : "text-white/70 hover:text-blue-600 dark:hover:text-blue-400"
    }`;

  return (
    <footer className="bg-[var(--color-brand-dark)] text-white px-6 md:px-16 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Side */}
        <motion.div
          variants={slideLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 2 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-4">
            <Image
              src="/logo/logo-dark-bg.png"
              alt="ViaVanta Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <h1 className="text-2xl font-extrabold tracking-wide">ViaVanta</h1>
          </div>

          <p className="text-sm text-white/80 leading-relaxed max-w-lg">
            At ViaVanta, we simplify space and service management for
            organizations and travelers alike. Whether you&apos;re booking a
            facility, coordinating visitors, or overseeing legal processes, our
            platform brings everything together seamlessly—powered by intuitive
            design and smart integrations.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm pt-2">
            <div>
              <h2 className="font-semibold mb-2 text-white/90">About</h2>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/pages/about"
                    className={linkClass("/pages/about")}
                  >
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/about/team"
                    className={linkClass("/pages/about/team")}
                  >
                    Team
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/about/careers"
                    className={linkClass("/pages/about/careers")}
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold mb-2 text-white/90">Legal</h2>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/pages/legal/privacy"
                    className={linkClass("/pages/legal/privacy")}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/legal/terms"
                    className={linkClass("/pages/legal/terms")}
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold mb-2 text-white/90">Support</h2>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/pages/contact"
                    className={linkClass("/pages/contact")}
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/contact/faq"
                    className={linkClass("/pages/contact/faq")}
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/contact/helpdesk"
                    className={linkClass("/pages/contact/helpdesk")}
                  >
                    Helpdesk
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-white/50 pt-4">
            &copy; {currentYear} ViaVanta. All rights reserved.
          </p>
        </motion.div>

        {/* Right Side: Google Map */}
        <motion.div
          variants={slideRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 2 }}
          className="w-full h-[300px]"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!4v1752911672294!6m8!1m7!1stKVhwnDAMUbOWsTee6Yitg!2m2!1d14.72662985390938!2d121.0373473614249!3f254.22949!4f0!5f0.7820865974627469"
            className="w-full h-full rounded-lg border-0"
            allow="fullscreen; geolocation"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </div>
    </footer>
  );
}
