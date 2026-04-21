"use client";
import API_BASE_URL from "@/utils/api";

import { 
  Users, Plus, Search, Phone, MapPin, 
  Trash2, Edit3, X, Save, HardHat, Building2, Briefcase, ShoppingCart, ArrowLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Contractor", "Supplier", "Transporter", "Labor Provider", "Internal"];

function Drawer({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden border-l border-slate-100">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em]">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </div>
    </>
  );
}

export default function ConstructionPartiesPage() {
  const [parties, setParties] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", category: "Contractor" });
  const [saving, setSaving] = useState(false);

  const fetchParties = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/construction/parties?search=${search}`);
      const data = await res.json();
      if (data.items) { setParties(data.items); }
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    fetchParties();
  }, [search]);

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/construction/parties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setDrawerOpen(false);
        fetchParties();
        setForm({ name: "", phone: "", address: "", category: "Contractor" });
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
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Directory</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
             <Users size={32} /> Contractors & Partners
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Manage construction vendors, site contractors, and material suppliers.</p>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-3 bg-amber-500 text-white px-7 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-95">
          <Plus size={18} /> Register Partner
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/10 flex gap-4">
          <div className="relative flex-1 group max-w-xl">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
             <input 
              type="text" 
              placeholder="Search by Contractor Name or Phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-amber-500 transition-all shadow-sm" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
           {isFetching ? (
             Array(6).fill(0).map((_, i) => <div key={i} className="h-64 bg-slate-50 rounded-[2rem] animate-pulse"></div>)
           ) : parties.length === 0 ? (
             <div className="col-span-full py-32 text-center text-slate-300 font-black uppercase text-xs tracking-widest">No site partners registered</div>
           ) : parties.map((party) => (
             <div 
               key={party.id} 
               onClick={() => router.push(`/construction/parties/${party.id}/ledger`)}
               className="bg-white border border-slate-100 rounded-[2rem] p-7 group hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-500 relative cursor-pointer"
             >
                <div className="flex items-start justify-between mb-6 relative z-10">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white`}>
                      <Briefcase size={24} />
                   </div>
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); /* edit logic */ }} 
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-transparent hover:border-amber-100 shadow-sm"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); /* delete logic */ }} 
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>

                <div className="mb-6 relative z-10">
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:translate-x-1 transition-transform">{party.name}</h3>
                   <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100 mt-2 inline-block lowercase first-letter:uppercase">{party.category}</span>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50 relative z-10 mt-auto">
                   <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-500">
                         <Phone size={12} className="text-slate-300" />
                         <span className="text-[11px] font-bold">{party.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                         <MapPin size={12} className="text-slate-300" />
                         <span className="text-[10px] font-medium truncate w-32">{party.address || 'Site Address'}</span>
                      </div>
                   </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); router.push(`/construction/ledger?party_id=${party.id}`); }}
                     className="bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2"
                   >
                     <ShoppingCart size={14} /> Purchase
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Register Site Partner">
         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Partner / Contractor Name *</label>
               <input 
                  type="text" 
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
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Contact Number</label>
                  <input 
                     type="text" 
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold outline-none focus:border-amber-500 transition-all text-slate-900"
                     value={form.phone}
                     onChange={(e) => setForm({...form, phone: e.target.value})}
                  />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Detailed Address</label>
               <textarea 
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-xs font-medium outline-none focus:border-amber-500 transition-all text-slate-900 resize-none"
                  value={form.address}
                  onChange={(e) => setForm({...form, address: e.target.value})}
               />
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-50">
               <button onClick={() => setDrawerOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
               <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="flex-1 py-4 bg-amber-500 text-white hover:bg-amber-400 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
               >
                  <Save size={16} /> {saving ? "Saving..." : "Register Partner"}
               </button>
            </div>
         </div>
      </Drawer>
    </div>
  );
}
