"use client";
import API_BASE_URL from "@/utils/api";

import { 
  Pickaxe, Plus, Search, TrendingUp, 
  AlertCircle, CheckCircle2,
  Trash2, Edit2, X, Save, HardHat, Box, Droplets, ArrowLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Raw Material", "Consumables", "Chemicals", "Fuel"];
const UNITS = ["Kg", "Metric Ton", "Ltr", "Truckloads"];

function Drawer({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden border-l border-slate-100 text-slate-900">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em]">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </div>
    </>
  );
}

export default function ConstructionMaterialsPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ name: "", variety: "", category: "Raw Material", unit: "Kg", min_stock_level: "100" });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/construction/products?search=${search}`);
      const data = await res.json();
      if (data.items) { 
          // Client side filter for raw materials/consumables if needed, or just show all but titled Materials
          setItems(data.items.filter((i: any) => i.category === 'Raw Material' || i.category === 'Consumables' || i.category === 'Consumable' || i.category === 'Chemicals' || i.category === 'Fuel')); 
      }
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    fetchItems();
  }, [search]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/construction/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setDrawerOpen(false);
        fetchItems();
        setForm({ name: "", variety: "", category: "Raw Material", unit: "Kg", min_stock_level: "100" });
      }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => router.push('/construction')} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm">
               <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
               <span className="w-8 h-[2px] bg-amber-500 rounded-full" />
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Site Stocks</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Pickaxe size={32} /> Materials Stock
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Gravel (Gitti), Sand (Balu), Steel, Fuel, and other consumable site resources.</p>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-3 bg-amber-500 text-white px-7 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-95">
          <Plus size={18} /> Add Material
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex gap-4 bg-slate-50/10">
          <div className="relative flex-1 group max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by Material Grade, Brand, or Variety..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-amber-500 transition-all shadow-sm" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-10 py-6">Material Details</th>
                <th className="px-10 py-6">Category</th>
                <th className="px-10 py-6">Current Stock</th>
                <th className="px-10 py-6 text-right">Site Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isFetching ? (
                Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-10 py-10 bg-slate-50/10"></td></tr>)
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-32 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">
                    No site materials registered
                  </td>
                </tr>
              ) : items.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-slate-50/80 transition-all duration-300 group cursor-pointer"
                  onClick={() => router.push(`/construction/ledger/${item.id}`)}
                >
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white border border-slate-100 text-amber-500 rounded-2xl flex items-center justify-center transition-all shadow-sm group-hover:bg-amber-500 group-hover:text-white">
                        {item.category === 'Fuel' ? <Droplets size={20} /> : <Box size={22} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase leading-none mb-1.5 group-hover:translate-x-1 transition-transform tracking-tight">{item.name}</p>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.variety || "General Grade"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900 tracking-tighter">{Number(item.quantity).toLocaleString()}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.unit}</span>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-right">
                    {Number(item.quantity) <= Number(item.min_stock_level) ? (
                      <div className="inline-flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 font-black text-[9px] uppercase tracking-widest animate-pulse">
                        <AlertCircle size={14} /> Low Supply
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 font-black text-[9px] uppercase tracking-widest">
                        <CheckCircle2 size={14} /> Available
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-7 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-transparent shadow-sm"><Edit2 size={15} /></button>
                        <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent shadow-sm"><Trash2 size={15} /></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Material Resource">
         <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Material Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Balu (Sand), Gitti 20mm, Cement" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold outline-none focus:border-amber-500 transition-all text-slate-900"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Category</label>
                  <select 
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold outline-none focus:border-amber-500 transition-all cursor-pointer"
                     value={form.category}
                     onChange={(e) => setForm({...form, category: e.target.value})}
                  >
                     {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Unit</label>
                  <select 
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold outline-none focus:border-amber-500 transition-all cursor-pointer"
                     value={form.unit}
                     onChange={(e) => setForm({...form, unit: e.target.value})}
                  >
                     {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
               </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Variety / Spec</label>
              <input 
                type="text" 
                placeholder="e.g. Fine, Coarse, OPC 43" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold outline-none focus:border-amber-500 transition-all text-slate-900"
                value={form.variety}
                onChange={(e) => setForm({...form, variety: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-50">
               <button onClick={() => setDrawerOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
               <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="flex-1 py-4 bg-amber-500 text-white hover:bg-amber-400 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
               >
                  <Save size={16} /> {saving ? "Saving..." : "Add to Stock"}
               </button>
            </div>
         </div>
      </Drawer>
    </div>
  );
}
