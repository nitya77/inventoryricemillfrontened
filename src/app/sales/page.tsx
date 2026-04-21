"use client";
import API_BASE_URL from "@/utils/api";

import {
  CreditCard, Search, Plus, TrendingUp, ChevronRight, ChevronLeft,
  Printer, Edit2, Trash2, Briefcase, X, Save, Box, User
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import SearchableSelect from "@/components/SearchableSelect";

const PRODUCT_TYPES = [{ id: "Finished", label: "Finished Rice" }, { id: "By-Product", label: "By-Product (Bran/Husk)" }, { id: "Raw", label: "Raw Paddy" }];

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

export default function SalesRegistryPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    buyer_name: "", variety: "", product_type: "Finished",
    bags_sold: "", weight_sold: "", rate_per_unit: "",
    invoice_date: "", unit: "Kg"
  });

  const fetchSales = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales?page=${page}&limit=10&search=${search}`);
      const data = await res.json();
      if (data.items) { setSales(data.items); setMeta(data.meta); }
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    const t = setTimeout(fetchSales, 300);
    return () => clearTimeout(t);
  }, [page, search]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products?limit=1000`)
      .then(r => r.json()).then(d => {
        if (d.items) setProducts(d.items.map((p: any) => ({ id: p.variety, label: p.variety, subLabel: p.type })));
      });
  }, []);

  const openEdit = (sale: any) => {
    setForm({
      buyer_name: sale.buyer_name, variety: sale.variety, product_type: sale.product_type || "Finished",
      bags_sold: sale.bags_sold?.toString() || "", weight_sold: sale.weight_sold?.toString() || "",
      rate_per_unit: sale.rate_per_unit?.toString() || "",
      invoice_date: sale.invoice_date ? sale.invoice_date.split("T")[0] : "",
      unit: sale.unit || "Kg"
    });
    setError(""); setSelectedId(sale.id); setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.buyer_name || !form.variety) { setError("Buyer name and variety are required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/${selectedId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: form.buyer_name, variety: form.variety,
          product_type: form.product_type,
          bags_sold: Number(form.bags_sold), weight_sold: Number(form.weight_sold),
          rate_per_unit: Number(form.rate_per_unit),
          invoice_date: form.invoice_date, unit: form.unit
        })
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Save failed"); return; }
      setDrawerOpen(false); fetchSales();
    } catch { setError("Network error"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this sale? Finished stock will be restored to inventory.")) return;
    try { await fetch(`${API_BASE_URL}/api/sales/${id}`, { method: "DELETE" }); fetchSales(); }
    catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2"><span className="w-8 h-[2px] bg-indigo-600 rounded-full" /><span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Sales</span></div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3"><CreditCard size={32} /> Sales</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Record rice and by-product sales with buyer and billing details.</p>
        </div>
        <Link href="/sales/new" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
          <Plus size={18} /> Generate Invoice
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex gap-4 bg-slate-50/30">
          <div className="relative flex-1 group max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input type="text" placeholder="Search by Buyer, Invoice #, or Variety..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm" />
          </div>
          <button onClick={fetchSales} className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><TrendingUp size={18} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                                <th className="px-10 py-6">Invoice No.</th>
                <th className="px-10 py-6">Buyer & Product</th>
                <th className="px-10 py-6">Amount</th>
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isFetching ? Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={5} className="px-10 py-10 bg-slate-50/10"></td></tr>
              )) : sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                  <td className="px-10 py-7"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{sale.invoice_no || `INV-${sale.id}`}</span></td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"><Briefcase size={18} /></div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase leading-none mb-1 group-hover:translate-x-1 transition-transform">{sale.buyer_name}</p>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{sale.variety}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-baseline gap-2 mb-1"><span className="text-lg font-black text-slate-900 tracking-tighter leading-none">₹{Number(sale.total_amount).toLocaleString()}</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total</span></div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60">{Number(sale.weight_sold).toLocaleString()} {sale.unit || 'Kg'} @ ₹{sale.rate_per_unit}/Kg</p>
                  </td>
                  <td className="px-10 py-7"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{sale.invoice_date?.split('T')[0] || 'N/A'}</span></td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/sales/invoice/${sale.invoice_no || sale.id}`} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm" title="Print Invoice"><Printer size={16} /></Link>
                      <button onClick={() => openEdit(sale)} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm" title="Edit Invoice"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(sale.id)} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 transition-all shadow-sm" title="Delete Invoice"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isFetching && sales.length === 0 && (
            <div className="p-32 text-center flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border border-slate-100 border-dashed"><CreditCard size={40} /></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Registry Currently Clear</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {sales.length} of {meta.totalItems} Records</p>
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
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Edit Sale Invoice">
        <div className="space-y-5">
          <LabeledInput label="Buyer Name *" type="text" value={form.buyer_name} onChange={(e: any) => setForm({ ...form, buyer_name: e.target.value })} />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Variety</label>
            <SearchableSelect options={products} value={form.variety} onChange={(v) => setForm({ ...form, variety: String(v) })} placeholder="Select Variety" icon={Box} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Product Type</label>
            <select value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all cursor-pointer">
              {PRODUCT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <LabeledInput label="Bags Sold" type="number" value={form.bags_sold} onChange={(e: any) => setForm({ ...form, bags_sold: e.target.value })} />
            <LabeledInput label="Weight (Kg)" type="number" value={form.weight_sold} onChange={(e: any) => setForm({ ...form, weight_sold: e.target.value })} />
          </div>
          <LabeledInput label="Rate / Kg (₹)" type="number" value={form.rate_per_unit} onChange={(e: any) => setForm({ ...form, rate_per_unit: e.target.value })} />
          <LabeledInput label="Invoice Date" type="date" value={form.invoice_date} onChange={(e: any) => setForm({ ...form, invoice_date: e.target.value })} />
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
