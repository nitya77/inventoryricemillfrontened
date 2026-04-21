"use client";
import API_BASE_URL from "@/utils/api";

import { 
  ArrowLeftRight, Plus, Search, TrendingUp, Calendar, 
  ArrowDownLeft, ArrowUpRight, HardHat, Drill, Users, 
  Trash2, Edit2, X, Save, FileText, Filter, ArrowLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { alertSuccess, alertError } from "@/utils/alerts";

const MOVEMENT_TYPES = [
  { id: "IN", label: "Inward (Purchase / Return)", color: "text-emerald-500", bg: "bg-emerald-50", icon: ArrowDownLeft },
  { id: "OUT", label: "Outward (Consumption / Issue)", color: "text-amber-500", bg: "bg-amber-50", icon: ArrowUpRight },
];

export default function ConstructionLedgerPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    product_id: "",
    party_id: "",
    type: "IN",
    quantity: "",
    ref_no: "",
    description: ""
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      // Fetch products and parties for the form
      const [prodRes, partRes, ledgerRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/construction/products?limit=1000`).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/construction/parties?limit=1000`).then(r => r.json()),
        // We'll search for all movements if no specific ID is provided? 
        // For simplicity, a "Recent Movements" list.
        fetch(`${API_BASE_URL}/api/construction/search?query=`).then(r => r.json()) // Dummy for now
      ]);

      if (prodRes.items) setProducts(prodRes.items.map((p: any) => ({ id: p.id, label: p.name, subLabel: p.variety })));
      if (partRes.items) setParties(partRes.items.map((p: any) => ({ id: p.id, label: p.name, subLabel: p.category })));
      
      // Hit a new endpoint for global movements if I create it
      const moveRes = await fetch(`${API_BASE_URL}/api/construction/movements`).then(r => r.json());
      if (moveRes) setEntries(moveRes);

    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!form.product_id || !form.quantity) {
      return alertError("Product and Quantity required");
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/construction/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setDrawerOpen(false);
        fetchData();
        alertSuccess(`Movement posted: ${form.type === 'IN' ? 'Inward Stock' : 'Consumption Out'}`);
      } else {
        alertError("Failed to post movement");
      }
    } catch (err) { 
      console.error(err); 
      alertError("Server communication failed");
    } finally { setSaving(false); }
  };

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
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Movements</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <ArrowLeftRight size={32} /> Material Ledger
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Track purchases (Inward) and site consumption (Outward) for all assets.</p>
        </div>
        <button 
          onClick={() => setDrawerOpen(true)} 
          className="flex items-center gap-3 bg-slate-900 text-white px-7 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl active:scale-95"
        >
          <Plus size={18} /> Record Movement
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Inward / Purchase</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-amber-500" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Outward / Consumed</span>
              </div>
           </div>
           <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">
              <Filter size={14} /> Filter
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6">Asset & Ref</th>
                <th className="px-10 py-6">Description / Party</th>
                <th className="px-10 py-6 text-right">Qty</th>
                <th className="px-10 py-6 text-center">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isFetching ? (
                Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-10 py-10 bg-slate-50/10"></td></tr>)
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-32 text-center text-slate-300 uppercase font-black text-[10px] tracking-widest">
                     No movements recorded for construction
                  </td>
                </tr>
              ) : entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition-all group">
                   <td className="px-10 py-7">
                      <span className="text-xs font-black text-slate-900 uppercase" suppressHydrationWarning>{new Date(entry.entry_date).toLocaleDateString()}</span>
                   </td>
                   <td className="px-10 py-7">
                      <div className="flex flex-col">
                         <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{entry.product_name}</span>
                         <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Ref: {entry.ref_no || '--'}</span>
                      </div>
                   </td>
                   <td className="px-10 py-7">
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-slate-600 line-clamp-1">{entry.description}</span>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{entry.party_name || 'Internal Issue'}</span>
                      </div>
                   </td>
                   <td className="px-10 py-7 text-right">
                      <span className={`text-lg font-black tracking-tighter ${entry.type === 'IN' ? 'text-emerald-600' : 'text-amber-600'}`}>
                         {entry.type === 'IN' ? '+' : '-'}{Number(entry.quantity).toLocaleString()}
                      </span>
                   </td>
                   <td className="px-10 py-7 text-center">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${entry.type === 'IN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                         {entry.type === 'IN' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                         <span className="text-[10px] font-black uppercase tracking-widest">{entry.type}</span>
                      </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Drawer */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-all ${drawerOpen ? "visible" : "invisible"}`}>
         <div className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setDrawerOpen(false)} />
         <div className={`relative w-full max-w-lg bg-white shadow-2xl transition-transform duration-500 overflow-hidden flex flex-col ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <div>
                  <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em]">Material Movement Entry</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 tracking-tight">Purchase or Consume Site Resources</p>
               </div>
               <button onClick={() => setDrawerOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-900">
               {/* Type Selector */}
               <div className="grid grid-cols-2 gap-3 p-1 bg-slate-50 rounded-2xl border border-slate-200">
                  {MOVEMENT_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setForm({...form, type: t.id})}
                      className={`flex flex-col items-center gap-2 py-4 rounded-xl transition-all ${
                        form.type === t.id 
                          ? `${t.bg} ${t.color} shadow-lg shadow-slate-200/50 border border-slate-100` 
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <t.icon size={20} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                    </button>
                  ))}
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Date of Transaction</label>
                  <div className="relative">
                     <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                     <input 
                        type="date" 
                        value={form.entry_date}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold outline-none focus:border-amber-500 transition-all text-slate-900"
                        onChange={(e) => setForm({...form, entry_date: e.target.value})}
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Select Asset / Material</label>
                  <SearchableSelect 
                    options={products} 
                    value={form.product_id} 
                    placeholder="Search site inventory..." 
                    icon={Drill}
                    onChange={(v) => setForm({...form, product_id: String(v)})}
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Target Contractor / Supplier</label>
                  <SearchableSelect 
                    options={parties} 
                    value={form.party_id} 
                    placeholder="Select Party (Optional for consumption)" 
                    icon={Users}
                    onChange={(v) => setForm({...form, party_id: String(v)})}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Quantity</label>
                     <input 
                        type="number" 
                        placeholder="0.00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-black outline-none focus:border-amber-500 transition-all text-slate-900"
                        value={form.quantity}
                        onChange={(e) => setForm({...form, quantity: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Reference / MRN #</label>
                     <input 
                        type="text" 
                        placeholder="Bill or Slip #"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold outline-none focus:border-amber-500 transition-all text-slate-900"
                        value={form.ref_no}
                        onChange={(e) => setForm({...form, ref_no: e.target.value})}
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Remarks / Location</label>
                  <textarea 
                     rows={3}
                     placeholder="State the reason or site location..."
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-xs font-medium outline-none focus:border-amber-500 transition-all text-slate-900 resize-none"
                     value={form.description}
                     onChange={(e) => setForm({...form, description: e.target.value})}
                  />
               </div>

               <div className="flex gap-3 pt-6 border-t border-slate-100">
                  <button onClick={() => setDrawerOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                  <button 
                     onClick={handleSave} 
                     disabled={saving}
                     className="flex-1 py-4 bg-amber-500 text-white hover:bg-amber-400 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
                  >
                     <Save size={16} /> {saving ? "Authorizing..." : "Post Movement"}
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
