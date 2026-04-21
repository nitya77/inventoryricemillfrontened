"use client";
import API_BASE_URL from "@/utils/api";

import { 
  ClipboardCheck, Calendar, ChevronLeft, ChevronRight, 
  Save, Search, User, CheckCircle2, XCircle, 
  Clock, MinusCircle, AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { alertSuccess, alertError } from "@/utils/alerts";

const STATUS_OPTS = [
  { id: "present", label: "Present", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { id: "absent", label: "Absent", icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  { id: "half", label: "Half-Day", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  { id: "late", label: "Late", icon: AlertCircle, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
];

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetEmployeeId = searchParams.get("employee_id");

  const [employees, setEmployees] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const selectedMonthYear = date.substring(0, 7);
  const isPastMonth = selectedMonthYear < currentMonthYear;

  const fetchData = async () => {
    setIsFetching(true);
    setAttendance({}); // Clear current state before loading new date
    setRemarks({});
    try {
      // Fetch employees
      const eRes = await fetch(`${API_BASE_URL}/api/employees`);
      const eData = await eRes.json();
      setEmployees(eData.items || []);

      // Fetch existing attendance for this date
      const d = new Date(date);
      const res = await fetch(`${API_BASE_URL}/api/employees/attendance?month=${d.getMonth()+1}&year=${d.getFullYear()}`);
      const aData = await res.json();
      
      const attMap: Record<number, string> = {};
      const remMap: Record<number, string> = {};
      aData.forEach((r: any) => {
        // Use a robust comparison for the date string
        const recordDate = new Date(r.attendance_date).toISOString().split('T')[0];
        if (recordDate === date) {
           attMap[r.employee_id] = r.status;
           remMap[r.employee_id] = r.remarks || "";
        }
      });
      setAttendance(attMap);
      setRemarks(remMap);

    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  const markAll = (status: string) => {
    const newAtt = { ...attendance };
    employees.forEach(e => newAtt[e.id] = status);
    setAttendance(newAtt);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([id, status]) => ({
        employee_id: parseInt(id),
        status,
        remarks: remarks[parseInt(id)] || ""
      }));

      const res = await fetch(`${API_BASE_URL}/api/employees/attendance/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, records })
      });

      if (res.ok) {
        alertSuccess(`Attendance saved for ${new Date(date).toLocaleDateString()}`);
      } else {
        alertError("Failed to save records");
      }
    } catch (err) { alertError("Communication error"); } finally { setSaving(false); }
  };

  const filteredEmployees = employees.filter(e => {
    // If targetEmployeeId is present, only show that employee
    if (targetEmployeeId && e.id.toString() !== targetEmployeeId) return false;
    
    return e.name.toLowerCase().includes(search.toLowerCase()) || 
           e.designation.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-indigo-500 rounded-full" />
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Daily Operations</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
             <ClipboardCheck size={32} /> Attendance Log
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Mark and track daily staff attendance records.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40">
           <button 
             onClick={() => {
                const d = new Date(date);
                d.setDate(d.getDate() - 1);
                setDate(d.toISOString().split('T')[0]);
             }}
             className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600"
           >
              <ChevronLeft size={20} />
           </button>
           <div className="flex flex-col items-center px-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marking For</span>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="text-xs font-black text-slate-900 tracking-widest uppercase outline-none cursor-pointer text-center bg-transparent" 
              />
           </div>
           <button 
              onClick={() => {
                const d = new Date(date);
                d.setDate(d.getDate() + 1);
                setDate(d.toISOString().split('T')[0]);
              }}
              className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600"
            >
              <ChevronRight size={20} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/10 flex flex-wrap items-center justify-between gap-6">
           <div className="relative flex-1 group min-w-[300px]">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Find staff..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all shadow-sm" 
              />
           </div>
           
           <div className="flex items-center gap-3">
              {isPastMonth ? (
                <div className="flex items-center gap-3 bg-amber-50 text-amber-700 px-6 py-3 rounded-xl border border-amber-200">
                   <AlertCircle size={18} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Historical Lock Active</span>
                </div>
              ) : (
                <>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Quick Mark:</span>
                  <button onClick={() => markAll('present')} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100">All Present</button>
                  <button onClick={() => markAll('absent')} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-100">All Absent</button>
                </>
              )}
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                    <th className="px-10 py-6">Staff Member</th>
                    <th className="px-10 py-6">Designation</th>
                    <th className="px-10 py-6">Notes / Remarks</th>
                    <th className="px-10 py-6 text-right">Attendance Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {isFetching ? (
                    Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={4} className="px-10 py-8 bg-slate-50/10"></td></tr>)
                 ) : filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="group hover:bg-slate-50/50 transition-all">
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-slate-900 text-indigo-400 rounded-xl flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {emp.name.charAt(0)}
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{emp.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{emp.phone || 'No Contact'}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-6 font-bold text-slate-500 text-xs uppercase tracking-widest leading-none">
                          {emp.designation}
                       </td>
                       <td className="px-10 py-6">
                           <input 
                             type="text" 
                             placeholder="Add note..."
                             value={remarks[emp.id] || ""}
                             onChange={(e) => setRemarks({...remarks, [emp.id]: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11px] font-bold focus:bg-white focus:border-indigo-300 transition-all outline-none"
                           />
                        </td>
                        <td className="px-10 py-6">
                           <div className="flex items-center justify-end gap-2">
                             {STATUS_OPTS.map((opt) => {
                                const active = attendance[emp.id] === opt.id;
                                return (
                                  <button
                                    key={opt.id}
                                    disabled={isPastMonth}
                                    onClick={() => setAttendance({...attendance, [emp.id]: opt.id})}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                                      active 
                                      ? `${opt.bg} ${opt.color} ${opt.border} font-black scale-105 shadow-md border-2` 
                                      : 'bg-white text-slate-400 border-slate-100 opacity-100'
                                    } ${isPastMonth ? 'cursor-not-allowed grayscale' : 'hover:border-indigo-200 hover:bg-slate-50'}`}
                                  >
                                     <opt.icon size={14} />
                                     <span className="text-[9px] uppercase tracking-widest">{opt.label}</span>
                                  </button>
                                );
                             })}
                          </div>
                       </td>
                    </tr>
                 ))}
                 {!isFetching && filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-32 text-center text-slate-300 font-black uppercase text-xs tracking-widest">
                         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200">
                            <User size={40} className="text-slate-200" />
                         </div>
                         No staff members found. <br />
                         <button onClick={() => router.push('/hrms/employees')} className="mt-4 text-indigo-500 hover:underline">Add employees first</button>
                      </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>

        <div className="p-10 border-t border-slate-100 bg-slate-50/30 flex justify-end">
           {!isPastMonth && (
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/40 active:scale-95 disabled:opacity-50"
              >
                 <Save size={18} /> {saving ? "Saving Records..." : "Save Daily Attendance"}
              </button>
           )}
        </div>
      </div>
    </div>
  );
}
