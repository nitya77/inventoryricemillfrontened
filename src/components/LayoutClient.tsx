"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ConstructionSidebar from "@/components/ConstructionSidebar";
import ConstructionHeader from "@/components/ConstructionHeader";
import HRMSidebar from "@/components/HRMSidebar";
import HRMHeader from "@/components/HRMHeader";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isConstruction = pathname.startsWith("/construction");
  const isHRM = pathname.startsWith("/employees") || pathname.startsWith("/attendance");

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="app-shell">
      <div className="sidebar-container">
        {isConstruction ? <ConstructionSidebar /> : isHRM ? <HRMSidebar /> : <Sidebar />}
      </div>
      <div className="main-container">
        {isConstruction ? <ConstructionHeader /> : isHRM ? <HRMHeader /> : <Header />}
        <main className="content-area">
          <div className="max-w-[1400px] mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
