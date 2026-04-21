"use client";
import API_BASE_URL from "@/utils/api";

import { 
  Printer, 
  Download, 
  Share2, 
  ArrowLeft, 
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  Scale
} from "lucide-react";
import { useState, useEffect, use } from "react";
import Link from "next/link";

interface InvoiceData {
  invoiceNo: string;
  buyerName: string;
  invoiceDate: string;
  items: any[];
}

export default function PrintableInvoicePage({ params }: { params: Promise<{ invoiceNo: string }> }) {
  const { invoiceNo } = use(params);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/sales/invoice/${invoiceNo}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [invoiceNo]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.5em] text-slate-400">Loading Asset Document...</div>;
  if (!data) return <div className="p-20 text-center font-black uppercase text-red-500">Document Not Found</div>;

  const totalAmount = data.items.reduce((sum, item) => sum + Number(item.total_amount), 0);
  const totalBags = data.items.reduce((sum, item) => sum + Number(item.bags_sold), 0);
  const totalWeight = data.items.reduce((sum, item) => sum + Number(item.weight_sold), 0);

  return (
    <div className="min-h-screen bg-slate-100 pb-20 print:bg-white print:p-0">
      {/* Action Toolbar - Hidden on print */}
      <div className="bg-white border-b border-slate-200 py-4 px-8 sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/sales" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Registry</span>
          </Link>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
                <Download size={14} /> PDF
             </button>
             <button 
               onClick={() => window.print()}
               className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
             >
                <Printer size={14} /> Print Invoice
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-10 print:mt-0">
         <div className="bg-white shadow-2xl shadow-slate-300/50 rounded-[2.5rem] overflow-hidden border border-slate-200 print:shadow-none print:border-none print:rounded-none">
            {/* Invoice Header */}
            <div className="p-16 border-b-4 border-indigo-600 bg-slate-900 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                  <div className="flex items-center gap-5">
                     <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/50 border border-indigo-400/20">
                        <Scale size={32} />
                     </div>
                     <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">Mill-X Enterprise</h1>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Industrial Dispatch Hub</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <h2 className="text-5xl font-black tracking-tighter text-indigo-400 uppercase opacity-40 mb-2">Invoice</h2>
                     <p className="text-xs font-black tracking-widest text-slate-400">REF: {data.invoiceNo}</p>
                  </div>
               </div>
            </div>

            <div className="p-16 space-y-16">
               {/* Entity Information */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  <div className="space-y-6">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Consignor Details</p>
                     <div className="space-y-3">
                        <h3 className="text-xl font-black text-slate-900 uppercase">Mill-X Processing Unit</h3>
                        <div className="space-y-2 text-xs font-bold text-slate-500 uppercase leading-relaxed max-w-xs">
                           <p className="flex items-start gap-3"><Building2 size={16} className="shrink-0 text-indigo-600" /> Industrial Estate, Phase-II, Himalayan Gateway</p>
                           <p className="flex items-center gap-3"><Phone size={16} className="shrink-0 text-indigo-600" /> +91-OPERATIONS-HUB</p>
                           <p className="flex items-center gap-3"><Mail size={16} className="shrink-0 text-indigo-600" /> Dispatch@mill-x.corp</p>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Billed To Consignee</p>
                     <div className="space-y-3">
                        <h3 className="text-2xl font-black text-indigo-600 uppercase tracking-tight">{data.buyerName}</h3>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Cycle Record</p>
                           <p className="text-sm font-black text-slate-900 uppercase italic">{new Date(data.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="pt-2">
                           <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              <CheckCircle2 size={14} /> Settlement Complete
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Line Items Table */}
               <div className="space-y-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Material Disbursement breakdown</p>
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-y border-slate-100">
                           <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest">Item / Refinement</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Bags</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Weight (Kg)</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right">Rate</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right">Line Total</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {data.items.map((item, i) => (
                           <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-6">
                                 <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.variety}</p>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{item.product_type}</p>
                              </td>
                              <td className="px-8 py-6 text-center text-sm font-black text-slate-900">{item.bags_sold}</td>
                              <td className="px-8 py-6 text-center text-sm font-black text-slate-900">{Number(item.weight_sold).toLocaleString()}</td>
                              <td className="px-8 py-6 text-right text-sm font-black text-slate-500 uppercase">₹{item.rate_per_unit}/Kg</td>
                              <td className="px-8 py-6 text-right text-base font-black text-slate-900 tracking-tighter italic">₹{Number(item.total_amount).toLocaleString()}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Summary Calculation */}
               <div className="flex justify-end pt-10 border-t border-slate-100">
                  <div className="w-full max-w-sm space-y-4">
                     <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Weight</span>
                        <span className="text-sm font-black text-slate-900">{totalWeight.toLocaleString()} Kg</span>
                     </div>
                     <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Bag Count</span>
                        <span className="text-sm font-black text-slate-900">{totalBags} Units</span>
                     </div>
                     <div className="h-px bg-slate-100 my-4" />
                     <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col gap-2 relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-tl-full blur-2xl group-hover:scale-125 transition-transform" />
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] relative z-10">Total Bill Valuation</p>
                        <div className="flex items-baseline gap-2 relative z-10">
                           <span className="text-4xl font-black tracking-tighter">₹{totalAmount.toLocaleString()}</span>
                           <span className="text-xs font-black text-slate-400 uppercase">INR</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Authorized Seal */}
               <div className="pt-20 grid grid-cols-1 md:grid-cols-2 gap-20 items-end">
                  <div className="space-y-4">
                     <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-200">
                        <span className="text-[10px] font-black uppercase text-center rotate-[-15deg]">Digital QR<br/>Reference</span>
                     </div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed italic max-w-xs">
                        This is a computer-generated document authorized by the Mill-X Enterprise Centralized Ledger. Physical signature not required for stock exit clearance.
                     </p>
                  </div>
                  <div className="text-right space-y-8">
                     <div className="inline-block border-b border-slate-300 w-64 h-20" />
                     <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Authorized Dispatch Officer</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 opacity-60">Authentication Node: EX-GATE-12</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between print:hidden">
               <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Validated & Audit-Ready</span>
               </div>
               <p className="text-[9px] text-slate-400 font-bold tracking-tight uppercase">Mill-X Billing V4.1 • Serialized Asset Disbursement</p>
            </div>
         </div>
      </div>
    </div>
  );
}
