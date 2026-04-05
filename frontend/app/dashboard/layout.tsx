"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-slate-50 dark:bg-[#1a1c24] min-h-screen transition-colors duration-300">
      {/* Sidebar starts at top-left [0,0] */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Navbar starts at top, but only for the remaining width */}
        <Navbar />
        
        {/* Page Content */}
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
