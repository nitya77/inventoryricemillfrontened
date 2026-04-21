"use client";
import API_BASE_URL from "@/utils/api";

import { 
  Shield, Plus, ShieldCheck, CheckSquare, Square, 
  Trash2, Edit3, Save, X, Users, Settings, Lock
} from "lucide-react";
import { useState, useEffect } from "react";
import { alertSuccess, alertError } from "@/utils/alerts";

const MODULES = [
  { id: "hrm", label: "HRM & Attendance", color: "bg-indigo-500" },
  { id: "milling", label: "Milling Op", color: "bg-emerald-500" },
  { id: "inventory", label: "Inventory & Stock", color: "bg-amber-500" },
  { id: "sales", label: "Sales & Dispatch", color: "bg-blue-500" },
  { id: "orders", label: "Orders & Booking", color: "bg-rose-500" },
  { id: "construction", label: "Construction", color: "bg-purple-500" },
  { id: "parties", label: "Master Data", color: "bg-slate-700" },
  { id: "reports", label: "Financial Reports", color: "bg-cyan-500" },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [form, setForm] = useState({ name: "", permissions: {} as Record<string, boolean> });
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/roles`);
      const data = await res.json();
      setRoles(data);
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleToggle = (modId: string) => {
    setForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [modId]: !prev.permissions[modId]
      }
    }));
  };

  const handleSave = async () => {
    if (!form.name) return alertError("Role Name is required");
    setSaving(true);
    try {
      const url = editingRole ? `${API_BASE_URL}/api/auth/roles/${editingRole.id}` : `${API_BASE_URL}/api/auth/roles`;
      const method = editingRole ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        alertSuccess(editingRole ? "Role updated" : "Role created");
        setDrawerOpen(false);
        setEditingRole(null);
        setForm({ name: "", permissions: {} });
        fetchRoles();
      }
    } catch (err) { alertError("Failed to save"); } finally { setSaving(false); }
  };

  const openEdit = (role: any) => {
    setEditingRole(role);
    setForm({ name: role.name, permissions: role.permissions || {} });
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-10 pb-20">
       <div className="flex items-center justify-between">
          <div>
             <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-[2px] bg-indigo-500 rounded-full" />
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Administration</span>
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                <Shield size={36} className="text-slate-900" /> Role Management
             </h1>
          </div>
          <button 
            onClick={() => { setEditingRole(null); setForm({ name: "", permissions: {} }); setDrawerOpen(true); }}
            className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
          >
             <Plus size={18} /> Define New Role
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map(role => (
             <div key={role.id} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all flex flex-col justify-between">
                <div>
                   <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-indigo-400">
                         <ShieldCheck size={22} />
                      </div>
                      <button onClick={() => openEdit(role)} className="p-3 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
                         <Edit3 size={16} />
                      </button>
                   </div>
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{role.name}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Access Permissions</p>
                   
                   <div className="flex flex-wrap gap-2">
                      {Object.entries(role.permissions || {}).filter(([_, v]) => v).map(([k]) => {
                        const mod = MODULES.find(m => m.id === k);
                        return (
                          <span key={k} className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full text-white ${mod?.color || 'bg-slate-400'}`}>
                             {mod?.label || k}
                          </span>
                        );
                      })}
                      {Object.values(role.permissions || {}).filter(v => v).length === 0 && (
                         <span className="text-[9px] font-bold text-slate-300 italic uppercase">No Permissions Assigned</span>
                      )}
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">?</div>
                   </div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Role</span>
                </div>
             </div>
          ))}
       </div>

       {/* Drawer */}
       {drawerOpen && (
         <>
           <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 animate-in fade-in" onClick={() => setDrawerOpen(false)} />
           <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-500">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                 <div>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Security Configuration</span>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{editingRole ? "Modify Authority" : "Define New Authority"}</h2>
                 </div>
                 <button onClick={() => setDrawerOpen(false)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Authority Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sales Manager, HR Assistant"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-8 py-5 text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none shadow-sm"
                    />
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                       <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <Lock size={14} className="text-indigo-500" /> Module Permissions
                       </h3>
                       <span className="text-[9px] font-black text-slate-400 uppercase">Select Modules to Grant Access</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                       {MODULES.map(mod => {
                         const active = !!form.permissions[mod.id];
                         return (
                           <button 
                             key={mod.id}
                             onClick={() => handleToggle(mod.id)}
                             className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${
                               active ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-slate-200"
                             }`}
                           >
                              <div className="flex items-center gap-4 text-left">
                                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${mod.color}`}>
                                    <ShieldCheck size={18} />
                                 </div>
                                 <div>
                                    <p className={`text-xs font-black uppercase tracking-tight ${active ? "text-indigo-600" : "text-slate-900"}`}>{mod.label}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Base Module Access</p>
                                 </div>
                              </div>
                              {active ? <CheckSquare size={22} className="text-indigo-600" /> : <Square size={22} className="text-slate-200" />}
                           </button>
                         )
                       })}
                    </div>
                 </div>
              </div>

              <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex gap-4">
                 <button onClick={() => setDrawerOpen(false)} className="flex-1 py-5 border border-slate-200 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white transition-all">Discard</button>
                 <button 
                   onClick={handleSave}
                   disabled={saving}
                   className="flex-[2] py-5 bg-indigo-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    <Save size={18} /> {saving ? "Applying Config..." : "Establish Role"}
                 </button>
              </div>
           </div>
         </>
       )}
    </div>
  );
}
