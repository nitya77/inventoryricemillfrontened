"use client";
import API_BASE_URL from "@/utils/api";

import { 
  Factory, 
  Search, 
  Plus, 
  Filter, 
  TrendingUp,
  Activity,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Package,
  ArrowUpRight,
  Zap,
  Percent
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function MillingRegistryPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchBatches = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/milling?page=${page}&limit=10&search=${search}`);
      const data = await res.json();
      if (data.items) {
        setBatches(data.items);
        setMeta(data.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBatches();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const avgRecovery = batches.length > 0 
    ? (batches.reduce((a, b) => a + (Number(b.rice_output_qty) / Number(b.paddy_input_qty)), 0) / batches.length * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="w-8 h-[2px] bg-indigo-600 rounded-full" />
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Production Control</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
             <Factory size={32} /> Production Recovery
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Industrial milling batch monitoring and automated yield performance registry.</p>
        </div>
        <div className="flex items-center gap-4">
           <Link 
             href="/milling/new"
             className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
           >
              <Plus size={18} /> Process New Batch
           </Link>
        </div>
      </div>

      {/* Analytics Card */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-900/40 border border-indigo-500/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-full bg-indigo-600/5 skew-x-[25deg] -mr-48" />
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-end gap-10">
             <div className="space-y-2">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400 border border-white/10">
                      <Activity size={20} />
                   </div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Aggregate Yield Efficiency</span>
                </div>
                <div className="flex items-end gap-3">
                   <h3 className="text-6xl font-black tracking-tighter leading-none">{avgRecovery}</h3>
                   <span className="text-2xl font-black text-indigo-500 mb-2">%</span>
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] pt-2">Average Rice Extraction Performance</p>
             </div>
             
             <div className="flex items-center gap-6">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Batches</p>
                   <p className="text-xl font-black">{meta.totalItems}</p>
                </div>
                <div className="bg-indigo-600/10 p-5 rounded-2xl border border-indigo-500/20">
                   <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-2">Operational Node</p>
                   <p className="text-xl font-black text-indigo-400">ACTIVE</p>
                </div>
             </div>
          </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        {/* Search Bar */}
        <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row justify-between lg:items-center gap-6 bg-slate-50/30">
           <div className="relative flex-1 group max-w-xl">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
             <input 
               type="text" 
               placeholder="Search by Variety or Batch Status..." 
               value={search}
               onChange={(e) => { setSearch(e.target.value); setPage(1); }}
               className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm"
             />
           </div>
           
           <div className="flex items-center gap-3">
             <button onClick={fetchBatches} className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                <TrendingUp size={18} />
             </button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-10 py-6">Batch ID</th>
                <th className="px-10 py-6">Variety / Specification</th>
                <th className="px-10 py-6 text-center">Inward Paddy</th>
                <th className="px-10 py-6 text-center">Refined recovery</th>
                <th className="px-10 py-6 text-right">Yield Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isFetching ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-10 bg-slate-50/10"></td>
                  </tr>
                ))
              ) : batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                  <td className="px-10 py-7">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">#{batch.id.toString().padStart(4, '0')}</span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          <Package size={18} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900 uppercase leading-none mb-1 group-hover:translate-x-1 transition-transform">{batch.variety}</p>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(batch.end_date).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <div className="flex flex-col items-center">
                       <span className="text-sm font-black text-slate-900">{Number(batch.paddy_input_qty).toLocaleString()} Kg</span>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Raw Intake</span>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <div className="text-center">
                          <p className="text-xs font-black text-slate-900">{Number(batch.rice_output_qty).toLocaleString()}</p>
                          <p className="text-[7px] font-black text-slate-400 uppercase">Rice</p>
                       </div>
                       <div className="w-px h-4 bg-slate-200" />
                       <div className="text-center">
                          <p className="text-xs font-black text-slate-500">{Number(batch.broken_output_qty).toLocaleString()}</p>
                          <p className="text-[7px] font-black text-slate-400 uppercase">Broken</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="inline-flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 font-black text-[11px] uppercase tracking-widest shadow-sm">
                       {((Number(batch.rice_output_qty) / Number(batch.paddy_input_qty)) * 100).toFixed(1)}%
                       <ArrowUpRight size={14} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!isFetching && batches.length === 0 && (
            <div className="p-32 text-center flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border border-slate-100 border-dashed">
                 <Factory size={40} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Operational Registry Empty</p>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing {batches.length} of {meta.totalItems} Batches
           </p>
           
           <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
              >
                 <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-1 mx-4">
                 {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                        page === p 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                        : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                       {p}
                    </button>
                 ))}
              </div>

              <button 
                disabled={page === meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
              >
                 <ChevronRight size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
