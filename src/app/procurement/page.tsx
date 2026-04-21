"use client";
import API_BASE_URL from "@/utils/api";

import {
  Scale, Search, Plus, TrendingUp, ChevronRight, ChevronLeft,
  Printer, Truck, User, Droplets, Edit2, Trash2, Eye, X, Save, Box, Calendar
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";

const UNITS = [{ id: "Kg", label: "Kg" }, { id: "Qtl", label: "Qtl" }, { id: "Ton", label: "Ton" }, { id: "Bags", label: "Bags" }];

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

function LabeledInput({ label, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">{label}</label>
      <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm" {...props} />
    </div>
  );
}

export default function ProcurementRegistryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [products, setProducts] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    farmer_name: "", vehicle_no: "", variety: "",
    gross_weight: "", tare_weight: "", moisture_pct: "", bags_count: "",
    price_per_quintal: "", unit: "Kg"
  });

  const fetchRecords = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/procurement?page=${page}&limit=10&search=${search}&startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      if (data.items) { setRecords(data.items); setMeta(data.meta); }
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    const t = setTimeout(fetchRecords, 300);
    return () => clearTimeout(t);
  }, [page, search, startDate, endDate]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products?limit=1000`)
      .then(r => r.json()).then(d => {
        if (d.items) setProducts(d.items.filter((p: any) => p.type === "Raw").map((p: any) => ({ id: p.variety, label: p.variety, subLabel: "Raw" })));
      });
  }, []);

  const openEdit = (record: any) => {
    setForm({
      farmer_name: record.farmer_name, vehicle_no: record.vehicle_no,
      variety: record.variety, gross_weight: record.gross_weight?.toString() || "",
      tare_weight: record.tare_weight?.toString() || "", moisture_pct: record.moisture_pct?.toString() || "",
      bags_count: record.bags_count?.toString() || "", price_per_quintal: record.price_per_quintal?.toString() || "",
      unit: record.unit || "Kg"
    });
    setError(""); setSelectedId(record.id); setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.farmer_name || !form.variety) { setError("Farmer name and variety are required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/procurement/${selectedId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_name: form.farmer_name, vehicle_no: form.vehicle_no,
          variety: form.variety, gross_weight: Number(form.gross_weight),
          tare_weight: Number(form.tare_weight), moisture_pct: Number(form.moisture_pct),
          bags_count: Number(form.bags_count), price_per_quintal: Number(form.price_per_quintal),
          unit: form.unit
        })
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Save failed"); return; }
      setDrawerOpen(false); fetchRecords();
    } catch { setError("Network error"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this procurement record? Raw stock will be decreased accordingly.")) return;
    try { await fetch(`${API_BASE_URL}/api/procurement/${id}`, { method: "DELETE" }); fetchRecords(); }
    catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2"><span className="w-8 h-[2px] bg-indigo-600 rounded-full" /><span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Procurement</span></div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3"><Scale size={32} /> Procurement</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Record paddy intake from farmers with weight, moisture, and rate details.</p>
        </div>
        <Link href="/procurement/new" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
          <Plus size={18} /> New Intake
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 bg-slate-50/30">
          <div className="relative flex-1 group max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input type="text" placeholder="Search by Farmer, Vehicle #, or Variety..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm" />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-6 py-4 hover:border-indigo-200 transition-all shadow-sm group min-w-[320px]">
              <Calendar size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="text-xs font-black text-slate-900 outline-none uppercase tracking-tight bg-transparent w-full"
              />
              <span className="text-[10px] font-black text-slate-300 px-2 shrink-0">TO</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="text-xs font-black text-slate-900 outline-none uppercase tracking-tight bg-transparent w-full"
              />
            </div>
            
            <button 
              onClick={() => { setStartDate(""); setEndDate(""); setSearch(""); setPage(1); }}
              className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 transition-all shadow-sm group"
              title="Clear All Filters"
            >
              <X size={18} />
            </button>
            <button onClick={fetchRecords} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><TrendingUp size={18} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-10 py-6 text-indigo-600">Gate Pass</th>
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6">Farmer & Vehicle</th>
                <th className="px-10 py-6">Variety & Moisture</th>
                <th className="px-10 py-6">Net Weight</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isFetching ? Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={5} className="px-10 py-10 bg-slate-50/10"></td></tr>
              )) : records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                  <td className="px-10 py-7">
                    <span className="text-xs font-black text-indigo-700 tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-xl shadow-sm">
                      GP-{record.id.toString().padStart(4, '0')}
                    </span>
                  </td>
                  <td className="px-10 py-7">
                    <span className="text-xs font-black text-slate-900" suppressHydrationWarning>{new Date(record.intake_date || record.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"><User size={18} /></div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase leading-none mb-1 group-hover:translate-x-1 transition-transform">{record.farmer_name}</p>
                        <div className="flex items-center gap-2"><Truck size={12} className="text-slate-400" /><span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{record.vehicle_no}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">{record.variety}</span>
                    <div className="flex items-center gap-2 mt-1"><Droplets size={12} className="text-blue-400" /><span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Moisture: {record.moisture_pct}%</span></div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-baseline gap-2 mb-1"><span className="text-lg font-black text-slate-900 tracking-tighter leading-none">{Number(record.net_weight).toLocaleString()}</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{record.unit || 'Kg'}</span></div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60">₹{Number(record.total_amount).toLocaleString()} Valued</p>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/procurement/receipt/${record.id}`} className="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Print Gate Pass"><Printer size={16} /></Link>
                      <button onClick={() => openEdit(record)} className="p-3 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm" title="Edit Record"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(record.id)} className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Delete Record"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isFetching && records.length === 0 && (
            <div className="p-32 text-center flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border border-slate-100 border-dashed"><Scale size={40} /></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Intake Queue Clear</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {records.length} of {meta.totalItems} Records</p>
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

      {/* Edit Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Edit Intake Record">
        <div className="space-y-5">
          <LabeledInput label="Farmer / Source Name *" type="text" value={form.farmer_name} onChange={(e: any) => setForm({ ...form, farmer_name: e.target.value })} />
          <LabeledInput label="Vehicle Number" type="text" value={form.vehicle_no} onChange={(e: any) => setForm({ ...form, vehicle_no: e.target.value })} />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Variety</label>
            <SearchableSelect options={products} value={form.variety} onChange={(v) => setForm({ ...form, variety: String(v) })} placeholder="Select Variety" icon={Box} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <LabeledInput label="Gross Weight (Kg)" type="number" value={form.gross_weight} onChange={(e: any) => setForm({ ...form, gross_weight: e.target.value })} />
            <LabeledInput label="Tare Weight (Kg)" type="number" value={form.tare_weight} onChange={(e: any) => setForm({ ...form, tare_weight: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <LabeledInput label="Moisture %" type="number" step="0.1" value={form.moisture_pct} onChange={(e: any) => setForm({ ...form, moisture_pct: e.target.value })} />
            <LabeledInput label="Bags Count" type="number" value={form.bags_count} onChange={(e: any) => setForm({ ...form, bags_count: e.target.value })} />
          </div>
          <LabeledInput label="Rate / Quintal (₹)" type="number" value={form.price_per_quintal} onChange={(e: any) => setForm({ ...form, price_per_quintal: e.target.value })} />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Unit</label>
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all cursor-pointer">
              {UNITS.map(u => <option key={u.id}>{u.label}</option>)}
            </select>
          </div>
          {error && <p className="text-xs font-black text-red-500 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">{error}</p>}
          <div className="flex gap-3 pt-4">
            <button onClick={() => setDrawerOpen(false)} className="flex-1 py-3.5 border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50">
              <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
