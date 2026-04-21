"use client";
import API_BASE_URL from "@/utils/api";

import {
  ShoppingCart, Search, Plus, TrendingUp, ChevronRight, ChevronLeft,
  Briefcase, ShieldCheck, MapPin, Phone, Edit3, Trash2, X, Save, CreditCard, Mail, User
} from "lucide-react";
import { useState, useEffect } from "react";

const EMPTY_FORM = { name: "", phone: "", email: "", address: "", gst_no: "", credit_limit: "" };

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

function Field({ label, icon: Icon, textarea, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">{label}</label>
      <div className="relative group">
        {Icon && <Icon size={16} className={`absolute left-4 ${textarea ? "top-4" : "top-1/2 -translate-y-1/2"} text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none`} />}
        {textarea ? (
          <textarea rows={3} className={`w-full bg-slate-50 border border-slate-200 rounded-2xl ${Icon ? "pl-10" : "pl-4"} pr-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm resize-none`} {...props} />
        ) : (
          <input className={`w-full bg-slate-50 border border-slate-200 rounded-2xl ${Icon ? "pl-10" : "pl-4"} pr-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm`} {...props} />
        )}
      </div>
    </div>
  );
}

export default function CustomersRegistryPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers?page=${page}&limit=12&search=${search}`);
      const data = await res.json();
      if (data.items) { setCustomers(data.items); setMeta(data.meta); }
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [page, search]);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setError("");
    setDrawerMode("add");
    setSelectedId(null);
    setDrawerOpen(true);
  };

  const openEdit = (c: any) => {
    setForm({ name: c.name, phone: c.phone || "", email: c.email || "", address: c.address || "", gst_no: c.gst_no || "", credit_limit: c.credit_limit?.toString() || "" });
    setError("");
    setDrawerMode("edit");
    setSelectedId(c.id);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true); setError("");
    try {
      const url = drawerMode === "add" ? `${API_BASE_URL}/api/customers` : `${API_BASE_URL}/api/customers/${selectedId}`;
      const res = await fetch(url, { method: drawerMode === "add" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, credit_limit: Number(form.credit_limit) || 0 }) });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Save failed"); return; }
      setDrawerOpen(false); fetchCustomers();
    } catch { setError("Network error"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try { await fetch(`${API_BASE_URL}/api/customers/${id}`, { method: "DELETE" }); fetchCustomers(); }
    catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-indigo-600 rounded-full" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Customers</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3"><ShoppingCart size={32} /> Customers</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Manage all buyers and customer accounts.</p>
        </div>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
          <Plus size={18} /> Register Buyer
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex gap-4 bg-slate-50/30">
          <div className="relative flex-1 group max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input type="text" placeholder="Search by Name, Phone, or GST..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm" />
          </div>
          <button onClick={fetchCustomers} className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><TrendingUp size={18} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-10">
          {isFetching ? Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-50 rounded-[2.5rem] animate-pulse border border-slate-100" />
          )) : customers.map((customer) => (
            <div key={customer.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/30 group hover:border-indigo-200 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full translate-x-12 -translate-y-12 opacity-50 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="w-14 h-14 bg-white border border-slate-100 text-slate-400 group-hover:bg-slate-950 group-hover:text-white group-hover:-rotate-6 rounded-2xl flex items-center justify-center transition-all shadow-sm">
                  <Briefcase size={28} />
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  <ShieldCheck size={12} /> Verified Buyer
                </span>
              </div>
              <div className="space-y-1 mb-6 relative z-10">
                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase truncate">{customer.name}</h3>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Buyer #{customer.id.toString().padStart(4, '0')}</span>
              </div>
              <div className="space-y-3 relative z-10">
                {customer.phone && <div className="flex items-center gap-3 text-slate-500"><Phone size={14} className="text-indigo-400" /><span className="text-[10px] font-black uppercase tracking-tight">{customer.phone}</span></div>}
                {customer.address && <div className="flex items-start gap-3 text-slate-500"><MapPin size={14} className="text-indigo-400 mt-0.5 shrink-0" /><span className="text-[10px] font-bold uppercase tracking-tight line-clamp-2 leading-relaxed">{customer.address}</span></div>}
                {customer.gst_no && <div className="flex items-center gap-3 text-slate-500"><CreditCard size={14} className="text-indigo-400" /><span className="text-[10px] font-black uppercase tracking-widest italic">{customer.gst_no}</span></div>}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Credit Limit</p>
                  <span className="text-sm font-black text-slate-900">₹{Number(customer.credit_limit || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(customer)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(customer.id, customer.name)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isFetching && customers.length === 0 && (
          <div className="p-32 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border border-slate-100 border-dashed"><ShoppingCart size={40} /></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Buyer Ledger Empty</p>
          </div>
        )}

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {customers.length} of {meta.totalItems} Customers</p>
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
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={drawerMode === "add" ? "Register New Buyer" : "Edit Buyer"}>
        <div className="space-y-5">
          <Field label="Full Name *" icon={User} type="text" placeholder="Business / Person Name" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
          <Field label="Phone Number" icon={Phone} type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} />
          <Field label="Email Address" icon={Mail} type="email" placeholder="buyer@example.com" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} />
          <Field label="GST Number" icon={CreditCard} type="text" placeholder="27AABCU9603R1ZX" value={form.gst_no} onChange={(e: any) => setForm({ ...form, gst_no: e.target.value })} />
          <Field label="Credit Limit (₹)" type="number" min="0" placeholder="0" value={form.credit_limit} onChange={(e: any) => setForm({ ...form, credit_limit: e.target.value })} />
          <Field label="Address" icon={MapPin} textarea placeholder="City, State, PIN" value={form.address} onChange={(e: any) => setForm({ ...form, address: e.target.value })} />
          {error && <p className="text-xs font-black text-red-500 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">{error}</p>}
          <div className="flex gap-3 pt-4">
            <button onClick={() => setDrawerOpen(false)} className="flex-1 py-3.5 border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50">
              <Save size={16} /> {saving ? "Saving..." : drawerMode === "add" ? "Create Buyer" : "Save Changes"}
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
