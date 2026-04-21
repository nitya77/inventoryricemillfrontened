"use client";
import API_BASE_URL from "@/utils/api";

import { 
  Printer, 
  ArrowLeft, 
  CheckCircle2,
  Building2,
  Phone,
  Scale,
  Truck,
  Droplets,
  Package,
  Calculator
} from "lucide-react";
import { useState, useEffect, use } from "react";
import Link from "next/link";

interface ProcurementData {
  id: number;
  farmer_name: string;
  vehicle_no: string;
  variety: string;
  gross_weight: number;
  tare_weight: number;
  net_weight: number;
  moisture_pct: number;
  bags_count: number;
  price_per_quintal: number;
  total_amount: number;
  created_at: string;
  payment_mode?: string;
  quality?: string;
  driver_name?: string;
}

export default function ProcurementReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ProcurementData | null>(null);
  const [items, setItems] = useState<ProcurementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/procurement/${id}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        if (json.vehicle_no) {
          fetch(`${API_BASE_URL}/api/procurement?search=${encodeURIComponent(json.vehicle_no)}&limit=100`)
            .then(res2 => res2.json())
            .then(json2 => {
               const dt = json.created_at.substring(0, 10);
               const related = json2.items.filter((i: any) => 
                 i.farmer_name === json.farmer_name &&
                 (i.intake_date === json.intake_date || i.created_at.substring(0, 10) === dt)
               );
               setItems(related.length > 0 ? related : [json]);
               setLoading(false);
            })
            .catch(() => {
               setItems([json]);
               setLoading(false);
            });
        } else {
           setItems([json]);
           setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.5em] text-slate-400">Retrieving Weight Record...</div>;
  if (!data) return <div className="p-20 text-center font-black uppercase text-red-500">Weight Record Not Found</div>;

  const grossNet = data.gross_weight - data.tare_weight;
  const totalDeductionTarget = (data.gross_weight - data.tare_weight) - data.net_weight;

  return (
    <div className="min-h-screen bg-slate-100 pb-20 print:bg-white print:p-0">
      {/* Action Toolbar */}
      <div className="bg-white border-b border-slate-200 py-4 px-8 sticky top-0 z-50 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/procurement" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Inward Registry</span>
          </Link>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all font-bold"
          >
            <Printer size={14} /> Print Weight Slip
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-10 print:mt-0">
         <div className="bg-white shadow-2xl shadow-slate-300/50 rounded-[2.5rem] overflow-hidden border border-slate-200 print:shadow-none print:border-none print:rounded-none">
            {/* Header */}
            <div className="p-12 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center border-b-4 border-indigo-600">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                     <Scale size={28} />
                  </div>
                  <div>
                     <h1 className="text-2xl font-black tracking-tighter uppercase leading-none mb-1">Mill-X Processing</h1>
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em]">Industrial Weightbridge Division</p>
                  </div>
               </div>
               <div className="text-right mt-6 md:mt-0">
                  <h2 className="text-4xl font-black tracking-tighter text-slate-700 uppercase leading-none mb-2">Gate Pass</h2>
                  <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Docket: MILL-IN-{data.id.toString().padStart(4, '0')}</p>
               </div>
            </div>

            <div className="p-12 space-y-12">
               {/* Metadata */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consignor Details</p>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight line-clamp-1 truncate">{data.farmer_name}</h3>
                        <div className="flex items-center gap-3 text-slate-500">
                           <Truck size={16} className="text-indigo-600" />
                           <span className="text-sm font-black uppercase tracking-widest">{data.vehicle_no || 'Walk-in'}</span>
                           {data.driver_name && (
                             <>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-sm font-black uppercase tracking-widest truncate max-w-[120px]">{data.driver_name}</span>
                             </>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4 md:text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intake Classification</p>
                     <div className="space-y-2">
                        <h3 className="text-xl font-black text-emerald-700 uppercase tracking-tight">
                           {items.length > 1 ? 'Multi-Segment Load' : data.variety}
                        </h3>
                        <div className="flex flex-wrap items-center justify-start md:justify-center gap-2">
                           <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest border border-slate-200">
                             Segments: {items.length}
                           </span>
                           {data.payment_mode && items.length === 1 && (
                             <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                               {data.payment_mode} Mode
                             </span>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4 md:text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telemetry Timestamp</p>
                     <p className="text-sm font-black text-slate-900 uppercase italic">
                        {new Date(data.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                     </p>
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                        <CheckCircle2 size={12} /> Intake Authorized
                     </div>
                  </div>
               </div>

               {/* Weightment Data */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Gross Weight</p>
                     <p className="text-2xl font-black text-slate-900">{Number(data.gross_weight).toLocaleString()} Kg</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Vehicle Tare</p>
                     <p className="text-2xl font-black text-slate-900">{Number(data.tare_weight).toLocaleString()} Kg</p>
                  </div>
                  <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Total Received Volume</p>
                     <p className="text-2xl font-black text-indigo-700">{grossNet.toLocaleString()} Kg</p>
                  </div>
               </div>

               {/* Segment Breakdown */}
               <div className="space-y-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Commodity Segment Breakdown</p>
                  <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50">
                           <tr className="border-b border-slate-100 uppercase tracking-widest text-slate-500 text-[9px] font-black">
                              <th className="px-8 py-4">Variety & Quality</th>
                              <th className="px-8 py-4 text-center">Bags</th>
                              <th className="px-8 py-4 text-center">Moisture</th>
                              <th className="px-8 py-4 text-right">Net Wt</th>
                              <th className="px-8 py-4 text-right">Rate / Quantal</th>
                              <th className="px-8 py-4 text-right">Amount</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {items.map((item, idx) => (
                             <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5">
                                   <p className="text-sm font-black text-slate-900 tracking-tight">{item.variety}</p>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.quality || 'Standard'} • {item.payment_mode || 'Default'}</p>
                                </td>
                                <td className="px-8 py-5 text-center text-sm font-black">{item.bags_count}</td>
                                <td className="px-8 py-5 text-center text-sm font-black">{item.moisture_pct}%</td>
                                <td className="px-8 py-5 text-right text-sm font-black text-emerald-600">{Number(item.net_weight).toLocaleString()} Kg</td>
                                <td className="px-8 py-5 text-right text-xs font-black text-slate-400">₹{item.price_per_quintal}</td>
                                <td className="px-8 py-5 text-right text-sm font-black tracking-tighter italic">₹{Number(item.total_amount).toLocaleString()}</td>
                             </tr>
                           ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white">
                           <tr>
                              <td colSpan={3} className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-indigo-400">Consolidated Apportionment</td>
                              <td className="px-8 py-6 text-right text-lg font-black tracking-tighter italic">{items.reduce((s, i) => s + Number(i.net_weight), 0).toLocaleString()} Kg</td>
                              <td></td>
                              <td className="px-8 py-6 text-right text-lg font-black tracking-tighter italic">₹{items.reduce((s, i) => s + Number(i.total_amount), 0).toLocaleString()}</td>
                           </tr>
                        </tfoot>
                     </table>
                  </div>
               </div>

               {/* Settlement View */}
               <div className="flex justify-between items-end gap-20 pt-10 border-t border-slate-100">
                  <div className="space-y-4 max-w-sm">
                     <div className="flex items-center gap-3 text-indigo-600">
                        <Calculator size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Rate: ₹{data.price_per_quintal}/Quintal</span>
                     </div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed tracking-widest">
                        Settlement amount is calculated based on commercial weight after moisture and bag deductions measured at the intake gateway bridge.
                     </p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aggregate Settlement Value</p>
                     <p className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic underline decoration-indigo-200 underline-offset-8">
                        ₹{items.reduce((s, i) => s + Number(i.total_amount), 0).toLocaleString()}
                     </p>
                  </div>
               </div>

               {/* Signatures */}
               <div className="pt-24 grid grid-cols-2 gap-40">
                  <div className="border-t border-slate-200 pt-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consignor / Farmer Signature</p>
                  </div>
                  <div className="border-t border-slate-200 pt-4 text-right">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Bridge Officer</p>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between print:hidden">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Industrial Mill-X Log v3.1</span>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Certified Weightment Record</span>
            </div>
         </div>
      </div>
    </div>
  );
}
