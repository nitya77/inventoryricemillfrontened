"use client";

import { 
  Warehouse, Users, BarChart3, Settings, LogOut, ChevronLeft, 
  HardHat, Pickaxe, Drill, Construction, ArrowLeftRight, ClipboardList
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const MENU_ITEMS = [
  { icon: Construction, label: "Site Overview", path: "/construction" },
  { icon: Drill, label: "Machinery Master", path: "/construction/inventory" },
  { icon: Pickaxe, label: "Materials Stock", path: "/construction/materials" },
  { icon: Users, label: "Contractors", path: "/construction/parties" },
  { icon: ArrowLeftRight, label: "Movements", path: "/construction/ledger" },
  { icon: BarChart3, label: "Project Reports", path: "/construction/reports" },
];

export default function ConstructionSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`h-screen bg-white text-slate-500 flex flex-col transition-all duration-500 relative border-r border-slate-200 ${collapsed ? "w-20" : "w-72"}`}>
      {/* Brand Section */}
      <div className={`p-8 mb-4 transition-all duration-500 group overflow-hidden ${collapsed ? "px-6" : ""}`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
            <HardHat size={22} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
               <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none truncate">Mill-X</h1>
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mt-1">Construction Unit</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/construction' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.label}
              href={item.path}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all group overflow-hidden relative ${
                isActive 
                  ? "bg-amber-500 text-white shadow-xl shadow-amber-500/20" 
                  : "hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-white" : "text-slate-400 group-hover:text-amber-500 transition-colors"} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && (
                 <div className="absolute right-0 w-1 h-5 bg-white/20 rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-1.5 border-t border-slate-100 bg-slate-50/50">
        <Link
          href="/"
          className="flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-indigo-600 hover:text-white transition-all border border-transparent hover:border-indigo-400 group"
        >
          <Construction size={20} className="group-hover:text-white" />
          {!collapsed && <span>Switch to Rice Mill</span>}
        </Link>
        <button 
          onClick={() => {
            localStorage.removeItem("inventory_token");
            localStorage.removeItem("inventory_user");
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all group overflow-hidden"
        >
          <LogOut size={20} className="text-slate-500 group-hover:text-red-500" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-amber-500 transition-all shadow-xl z-50 print:hidden"
      >
        <ChevronLeft size={14} className={`transition-transform duration-500 ${collapsed ? "rotate-180" : ""}`} />
      </button>
    </aside>
  );
}
