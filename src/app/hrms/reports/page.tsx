"use client";
import API_BASE_URL from "@/utils/api";

import { 
  BarChart3, Calendar, ChevronLeft, ChevronRight, 
  Download, Printer, ArrowLeft, Filter as FilterIcon, Users, 
  CheckCircle2, XCircle, Clock, AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AttendanceReportPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFetching, setIsFetching] = useState(true);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const eRes = await fetch(`${API_BASE_URL}/api/employees`);
      const eData = await eRes.json();
      setEmployees(eData.items || []);

      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const aRes = await fetch(`${API_BASE_URL}/api/employees/attendance?month=${month}&year=${year}`);
      const aData = await aRes.json();
      setAttendance(aData);
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getStatus = (empId: number, day: number) => {
     // Check for attendance on this specific day
     const dayStr = `${year}-${String(currentDate.getMonth()+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
     const record = attendance.find(r => r.employee_id === empId && r.attendance_date.split('T')[0] === dayStr);
     return record ? record.status : null;
  };

  const statusIcons: any = {
    present: { label: 'P', color: 'bg-emerald-500' },
    absent: { label: 'A', color: 'bg-rose-500' },
    half: { label: 'H', color: 'bg-amber-500' },
    late: { label: 'L', color: 'bg-indigo-500' }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => router.back()} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
               <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-indigo-500 rounded-full" />
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Audit Reports</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
             <BarChart3 size={32} /> Monthly Attendance
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Monthly employee-wise attendance matrix and productivity report.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40">
           <button 
             onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} 
             className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600"
           >
              <ChevronLeft size={20} />
           </button>
           <div className="flex flex-col items-center px-6">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Report For</span>
              <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{monthName} {year}</span>
           </div>
           <button 
             onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} 
             className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600"
           >
              <ChevronRight size={20} />
           </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
               <CheckCircle2 size={24} />
            </div>
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Present Status</p>
               <h4 className="text-sm font-black text-slate-900">High Reliability</h4>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
               <XCircle size={24} />
            </div>
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Absent Rate</p>
               <h4 className="text-sm font-black text-slate-900">Monthly Audit</h4>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
              <FilterIcon size={18} className="text-indigo-500" /> Attendance Matrix
           </h2>
           <div className="flex items-center gap-2">
              {Object.entries(statusIcons).map(([key, val]: any) => (
                <div key={key} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl">
                   <div className={`w-2 h-2 rounded-full ${val.color}`} />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{key}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/10">
                    <th className="px-8 py-5 sticky left-0 bg-white z-10 border-r border-slate-100 min-w-[200px]">Staff Member</th>
                    {daysArray.map(day => (
                      <th key={day} className="px-3 py-5 text-center border-r border-slate-50 min-w-[40px]">{day}</th>
                    ))}
                    <th className="px-6 py-5 text-center bg-emerald-50 text-emerald-600 font-black">Total P</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {isFetching ? (
                    Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={daysInMonth + 2} className="h-16 bg-slate-50/10 px-8"></td></tr>)
                 ) : employees.map((emp) => {
                    let presentCount = 0;
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/30 transition-all group">
                        <td className="px-8 py-5 sticky left-0 bg-white z-10 border-r border-slate-100 group-hover:bg-slate-50 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-900 text-indigo-400 rounded-lg flex items-center justify-center text-[10px] font-black">
                                 {emp.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate">{emp.name}</p>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">{emp.designation}</p>
                              </div>
                           </div>
                        </td>
                        {daysArray.map(day => {
                           const status = getStatus(emp.id, day);
                           if (status === 'present') presentCount++;
                           const icon = status ? statusIcons[status] : null;
                           return (
                             <td key={day} className="px-1 py-1 border-r border-slate-50">
                                {icon ? (
                                  <div className={`w-7 h-7 mx-auto rounded-lg ${icon.color} text-white flex items-center justify-center text-[9px] font-black shadow-sm`}>
                                     {icon.label}
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 mx-auto rounded-lg bg-slate-50 border border-slate-100 border-dashed" />
                                )}
                             </td>
                           );
                        })}
                        <td className="px-6 py-5 text-center bg-emerald-50/50 text-emerald-700 font-black text-xs italic">
                           {presentCount}
                        </td>
                      </tr>
                    )
                 })}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
