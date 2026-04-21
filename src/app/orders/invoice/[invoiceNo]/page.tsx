"use client";
import API_BASE_URL from "@/utils/api";

import { 
  Printer, 
  Download, 
  ArrowLeft, 
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  Scale,
  ClipboardCheck,
  User,
  ShoppingCart
} from "lucide-react";
import { useState, useEffect, use } from "react";
import Link from "next/link";

interface OrderData {
  invoiceNo: string;
  entityName: string;
  orderType: string;
  expectedDate: string;
  items: any[];
}

export default function PrintableOrderPage({ params }: { params: Promise<{ invoiceNo: string }> }) {
  const { invoiceNo } = use(params);
  const [data, setData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For simplicity, we adapt the logic: fetch by invoiceNo
    // We assume the backend route GET /api/orders/invoice/:invoiceNo exists or we can use the main GET / with filter
    fetch(`${API_BASE_URL}/api/orders?search=${invoiceNo}`)
      .then(res => res.json())
      .then(json => {
        if (json.items && json.items.length > 0) {
          setData({
            invoiceNo,
            entityName: json.items[0].entity_name,
            orderType: json.items[0].order_type,
            expectedDate: json.items[0].expected_date,
            items: json.items
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [invoiceNo]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.5em] text-slate-400">Loading Order Document...</div>;
  if (!data) return <div className="p-20 text-center font-black uppercase text-red-500">Document Not Found</div>;

  const totalAmount = data.items.reduce((sum, item) => sum + Number(item.total_amount), 0);
  const totalVolume = data.items.reduce((sum, item) => sum + Number(item.total_quantity), 0);

  return (
    <div className="min-h-screen bg-slate-100 pb-20 print:bg-white print:p-0">
      {/* Action Toolbar - Hidden on print */}
      <div className="bg-white border-b border-slate-200 py-4 px-8 sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/orders" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Orders</span>
          </Link>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all font-bold" onClick={() => window.print()}>
                <Printer size={14} /> Print Order Copy
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-10 print:mt-0">
         <div className="bg-white shadow-2xl shadow-slate-300/50 rounded-[2.5rem] overflow-hidden border border-slate-200 print:shadow-none print:border-none print:rounded-none">
            {/* Order Header */}
            <div className={`p-16 border-b-4 ${data.orderType === 'Purchase' ? 'border-blue-600 bg-slate-900' : 'border-emerald-600 bg-slate-900'} text-white relative overflow-hidden`}>
               <div className={`absolute top-0 right-0 w-96 h-96 ${data.orderType === 'Purchase' ? 'bg-blue-500/10' : 'bg-emerald-500/10'} rounded-full -mr-32 -mt-32 blur-3xl`} />
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                  <div className="flex items-center gap-5">
                     <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 ${data.orderType === 'Purchase' ? 'bg-blue-600 shadow-blue-600/50' : 'bg-emerald-600 shadow-emerald-600/50'}`}>
                        <ClipboardCheck size={32} />
                     </div>
                     <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">Mill-X Enterprise</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Universal Commitment Protocol</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <h2 className={`text-5xl font-black tracking-tighter uppercase opacity-40 mb-2 ${data.orderType === 'Purchase' ? 'text-blue-400' : 'text-emerald-400'}`}>Order Copy</h2>
                     <p className="text-xs font-black tracking-widest text-slate-400 uppercase">Docket: {data.invoiceNo}</p>
                  </div>
               </div>
            </div>

            <div className="p-16 space-y-16">
               {/* Order Context */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  <div className="space-y-6">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Booking Context</p>
                     <div className="space-y-4">
                        <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-2xl border font-black text-xs uppercase tracking-widest ${data.orderType === 'Purchase' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                           {data.orderType === 'Purchase' ? <ShoppingCart size={16} /> : <User size={16} />}
                           Inward {data.orderType} Commitment
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Registered With Trader:</p>
                           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{data.entityName}</h3>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Operational Timeline</p>
                     <div className="space-y-4">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fulfillment Deadline:</p>
                           <p className="text-lg font-black text-slate-900 uppercase tracking-tight italic underline decoration-indigo-200 underline-offset-4">
                              {new Date(data.expectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                           </p>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                           <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Pending Fulfillment Verification</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Commitment Breakdown */}
               <div className="space-y-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Variety Commitment Table</p>
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-y border-slate-100">
                           <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest">Variety Specification</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Commitment Volume</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right">Booking Rate</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right">Aggregate Valuation</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {data.items.map((item, i) => (
                           <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-6">
                                 <p className="text-sm font-black text-slate-900 uppercase tracking-tight italic">{item.variety}</p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">Verified Grade</p>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <p className="text-sm font-black text-slate-900">{Number(item.total_quantity).toLocaleString()} <span className="text-[10px] text-slate-400 uppercase">Kg</span></p>
                              </td>
                              <td className="px-8 py-6 text-right text-sm font-black text-slate-500 uppercase tracking-widest opacity-60">
                                 ₹{item.rate_per_unit}/Kg
                              </td>
                              <td className="px-8 py-6 text-right text-base font-black text-slate-900 tracking-tighter italic">
                                 ₹{Number(item.total_amount).toLocaleString()}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Summary Footnote */}
               <div className="flex justify-between items-end pt-10 border-t border-slate-100 gap-20">
                  <div className="space-y-4 max-w-sm">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                        Terms: This commitment copy serves as an official proof of booking in the Mill-X centralized database. All rates are subject to quality verification at the dispatch gate bridge.
                     </p>
                  </div>
                  <div className="w-full max-w-sm bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Net Volume</span>
                        <span className="text-lg font-black text-slate-900">{totalVolume.toLocaleString()} Kg</span>
                     </div>
                     <div className="h-px bg-slate-200 mt-4 mb-2" />
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Total Booking Valuation</span>
                        <span className="text-2xl font-black text-indigo-600 tracking-tighter italic">₹{totalAmount.toLocaleString()}</span>
                     </div>
                  </div>
               </div>

               {/* Official Authorization */}
               <div className="pt-20 grid grid-cols-1 md:grid-cols-2 gap-20 items-end">
                  <div className="space-y-4 opacity-40">
                     <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                        <Scale size={24} />
                     </div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Authenticated • Mill-X HQ</p>
                  </div>
                  <div className="text-right space-y-8">
                     <div className="inline-block border-b-2 border-slate-900 w-64 h-24" />
                     <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Authorized Operations Officer</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">Authentication Code: MILL-P-ACK-{(Math.random()*1000).toFixed(0)}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-slate-950 text-slate-500 border-t border-slate-800 flex items-center justify-between print:hidden">
               <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">Node Operations Synchronized</span>
               </div>
               <p className="text-[9px] font-black tracking-tight uppercase">Document V4.1 • Universal Commitment Registry</p>
            </div>
         </div>
      </div>
    </div>
  );
}
