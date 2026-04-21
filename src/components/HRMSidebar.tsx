"use client";

import { 
  Users, ClipboardCheck, BarChart3, Settings, 
  ChevronLeft, Menu, LogOut, LayoutDashboard,
  UserCheck, Briefcase, Filter
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "HR Dashboard", icon: LayoutDashboard, href: "/employees" },
  { label: "Staff Registry", icon: Users, href: "/employees" },
  { label: "Daily Attendance", icon: ClipboardCheck, href: "/attendance" },
  { label: "Monthly Bulk Log", icon: Filter, href: "/attendance/matrix" },
  { label: "Attendance Audit", icon: BarChart3, href: "/attendance/reports" },
  { label: "Payroll Config", icon: Settings, href: "/employees" },
];

export default function HRMSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`bg-slate-950 text-white flex flex-col h-full border-r border-slate-800 transition-all duration-500 ${isCollapsed ? "w-20" : "w-64"}`}>
      <div className={`h-24 flex items-center px-7 border-b border-slate-800 bg-indigo-950/20`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 active:scale-95 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
            <UserCheck size={26} />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
               <h1 className="text-xl font-black tracking-tighter uppercase italic">HRM Core</h1>
               <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.4em] mt-1">Personnel</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-10 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                isActive 
                ? "bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/30" 
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-indigo-400"} />
              {!isCollapsed && <span className="text-[11px] uppercase tracking-widest font-black">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800 flex flex-col items-center">
         <Link href="/" className="mb-4 flex items-center gap-3 text-slate-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest">
            <ChevronLeft size={16} /> Exit to Mill
         </Link>
         <button 
           onClick={() => {
             localStorage.removeItem("inventory_token");
             localStorage.removeItem("inventory_user");
             window.location.href = "/login";
           }}
           className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${isCollapsed ? "justify-center" : ""}`}
         >
            <LogOut size={20} />
            {!isCollapsed && <span className="text-[11px] uppercase tracking-widest font-black">Secure Signout</span>}
         </button>
      </div>
    </aside>
  );
}
