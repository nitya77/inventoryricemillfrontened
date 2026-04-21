"use client";

import { 
  HardHat, Drill, Pickaxe, Users, ArrowLeftRight, 
  BarChart3, TrendingUp, AlertCircle, Box, 
  ArrowUpRight, ShoppingCart, Briefcase, Settings
} from "lucide-react";
import Link from "next/link";

export default function ConstructionModuleIndex() {
  return (
    <div className="space-y-10 pb-20">
      {/* Hero Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-amber-500/10 transition-all duration-700" />
         <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
               <span className="w-8 h-[2px] bg-amber-500 rounded-full" />
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Site Command Center</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Welcome to Site Operations</h1>
            <p className="text-slate-500 font-medium text-sm max-w-lg">Manage heavy machinery, raw site materials, and contractor workflows from a single unified workspace.</p>
         </div>
         <div className="flex items-center gap-4 relative z-10">
            <Link href="/construction/inventory" className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-95">
               Manage Machinery
            </Link>
         </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Link href="/construction/inventory" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:border-amber-500 transition-all group">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all">
               <Drill size={24} />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Machinery Master</h3>
            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">Track JCBs, Mixers, and heavy equipment health.</p>
         </Link>

         <Link href="/construction/materials" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:border-emerald-500 transition-all group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all">
               <Pickaxe size={24} />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Materials Stock</h3>
            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">Inventory for Gravel, Sand, and Steel grades.</p>
         </Link>

         <Link href="/construction/parties" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:border-indigo-500 transition-all group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all">
               <Users size={24} />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Contractors</h3>
            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">Manage site-vendors and specialized labor providers.</p>
         </Link>

         <Link href="/construction/ledger" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:border-rose-500 transition-all group">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-500 group-hover:text-white transition-all">
               <ArrowLeftRight size={24} />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Material Ledger</h3>
            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">Audit trail for inward purchases and site consumption.</p>
         </Link>
      </div>

      {/* Quick Stats Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -mb-48 -mr-48" />
            <div className="relative z-10 h-full flex flex-col">
               <div className="flex items-center justify-between mb-10">
                  <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em]">Project Velocity</h2>
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                     <TrendingUp size={16} /> Operational Efficiency UP
                  </div>
               </div>
               <div className="mt-auto grid grid-cols-3 gap-8">
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Materials On-Site</p>
                     <p className="text-3xl font-black tracking-tighter italic text-white">4,820 <span className="text-xs">MT</span></p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Machinery Active</p>
                     <p className="text-3xl font-black tracking-tighter italic text-white">12 <span className="text-xs">UNITS</span></p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Contractors</p>
                     <p className="text-3xl font-black tracking-tighter italic text-white">08 <span className="text-xs">ACTIVE</span></p>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 border border-amber-100 border-dashed">
               <AlertCircle size={40} />
            </div>
            <div>
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Supply Alerts</h3>
               <p className="text-[11px] text-slate-400 font-bold leading-relaxed px-6">Gravel (Gitti) is running low on project sites. Review ledger for recent consumption.</p>
            </div>
            <Link href="/construction/materials" className="text-xs font-black text-amber-600 uppercase tracking-widest hover:underline transition-all">Review Supplies</Link>
         </div>
      </div>
    </div>
  );
}
