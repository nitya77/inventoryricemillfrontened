"use client";
import API_BASE_URL from "@/utils/api";

import { 
  ShoppingCart, 
  UserPlus, 
  Briefcase, 
  Phone, 
  MapPin, 
  ArrowLeft,
  Save,
  Zap,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewCustomerRegistrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    contact: "", 
    email: "", 
    address: "", 
    gst_no: "", 
    credit_limit: "0" 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: formData.contact, // Mapping contact to phone for backend consistency
          credit_limit: Number(formData.credit_limit)
        }),
      });
      if (res.ok) {
        router.push("/customers");
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
          <Link href="/customers" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-4 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Buyer Nexus</span>
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
             <UserPlus size={32} className="text-indigo-600" /> Commercial Registration
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Register new wholesale buyers and commercial trade entities into the Mill-X network.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
               <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Zap size={18} className="text-indigo-600" /> Professional Trading Profile
               </h2>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm">
                  Distribution Protocol: V2.0
               </div>
            </div>
            
            <div className="p-10 space-y-10">
              {/* Basic Identity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Trading Entity Name</label>
                  <div className="relative group">
                    <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Company or Buyer Name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Commercial GSTIN</label>
                  <div className="relative group">
                    <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                    <input 
                      type="text" 
                      required
                      value={formData.gst_no}
                      onChange={(e) => setFormData({...formData, gst_no: e.target.value})}
                      placeholder="XXAAAAA0000A1Z5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all uppercase placeholder:normal-case shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Communication & Credit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Authorized Credit Limit (₹)</label>
                  <div className="relative group">
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                    <input 
                      type="number" 
                      value={formData.credit_limit}
                      onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Registered Logistics/Billing Address</label>
                <div className="relative group">
                  <MapPin size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                  <textarea 
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Provide full legal billing address..."
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-black outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-inner resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-10">
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compliance Authorization</span>
                  <p className="text-xs font-bold text-slate-400 tracking-tight uppercase">I hereby authorize this entity for wholesale commercial distribution.</p>
               </div>
               <button 
                type="submit"
                disabled={isLoading}
                className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-600/40 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Synchronizing Buyer Profile..." : (
                  <>
                    <Save size={18} />
                    Finalize Registration
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="xl:col-span-1 space-y-8 text-white">
           <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-bl-full -mr-8 -mt-8" />
              <div className="relative z-10 space-y-6">
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <ShoppingCart size={16} className="text-indigo-400" /> Wholesale
                 </h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase leading-relaxed tracking-wider">
                    Distributors and bulk buyers enable high-volume liquidation of finished assets.
                 </p>
                 <div className="pt-4 border-t border-slate-800">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Aggregate Value</p>
                    <span className="text-2xl font-black italic tracking-tighter text-indigo-400">Strategic</span>
                 </div>
              </div>
           </div>

           <div className="bg-indigo-600 p-8 rounded-[2.5rem] border border-indigo-400 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-tr-full blur-2xl" />
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Commercial Trust</span>
                 </div>
                 <p className="text-[10px] font-black text-indigo-100 uppercase leading-relaxed tracking-wider opacity-80">
                    Verified GSTIN enables compliant tax-invoice generation and industrial auditing.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
