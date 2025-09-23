import "./globals.css";
import { Winky_Rough } from "next/font/google";
import type { Metadata } from "next";

const winkyRough = Winky_Rough({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-winky-rough",
});

export const metadata: Metadata = {
  title: {
    default: "ViaVanta",
    template: "ViaVanta - %s",
  },
  description: "Administrative System for Travel and Tours",
  icons: {
    icon: "/logo/logo-dark-bg.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={winkyRough.className}>
      <body className="antialiased font-body">{children}</body>
    </html>
  );
}
