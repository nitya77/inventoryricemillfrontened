"use client";
import API_BASE_URL from "@/utils/api";

import { 
  Users, 
  UserPlus, 
  Briefcase, 
  Phone, 
  MapPin, 
  ArrowLeft,
  Save,
  Zap,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewSellerOnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", contact: "", address: "", seller_type: "Farmer" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sellers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: formData.contact // Mapping contact to phone for backend
        }),
      });
      if (res.ok) {
        router.push("/sellers");
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
          <Link href="/sellers" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-4 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Network registry</span>
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
             <UserPlus size={32} className="text-indigo-600" /> Partner Onboarding
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Register new strategic source entities and farmers into the Mill-X ecosystem.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
               <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Zap size={18} className="text-indigo-600" /> Legal Entity Profile
               </h2>
               <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
                  Verification Protocol: V1.2
               </div>
            </div>
            
            <div className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Full Legal Name</label>
                  <div className="relative group">
                    <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Organization or Individual Name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Primary Contact</label>
                  <div className="relative group">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                    <input 
                      type="text" 
                      required
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      placeholder="+91-00000 00000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Partner Classification</label>
                  <select 
                    value={formData.seller_type}
                    onChange={(e) => setFormData({...formData, seller_type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="Farmer">Primary Farmer</option>
                    <option value="Wholesaler">Bulk Wholesaler</option>
                    <option value="Broker">Intermediary Broker</option>
                    <option value="Direct Supplier">Direct Industrial Supplier</option>
                  </select>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Verification Status</label>
                   <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl">
                      <ShieldCheck className="text-emerald-600" size={20} />
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Automatic ID Verification Active</span>
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Registered Address / Location Nexus</label>
                <div className="relative group">
                  <MapPin size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                  <textarea 
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Provide full legal operational address..."
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-10">
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compliance Check</span>
                  <p className="text-xs font-bold text-slate-400 tracking-tight uppercase">I hereby authorize this entity as a verified Mill-X partner.</p>
               </div>
               <button 
                type="submit"
                disabled={isLoading}
                className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-600/40 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Synchronizing Asset Profile..." : (
                  <>
                    <Save size={18} />
                    Authorize Onboarding
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="xl:col-span-1 space-y-8 text-white">
           <div className="bg-indigo-600 p-8 rounded-[2.5rem] border border-indigo-400 shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8" />
              <div className="relative z-10 space-y-6">
                 <h3 className="text-xs font-black uppercase tracking-[0.3em]">Direct Sourcing</h3>
                 <p className="text-[10px] font-black text-indigo-100 uppercase leading-relaxed tracking-wider opacity-80">
                    Onboarding primary farmers enables direct weightbridge integration and immediate commercial settlements.
                 </p>
                 <div className="pt-4 border-t border-white/10">
                    <p className="text-[8px] font-black text-white uppercase tracking-widest opacity-60 mb-2">Benefit Tier</p>
                    <span className="text-2xl font-black italic tracking-tighter">Premium</span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-tr-full blur-2xl" />
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-3">
                    <Users size={18} className="text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Network reach</span>
                 </div>
                 <p className="text-[10px] font-black text-slate-500 uppercase leading-relaxed tracking-wider">
                    Total active verified entities across global supply chain:
                 </p>
                 <p className="text-4xl font-black tracking-tighter text-white">840+</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
