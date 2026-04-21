"use client";
import API_BASE_URL from "@/utils/api";

import { 
  ArrowLeftRight, ArrowDownLeft, ArrowUpRight, 
  HardHat, Drill, Box, Calendar, History, 
  TrendingUp, TrendingDown, ClipboardList, Receipt, ArrowLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ConstructionItemLedgerPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/construction/products/${id}/ledger`);
      const json = await res.json();
      if (json) {
        setData(json.product);
        setEntries(json.items);
      }
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (isFetching) return <div className="p-20 text-center animate-pulse text-slate-400 font-black uppercase text-xs tracking-widest">Loading Site Audit...</div>;
  if (!data) return <div className="p-20 text-center text-rose-500 font-black uppercase text-xs tracking-widest">Asset Not Found</div>;

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => window.history.back()} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm">
               <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
               <span className="w-8 h-[2px] bg-amber-500 rounded-full" />
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Inventory Audit</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            {data.name} <span className="text-xl text-slate-400 font-bold italic tracking-normal">({data.variety || 'Standard'})</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Detailed movement history and stock verification for site assets.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white px-8 py-4 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Stock</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">{Number(data.quantity).toLocaleString()} <span className="text-xs uppercase">{data.unit}</span></h3>
           </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg shadow-slate-200/30">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
               <Receipt size={20} />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Movements</p>
            <h4 className="text-xl font-black text-slate-900 mt-1 italic">{entries.length} Trx</h4>
         </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
               <History size={18} className="text-amber-500" /> Movement History
            </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6">Entity / Description</th>
                <th className="px-10 py-6">Ref No.</th>
                <th className="px-10 py-6 text-right">Debit (–)</th>
                <th className="px-10 py-6 text-right">Credit (+)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.map((entry: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-6 text-xs font-black text-slate-900 uppercase" suppressHydrationWarning>
                    {new Date(entry.entry_date).toLocaleDateString()}
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-xs font-black text-slate-700 uppercase leading-none mb-1.5 group-hover:translate-x-1 transition-transform">{entry.party_name || 'Internal consumption'}</p>
                    <span className="text-[10px] text-slate-400 font-medium line-clamp-1">{entry.description || 'No description provided'}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black text-indigo-400 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 uppercase tracking-widest">{entry.ref_no || '--'}</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    {entry.type === 'OUT' && (
                      <span className="text-lg font-black text-amber-500 tracking-tighter italic">-{Number(entry.quantity).toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-10 py-6 text-right">
                    {entry.type === 'IN' && (
                      <span className="text-lg font-black text-emerald-600 tracking-tighter italic">+{Number(entry.quantity).toLocaleString()}</span>
                    )}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-32 text-center text-slate-300 font-black uppercase text-xs tracking-widest">
                    Audit trail is clear
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
