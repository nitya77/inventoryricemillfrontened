"use client";
import API_BASE_URL from "@/utils/api";

import { 
  Users, Plus, Search, Phone, Briefcase, 
  Calendar, Trash2, Edit3, X, Save, 
  UserPlus, MapPin, DollarSign, ArrowLeft, MinusCircle, FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { alertSuccess, alertError } from "@/utils/alerts";

const SALARY_TYPES = ["Monthly", "Daily"];
const DESIGNATIONS = ["Manager", "Operator", "Supervisor", "Accounts", "Labor", "Security", "Driver"];

function Drawer({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden border-l border-slate-100">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em]">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 text-slate-900">{children}</div>
      </div>
    </>
  );
}

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    designation: "Operator", 
    phone: "", 
    salary_type: "Monthly", 
    basic_salary: "0",
    dob: "",
    joining_date: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, totalItems: 0 });

  const fetchEmployees = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees?search=${search}&page=${page}&limit=9&include_deactivated=true`);
      const data = await res.json();
      if (data.items) { 
        setEmployees(data.items); 
        setMeta(data.meta);
      }
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, page]);

  // Reset page on search
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleSave = async () => {
    if (!form.name) return alertError("Employee Name is required");
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setDrawerOpen(false);
        fetchEmployees();
        alertSuccess("Employee registered successfully");
        setForm({ name: "", designation: "Operator", phone: "", salary_type: "Monthly", basic_salary: "0", dob: "", joining_date: new Date().toISOString().split('T')[0] });
      } else {
        alertError(data.error || "Failed to save employee");
      }
    } catch (err) { alertError("Server error"); } finally { setSaving(false); }
  };

  const toggleStatus = async (emp: any) => {
    const newStatus = emp.status === 'active' ? 'deactive' : 'active';
    if (!confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this employee?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/${emp.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        alertSuccess(`Employee ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        fetchEmployees();
      }
    } catch (err) { alertError("Toggle failed"); }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-indigo-500 rounded-full" />
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">HR Management</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
             <Users size={32} /> Employee Registry
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Manage staff profiles, designations, and salary structures.</p>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-3 bg-indigo-600 text-white px-7 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
          <UserPlus size={18} /> Register Staff
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/10 flex gap-4">
          <div className="relative flex-1 group max-w-xl">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
             <input 
              type="text" 
              placeholder="Search by Employee Name, ID or Phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all shadow-sm" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
           {isFetching ? (
             Array(6).fill(0).map((_, i) => <div key={i} className="h-48 bg-slate-50 rounded-[2rem] animate-pulse"></div>)
           ) : employees.length === 0 ? (
             <div className="col-span-full py-32 text-center text-slate-300 font-black uppercase text-xs tracking-widest">No employees found</div>
           ) : employees.map((emp) => (
             <div 
               key={emp.id} 
               onClick={() => router.push(`/hrms/employees/${emp.id}/ledger`)}
               className="group bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-600/10 transition-all cursor-pointer relative overflow-hidden"
             >
                <div className="flex items-start justify-between mb-6">
                   <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      {emp.name.charAt(0)}
                   </div>
                   <div className="flex-1 ml-4 overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{emp.name}</h4>
                         <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                           emp.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                         }`}>
                           {emp.status}
                         </span>
                      </div>
                   </div>
                </div>
                
                <div className="p-5 flex items-center justify-between border-t border-slate-50 bg-slate-50/20 rounded-2xl">
                   <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <span className="text-[10px] font-black uppercase tracking-widest">{emp.designation}</span>
                   </div>
                   <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => toggleStatus(emp)}
                        className={`p-2 transition-all rounded-lg ${
                          emp.status === 'active' ? 'text-rose-400 hover:bg-rose-50 hover:text-rose-600' : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                        title={emp.status === 'active' ? "Deactivate" : "Activate"}
                      >
                         {emp.status === 'active' ? <MinusCircle size={14} /> : <UserPlus size={14} />}
                      </button>
                      <button className="p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all rounded-lg">
                         <Edit3 size={14} />
                      </button>
                   </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-500">
                         <Phone size={12} className="text-slate-300" />
                         <span className="text-[11px] font-black">{emp.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                         <DollarSign size={12} className="text-slate-300" />
                         <span className="text-[10px] font-black uppercase tracking-widest">{emp.salary_type}: ₹{Number(emp.basic_salary).toLocaleString()}</span>
                      </div>
                   </div>
                   <button 
                     onClick={() => router.push(`/attendance?employee_id=${emp.id}`)}
                     className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 rounded-xl transition-all"
                     title="View Attendance"
                   >
                      <Calendar size={18} />
                   </button>
                </div>
             </div>
           ))}
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-900">{employees.length}</span> of <span className="text-slate-900">{meta.totalItems}</span> staff members
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: meta.totalPages }, (_, i) => (
                  <button
                    key={i+1}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                      page === i + 1 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                      : "bg-white text-slate-400 border border-slate-100 hover:border-indigo-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all rotate-180"
              >
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Register New Employee">
         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Employee Full Name *</label>
               <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-all"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Designation</label>
                  <select 
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-all cursor-pointer"
                     value={form.designation}
                     onChange={(e) => setForm({...form, designation: e.target.value})}
                  >
                     {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Contact Number</label>
                  <input 
                     type="text" 
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-all"
                     value={form.phone}
                     onChange={(e) => setForm({...form, phone: e.target.value})}
                  />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Salary Type</label>
                  <select 
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-all cursor-pointer"
                     value={form.salary_type}
                     onChange={(e) => setForm({...form, salary_type: e.target.value})}
                  >
                     {SALARY_TYPES.map(s => <option key={s}>{s}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Basic Salary (₹)</label>
                  <input 
                     type="number" 
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-all"
                     value={form.basic_salary}
                     onChange={(e) => setForm({...form, basic_salary: e.target.value})}
                  />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Date of Birth</label>
                  <input 
                     type="date" 
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-all"
                     value={form.dob}
                     onChange={(e) => setForm({...form, dob: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Joining Date</label>
                  <input 
                     type="date" 
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-all"
                     value={form.joining_date}
                     onChange={(e) => setForm({...form, joining_date: e.target.value})}
                  />
               </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-100">
               <button onClick={() => setDrawerOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
               <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="flex-1 py-4 bg-indigo-600 text-white hover:bg-indigo-500 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
               >
                  <Save size={16} /> {saving ? "Saving..." : "Register Employee"}
               </button>
            </div>
         </div>
      </Drawer>
    </div>
  );
}
