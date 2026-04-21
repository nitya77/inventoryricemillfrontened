"use client";
import API_BASE_URL from "@/utils/api";

import { Search, Bell, User, Loader2, UserCheck, ShieldCheck, Briefcase } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HRMHeader() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`${API_BASE_URL}/api/employees/search?query=${search}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.employees || []);
          setShowResults(true);
        })
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);
  
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-8 flex-1">
        <div className="flex items-center gap-3 px-4 py-2 bg-indigo-600 rounded-xl overflow-hidden shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
           <ShieldCheck size={18} className="text-white" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Security Cleared</span>
        </div>

        <div className="relative w-full max-w-lg group" ref={searchRef}>
          {isSearching ? <Loader2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin z-10" /> : <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />}
          <input 
            type="text" 
            placeholder="Search employees by name, phone or code..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => search.length >= 2 && setShowResults(true)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm outline-none"
          />

          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 shadow-2xl rounded-[1.5rem] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel Match</span>
                  <span className="text-[9px] font-black text-indigo-500 uppercase">{results.length} Found</span>
               </div>
               <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
                  {results.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-bold text-xs uppercase italic">No staff found matching "{search}"</div>
                  ) : results.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        router.push(`/attendance?employee_id=${emp.id}`);
                        setSearch("");
                        setShowResults(false);
                      }}
                      className="w-full p-5 flex items-center gap-4 hover:bg-slate-50 transition-all text-left group/item"
                    >
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                        <User size={18} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{emp.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{emp.designation}</span>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">• {emp.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </button>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
           <div className="text-right">
              <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">HR Director</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Admin Access</p>
           </div>
           <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 text-slate-500 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white transition-all duration-500 cursor-pointer overflow-hidden">
              <User size={22} />
           </div>
        </div>
      </div>
    </header>
  );
}
