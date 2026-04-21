"use client";
import API_BASE_URL from "@/utils/api";

import { Search, Bell, HelpCircle, User, ChevronDown, Menu, Loader2, MapPin, Phone, Package } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState("Admin User");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{parties: any[], products: any[]}>({parties: [], products: []});
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = localStorage.getItem("inventory_user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserName(parsed.fullname || parsed.employeeId);
      } catch (e) {}
    }
  }, []);

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
    if (searchQuery.length < 2) {
      setSearchResults({ parties: [], products: [] });
      setShowResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);
      fetch(`${API_BASE_URL}/api/global-search?query=${searchQuery}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data);
          setShowResults(true);
        })
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-6 flex-1">
        <button className="lg:hidden text-slate-500 hover:text-indigo-600 transition-colors">
          <Menu size={20} />
        </button>
        <div className="relative w-full max-w-md group" ref={searchRef}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10">
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </div>
          <input 
            type="text" 
            placeholder="Search Parties, Products, Invoices..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-all outline-none shadow-sm"
          />

          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-100">
                {/* Party Section */}
                {searchResults.parties.length > 0 && (
                  <div className="bg-white">
                    <div className="p-3 bg-slate-50/80 sticky top-0 z-10">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Parties & Entities</span>
                    </div>
                    {searchResults.parties.map((party) => (
                      <button
                        key={party.id}
                        onClick={() => {
                          router.push(`/parties/${party.id}/ledger`);
                          setShowResults(false);
                          setSearchQuery("");
                        }}
                        className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-all text-left group/item"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${party.is_customer ? 'bg-emerald-50 border-emerald-100 text-emerald-600 group-hover/item:bg-emerald-600 group-hover/item:text-white' : 'bg-amber-50 border-amber-100 text-amber-600 group-hover/item:bg-amber-600 group-hover/item:text-white'}`}>
                          <User size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{party.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{party.category}</span>
                            <span className="text-[9px] font-bold text-slate-300">•</span>
                            <span className="text-[9px] font-medium text-slate-400">{party.phone || 'No Contact'}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Product Section */}
                {searchResults.products.length > 0 && (
                  <div className="bg-white">
                    <div className="p-3 bg-slate-50/80 sticky top-0 z-10">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Inventory & Products</span>
                    </div>
                    {searchResults.products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          router.push(`/reports/stock/${product.id}/ledger`);
                          setShowResults(false);
                          setSearchQuery("");
                        }}
                        className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-all text-left group/item"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100 bg-indigo-50 text-indigo-600 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                          <Package size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{product.name} ({product.variety})</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 group-hover/item:bg-white/20 px-1.5 py-0.5 rounded transition-colors">{product.type}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Stock: {Number(product.quantity).toLocaleString()} {product.unit}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.parties.length === 0 && searchResults.products.length === 0 && !isSearching && (
                  <div className="p-12 text-center bg-white">
                    <HelpCircle size={32} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-loose">
                      No results found for <br/>
                      <span className="text-indigo-500 underline decoration-indigo-200 decoration-wavy">"{searchQuery}"</span>
                    </p>
                  </div>
                )}
              </div>
              
              {(searchResults.parties.length > 0 || searchResults.products.length > 0) && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Search Active</span>
                  <p className="text-[9px] font-bold text-slate-400 italic">Found {searchResults.parties.length + searchResults.products.length} matches</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 mr-4">
           <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
            <HelpCircle size={20} />
          </button>
        </div>
        
        <div className="h-8 w-px bg-slate-200 mx-1" />
        
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">{userName}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">System Admin</p>
          </div>
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 border border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
            <User size={20} />
          </div>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-indigo-600 transition-all" />
        </div>
      </div>
    </header>
  );
}
