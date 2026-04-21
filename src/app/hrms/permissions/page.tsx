"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import { Shield, ShieldAlert, Key, CheckCircle2, Factory, Briefcase, ShoppingCart, Users, Zap, X, Save } from "lucide-react";

export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<any[]>([
    { id: 1, name: "Administrator", permissions: { hrm: true, milling: true, construction: true } },
    { id: 2, name: "Manager / Lead", permissions: { hrm: false, milling: true, construction: true } },
    { id: 3, name: "Regular Staff", permissions: { hrm: false, milling: true, construction: false } }
  ]);
  
  const modulesList = [
    { key: "milling", label: "Milling Core", icon: Factory },
    { key: "construction", label: "Construction", icon: Briefcase },
    { key: "hrm", label: "HRM & Employees", icon: Users },
  ];

  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/roles`);
      const data = await res.json();
      if (res.ok && data.length > 0) setRoles(data);
    } catch (err) { console.error("Failed to load roles", err); }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const togglePermission = (roleId: number, modKey: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [modKey]: !r.permissions[modKey]
          }
        };
      }
      return r;
    }));
  };

  const handleSave = async (roleId: number) => {
    setSaving(true);
    const roleToSave = roles.find(r => r.id === roleId);
    if (!roleToSave) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/roles/${roleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleToSave.name, permissions: roleToSave.permissions })
      });
      if (res.ok) alert("Role Permissions updated successfully in Database.");
      else alert("Failed to save changes.");
    } catch (err) { alert("API Connection error."); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-10 pb-20 p-6 md:p-10 min-h-screen bg-slate-50/50">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-indigo-600 rounded-full" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Administration</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Shield size={32} /> Role Matrix
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Configure security policies, module access, and user groups.</p>
        </div>
      </div>

      {/* Main Grid Matrix */}
      <div className="grid grid-cols-1 gap-8">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative group">
            {role.name === "Administrator" && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full translate-x-10 -translate-y-10 opacity-60 z-0 pointer-events-none" />
            )}
            
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between relative z-10">
               <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-white border border-slate-200 text-slate-700 shadow-sm rounded-2xl flex items-center justify-center group-hover:border-indigo-200 group-hover:text-indigo-600 transition-colors">
                   <Key size={24} />
                 </div>
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter shadow-sm">{role.name}</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global ID: ROLE-00{role.id}</p>
                 </div>
               </div>
               
               <button 
                 onClick={() => handleSave(role.id)} 
                 disabled={saving}
                 className="hidden sm:flex bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest items-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-50"
               >
                 <Save size={16} /> Save Policy
               </button>
            </div>

            <div className="p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
               {modulesList.map((mod) => {
                 const hasAccess = !!role.permissions[mod.key];
                 return (
                   <div 
                     key={mod.key} 
                     onClick={() => togglePermission(role.id, mod.key)}
                     className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-4 text-center ${
                       hasAccess 
                       ? "bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-100/50 hover:bg-indigo-100" 
                       : "bg-slate-50 border-slate-100 opacity-60 hover:opacity-100 hover:bg-slate-100"
                     }`}
                   >
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hasAccess ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30" : "bg-white text-slate-400 border border-slate-200"}`}>
                       <mod.icon size={20} />
                     </div>
                     <div>
                       <div className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap mb-1 text-slate-700">{mod.label}</div>
                       <div className={`text-[9px] font-black uppercase flex items-center justify-center gap-1 ${hasAccess ? "text-indigo-600" : "text-slate-400"}`}>
                         {hasAccess ? <><CheckCircle2 size={12} /> Granted</> : <><X size={12} /> Revoked</>}
                       </div>
                     </div>
                   </div>
                 );
               })}
            </div>
            
            {/* Mobile save button */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 sm:hidden">
               <button 
                 onClick={() => handleSave(role.id)} 
                 disabled={saving}
                 className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-50"
               >
                 <Save size={16} /> Save {role.name} Policy
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
