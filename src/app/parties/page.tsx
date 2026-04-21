"use client";
import API_BASE_URL from "@/utils/api";

import {
  Users, Search, Plus, TrendingUp, ChevronRight, ChevronLeft,
  Briefcase, ShieldCheck, MapPin, Phone, Edit3, Trash2, X, Save, User,
  Mail, CreditCard, Tag, Filter, CheckCircle2, History
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["Farmer", "Trader", "Arhtia / Agent", "Miller", "Wholesaler", "Retailer", "Other"];

const EMPTY_FORM = { 
  name: "", 
  phone: "", 
  email: "", 
  address: "", 
  gst_no: "", 
  credit_limit: 0, 
  category: "Farmer",
  is_customer: false,
  is_seller: true 
};

function Drawer({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden transform transition-transform animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </div>
    </>
  );
}

function Field({ label, icon: Icon, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">{label}</label>
      <div className="relative group">
        {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />}
        <input
          className={`w-full bg-slate-50 border border-slate-200 rounded-2xl ${Icon ? "pl-10" : "pl-4"} pr-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm`}
          {...props}
        />
      </div>
    </div>
  );
}

export default function PartyRegistryPage() {
  const [parties, setParties] = useState<any[]>([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<"all" | "customer" | "seller">("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchParties = async () => {
    setIsFetching(true);
    try {
      const typeParam = filterType !== "all" ? `&type=${filterType}` : "";
      const res = await fetch(`${API_BASE_URL}/api/parties?page=${page}&limit=12&search=${search}${typeParam}`);
      const data = await res.json();
      if (data.items) { setParties(data.items); setMeta(data.meta); }
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    const t = setTimeout(fetchParties, 300);
    return () => clearTimeout(t);
  }, [page, search, filterType]);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setError("");
    setDrawerMode("add");
    setSelectedId(null);
    setDrawerOpen(true);
  };

  const openEdit = (party: any) => {
    setForm({ 
      name: party.name, 
      phone: party.phone || "", 
      email: party.email || "", 
      address: party.address || "", 
      gst_no: party.gst_no || "", 
      credit_limit: Number(party.credit_limit) || 0, 
      category: party.category || "Farmer",
      is_customer: party.is_customer,
      is_seller: party.is_seller 
    });
    setError("");
    setDrawerMode("edit");
    setSelectedId(party.id);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.is_customer && !form.is_seller) { setError("Entity must be a Customer, a Seller, or both"); return; }
    
    setSaving(true);
    setError("");
    try {
      const url = drawerMode === "add" ? `${API_BASE_URL}/api/parties` : `${API_BASE_URL}/api/parties/${selectedId}`;
      const method = drawerMode === "add" ? "POST" : "PUT";
      const res = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(form) 
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Save failed"); return; }
      setDrawerOpen(false);
      fetchParties();
    } catch { setError("Network error"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(`${API_BASE_URL}/api/parties/${id}`, { method: "DELETE" });
      fetchParties();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-indigo-600 rounded-full" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Master Data</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Users size={32} /> Party Registry
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Unified management of Buyers, Sellers, Agents, and Farmers.</p>
        </div>
        <button onClick={openAdd} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95">
          <Plus size={18} /> Add New Party
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        {/* Filters & Search */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/20 flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full lg:w-auto">
             {(['all', 'customer', 'seller'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setFilterType(t); setPage(1); }}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterType === t 
                    ? "bg-slate-900 text-white shadow-xl" 
                    : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {t === 'all' ? 'All Entities' : t === 'customer' ? 'Buyers' : 'Sellers'}
                </button>
             ))}
          </div>

          <div className="relative group flex-1 w-full max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Name, Contact, GST or Village..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm" 
            />
          </div>
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-10">
          {isFetching ? Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-72 bg-slate-50 rounded-[2.5rem] animate-pulse border border-slate-100" />
          )) : parties.map((party) => (
            <div 
              key={party.id} 
              onClick={() => router.push(`/parties/${party.id}/ledger`)}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/20 group hover:border-indigo-200 transition-all relative overflow-hidden flex flex-col h-full cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full translate-x-12 -translate-y-12 opacity-50 transition-transform group-hover:translate-x-10 group-hover:-translate-y-10" />
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:rotate-6 rounded-2xl flex items-center justify-center transition-all shadow-sm">
                  <User size={28} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    {party.category}
                  </span>
                  <div className="flex gap-1">
                    {party.is_seller && (
                      <span className="w-5 h-5 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-lg flex items-center justify-center text-[9px] font-black" title="Is Seller">S</span>
                    )}
                    {party.is_customer && (
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 border border-blue-200 rounded-lg flex items-center justify-center text-[9px] font-black" title="Is Customer">C</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1 mb-6 relative z-10 flex-1 min-h-[60px]">
                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase line-clamp-2 leading-none" title={party.name}>{party.name}</h3>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mt-1">UID-{party.id.toString().padStart(5, '0')}</span>
                
                <div className="mt-6 space-y-3">
                  {party.phone && <div className="flex items-center gap-3 text-slate-500"><Phone size={14} className="text-indigo-400" /><span className="text-[10px] font-black uppercase tracking-tight">{party.phone}</span></div>}
                  {party.address && <div className="flex items-start gap-3 text-slate-500"><MapPin size={14} className="text-indigo-400 mt-0.5 shrink-0" /><span className="text-[10px] font-bold uppercase tracking-tight line-clamp-2 leading-relaxed">{party.address}</span></div>}
                  {party.gst_no && <div className="flex items-center gap-3 text-slate-500"><CreditCard size={14} className="text-indigo-400" /><span className="text-[10px] font-black uppercase tracking-tight">GST: {party.gst_no}</span></div>}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Credit Limit</span>
                  <span className="text-xs font-black text-slate-900">₹{Number(party.credit_limit).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/parties/${party.id}/ledger`} 
                    onClick={(e) => e.stopPropagation()}
                    className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all border border-indigo-100" 
                    title="View Ledger"
                  >
                    <History size={16} />
                  </Link>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEdit(party); }} 
                    className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all border border-amber-100 shadow-sm"
                    title="Edit Party"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(party.id, party.name); }} 
                    className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all border border-rose-100 shadow-sm"
                    title="Delete Party"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!isFetching && parties.length === 0 && (
          <div className="p-32 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border border-slate-100 border-dashed"><Users size={40} /></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Registry is Empty</p>
          </div>
        )}

        {/* Pagination */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total {meta.totalItems} Registered Parties</p>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronLeft size={20} /></button>
            <div className="flex items-center gap-1 mx-4">
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${page === p ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{p}</button>
              ))}
            </div>
            <button disabled={page === meta.totalPages} onClick={() => setPage(page + 1)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {/* Add / Edit Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={drawerMode === "add" ? "Onboard New Party" : "Modify Party Details"}>
        <div className="space-y-8">
          {/* Identity & Contact */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <User size={14} /> Identity Information
            </h4>
            <Field label="Business / Individual Name *" icon={User} type="text" placeholder="Enter Full Name" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone Number" icon={Phone} type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} />
              <Field label="Email Address" icon={Mail} type="email" placeholder="example@mail.com" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          {/* Roles & Category */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <Tag size={14} /> Classification
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Operational Roles</label>
                <div className="flex flex-col gap-3">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={form.is_seller} onChange={(e) => setForm({ ...form, is_seller: e.target.checked })} className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-xs font-black text-slate-600 group-hover:text-slate-900 transition-colors">Seller / Supplier</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={form.is_customer} onChange={(e) => setForm({ ...form, is_customer: e.target.checked })} className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-xs font-black text-slate-600 group-hover:text-slate-900 transition-colors">Buyer / Customer</span>
                   </label>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all cursor-pointer">
                  {CATEGORIES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Financials & Address */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <Briefcase size={14} /> Details & Financials
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Field label="GST Number" icon={CreditCard} type="text" placeholder="22AAAAA0000A1Z5" value={form.gst_no} onChange={(e: any) => setForm({ ...form, gst_no: e.target.value })} />
              <Field label="Credit Limit (₹)" icon={CheckCircle2} type="number" placeholder="0.00" value={form.credit_limit} onChange={(e: any) => setForm({ ...form, credit_limit: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Physical Address</label>
              <div className="relative group">
                <MapPin size={16} className="absolute left-4 top-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                <textarea rows={3} placeholder="Village, District, State, Pincode" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm resize-none" />
              </div>
            </div>
          </div>

          {error && <p className="text-xs font-black text-red-500 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">{error}</p>}
          
          <div className="flex gap-4 pt-4">
            <button onClick={() => setDrawerOpen(false)} className="px-8 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-300 disabled:opacity-50">
              <Save size={18} /> {saving ? "Saving..." : drawerMode === "add" ? "Create Party" : "Apply Changes"}
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
