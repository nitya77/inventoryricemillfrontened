"use client";
import API_BASE_URL from "@/utils/api";

import { 
  Package, 
  ShoppingCart, 
  Wallet, 
  Factory, 
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle2,
  Activity,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";

function StatCard({ icon: Icon, label, value, trend, trendValue, color, bg, border }: any) {
  return (
    <div className={`bg-white p-6 rounded-3xl border ${border} shadow-sm group hover:border-indigo-200 transition-all hover:shadow-xl hover:shadow-slate-200/50 relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${bg} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-2xl ${bg} ${color} shadow-sm group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg ${
              trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trendValue}
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none mb-3">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aggregate</span>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">Operational Pulse</span>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardHub() {
  const [stats, setStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard/stats`),
          fetch(`${API_BASE_URL}/api/dashboard/activity`)
        ]);
        
        const statsData = await statsRes.json();
        const activityData = await activityRes.json();

        setStats([
          { label: "Material Intake", value: statsData.materialIntake, trend: "up", trendValue: "+100%", icon: ShoppingCart, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", unit: "Kg" },
          { label: "Refined Output", value: statsData.refinedOutput, trend: "up", trendValue: "LIVE", icon: Package, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", unit: "Kg" },
          { label: "Fresh Paddy Stock", value: statsData.freshPaddyStock, trend: "up", trendValue: "AVAILABLE", icon: Zap, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", unit: "Kg" },
          { label: "Live Milling", value: statsData.liveMilling, trend: "up", trendValue: "PROCESSING", icon: Factory, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", unit: "Batch" },
          { label: "Projected Rev", value: statsData.projectedRev, trend: "up", trendValue: "REVENUE", icon: Wallet, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", unit: "Total" },
        ]);
        setActivities(activityData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-10 pb-16">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="flex w-2 h-2 rounded-full bg-indigo-600" />
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Enterprise HQ</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Command Center</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Real-time surveillance of mill operations and global logistics.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1">
              <button className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all">Live Metrics</button>
              <button className="px-5 py-2.5 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-slate-900 transition-all">Deep Analytics</button>
           </div>
           <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-900 hover:border-indigo-600 transition-all shadow-sm">
              <Zap size={20} />
           </button>
        </div>
      </div>

      {/* Primary Intelligence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 h-48 animate-pulse shadow-sm" />
          ))
        ) : (
          stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Activity Surveillance */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                 <Activity size={18} className="text-indigo-600" /> Activity Surveillance Log
              </h2>
            </div>
            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-4 py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all">Export Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Operational ID</th>
                  <th className="px-8 py-6">Workflow</th>
                  <th className="px-8 py-6">Varietal</th>
                  <th className="px-8 py-6">Metric Vol</th>
                  <th className="px-8 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activities.length > 0 ? (
                  activities.map((row) => (
                    <tr key={`${row.type}-${row.id}`} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-6 text-xs font-black text-slate-400 group-hover:text-indigo-600 transition-colors uppercase tracking-widest truncate max-w-[120px]">
                        {row.type === 'Intake' ? `PROC-${row.id}` : row.type === 'Milling' ? `BATCH-${row.id}` : `INV-${row.id}`}
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-slate-900">
                        {row.type === 'Intake' ? 'Material Intake' : row.type === 'Milling' ? 'Production Milling' : 'Sales Dispatch'}
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight py-1 px-2 bg-slate-100 rounded-md">{row.variety}</span>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-slate-900 italic tracking-tight">
                        {Number(row.qty).toLocaleString()} Kg
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                          row.status === 'Verified' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          row.status === 'Processing' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      {isLoading ? 'Synchronizing Datastreams...' : 'No Recent Activity Detected'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global System Health */}
        <div className="space-y-8">
           <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-bl-[100px] -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-indigo-400 mb-8 shadow-inner">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-black mb-3 tracking-tighter">Nodes Synchronized</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-10 opacity-80">All milling infrastructure is performing within optimal yield thresholds (68.4% Efficiency).</p>
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95">Download System Audit</button>
              </div>
           </div>
           
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4 shadow-sm opacity-60">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                 <Package size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-relaxed">Advanced predictive modules<br/>pending data integration...</p>
           </div>
        </div>
      </div>
    </div>
  );
}
