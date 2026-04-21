"use client";
import API_BASE_URL from "@/utils/api";
import { 
  ClipboardCheck, Search, Plus, Trash2, Edit2, ChevronRight, 
  Layers, Filter, Box, X, Save, Activity
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

export default function QualityMasterPage() {
  const [qualities, setQualities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchQualities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/qualities?search=${search}`);
      const data = await res.json();
      setQualities(data);
    } catch (err) {
      console.error("Failed to fetch qualities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchQualities, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => {
    setForm({ name: "", description: "" });
    setDrawerMode("add");
    setSelectedId(null);
    setError("");
    setDrawerOpen(true);
  };

  const openEdit = (q: any) => {
    setForm({ name: q.name, description: q.description || "" });
    setDrawerMode("edit");
    setSelectedId(q.id);
    setError("");
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Quality name is required"); return; }
    setSaving(true);
    try {
      const url = drawerMode === "add" ? `${API_BASE_URL}/api/qualities` : `${API_BASE_URL}/api/qualities/${selectedId}`;
      const res = await fetch(url, {
        method: drawerMode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to save");
      setDrawerOpen(false);
      fetchQualities();
    } catch (err) {
      setError("Failed to save quality");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete quality "${name}"?`)) return;
    try {
      await fetch(`${API_BASE_URL}/api/qualities/${id}`, { method: "DELETE" });
      fetchQualities();
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
            <ClipboardCheck size={32} className="text-indigo-600" /> Quality Master (Grades)
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Define and manage industrial quality grades and sorting specifications.
          </p>
        </div>
        <button 
          onClick={openAdd}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
        >
          <Plus size={18} /> Register Grade
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex gap-4 bg-slate-50/30">
          <div className="relative flex-1 group max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search grades..." 
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
                <th className="px-10 py-6">Grade / Quality Name</th>
                <th className="px-10 py-6">Specification</th>
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
              ) : qualities.length > 0 ? (
                qualities.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-10 py-7">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">#GRD-{q.id}</span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          <Activity size={18} />
                        </div>
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{q.name}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className="text-xs text-slate-500 font-medium">{q.description || 'No specific attributes defined'}</span>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEdit(q)}
                          className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(q.id, q.name)}
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
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Quality Grades Defined</p>
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
        title={drawerMode === "add" ? "Register New Grade" : "Edit Grade Specification"}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Grade Name *</label>
            <input 
              type="text" 
              placeholder="e.g. Fresh, Dull, Refined" 
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Description / Spec</label>
            <textarea 
              placeholder="Define the sorting standards for this grade..." 
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
              className="flex-1 py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
            >
              <Save size={16} /> {saving ? "Saving..." : drawerMode === "add" ? "Register Grade" : "Save Specification"}
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
