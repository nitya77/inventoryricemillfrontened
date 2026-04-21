"use client";
import API_BASE_URL from "@/utils/api";

import { 
  ClipboardCheck, Calendar, ChevronLeft, ChevronRight, 
  Download, Printer, FileSpreadsheet, ArrowLeft, Loader2,
  DollarSign, Briefcase, User, CalendarDays
} from "lucide-react";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTS = [
  { id: 'present', label: 'P', color: 'bg-emerald-500', bg: 'bg-emerald-50', icon: ClipboardCheck, border: 'border-emerald-200' },
  { id: 'absent', label: 'A', color: 'bg-rose-500', bg: 'bg-rose-50', icon: Calendar, border: 'border-rose-200' },
  { id: 'half', label: 'H', color: 'bg-amber-500', bg: 'bg-amber-50', icon: Calendar, border: 'border-amber-200' },
  { id: 'late', label: 'L', color: 'bg-indigo-500', bg: 'bg-indigo-50', icon: Download, border: 'border-indigo-200' },
  { id: 'off', label: 'O', color: 'bg-slate-400', bg: 'bg-slate-50', icon: Calendar, border: 'border-slate-200' },
];

export default function EmployeeLedgerPage({ params: paramsPromise }: any) {
  const params: any = use(paramsPromise);
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFetching, setIsFetching] = useState(true);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      // Fetch employee info
      const eRes = await fetch(`${API_BASE_URL}/api/employees/${params.id}`);
      const eData = await eRes.json();
      setEmployee(eData);

      // Fetch attendance
      const aRes = await fetch(`${API_BASE_URL}/api/employees/${params.id}/attendance?month=${month + 1}&year=${year}`);
      const aData = await aRes.json();
      setAttendance(aData);
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const getDayStatus = (day: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendance.find(a => new Date(a.attendance_date).toISOString().split('T')[0] === dStr);
  };

  const isSunday = (day: number) => new Date(year, month, day).getDay() === 0;

  const downloadExcel = () => {
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    let csv = `Employee Ledger: ${employee?.name}\n`;
    csv += `Designation: ${employee?.designation}\n`;
    csv += `Salary Type: ${employee?.salary_type}\n`;
    csv += `Period: ${monthName} ${year}\n\n`;
    csv += "Date,Day,Status,Remarks\n";

    daysArray.forEach(day => {
      const record = getDayStatus(day);
      const dayName = new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'long' });
      const status = record ? record.status.toUpperCase() : (isSunday(day) ? "OFF" : "-");
      const remarks = record?.remarks || "";
      csv += `${day}/${month + 1}/${year},${dayName},${status},"${remarks}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${employee?.name}_Ledger_${monthName}_${year}.csv`);
    link.click();
  };

  if (!employee && isFetching) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-10 pb-20">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 no-print">
          <div>
             <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all group mb-4">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Back to Registry</span>
             </button>
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400">
                   {employee?.name.charAt(0)}
                </div>
                {employee?.name}'s Ledger
             </h1>
          </div>

          <div className="flex items-center gap-4">
             <div className="bg-white border border-slate-200 px-6 py-4 rounded-3xl flex items-center gap-4">
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(month - 1)))}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                >
                   <ChevronLeft size={20} />
                </button>
                <div className="text-center min-w-[120px]">
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">{currentDate.toLocaleString('default', { month: 'long' })}</p>
                   <p className="text-xs font-black text-slate-900 mt-1">{year}</p>
                </div>
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(month + 1)))}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                >
                   <ChevronRight size={20} />
                </button>
             </div>
             <button onClick={downloadExcel} className="p-5 bg-indigo-600 text-white rounded-3xl hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all">
                <FileSpreadsheet size={20} />
             </button>
          </div>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
          {[
            { label: "Designation", value: employee?.designation || "N/A", icon: Briefcase, color: "text-blue-500" },
            { label: "Salary Type", value: employee?.salary_type || "N/A", icon: DollarSign, color: "text-emerald-500" },
            { label: "Basic Pay", value: `₹${Number(employee?.basic_salary || 0).toLocaleString()}`, icon: DollarSign, color: "text-amber-500" },
            { label: "Total Present", value: attendance.filter(a => a.status === 'present').length, icon: User, color: "text-indigo-500" },
          ].map((stat, i) => (
             <div key={i} className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                   <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
                      <stat.icon size={20} />
                   </div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight lowercase first-letter:uppercase">{stat.value}</p>
             </div>
          ))}
       </div>

       {/* Attendance Table */}
       <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <th className="px-10 py-6">Date</th>
                   <th className="px-10 py-6">Day</th>
                   <th className="px-10 py-6">Status</th>
                   <th className="px-10 py-6">Remarks / Justification</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {daysArray.map(day => {
                  const record = getDayStatus(day);
                  const dayDate = new Date(year, month, day);
                  const sun = dayDate.getDay() === 0;
                  const opt = STATUS_OPTS.find(o => o.id === record?.status);

                  return (
                    <tr key={day} className={`hover:bg-slate-50/50 transition-colors ${sun ? 'bg-rose-50/30' : ''}`}>
                       <td className="px-10 py-5">
                          <span className="text-xs font-black text-slate-900">{day} {currentDate.toLocaleString('default', { month: 'short' })}</span>
                       </td>
                       <td className="px-10 py-5 uppercase tracking-widest text-[10px] font-black text-slate-400">
                          {dayDate.toLocaleDateString('en-US', { weekday: 'long' })}
                       </td>
                       <td className="px-10 py-5">
                          {opt ? (
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${opt.bg} ${opt.color} ${opt.border}`}>
                               <opt.icon size={12} className="opacity-80" />
                               <span className="text-[9px] font-black uppercase tracking-widest">{opt.id}</span>
                            </div>
                          ) : sun ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-50 text-slate-400 border-slate-100">
                               <CalendarDays size={12} className="opacity-80" />
                               <span className="text-[9px] font-black uppercase tracking-widest">Off</span>
                            </div>
                          ) : (
                            <span className="text-slate-200 font-bold ml-4">-</span>
                          )}
                       </td>
                       <td className="px-10 py-5">
                          <p className="text-[11px] font-bold text-slate-600 max-w-sm italic">
                             {record?.remarks || (sun ? "Weekly Holiday" : "")}
                          </p>
                       </td>
                    </tr>
                  )
                })}
             </tbody>
          </table>
       </div>
    </div>
  );
}
