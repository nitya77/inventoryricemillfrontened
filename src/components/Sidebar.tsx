"use client";

import { 
  LayoutDashboard, 
  ShoppingCart, 
  Warehouse, 
  Factory, 
  BarChart3, 
  Settings, 
  LogOut, 
  ClipboardCheck, 
  Zap, 
  Users, 
  Briefcase, 
  ChevronDown, 
  ChevronRight, 
  Database, 
  Menu, 
  ChevronLeft,
  ShieldCheck,
  Drill,
  ArrowLeftRight,
  Calendar,
  Tag
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

interface MenuItem {
  label: string;
  icon: any;
  href?: string;
  children?: MenuItem[];
}

interface MenuGroup {
  groupLabel: string;
  items: MenuItem[];
}

const millingGroups: MenuGroup[] = [
  {
    groupLabel: "Home",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    ]
  },
  {
    groupLabel: "Operations",
    items: [
      { label: "Orders", icon: ClipboardCheck, href: "/orders" },
      { label: "Procurement", icon: ShoppingCart, href: "/procurement" },
      { label: "Milling", icon: Factory, href: "/milling" },
      { label: "Sales", icon: Zap, href: "/sales" },
    ]
  },
  {
    groupLabel: "Master Data",
    items: [
      { label: "Party Master", icon: Users, href: "/parties" },
      { label: "Product Master", icon: Warehouse, href: "/products" },
      { label: "Variety Master", icon: Tag, href: "/varieties" },
      { label: "Quality Master", icon: ClipboardCheck, href: "/qualities" },
    ]
  },
  {
    groupLabel: "Reports",
    items: [
      { label: "Reports", icon: BarChart3, href: "/reports" },
      { label: "Settings", icon: Settings, href: "/settings" },
    ]
  }
];

const hrmsGroups: MenuGroup[] = [
  {
    groupLabel: "Human Resources",
    items: [
      { label: "Daily Attendance", icon: ClipboardCheck, href: "/hrms" },
      { label: "Monthly Matrix", icon: Calendar, href: "/hrms/matrix" },
      { label: "HR Reports", icon: BarChart3, href: "/hrms/reports" },
      { label: "Employees", icon: Users, href: "/hrms/employees" },
      { label: "Role Policies", icon: ShieldCheck, href: "/hrms/permissions" },
      { label: "Switch App", icon: ArrowLeftRight, href: "/" },
    ]
  }
];

const constructionGroups: MenuGroup[] = [
  {
    groupLabel: "Construction Hub",
    items: [
      { label: "Site Command", icon: LayoutDashboard, href: "/construction" },
      { label: "Machinery", icon: Drill, href: "/construction/inventory" },
      { label: "Stock Ledger", icon: ArrowLeftRight, href: "/construction/ledger" },
      { label: "Contractors", icon: Users, href: "/construction/parties" },
      { label: "Switch App", icon: ArrowLeftRight, href: "/" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openSubmenus, setOpenSubmenus] = useState<string[]>(["Masters"]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("inventory_user") || "{}");
      const userPerms = user.permissions || {};
      // If no permissions are defined, default to full access
      if (Object.keys(userPerms).length === 0) {
        setPermissions({ "hrm": true, "milling": true, "inventory": true, "sales": true, "orders": true, "construction": true, "parties": true, "reports": true });
      } else {
        setPermissions(userPerms);
      }
    } catch (e) {
      setPermissions({ "hrm": true, "milling": true, "inventory": true, "sales": true, "orders": true, "construction": true, "parties": true, "reports": true });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("inventory_token");
    localStorage.removeItem("inventory_user");
    window.location.href = "/login";
  };

  const hasPermission = (label: string) => {
    const key = label.toLowerCase();
    if (key === 'dashboard') return true;
    if (key === 'masters') return (permissions['parties'] ?? true) || (permissions['inventory'] ?? true);
    if (key === 'party master') return permissions['parties'] ?? true;
    if (key === 'products / stock') return permissions['inventory'] ?? true;
    return permissions[key] ?? true;
  };

  const currentGroups = useMemo(() => {
    if (pathname.startsWith("/hrms") || pathname.startsWith("/employees")) return hrmsGroups;
    if (pathname.startsWith("/construction")) return constructionGroups;
    return millingGroups;
  }, [pathname]);

  const filteredGroups = currentGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      const allowed = hasPermission(item.label);
      if (item.children) {
        item.children = item.children.filter(child => hasPermission(child.label));
        return item.children.length > 0;
      }
      return allowed;
    })
  })).filter(group => group.items.length > 0);

  const toggleSubmenu = (label: string) => {
    if (isCollapsed) return;
    setOpenSubmenus(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label) 
        : [...prev, label]
    );
  };

  useEffect(() => {
    if (isCollapsed) return;
    filteredGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.children) {
          const isChildActive = item.children.some(child => child.href === pathname);
          if (isChildActive && !openSubmenus.includes(item.label)) {
            setOpenSubmenus(prev => [...prev, item.label]);
          }
        }
      });
    });
  }, [pathname, isCollapsed, permissions]);

  return (
    <aside 
      className={`bg-gradient-to-b from-[#0F1129] to-[#171A3F] text-white flex flex-col h-full border-r border-white/5 shadow-2xl z-50 transition-all duration-500 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Section */}
      <div className={`h-24 flex items-center border-b border-white/10 bg-white/5 transition-all duration-500 ${
        isCollapsed ? "px-4 justify-center" : "px-7"
      }`}>
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 border border-white/10 cursor-pointer hover:bg-indigo-500 transition-all active:scale-95"
          >
            {isCollapsed ? <Menu size={22} /> : <Warehouse size={26} className="drop-shadow-sm" />}
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none text-white italic">Mill-X</h1>
              <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.4em] mt-1.5 opacity-100">Enterprise Core</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-8 space-y-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {filteredGroups.map((group) => (
          <div key={group.groupLabel} className="space-y-3">
            {!isCollapsed && (
              <div className="px-4 mb-1 animate-in fade-in duration-500">
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] block whitespace-nowrap opacity-40">
                   {group.groupLabel}
                </span>
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isSubmenu = !!item.children;
                const isOpen = openSubmenus.includes(item.label) && !isCollapsed;
                const isActive = item.href === pathname || 
                                 (item.children?.some(child => child.href === pathname));

                if (isSubmenu) {
                  return (
                    <div key={item.label} className="space-y-1">
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        title={isCollapsed ? item.label : ""}
                        className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                          isActive 
                          ? "bg-white/10 text-indigo-400 font-bold border border-white/5" 
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                        } ${isCollapsed ? "justify-center" : "justify-between"}`}
                      >
                        <div className="flex items-center gap-3.5">
                          <item.icon size={18} className={`transition-all duration-300 ${isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-400"} ${isCollapsed ? "scale-110" : ""}`} />
                          {!isCollapsed && <span className="text-[11px] uppercase tracking-[0.15em] font-black whitespace-nowrap animate-in fade-in slide-in-from-left-2">{item.label}</span>}
                        </div>
                        {!isCollapsed && (
                          <div className="animate-in fade-in duration-500">
                            {isOpen ? <ChevronDown size={14} className="opacity-60" /> : <ChevronRight size={14} className="opacity-60" />}
                          </div>
                        )}
                      </button>
                      
                      {isOpen && !isCollapsed && (
                        <div className="pl-6 space-y-1 mt-1 border-l border-white/10 ml-7 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          {item.children?.map((child) => {
                            const isChildActive = child.href === pathname;
                            return (
                              <Link
                                key={child.label}
                                href={child.href!}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
                                  isChildActive
                                  ? "text-indigo-400 font-black"
                                  : "text-slate-400 hover:text-white"
                                }`}
                              >
                                <child.icon size={14} className={isChildActive ? "text-indigo-400" : "opacity-50 group-hover:opacity-100 transition-opacity"} />
                                <span className={`text-[10px] uppercase tracking-widest font-black whitespace-nowrap ${isChildActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                                   {child.label}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    title={isCollapsed ? item.label : ""}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                      isActive 
                      ? "bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/40 border border-white/10 translate-x-1" 
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    <item.icon size={18} className={`transition-all duration-300 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"} ${isCollapsed ? "scale-110" : ""}`} />
                    {!isCollapsed && <span className={`text-[11px] uppercase tracking-[0.15em] font-black whitespace-nowrap animate-in fade-in slide-in-from-left-2 ${isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Area */}
      <div className={`p-4 border-t border-white/10 bg-black/20 transition-all duration-500 ${isCollapsed ? "px-2" : "p-4"}`}>
        <button 
          onClick={handleLogout}
          className={`flex items-center gap-3.5 px-4 py-3.5 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all group ${isCollapsed ? "justify-center px-0" : "justify-between"}`}
        >
          <div className="flex items-center gap-3.5">
             <LogOut size={18} className={`group-hover:-translate-x-0.5 transition-transform ${isCollapsed ? "scale-110" : ""}`} />
             {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mt-0.5 animate-in fade-in">Logout</span>}
          </div>
        </button>

        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mt-4 flex items-center gap-3 px-4 py-2 w-full text-indigo-400/50 hover:text-indigo-400 transition-all group"
          >
             <ChevronLeft size={16} />
             <span className="text-[9px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">Collapse Sidebar</span>
          </button>
        )}
      </div>
    </aside>
  );
}
