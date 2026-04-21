"use client";
import API_BASE_URL from "@/utils/api";

import { 
  ArrowLeft, History, ShoppingCart, User, 
  Phone, MapPin, Calendar, Receipt, 
  ArrowDownLeft, ArrowUpRight, TrendingUp, Briefcase
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ConstructionPartyLedgerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [party, setParty] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      // We need an endpoint for party specific construction movements
      const res = await fetch(`${API_BASE_URL}/api/construction/parties/${id}/movements`);
      const data = await res.json();
      if (data) {
        setParty(data.party);
        setEntries(data.movements);
      }
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (isFetching) return <div className="p-20 text-center animate-pulse text-slate-400 font-black uppercase text-xs tracking-widest">Loading Partner Profile...</div>;
  if (!party) return <div className="p-20 text-center text-rose-500 font-black uppercase text-xs tracking-widest">Partner Not Found</div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Partner Ledger</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{party.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 col-span-1">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
               <User size={28} />
            </div>
            <div className="space-y-4">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                  <span className="text-sm font-black text-slate-900 uppercase italic underline decoration-amber-200 underline-offset-4">{party.category}</span>
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Details</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Phone size={14} className="text-slate-300" /> {party.phone || 'N/A'}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Office Address</p>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed"><MapPin size={14} className="inline mr-1 text-slate-300" /> {party.address || 'N/A'}</p>
               </div>
            </div>
         </div>

         <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
               <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                     <Receipt size={18} className="text-amber-500" /> Transaction History
                  </h2>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                           <th className="px-10 py-6">Date</th>
                           <th className="px-10 py-6">Item / Ref</th>
                           <th className="px-10 py-6 text-right">Inward (+)</th>
                           <th className="px-10 py-6 text-right">Outward (–)</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {entries.length === 0 ? (
                           <tr><td colSpan={4} className="p-32 text-center text-slate-300 font-black uppercase text-xs tracking-widest">No site movements recorded with this partner</td></tr>
                        ) : entries.map((entry, i) => (
                           <tr key={i} className="hover:bg-slate-50 transition-all font-medium group">
                              <td className="px-10 py-6 text-xs font-black text-slate-900 uppercase" suppressHydrationWarning>{new Date(entry.entry_date).toLocaleDateString()}</td>
                              <td className="px-10 py-6">
                                 <p className="text-sm font-black text-slate-700 uppercase leading-none mb-1 group-hover:translate-x-1 transition-transform">{entry.product_name}</p>
                                 <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Ref: {entry.ref_no || '--'}</span>
                              </td>
                              <td className="px-10 py-6 text-right">
                                 {entry.type === 'IN' && <span className="text-lg font-black text-emerald-600 tracking-tighter">+{Number(entry.quantity).toLocaleString()}</span>}
                              </td>
                              <td className="px-10 py-6 text-right">
                                 {entry.type === 'OUT' && <span className="text-lg font-black text-amber-500 tracking-tighter">-{Number(entry.quantity).toLocaleString()}</span>}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
