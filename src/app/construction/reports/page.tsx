"use client";

import { 
  BarChart3, TrendingUp, TrendingDown, 
  ArrowUpRight, ArrowDownRight, HardHat, Pickaxe, Drill,
  Calendar, FileText, Download, Printer, ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConstructionReportsPage() {
  const router = useRouter();
  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => router.back()} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm">
               <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-amber-500 rounded-full" />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Analytics</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <BarChart3 size={32} /> Site Analytics
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Review resource consumption, machinery utilization, and stock trends.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-3 bg-white border border-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              <Download size={16} /> Export CSV
           </button>
           <button className="flex items-center gap-3 bg-amber-500 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-95">
              <Printer size={16} /> Print Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
               <TrendingUp size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Materials Intake</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">2,450 <span className="text-sm">Metric Tons</span></h3>
            <div className="mt-4 flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
               <ArrowUpRight size={14} /> +12.5% vs Prev Month
            </div>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
               <TrendingDown size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Consumption</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">1,820 <span className="text-sm">MT Consumed</span></h3>
            <div className="mt-4 flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest">
               <ArrowUpRight size={14} /> Higher Utilization Rate
            </div>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
               <Drill size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Machinery Active</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">12 <span className="text-sm">Units on Site</span></h3>
            <div className="mt-4 flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
               <CheckCircle2 size={14} /> All Systems Operational
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-32 text-center">
         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 mb-6 border-2 border-dashed border-slate-200">
            <BarChart3 size={40} />
         </div>
         <p className="text-xs font-black text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
            Detailed project-wise reports and machinery downtime analytics are currently being generated.
         </p>
      </div>
    </div>
  );
}
