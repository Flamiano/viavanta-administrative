"use client";

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white text-gray-600 text-xs flex flex-col items-center justify-center px-4 py-2 border-t border-gray-300">
      <span className="font-medium mb-1">Administrative</span>
      <span>© {currentYear} ViaVanta Travel and Tours</span>
    </footer>
  );
}
