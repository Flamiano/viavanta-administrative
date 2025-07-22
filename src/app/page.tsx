import Navbar from "@/comps/Navbar";
import Footer from "@/comps/Footer";
import {
  FaGoogle,
  FaFacebook,
  FaGithub,
  FaYoutube,
  FaTwitch,
  FaSlack,
  FaBolt,
} from "react-icons/fa";
import { CalendarCheck, FolderSearch, Scale, BadgeCheck } from "lucide-react";
import InfiniteMenu from "@/comps/reactbits/InifiniteMenu";

export default function Home() {
  const icons = [
    <FaGoogle key="google" />,
    <FaFacebook key="facebook" />,
    <FaGithub key="github" />,
    <FaYoutube key="youtube" />,
    <FaTwitch key="twitch" />,
    <FaSlack key="slack" />,
    <FaBolt key="bolt" />,
  ];

  const items = [
    {
      image: "/assets/1.jpg",
      link: "https://google.com/",
      title: "Facilities Reservation",
      description:
        "Easily book and manage meeting rooms, venues, and resources with ViaVanta’s Facilities Reservation system.",
    },
    {
      image: "/assets/2.jpg",
      link: "https://google.com/",
      title: "Document Management",
      description:
        "Securely store, organize, and retrieve important documents with our smart archiving system.",
    },
    {
      image: "/assets/3.jpg",
      link: "https://google.com/",
      title: "Legal Management",
      description:
        "Track legal cases, manage contracts, and ensure compliance with our Legal Management dashboard.",
    },
    {
      image: "/assets/4.jpg",
      link: "https://google.com/",
      title: "Visitor Management",
      description:
        "Digitally monitor and log all visitor activities for enhanced safety and transparency.",
    },
    {
      image: "/assets/5.jpg",
      link: "https://google.com/",
      title: "Travel Analytics",
      description:
        "Make informed decisions using real-time insights into tours, bookings, and passenger trends.",
    },
    {
      image: "/assets/6.jpg",
      link: "https://google.com/",
      title: "Booking Management",
      description:
        "Centralized control for handling user bookings, schedules, and trip types seamlessly.",
    },
    {
      image: "/assets/7.jpg",
      link: "https://google.com/",
      title: "Customer Engagement",
      description:
        "Boost satisfaction with tools for direct communication, surveys, and personalized promotions.",
    },
    {
      image: "/assets/8.jpg",
      link: "https://google.com/",
      title: "Smart Dashboard",
      description:
        "An intuitive interface that gives administrators a full overview of system activity and usage.",
    },
    {
      image: "/assets/9.jpg",
      link: "https://google.com/",
      title: "User Access Control",
      description:
        "Set role-based access and permissions for streamlined operations and enhanced security.",
    },
    {
      image: "/assets/10.jpg",
      link: "https://google.com/",
      title: "Scalable System",
      description:
        "ViaVanta grows with you — ready for expansion without compromising performance.",
    },
  ];

  //Animations Framer-Motion
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="font-body flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6 sm:px-12 gap-10">
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            Welcome to{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Administrative
            </span>
          </h1>
          <p className="mt-4 text-md sm:text-lg text-gray-600 dark:text-gray-300">
            A platform designed to streamline and simplify the way you manage
            your travel and tour operations.
          </p>
          <p className="mt-2 text-sm sm:text-lg text-gray-500 dark:text-gray-400">
            From scheduling and resource tracking to real-time analytics and
            customer engagement, ViaVanta empowers administrators with
            intelligent tools for better decision-making.
          </p>
          <p className="mt-2 text-sm sm:text-lg text-gray-500 dark:text-gray-400">
            Secure, fast, and built for scale — your digital command center is
            here.
          </p>
        </div>

        <div className="flex flex-row flex-wrap justify-center gap-4 w-full max-w-md">
          <a
            href="#"
            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow"
          >
            Get Started
          </a>
          <a
            href="#"
            className="flex-1 text-center border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold px-6 py-3 rounded-full shadow"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Background Video Section */}
      <section className="relative h-[300px] w-full overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="/videos/1000005256.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </section>

      {/* Module Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="text-blue-400">Administrative</span> Module
          </h2>
          <p className="mb-12 text-gray-300 max-w-3xl mx-auto">
            ViaVanta empowers administrators with essential tools to manage,
            organize, and streamline core operations — all in one secure
            platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Facilities Reservation */}
            <div className="bg-blue-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
              <div className="text-blue-400 text-4xl mb-4 flex justify-center">
                <CalendarCheck
                  size={40}
                  className="text-blue-400 mb-4 mx-auto"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Facilities Reservation
              </h3>
              <p className="text-gray-300 text-sm">
                Easily manage booking of conference rooms, event halls, or any
                facility with real-time scheduling and conflict prevention.
              </p>
            </div>

            {/* Document Management */}
            <div className="bg-blue-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
              <div className="text-blue-400 text-4xl mb-4 flex justify-center">
                <FolderSearch
                  size={40}
                  className="text-blue-400 mb-4 mx-auto"
                />{" "}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Document Management
              </h3>
              <p className="text-gray-300 text-sm">
                Organize, archive, and retrieve important documents securely.
                Never lose vital files with our efficient archiving system.
              </p>
            </div>

            {/* Legal Management */}
            <div className="bg-blue-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
              <div className="text-blue-400 text-4xl mb-4 flex justify-center">
                <Scale size={40} className="text-blue-400 mb-4 mx-auto" />{" "}
              </div>
              <h3 className="text-xl font-semibold mb-2">Legal Management</h3>
              <p className="text-gray-300 text-sm">
                Track legal cases, contracts, and compliance workflows to
                maintain proper documentation and reduce liability.
              </p>
            </div>

            {/* Visitor Management */}
            <div className="bg-blue-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
              <div className="text-blue-400 text-4xl mb-4 flex justify-center">
                <BadgeCheck size={40} className="text-blue-400 mb-4 mx-auto" />{" "}
              </div>
              <h3 className="text-xl font-semibold mb-2">Visitor Management</h3>
              <p className="text-gray-300 text-sm">
                Register, monitor, and manage guest access with ease while
                enhancing security and ensuring a smooth visitor experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-blue-800 py-20 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Why <span className="text-blue-300">Choose ViaVanta?</span>
          </h2>
          <p className="text-gray-200 mb-12 max-w-2xl mx-auto">
            ViaVanta is your trusted digital partner for modernizing
            administrative processes with speed, transparency, and intelligent
            design.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-blue-900 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
              <div className="text-blue-300 text-4xl mb-4 flex justify-center">
                <i className="lucide lucide-shield-check" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure by Design</h3>
              <p className="text-gray-200 text-sm">
                Data encryption, role-based access, and audit logs ensure
                sensitive data stays protected 24/7.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-blue-900 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
              <div className="text-blue-300 text-4xl mb-4 flex justify-center">
                <i className="lucide lucide-layout-dashboard" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Unified Dashboard</h3>
              <p className="text-gray-200 text-sm">
                View, manage, and act on critical modules from one intuitive
                dashboard interface.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-blue-900 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
              <div className="text-blue-300 text-4xl mb-4 flex justify-center">
                <i className="lucide lucide-bolt" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Responsive</h3>
              <p className="text-gray-200 text-sm">
                Optimized for both desktop and mobile, ViaVanta responds fast no
                matter the device.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-blue-900 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
              <div className="text-blue-300 text-4xl mb-4 flex justify-center">
                <i className="lucide lucide-settings" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customizable Tools</h3>
              <p className="text-gray-200 text-sm">
                Tailor features and modules to fit your organization’s workflow
                and policies.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-blue-900 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
              <div className="text-blue-300 text-4xl mb-4 flex justify-center">
                <i className="lucide lucide-users" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                User-Centric Design
              </h3>
              <p className="text-gray-200 text-sm">
                Built with users in mind — clean UI, smooth navigation, and
                accessible design for all.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-blue-900 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
              <div className="text-blue-300 text-4xl mb-4 flex justify-center">
                <i className="lucide lucide-cloud-check" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cloud-Based Access</h3>
              <p className="text-gray-200 text-sm">
                Manage operations from anywhere — all you need is a device and
                internet connection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* InfiniteMenu Images 1-10 */}
      <section className="w-full">
        <div className="w-full h-[600px] md:h-[700px] lg:h-[800px] relative">
          <InfiniteMenu items={items} />
        </div>
      </section>

      {/* Auto-Scrolling Icon Carousel */}
      <section className="py-12 overflow-hidden">
        <div className="relative w-full overflow-hidden">
          <div
            className="flex text-white text-7xl whitespace-nowrap animate-[marquee_15s_linear_infinite]"
            style={{ width: "max-content" }}
          >
            {Array(6)
              .fill(icons)
              .flat()
              .map((icon, index) => (
                <div key={index} className="flex-shrink-0 mx-8">
                  {icon}
                </div>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
