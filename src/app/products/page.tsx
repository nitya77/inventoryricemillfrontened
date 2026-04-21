"use client";
import API_BASE_URL from "@/utils/api";

import {
  Warehouse, Package, Tag, Layers, ChevronRight, ChevronLeft,
  AlertCircle, Plus, Search, TrendingUp, ArrowUpRight, CheckCircle2,
  Box, Scale, Edit2, Trash2, X, Save
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PRODUCT_TYPES = ["Raw", "Finished", "By-Product"];
const UNITS = ["Kg", "Qtl", "Ton", "Units"];
const EMPTY_FORM = { 
  name: "", 
  variety: "", 
  varietyId: "",
  type: "Finished", 
  unit: "Kg", 
  quality: "Fresh",
  qualityId: "" 
};

function Drawer({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </div>
    </>
  );
}

export default function ProductsMasterPage() {
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [varieties, setVarieties] = useState<{ id: number; name: string }[]>([]);
  const [qualities, setQualities] = useState<{ id: number; name: string }[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchItems = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products?page=${page}&limit=10&search=${search}`);
      const data = await res.json();
      if (data.items) { setItems(data.items); setMeta(data.meta); }
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  const fetchVarieties = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/varieties`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setVarieties(data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchQualities = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/qualities`);
      const data = await res.json();
      if (Array.isArray(data)) setQualities(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchVarieties();
    fetchQualities();
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchItems, 300);
    return () => clearTimeout(t);
  }, [page, search]);

  const rawVolume = items.filter(i => i.type === 'Raw').reduce((s, i) => s + Number(i.quantity), 0);
  const finishedVolume = items.filter(i => i.type === 'Finished').reduce((s, i) => s + Number(i.quantity), 0);
  const byProductVolume = items.filter(i => i.type === 'By-Product').reduce((s, i) => s + Number(i.quantity), 0);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setError("");
    setDrawerMode("add");
    setSelectedId(null);
    setDrawerOpen(true);
  };

  const openEdit = (item: any) => {
    setForm({ name: item.name, variety: item.variety || "", varietyId: item.varietyId || "", type: item.type, unit: item.unit || "Kg", quality: item.quality || "Fresh" });
    setError("");
    setDrawerMode("edit");
    setSelectedId(item.id);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.varietyId) { setError("Name and Variety are required"); return; }
    setSaving(true); setError("");
    try {
      const selectedVar = varieties.find(v => v.id === Number(form.varietyId));
      const selectedQual = qualities.find(q => q.id === Number(form.qualityId));
      
      const url = drawerMode === "add" ? `${API_BASE_URL}/api/products` : `${API_BASE_URL}/api/products/${selectedId}`;
      const res = await fetch(url, { 
        method: drawerMode === "add" ? "POST" : "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          ...form, 
          variety: selectedVar?.name, 
          quality: selectedQual?.name,
          qualityId: form.qualityId
        }) 
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Save failed"); return; }
      setDrawerOpen(false); fetchItems();
    } catch { setError("Network error"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete product "${name}"? This action does NOT reverse stock movements.`)) return;
    try { await fetch(`${API_BASE_URL}/api/products/${id}`, { method: "DELETE" }); fetchItems(); }
    catch (err) { console.error(err); }
  };

  const typeColor = (t: string) =>
    t === 'Raw' ? 'bg-orange-50 text-orange-600 border-orange-100' :
    t === 'Finished' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
    'bg-indigo-50 text-indigo-600 border-indigo-100';

  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-indigo-600 rounded-full" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Stock</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3"><Warehouse size={32} /> Products & Stock</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">View and manage all products and current stock levels.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-3 bg-slate-900 text-white px-7 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
          <Plus size={18} /> Register Asset
        </button>
      </div>

      {/* Analytics Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-indigo-100 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 opacity-20 rounded-bl-full -mr-8 -mt-8" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm"><Box size={22} /></div>
              <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">ACTIVE HUB</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Raw Material Pipeline</p>
            <div className="flex items-baseline gap-2"><h3 className="text-4xl font-black text-slate-900 tracking-tighter">{rawVolume.toLocaleString()}</h3><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kg</span></div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 opacity-20 rounded-bl-full -mr-8 -mt-8" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm"><CheckCircle2 size={22} /></div>
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">MARKET READY</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Finished Products</p>
            <div className="flex items-baseline gap-2"><h3 className="text-4xl font-black text-slate-900 tracking-tighter">{finishedVolume.toLocaleString()}</h3><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kg</span></div>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl shadow-slate-900/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 bg-white/5 text-indigo-400 rounded-2xl flex items-center justify-center shadow-sm border border-white/5"><TrendingUp size={22} /></div>
              <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg">SURPLUS ACTIVE</span>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">By-Product Assets</p>
            <div className="flex items-baseline gap-2"><h3 className="text-4xl font-black text-white tracking-tighter">{byProductVolume.toLocaleString()}</h3><span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Kg</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex gap-4 bg-slate-50/30">
          <div className="relative flex-1 group max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input type="text" placeholder="Search by SKU, Variety, or Classification..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm" />
          </div>
          <button onClick={fetchItems} className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><TrendingUp size={18} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                        <th className="px-10 py-6">Product Name</th>
                <th className="px-10 py-6">Quality</th>
                <th className="px-10 py-6">Type</th>
                <th className="px-10 py-6">Stock Quantity</th>
                <th className="px-10 py-6 text-right">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isFetching ? Array(6).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={5} className="px-10 py-10 bg-slate-50/10"></td></tr>
              )) : items.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => router.push(`/reports/stock/${item.id}/ledger`)}
                  className="hover:bg-slate-50/80 transition-all duration-300 group cursor-pointer"
                >
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"><Package size={22} /></div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase leading-none mb-1.5 group-hover:translate-x-1 transition-transform tracking-tight">{item.name}</p>
                        <div className="flex items-center gap-2"><Tag size={10} className="text-slate-300" /><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.variety || "Industrial Grade"}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200 text-slate-500 bg-slate-50`}>{item.quality || 'Fresh'}</span>
                  </td>
                  <td className="px-10 py-7">
                    <span className={`inline-flex px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${typeColor(item.type)}`}>{item.type}</span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-lg font-black text-slate-900 tracking-tighter leading-none">{Number(item.quantity).toLocaleString()}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.unit || 'Kg'}</span>
                    </div>
                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest italic opacity-60">Est. {Math.floor(item.quantity / 50)} Units (@50kg)</p>
                  </td>
                  <td className="px-10 py-7 text-right">
                    {item.quantity < 500 ? (
                      <div className="inline-flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 font-black text-[9px] uppercase tracking-widest animate-pulse"><AlertCircle size={14} />Critical Depletion</div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-slate-400 font-black text-[9px] uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity"><Scale size={14} className="group-hover:text-indigo-600" />Within Nominal Range</div>
                    )}
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEdit(item); }} 
                        title="Edit Product" 
                        className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all border border-amber-100 shadow-sm"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.name); }} 
                        title="Delete Product" 
                        className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all border border-rose-100 shadow-sm"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isFetching && items.length === 0 && (
            <div className="p-32 text-center flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border border-slate-100 border-dashed"><Layers size={40} /></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Asset Index Clear</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {items.length} of {meta.totalItems} Asset Variants</p>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronLeft size={20} /></button>
            <div className="flex items-center gap-1 mx-4">
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${page === p ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{p}</button>
              ))}
            </div>
            <button disabled={page === meta.totalPages} onClick={() => setPage(page + 1)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {/* Add / Edit Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={drawerMode === "add" ? "Register New Asset" : "Edit Asset"}>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Product Name *</label>
            <input type="text" placeholder="e.g. Basmati Rice, Paddy Bran" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Variety / Grade *</label>
              <select 
                value={form.varietyId}
                onChange={(e) => setForm({ ...form, varietyId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all cursor-pointer shadow-sm"
              >
                <option value="">Select Variety</option>
                {varieties.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Quality Grade *</label>
              <select 
                value={form.qualityId}
                onChange={(e) => setForm({ ...form, qualityId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all cursor-pointer shadow-sm"
              >
                <option value="">Select Quality</option>
                {qualities.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all cursor-pointer">
                {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all cursor-pointer">
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          {drawerMode === "edit" && (
            <p className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
              Note: Quantity is managed automatically by procurement, milling, and sales transactions. Only metadata fields can be edited here.
            </p>
          )}
          {error && <p className="text-xs font-black text-red-500 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">{error}</p>}
          <div className="flex gap-3 pt-4">
            <button onClick={() => setDrawerOpen(false)} className="flex-1 py-3.5 border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50">
              <Save size={16} /> {saving ? "Saving..." : drawerMode === "add" ? "Register Asset" : "Save Changes"}
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
