"use client";
import API_BASE_URL from "@/utils/api";

import { 
  ClipboardCheck, Calendar, ChevronLeft, ChevronRight, 
  Clock, AlertCircle, Filter as FilterIcon, ArrowLeft, Loader2,
  Download, Printer, FileSpreadsheet, Save, Search, User, CheckCircle2, XCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { alertSuccess, alertError } from "@/utils/alerts";

const STATUS_OPTS = [
  { id: "present", label: "P", color: "bg-emerald-500", text: "text-emerald-600" },
  { id: "absent", label: "A", color: "bg-rose-500", text: "text-rose-600" },
  { id: "half", label: "H", color: "bg-amber-500", text: "text-amber-600" },
  { id: "late", label: "L", color: "bg-indigo-500", text: "text-indigo-600" },
  { id: "off", label: "O", color: "bg-slate-400", text: "text-slate-500" },
];

export default function AttendanceMatrixPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState<Record<string, string>>({}); // Key: "empId_YYYY-MM-DD"
  const [isFetching, setIsFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const now = new Date();
  const isPastMonth = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth());

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const eRes = await fetch(`${API_BASE_URL}/api/employees`);
      const eData = await eRes.json();
      setEmployees(eData.items || []);

      const aRes = await fetch(`${API_BASE_URL}/api/employees/attendance?month=${month + 1}&year=${year}`);
      const aData = await aRes.json();
      
      const attMap: Record<string, string> = {};
      aData.forEach((r: any) => {
        const dStr = new Date(r.attendance_date).toISOString().split('T')[0];
        attMap[`${r.employee_id}_${dStr}`] = r.status;
      });
      setAttendance(attMap);
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const handleCellClick = (empId: number, day: number) => {
    if (isPastMonth) return; // Prevent editing past months
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const key = `${empId}_${dStr}`;
    const currentStatus = attendance[key] || "none";
    
    // Cycle through statuses: none -> present -> absent -> half -> late -> off -> none
    const sequence = ["none", "present", "absent", "half", "late", "off"];
    const currentIndex = sequence.indexOf(currentStatus);
    const nextStatus = sequence[(currentIndex + 1) % sequence.length];
    
    const newAtt = { ...attendance };
    if (nextStatus === "none") {
      delete newAtt[key];
    } else {
      newAtt[key] = nextStatus;
    }
    setAttendance(newAtt);
  };

  const isSunday = (day: number) => {
    return new Date(year, month, day).getDay() === 0;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Group by date to use bulk API (or modify API to handle multiple dates)
      // For now, I'll send individual dates in sequence or use a bulk endpoint
      const datesToSave = Object.keys(attendance).reduce((acc: any, key) => {
        const [id, date] = key.split('_');
        if (!acc[date]) acc[date] = [];
        acc[date].push({ employee_id: parseInt(id), status: attendance[key] });
        return acc;
      }, {});

      for (const dStr of Object.keys(datesToSave)) {
        await fetch(`${API_BASE_URL}/api/employees/attendance/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dStr, records: datesToSave[dStr] })
        });
      }
      alertSuccess("Monthly attendance data synchronized");
    } catch (err) { alertError("Failed to save changes"); } finally { setSaving(false); }
  };

  const downloadExcel = () => {
    // Generate CSV data
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    let csv = `Attendance Report - ${monthName} ${year}\n\n`;
    
    // Header row
    csv += "Staff Member,Designation," + daysArray.join(",") + "\n";
    
    // Employee rows
    employees.forEach(emp => {
      let row = `"${emp.name}","${emp.designation}"`;
      daysArray.forEach(day => {
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const status = attendance[`${emp.id}_${dStr}`];
        const label = STATUS_OPTS.find(o => o.id === status)?.label || (isSunday(day) ? "O" : "-");
        row += `,${label}`;
      });
      csv += row + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_${monthName}_${year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
     window.print();
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
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Bulk Marking</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
             <FilterIcon size={32} /> Monthly Grid Log
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Mark monthly attendance in a single grid. Sundays are highlighted as default off.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40">
           <button 
             onClick={() => setCurrentDate(new Date(currentDate.setMonth(month - 1)))} 
             className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600"
           >
              <ChevronLeft size={20} />
           </button>
           <div className="flex flex-col items-center px-6 min-w-[140px]">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Grid For</span>
              <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{currentDate.toLocaleString('default', { month: 'long' })} {year}</span>
           </div>
           <button 
             onClick={() => setCurrentDate(new Date(currentDate.setMonth(month + 1)))} 
             className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-indigo-600"
           >
              <ChevronRight size={20} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden relative">
         {saving && (
           <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="text-indigo-600 animate-spin" size={48} />
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Synchronizing Monthly Records...</p>
           </div>
         )}

        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <span className="w-8 h-[2px] bg-indigo-500 rounded-full" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Smart Click Sequence</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                 {[
                   { clicks: 1, label: "Present", color: "bg-emerald-500" },
                   { clicks: 2, label: "Absent", color: "bg-rose-500" },
                   { clicks: 3, label: "Half-Day", color: "bg-amber-500" },
                   { clicks: 4, label: "Late", color: "bg-indigo-500" },
                   { clicks: 5, label: "Off", color: "bg-slate-400" },
                 ].map(step => (
                   <div key={step.clicks} className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-200 transition-all group">
                      <div className="w-6 h-6 bg-slate-900 border border-white/20 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">{step.clicks}x</div>
                      <div className={`w-2 h-2 rounded-full ${step.color}`} />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{step.label}</span>
                   </div>
                 ))}
              </div>
           </div>
           {isPastMonth ? (
              <div className="flex items-center gap-3 bg-amber-50 text-amber-700 px-8 py-4 rounded-2xl border border-amber-200 shadow-sm">
                 <AlertCircle size={20} />
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">ReadOnly Mode</p>
                    <p className="text-[9px] font-bold opacity-70">Historical records are locked</p>
                 </div>
              </div>
           ) : (
              <>
                  <button 
                    onClick={downloadExcel}
                    className="flex items-center gap-3 bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95 no-print"
                  >
                     <FileSpreadsheet size={18} className="text-emerald-600" /> Export Excel
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-3 bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95 no-print"
                  >
                     <Printer size={18} className="text-indigo-600" /> Print Log
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/40 active:scale-95 disabled:opacity-50 shrink-0 no-print"
                  >
                     <Save size={18} /> {saving ? "Saving..." : "Save Grid Data"}
                  </button>
               </>
           )}
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/10">
                    <th className="px-8 py-5 sticky left-0 bg-white z-20 border-r border-slate-100 min-w-[200px] shadow-[5px_0_10px_-5px_rgba(0,0,0,0.05)]">Staff Member</th>
                    {daysArray.map(day => (
                      <th 
                        key={day} 
                        className={`px-1 py-5 text-center border-r border-slate-50 min-w-[45px] ${isSunday(day) ? 'bg-rose-50/50 text-rose-600' : ''}`}
                      >
                        {day}<br/>
                        <span className="text-[7px] opacity-60">{new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</span>
                      </th>
                    ))}
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {isFetching ? (
                    Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={daysInMonth + 1} className="h-16 bg-slate-50/10 px-8"></td></tr>)
                 ) : employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-slate-100 transition-colors">
                       <td className="px-8 py-4 sticky left-0 bg-white z-10 border-r border-slate-200 font-bold shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
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
                          const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const status = attendance[`${emp.id}_${dStr}`];
                          const opt = STATUS_OPTS.find(o => o.id === status);
                          const sun = isSunday(day);
                          
                          return (
                            <td 
                              key={day} 
                              onClick={() => handleCellClick(emp.id, day)}
                              className={`px-1 py-2 border-r border-slate-100 text-center ${sun ? 'bg-rose-50/50' : 'bg-white'} ${isPastMonth ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                            >
                               <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm transition-all ${
                                 opt 
                                 ? `${opt.color} text-white border-transparent` 
                                 : sun 
                                   ? 'bg-rose-100 border-rose-200 text-rose-500' 
                                   : 'bg-slate-50 border-slate-200 text-slate-300'
                               }`}>
                                  {opt ? opt.label : sun ? 'O' : '-'}
                               </div>
                            </td>
                          );
                       })}
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
