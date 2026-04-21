"use client";
import API_BASE_URL from "@/utils/api";
import { 
  Tag, Search, Plus, Trash2, Edit2, ChevronRight, 
  Layers, Filter, Box, X, Save
} from "lucide-react";
import { useState, useEffect } from "react";

function Drawer({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
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

export default function VarietyMasterPage() {
  const [varieties, setVarieties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchVarieties = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/varieties?search=${search}`);
      const data = await res.json();
      setVarieties(data);
    } catch (err) {
      console.error("Failed to fetch varieties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchVarieties, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => {
    setForm({ name: "", description: "" });
    setDrawerMode("add");
    setSelectedId(null);
    setError("");
    setDrawerOpen(true);
  };

  const openEdit = (v: any) => {
    setForm({ name: v.name, description: v.description || "" });
    setDrawerMode("edit");
    setSelectedId(v.id);
    setError("");
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Variety name is required"); return; }
    setSaving(true);
    try {
      const url = drawerMode === "add" ? `${API_BASE_URL}/api/varieties` : `${API_BASE_URL}/api/varieties/${selectedId}`;
      const res = await fetch(url, {
        method: drawerMode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to save");
      setDrawerOpen(false);
      fetchVarieties();
    } catch (err) {
      setError("Failed to save variety");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete variety "${name}"?`)) return;
    try {
      await fetch(`${API_BASE_URL}/api/varieties/${id}`, { method: "DELETE" });
      fetchVarieties();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-indigo-600 rounded-full" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Master Data</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Tag size={32} /> Variety Master
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Centrally manage and standardize variety names across the enterprise.
          </p>
        </div>
        <button 
          onClick={openAdd}
          className="bg-slate-900 hover:bg-indigo-600 text-white px-7 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95"
        >
          <Plus size={18} /> Register Variety
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex gap-4 bg-slate-50/30">
          <div className="relative flex-1 group max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search varieties..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-10 py-6">ID</th>
                <th className="px-10 py-6">Variety Name</th>
                <th className="px-10 py-6">Description</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-10 py-10 bg-slate-50/10"></td>
                  </tr>
                ))
              ) : varieties.length > 0 ? (
                varieties.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-10 py-7">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">#VAR-{v.id}</span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          <Box size={18} />
                        </div>
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className="text-xs text-slate-500 font-medium">{v.description || 'No description provided'}</span>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEdit(v)}
                          className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(v.id, v.name)}
                          className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Layers size={40} className="text-slate-200" />
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Varieties Identified</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        title={drawerMode === "add" ? "Register New Variety" : "Edit Variety"}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Variety Name *</label>
            <input 
              type="text" 
              placeholder="e.g. PR-126, Basmati 1121" 
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Description</label>
            <textarea 
              placeholder="Additional details about this variety..." 
              value={form.description}
              rows={4}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm resize-none" 
            />
          </div>
          {error && <p className="text-xs font-black text-red-500 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">{error}</p>}
          <div className="flex gap-3 pt-6 border-t border-slate-100">
            <button onClick={() => setDrawerOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="flex-1 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50"
            >
              <Save size={16} /> {saving ? "Saving..." : drawerMode === "add" ? "Register Variety" : "Save Changes"}
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
