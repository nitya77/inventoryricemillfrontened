"use client";
import API_BASE_URL from "@/utils/api";

import { Search, Bell, User, Loader2, HardHat, Pickaxe, Drill } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ConstructionHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{parties: any[], products: any[]}>({parties: [], products: []});
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
    if (searchQuery.length < 2) {
      setSearchResults({parties: [], products: []});
      setShowResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);
      fetch(`${API_BASE_URL}/api/construction/search?query=${searchQuery}`)
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
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500 rounded-lg shrink-0 overflow-hidden">
           <HardHat size={16} className="text-white" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Construction Mode</span>
        </div>

        <div className="relative w-full max-w-md group" ref={searchRef}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors z-10">
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </div>
          <input 
            type="text" 
            placeholder="Search Machinery, Raw Materials (Gravel, Sand)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all outline-none shadow-sm"
          />

          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-100">
                {/* Party Section */}
                {searchResults.parties.length > 0 && (
                  <div className="bg-white">
                    <div className="p-3 bg-slate-50">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Contractors & Suppliers</span>
                    </div>
                    {searchResults.parties.map((party) => (
                      <button
                        key={party.id}
                        onClick={() => {
                          router.push(`/construction/parties`);
                          setShowResults(false);
                          setSearchQuery("");
                        }}
                        className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-all text-left group/item"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 bg-slate-50 text-slate-400 group-hover/item:border-amber-500 group-hover/item:text-amber-500">
                          <User size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{party.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{party.category || 'Construction Partner'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Product Section */}
                {searchResults.products.length > 0 && (
                  <div className="bg-white">
                    <div className="p-3 bg-slate-50">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Machinery & Materials</span>
                    </div>
                    {searchResults.products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          router.push(`/construction/inventory`);
                          setShowResults(false);
                          setSearchQuery("");
                        }}
                        className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-all text-left group/item"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 bg-slate-50 text-slate-400 group-hover/item:border-amber-500 group-hover/item:text-amber-500">
                          {product.category === 'equipment' ? <Drill size={18} /> : <Pickaxe size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{product.variety || 'Standard'}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">• {Number(product.quantity).toLocaleString()} {product.unit} Available</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {searchResults.parties.length === 0 && searchResults.products.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching construction assets</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-slate-400 hover:text-amber-500 transition-colors relative">
           <Bell size={20} />
           <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-white" />
        </button>
        <div className="w-[1px] h-8 bg-slate-200" />
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">Site Engineer</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Construction Dept.</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 group-hover:border-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 overflow-hidden text-slate-500">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
