"use client";
import API_BASE_URL from "@/utils/api";

import { 
  BarChart3, 
  ArrowLeft, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Warehouse,
  History,
  Receipt,
  Download,
  Eye,
  Calendar,
  Layers,
  ShieldCheck,
  Tag,
  Filter,
  FileText,
  X,
  Printer,
  Clock
} from "lucide-react";
import { useState, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ItemLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<{ 
    product: any, 
    items: any[], 
    pending?: { purchase: number, sale: number } 
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "All" // All, IN, OUT
  });

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const sp = new URLSearchParams();
      if (filters.startDate) sp.append('startDate', filters.startDate);
      if (filters.endDate) sp.append('endDate', filters.endDate);
      
      const res = await fetch(`${API_BASE_URL}/api/products/${id}/ledger?${sp.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch ledger');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [id, filters.startDate, filters.endDate]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    let rows = [...data.items];
    if (filters.type !== "All") {
      rows = rows.filter(i => i.type === filters.type);
    }
    return rows;
  }, [data, filters.type]);

  const exportCSV = () => {
    if (!data || !filteredItems.length) return;
    const headers = ["Date", "Description", "Ref No", "Type", "Amount", "Balance"];
    const rows = filteredItems.map(i => [
      new Date(i.entry_date).toLocaleDateString(),
      i.description,
      i.ref_no,
      i.type === 'IN' ? 'Stock In' : 'Stock Out',
      i.amount,
      i.running_balance
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `item_ledger_${data.product.name}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading && !data) {
    return (
      <div className="p-20 text-center space-y-4 animate-pulse">
        <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto" />
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">Analyzing Inventory Audit Trail...</p>
      </div>
    );
  }

  if (!data || !data.product) return null;

  const { product } = data;
  const currentStock = data.items.length > 0 ? data.items[data.items.length - 1].running_balance : 0;
  const totalIn = filteredItems.filter(i => i.type === 'IN').reduce((s, i) => s + Number(i.amount), 0);
  const totalOut = filteredItems.filter(i => i.type === 'OUT').reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="space-y-8 pb-32">
        {/* Breadcrumb & Quick Actions */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-[2px] bg-indigo-500 rounded-full" />
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em]">Inventory Audit Ledger</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase truncate max-w-xl" title={product.name}>{product.name}</h1>
            </div>
         </div>
         <div className="flex gap-4">
           <button 
             onClick={exportCSV}
             className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
           >
             <FileText size={16} /> CSV
           </button>
           <button 
             onClick={() => window.print()}
             className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-all"
           >
             <Printer size={16} /> Print PDF
           </button>
         </div>
       </div>

       {/* Print Header */}
       <div className="hidden print:block border-b-2 border-slate-900 pb-6 mb-8">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Inventory Audit Ledger</h1>
          <p className="text-xl font-bold text-slate-600 uppercase mt-1">{product.name} ({product.variety})</p>
          <p className="text-xs font-semibold text-slate-400 mt-2" suppressHydrationWarning>Generated on: {new Date().toLocaleString()}</p>
          {filters.startDate && <p className="text-xs font-semibold text-slate-500 mt-1">Period: {filters.startDate} to {filters.endDate || 'Present'}</p>}
       </div>

       {/* Top Product Details Card */}
       <div className="bg-white rounded-[2.5rem] border border-slate-200 border-b-4 border-b-indigo-500 shadow-2xl shadow-slate-200/50 overflow-hidden print:border-b-2 print:rounded-3xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
             <div className="p-8 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  <Tag size={12} className="text-indigo-500" /> Variety
                </div>
                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{product.variety}</p>
             </div>
             <div className="p-8 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  <Layers size={12} className="text-indigo-500" /> Type
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    product.type === 'Raw' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    product.type === 'Finished' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    {product.type}
                  </span>
                </div>
             </div>
             <div className="p-8 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  <ShieldCheck size={12} className="text-indigo-500" /> Grade
                </div>
                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{product.quality || 'Fresh'}</p>
             </div>
             <div className="p-8 space-y-3 bg-slate-50/30 print:bg-transparent">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  <Clock size={12} className="text-indigo-500" /> Pipeline Commitment
                </div>
                <div className="flex items-center justify-between gap-4">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-emerald-600 uppercase">+{Number(data.pending?.purchase || 0).toLocaleString()} In</span>
                      <span className="text-[9px] font-black text-amber-600 uppercase">-{Number(data.pending?.sale || 0).toLocaleString()} Out</span>
                   </div>
                   <p className="text-lg font-black text-slate-900 tracking-tight">
                     {((data.pending?.purchase || 0) - (data.pending?.sale || 0)).toLocaleString()} {product.unit}
                   </p>
                </div>
             </div>
          </div>
       </div>

       {/* Audit Controls / Filters */}
       <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100 flex flex-wrap items-end gap-6 print:hidden">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
             <div className="relative">
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date" 
                  value={filters.startDate}
                  onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                  className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all min-w-[160px]" 
                />
             </div>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
             <div className="relative">
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date" 
                  value={filters.endDate}
                  onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                  className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all min-w-[160px]" 
                />
             </div>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Movement Type</label>
             <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                {['All', 'IN', 'OUT'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilters(f => ({ ...f, type: t }))}
                    className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      filters.type === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {t === 'All' ? 'Combined' : t === 'IN' ? 'Inward' : 'Outward'}
                  </button>
                ))}
             </div>
          </div>
          <button 
             onClick={() => setFilters({ startDate: "", endDate: "", type: "All" })}
             className="ml-auto w-12 h-12 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:text-red-500 hover:border-red-200 transition-all group"
             title="Clear Filters"
          >
             <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
       </div>

       {/* Summary Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:grid-cols-3 print:gap-4">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 flex flex-col gap-6 print:p-6 print:rounded-2xl">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center justify-center print:w-8 print:h-8">
              <TrendingUp size={24} className="print:w-4 print:h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Stock Inwards</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tighter print:text-xl">{totalIn.toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{product.unit || 'Kg'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 flex flex-col gap-6 print:p-6 print:rounded-2xl">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 flex items-center justify-center print:w-8 print:h-8">
              <TrendingDown size={24} className="print:w-4 print:h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Stock Outwards</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tighter print:text-xl">{totalOut.toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{product.unit || 'Kg'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group print:bg-white print:border-slate-200 print:shadow-none print:p-6 print:rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform print:hidden" />
            <div className="w-12 h-12 bg-slate-800 text-indigo-400 rounded-2xl border border-slate-700 flex items-center justify-center mb-6 print:w-8 print:h-8 print:bg-slate-100 print:border-slate-200 print:mb-4">
              <Warehouse size={24} className="print:w-4 print:h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 print:text-slate-400">Live Inventory Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tracking-tighter print:text-slate-900 print:text-xl">{currentStock.toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest print:text-slate-400">{product.unit || 'Kg'}</span>
              </div>
            </div>
          </div>
       </div>

       {/* Audit Table */}
       <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden print:rounded-none print:border-none print:shadow-none">
          <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between print:p-4">
             <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
               <History size={18} className="text-indigo-600 print:hidden" /> Transaction Audit Trail
             </h2>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-4 print:hidden">
               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Inward</span>
               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400" /> Outward</span>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 print:bg-transparent">
                  <th className="px-10 py-6">Date</th>
                  <th className="px-10 py-6">Reference & Event</th>
                  <th className="px-10 py-6 text-right">Outward (–)</th>
                  <th className="px-10 py-6 text-right">Inward (+)</th>
                  <th className="px-10 py-6 text-right bg-slate-50/80 print:bg-transparent">Stock Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.slice().reverse().map((entry, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 tracking-tight" suppressHydrationWarning>{new Date(entry.entry_date).toLocaleDateString()}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest print:hidden" suppressHydrationWarning>
                             {new Date(entry.sort_ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${entry.type === 'IN' ? 'bg-emerald-50 text-emerald-600 font-black' : 'bg-amber-50 text-amber-600 font-black'} border border-transparent print:hidden`}>
                          {entry.type === 'IN' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 leading-tight">{entry.description}</p>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1 block">{entry.ref_no}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                       {entry.type === 'OUT' ? (
                         <span className="text-base font-black text-amber-600 tracking-tighter">-{Number(entry.amount).toLocaleString()}</span>
                       ) : <span className="text-slate-200">—</span>}
                    </td>
                    <td className="px-10 py-6 text-right">
                       {entry.type === 'IN' ? (
                         <span className="text-base font-black text-emerald-600 tracking-tighter">+{Number(entry.amount).toLocaleString()}</span>
                       ) : <span className="text-slate-200">—</span>}
                    </td>
                    <td className="px-10 py-6 text-right bg-slate-50/30 print:bg-transparent">
                       <p className="text-base font-black text-slate-900 tracking-tighter italic">
                         {Number(entry.running_balance).toLocaleString()} <span className="text-[10px] font-bold text-slate-400 not-italic uppercase ml-0.5">{product.unit || 'Kg'}</span>
                       </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredItems.length === 0 && (
              <div className="p-32 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200 mb-4 border border-slate-100 border-dashed">
                  <Package size={32} />
                </div>
                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">No inventory movements found for the selected filters</p>
              </div>
            )}
          </div>
       </div>

       {/* Print Footer */}
       <div className="hidden print:flex justify-between items-center mt-20 border-t-2 border-slate-100 pt-8">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Auditor</p>
            <div className="mt-8 border-b border-slate-200 w-48" />
          </div>
          <p className="text-[10px] font-bold text-slate-400">Total Movements Extracted: {filteredItems.length} Entries</p>
       </div>
    </div>
  );
}
