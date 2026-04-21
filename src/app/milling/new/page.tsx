"use client";
import API_BASE_URL from "@/utils/api";

import {
  Factory,
  Play,
  Scale,
  Zap,
  ArrowLeft,
  Save,
  Activity,
  Package,
  Percent,
  TrendingDown,
  Trash2,
  Box
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SearchableSelect from "@/components/SearchableSelect";

export default function NewMillingBatchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rawVarieties, setRawVarieties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    variety: "",
    varietyId: "",
    quality: "Fresh",
    qualityId: "",
    paddyInput: "",
    riceOutput: "",
    brokenOutput: "",
    branOutput: "",
    huskOutput: ""
  });

  useEffect(() => {
    const API_BASE = `${API_BASE_URL}/api`;
    fetch(`${API_BASE}/products?limit=1000`)
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          // Broaden filter to include anything "Raw" or labeled "Dhan/Paddy"
          const raw = data.items.filter((p: any) => 
            p.type === 'Raw' || 
            p.name.toLowerCase().includes("dhan") || 
            p.variety.toLowerCase().includes("dhan") ||
            p.name.toLowerCase().includes("paddy")
          );

          setRawVarieties(raw.map((p: any) => ({
            id: p.id,
            label: p.name || p.variety,
            subLabel: `${p.quality || 'Fresh'} Quality | ${Number(p.quantity).toLocaleString()} Kg in stock`,
            varietyName: p.variety,
            varietyId: p.variety_id,
            quality: p.quality || 'Fresh',
            qualityId: p.quality_id
          })));
        }
      })
      .catch(err => console.error("Milling product fetch failed:", err));
  }, []);

  const pInput = Number(formData.paddyInput) || 0;
  const rOutput = Number(formData.riceOutput) || 0;
  const bOutput = Number(formData.brokenOutput) || 0;
  const brOutput = Number(formData.branOutput) || 0;
  const hOutput = Number(formData.huskOutput) || 0;

  const totalOutput = rOutput + bOutput + brOutput + hOutput;
  const yieldPercentage = pInput > 0 ? (totalOutput / pInput) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/milling`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          paddyInput: Number(formData.paddyInput),
          riceOutput: Number(formData.riceOutput),
          brokenOutput: Number(formData.brokenOutput),
          branOutput: Number(formData.branOutput),
          huskOutput: Number(formData.huskOutput),
        }),
      });

      if (res.ok) {
        router.push("/milling");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <Link href="/milling" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-4 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Production Log</span>
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
             <Factory size={32} className="text-indigo-600" /> Refinement Output
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Industrial production batch finalization and automated yield recovery analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        {/* Production Console */}
        <div className="xl:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
               <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Play size={18} className="text-indigo-600" /> Yield Processing Entry
               </h2>
               <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm">
                  Authorization Node: MILL-A-12
               </div>
            </div>
            
            <div className="p-10 space-y-10">
               {/* Input Phase */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <SearchableSelect
                      label="Varietal Spec (Raw Paddy)"
                      placeholder="Select Variety"
                      options={rawVarieties}
                      value={rawVarieties.find(v => v.varietyName === formData.variety && v.quality === formData.quality)?.id || ""}
                      onChange={(id) => {
                        const selected = rawVarieties.find(o => o.id === id);
                        if (selected) {
                          setFormData({ 
                            ...formData, 
                            variety: selected.varietyName, 
                            varietyId: selected.varietyId, 
                            quality: selected.quality,
                            qualityId: selected.qualityId 
                          });
                        }
                      }}
                      icon={Box}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] pl-1">Input Raw Paddy (Kg)</label>
                    <div className="relative group">
                      <Scale size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                      <input 
                        type="number" 
                        required
                        value={formData.paddyInput}
                        onChange={(e) => setFormData({...formData, paddyInput: e.target.value})}
                        placeholder="Total Intake Weight"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner"
                      />
                    </div>
                  </div>
               </div>

               {/* Recovery Phase */}
               <div className="pt-10 border-t border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                     <Zap size={16} className="text-indigo-600" /> Final Output breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Finished Rice (Kg)</label>
                      <input type="number" required value={formData.riceOutput} onChange={(e) => setFormData({...formData, riceOutput: e.target.value})} placeholder="0" className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Broken Rice (Kg)</label>
                      <input type="number" required value={formData.brokenOutput} onChange={(e) => setFormData({...formData, brokenOutput: e.target.value})} placeholder="0" className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Rice Bran (Kg)</label>
                      <input type="number" required value={formData.branOutput} onChange={(e) => setFormData({...formData, branOutput: e.target.value})} placeholder="0" className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Husk (Kg)</label>
                      <input type="number" required value={formData.huskOutput} onChange={(e) => setFormData({...formData, huskOutput: e.target.value})} placeholder="0" className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all shadow-sm" />
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-slate-900 border-t border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-10">
               <div className="flex items-center gap-12">
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1.5 opacity-80">Aggregate Yield recovery</p>
                    <div className="flex items-baseline gap-2 text-white">
                       <span className="text-3xl font-black tracking-tighter">{yieldPercentage.toFixed(1)}%</span>
                       <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Efficiency</span>
                    </div>
                  </div>
                  <div className="w-[1px] h-10 bg-slate-800" />
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">Commercial Assets Created</p>
                    <p className="text-2xl font-black text-emerald-400 tracking-tight">{totalOutput.toLocaleString()} Kg</p>
                  </div>
               </div>

               <button 
                type="submit"
                disabled={isLoading}
                className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-600/40 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Synchronizing Production Data..." : (
                  <>
                    <Save size={18} />
                    Authorize Production Batch
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Diagnostic Side Panel */}
        <div className="xl:col-span-1 space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 opacity-40 transition-transform group-hover:scale-110" />
              <div className="relative z-10 space-y-8">
                 <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                    <Activity size={24} />
                 </div>
                 
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Refinement Diagnostic</h3>

                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Raw Consumed</span>
                       <span className="text-sm font-black text-slate-900">{pInput.toLocaleString()} Kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-emerald-500">Valued Assets</span>
                       <span className="text-sm font-black text-emerald-600">+{totalOutput.toLocaleString()} Kg</span>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-red-400">Process Loss</span>
                       <span className="text-sm font-black text-red-500">{(pInput - totalOutput).toLocaleString()} Kg</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 text-white relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-tl-full blur-2xl" />
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <Percent size={18} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Yield Benchmark</span>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Extraction Rate</p>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-indigo-500 transition-all duration-1000" 
                         style={{ width: `${Math.min(yieldPercentage, 100)}%` }}
                       />
                    </div>
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter text-right italic">{yieldPercentage.toFixed(1)}% recovery</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
