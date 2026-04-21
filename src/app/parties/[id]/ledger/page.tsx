"use client";
import API_BASE_URL from "@/utils/api";

import {
  ArrowLeft, History, Plus, Receipt, TrendingDown, TrendingUp, 
  User, Wallet, X, Save, Calendar, FileText, CheckCircle2,
  Trash2, Filter, Download, Printer, Building2, ShoppingCart, Zap,
  Eye, Package, Truck
} from "lucide-react";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function SummaryCard({ title, amount, icon: Icon, colorClass, subText }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-5 rounded-bl-[3rem] transition-transform group-hover:scale-110`} />
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100 ${colorClass.replace('bg-', 'text-')} shadow-sm transition-all group-hover:rotate-6`}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</span>
      </div>
      <p className="text-2xl font-black text-slate-900 tracking-tighter mb-1">
        ₹{Math.abs(amount).toLocaleString()}
      </p>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{subText}</p>
    </div>
  );
}

function Drawer({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden transform transition-transform animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
}

function Field({ label, icon: Icon, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">{label}</label>
      <div className="relative group">
        {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />}
        <input
          className={`w-full bg-slate-50 border border-slate-200 rounded-2xl ${Icon ? "pl-10" : "pl-4"} pr-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm`}
          {...props}
        />
      </div>
    </div>
  );
}

export default function PartyLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ledger'); // ledger, purchases, sales
  const [purchases, setPurchases] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    source: '' // procurement, sale, manual
  });
  const [form, setForm] = useState({
    entry_date: '',
    type: 'DEBIT',
    amount: '',
    payment_mode: 'Cash',
    payment_details: '',
    bank_name: '',
    utr_no: '',
    ref_no: '',
    cheque_date: ''
  });

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const sp = new URLSearchParams();
      if (filters.startDate) sp.append('startDate', filters.startDate);
      if (filters.endDate) sp.append('endDate', filters.endDate);
      if (filters.source) sp.append('source', filters.source);

      const res = await fetch(`${API_BASE_URL}/api/parties/${id}/ledger?${sp.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch ledger');
      const json = await res.json();
      setData(json);

      // Fetch Tab Specific Data if needed
      if (activeTab === 'purchases') fetchPurchases();
      if (activeTab === 'sales') fetchSales();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPurchases = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/procurement?partyId=${id}&limit=1000`);
      const json = await res.json();
      setPurchases(json.items || []);
    } catch (e) { console.error(e); }
  };

  const fetchSales = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales?partyId=${id}&limit=1000`);
      const json = await res.json();
      setSales(json.items || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    setForm(f => ({ ...f, entry_date: new Date().toISOString().split('T')[0] }));
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [id, filters, activeTab]);

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) return alert("Please fill amount and description");
    
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        payment_details: form.payment_mode === "Cheque"
          ? `CHQ: ${form.ref_no} | ${form.bank_name} | Date: ${form.cheque_date || 'N/A'}`
          : form.payment_mode === "Bank"
          ? `UTR: ${form.utr_no} | ${form.bank_name}`
          : form.payment_details
      };
      
      const res = await fetch(`${API_BASE_URL}/api/parties/${id}/ledger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setDrawerOpen(false);
        setForm({
          entry_date: new Date().toISOString().split('T')[0],
          type: 'DEBIT',
          amount: '',
          description: '',
          ref_no: '',
          payment_mode: 'Cash',
          payment_details: '',
          bank_name: '',
          utr_no: '',
          ref_no: '',
          cheque_date: ''
        });
        fetchLedger();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save entry");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadCSV = () => {
    if (!data || !data.entries) return;
    const headers = ["Date", "Description", "Ref No", "Type", "Amount", "Balance", "Mode", "Details"];
    const rows = data.entries.map((e: any) => [
      new Date(e.entry_date).toLocaleDateString(),
      `"${e.description.replace(/"/g, '""')}"`,
      e.ref_no,
      e.type,
      e.amount,
      e.running_balance,
      e.payment_mode || '',
      e.payment_details || ''
    ]);

    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ledger_${party.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const deleteManualEntry = async (entryId: string) => {
    if (!confirm("Delete this manual entry?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/parties/${id}/ledger/${entryId}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchLedger();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="p-20 text-center space-y-4 animate-pulse">
        <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto" />
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading Ledger Details...</p>
      </div>
    );
  }

  const { party, entries, summary } = data;
  const balanceLabel = summary.closingBalance >= 0 ? "Mill Owes Party" : "Party Owes Mill";
  const balanceColor = summary.closingBalance >= 0 ? "text-emerald-500" : "text-amber-500";

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <Link
            href="/parties"
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Registry</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
              <History size={32} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase truncate max-w-xl" title={party.name}>{party.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">UID-{party.id.toString().padStart(5, '0')}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{party.category} • {party.phone || 'No Contact'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link 
            href={`/procurement/new?partyId=${party.id}`}
            target="_blank"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-100 active:scale-95"
          >
            <ShoppingCart size={16} /> New Purchase
          </Link>
          <Link 
            href={`/sales/new?partyId=${party.id}`}
            target="_blank"
            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-amber-100 active:scale-95"
          >
            <Zap size={16} /> New Sale
          </Link>
          <div className="flex gap-2">
            <button 
              onClick={downloadCSV}
              className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
              title="Download CSV (Excel)"
            >
              <Download size={18} />
            </button>
            <button onClick={() => window.print()} className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
              <Printer size={18} />
            </button>
          </div>
          <button 
            onClick={() => setDrawerOpen(true)}
            className="bg-indigo-600 hover:bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            <Plus size={18} /> Add Journal Entry
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-200/60 w-fit">
        {[
          { id: 'ledger', label: 'Financial Ledger', icon: Receipt },
          { id: 'purchases', label: 'Procurement History', icon: ShoppingCart },
          { id: 'sales', label: 'Sales History', icon: Zap }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2 border ${activeTab === t.id ? 'bg-white text-indigo-600 border-indigo-100 shadow-sm' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'ledger' && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SummaryCard 
              title="Total Billed By Party" 
              amount={summary.totalCredit} 
              icon={TrendingUp} 
              colorClass="bg-emerald-600"
              subText="Purchases & Credits (We Owe)"
            />
            <SummaryCard 
              title="Total Paid / Billed To Party" 
              amount={summary.totalDebit} 
              icon={TrendingDown} 
              colorClass="bg-amber-600"
              subText="Sales & Payments"
            />
            <SummaryCard 
              title="Closing Balance" 
              amount={Math.abs(summary.closingBalance)} 
              icon={Wallet} 
              colorClass={summary.closingBalance >= 0 ? 'bg-indigo-600' : 'bg-rose-600'}
              subText={balanceLabel}
              prefix={summary.closingBalance >= 0 ? "Payable: " : "Receivable: "}
            />
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/10 flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-4">
              <Filter size={16} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter By:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 flex-1">
              <div className="flex items-center gap-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">From</label>
                <input 
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To</label>
                <input 
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                <select
                  value={filters.source}
                  onChange={(e) => setFilters({...filters, source: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="">All Entries</option>
                  <option value="procurement">Purchases (Paddy)</option>
                  <option value="sale">Sales (Dispatch)</option>
                  <option value="manual">Other / Journal</option>
                </select>
              </div>
              
              {(filters.startDate || filters.endDate || filters.source) && (
                <button 
                  onClick={() => setFilters({ startDate: '', endDate: '', source: '' })}
                  className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </>
      )}


        {activeTab === 'ledger' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                 <Receipt size={18} className="text-indigo-600" /> Account Statement
              </h2>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-4">
                 <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Credit (Payable)</span>
                 <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400" /> Debit (Paid/Recv)</span>
              </div>
            </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6">Reference & Description</th>
                <th className="px-10 py-6 text-right">Debit (We Paid / Sold)</th>
                <th className="px-10 py-6 text-right">Credit (We Bought)</th>
                <th className="px-10 py-6 text-right bg-slate-50/80">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.map((entry: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-900 tracking-tight" suppressHydrationWarning>{new Date(entry.entry_date).toLocaleDateString()}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest" suppressHydrationWarning>{new Date(entry.sort_ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-start gap-4">
                       <div className={`p-2 rounded-lg bg-slate-50 text-slate-400 shrink-0 ${entry.source === 'manual' ? 'border border-slate-100' : ''}`}>
                         {entry.source === 'procurement' ? <ArrowLeft size={14} className="text-emerald-500" /> : 
                          entry.source === 'sale' ? <ArrowLeft size={14} className="text-amber-500 rotate-180" /> : <History size={14} />}
                       </div>
                       <div>
                         {entry.bill_url ? (
                            <Link href={entry.bill_url} target="_blank" className="hover:text-indigo-600 transition-colors group/bill">
                              <p className="text-[11px] font-bold text-slate-600 leading-relaxed max-w-sm line-clamp-2 underline decoration-slate-200 underline-offset-4 decoration-dashed group-hover/bill:decoration-indigo-300">
                                {entry.description}
                              </p>
                            </Link>
                          ) : (
                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed max-w-sm line-clamp-2">{entry.description}</p>
                          )}

                         <div className="flex items-center gap-3 mt-1">
                                                       {entry.bill_url ? (
                              <Link href={entry.bill_url} target="_blank" className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 hover:bg-indigo-100 transition-all">
                                {entry.ref_no}
                              </Link>
                            ) : (
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50/50 px-1.5 py-0.5 rounded">{entry.ref_no}</span>
                            )}

                            {entry.payment_mode && (
                              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Wallet size={10} /> {entry.payment_mode}
                              </span>
                            )}
                            {entry.payment_details && (
                              <span className="text-[9px] font-medium text-slate-400 italic">
                                ({entry.payment_details})
                              </span>
                            )}

                           {entry.source === 'manual' && (
                             <button 
                               onClick={() => deleteManualEntry(entry.ref_id)}
                               className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                             >
                               <Trash2 size={10} />
                             </button>
                           )}
                         </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    {entry.type === 'DEBIT' ? (
                      <span className="text-sm font-black text-amber-600 tracking-tight">₹{Number(entry.amount).toLocaleString()}</span>
                    ) : <span className="text-slate-200">—</span>}
                  </td>
                  <td className="px-10 py-6 text-right">
                    {entry.type === 'CREDIT' ? (
                      <span className="text-sm font-black text-emerald-600 tracking-tight">₹{Number(entry.amount).toLocaleString()}</span>
                    ) : <span className="text-slate-200">—</span>}
                  </td>
                  <td className={`px-10 py-6 text-right bg-slate-50/50`}>
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-black tracking-tighter ${entry.running_balance >= 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                        ₹{Math.abs(entry.running_balance).toLocaleString()}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${entry.running_balance >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {entry.running_balance >= 0 ? 'Payable' : 'Receivable'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr 
                onClick={() => setDrawerOpen(true)}
                className="group cursor-pointer hover:bg-slate-50 transition-all border-t-2 border-dashed border-slate-50"
              >
                <td className="px-10 py-8 text-center" colSpan={5}>
                   <div className="flex items-center justify-center gap-4 group-hover:scale-105 transition-transform">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <Plus size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] leading-none">Record New Account Entry</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manual payment, adjustment, or credit</p>
                      </div>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
            {entries.length === 0 && (
              <div className="p-32 text-center flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border border-slate-100 border-dashed">
                  <Receipt size={40} />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Transaction history is clear</p>
              </div>
            )}
          </div>
        </div>
      )}

        {activeTab === 'purchases' && (
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                   <ShoppingCart size={18} className="text-emerald-600" /> All Procurements
                </h2>
             </div>
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                   <th className="px-8 py-5">Date</th>
                   <th className="px-8 py-5">Variety / Vehicle</th>
                   <th className="px-8 py-5 text-right">Weight (Net)</th>
                   <th className="px-8 py-5 text-right">Amount</th>
                   <th className="px-8 py-5 text-center">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {purchases.map((p: any) => (
                   <tr key={p.id} className="hover:bg-slate-50/50 transition-all font-medium group">
                     <td className="px-8 py-6">
                        <span className="text-xs font-black text-slate-900" suppressHydrationWarning>{new Date(p.intake_date).toLocaleDateString()}</span>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700 uppercase">{p.variety}</span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1"><Truck size={10} /> {p.vehicle_no}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-right text-xs font-black text-slate-900">{(p.net_weight || 0).toLocaleString()} Kg</td>
                     <td className="px-8 py-6 text-right text-xs font-black text-emerald-600">₹{Number(p.total_amount || 0).toLocaleString()}</td>
                     <td className="px-8 py-6 text-center">
                        <Link href={`/procurement/receipt/${p.id}`} target="_blank" className="p-2.5 text-indigo-600 hover:bg-white hover:shadow-md rounded-xl inline-block transition-all border border-transparent hover:border-indigo-100">
                          <Eye size={18} />
                        </Link>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {purchases.length === 0 && (
               <div className="p-32 text-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 mb-4">
                    <ShoppingCart size={32} />
                 </div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No procurement history</p>
               </div>
             )}
           </div>
        )}

        {activeTab === 'sales' && (
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                   <Zap size={18} className="text-amber-600" /> All Sales Invoices
                </h2>
             </div>
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                   <th className="px-8 py-5">Date</th>
                   <th className="px-8 py-5">Invoice / Variety</th>
                   <th className="px-8 py-5 text-right">Qty Sold</th>
                   <th className="px-8 py-5 text-right">Total Sale</th>
                   <th className="px-8 py-5 text-center">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {sales.map((s: any) => (
                   <tr key={s.id} className="hover:bg-slate-50 transition-all font-medium group">
                     <td className="px-8 py-6 text-xs font-black text-slate-900" suppressHydrationWarning>{new Date(s.invoice_date).toLocaleDateString()}</td>
                     <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900">{s.invoice_no}</span>
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">{s.variety}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-right text-xs font-black text-slate-900">{(s.weight_sold || 0).toLocaleString()} Kg</td>
                     <td className="px-8 py-6 text-right text-xs font-black text-amber-600">₹{Number(s.total_amount || 0).toLocaleString()}</td>
                     <td className="px-8 py-6 text-center">
                        <Link href={`/sales/invoice/${s.invoice_no}`} target="_blank" className="p-2.5 text-indigo-600 hover:bg-white hover:shadow-md rounded-xl inline-block transition-all border border-transparent hover:border-indigo-100">
                          <Eye size={18} />
                        </Link>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {sales.length === 0 && (
               <div className="p-32 text-center text-slate-200">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 mb-4">
                    <Zap size={32} />
                 </div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No sales recorded</p>
               </div>
             )}
           </div>
        )}

      {/* Manual Entry Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Journal Entry">
        <form onSubmit={handleManualEntry} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Entry Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setForm({...form, type: 'DEBIT'})}
                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.type === 'DEBIT' ? 'bg-amber-600 border-amber-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-amber-200'}`}
              >
                Debit (Paid / Sold To Party)
              </button>
              <button 
                type="button"
                onClick={() => setForm({...form, type: 'CREDIT'})}
                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.type === 'CREDIT' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-200'}`}
              >
                Credit (Bought From Party)
              </button>
            </div>
            <p className="text-[9px] text-slate-400 italic px-2">
              {form.type === 'DEBIT' 
                ? "Debit: Money paid TO party (Outward flow) or goods sold to them." 
                : "Credit: Paddy purchased FROM party (Inward flow) or deposit received."}
            </p>
          </div>

          <Field 
            label="Transaction Date" 
            icon={Calendar} 
            type="date"
            value={form.entry_date}
            onChange={(e: any) => setForm({...form, entry_date: e.target.value})}
          />

          <Field 
            label="Amount (₹)" 
            icon={Wallet} 
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e: any) => setForm({...form, amount: e.target.value})}
          />

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Description</label>
            <div className="relative group">
              <FileText size={16} className="absolute left-4 top-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
              <textarea 
                rows={3} 
                placeholder="Details of payment or adjustment..."
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm resize-none"
              />
            </div>
          </div>

          <div className={`grid gap-4 ${form.payment_mode === 'Cash' || form.payment_mode === 'Adjustment' ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">Payment Mode</label>
              <select 
                value={form.payment_mode}
                onChange={(e) => setForm({...form, payment_mode: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-black outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E')] bg-[length:10px] bg-[right_1rem_center] bg-no-repeat"
              >
                <option value="Cash">Cash</option>
                <option value="Bank">Bank / UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="Adjustment">Adjustment</option>
                <option value="Credit">Credit/Deferred</option>
              </select>
            </div>
            
            {form.payment_mode === "Cheque" && (
               <Field 
                 label="Cheque No" 
                 icon={Plus} 
                 type="text"
                 placeholder="6-digit No"
                 value={form.ref_no}
                 onChange={(e: any) => setForm({...form, ref_no: e.target.value})}
               />
            )}
            
            {form.payment_mode === "Bank" && (
               <Field 
                 label="UTR / Ref No" 
                 icon={Receipt} 
                 type="text"
                 placeholder="TXN ID"
                 value={form.utr_no}
                 onChange={(e: any) => setForm({...form, utr_no: e.target.value})}
               />
            )}
            
            {form.payment_mode === "Credit" && (
               <Field 
                 label="Reference No" 
                 icon={Plus} 
                 type="text"
                 placeholder="Optional ref #"
                 value={form.ref_no}
                 onChange={(e: any) => setForm({...form, ref_no: e.target.value})}
               />
            )}
          </div>

          {(form.payment_mode === "Cheque" || form.payment_mode === "Bank") && (
            <div className={`grid gap-4 ${form.payment_mode === 'Cheque' ? 'grid-cols-2' : 'grid-cols-1'}`}>
               <Field 
                  label="Bank Name" 
                  icon={Building2} 
                  type="text"
                  placeholder={form.payment_mode === "Cheque" ? "e.g. ICICI, HDFC" : "Bank"}
                  value={form.bank_name}
                  onChange={(e: any) => setForm({...form, bank_name: e.target.value})}
                />
              {form.payment_mode === "Cheque" && (
                 <Field 
                    label="Cheque Date" 
                    icon={Calendar} 
                    type="date"
                    value={form.cheque_date}
                    onChange={(e: any) => setForm({...form, cheque_date: e.target.value})}
                  />
              )}
            </div>
          )}

          {form.payment_mode === "Credit" && (
            <Field 
              label="Credit Details" 
              icon={Receipt} 
              type="text"
              placeholder="e.g. Deferred payment, Promissory"
              value={form.payment_details}
              onChange={(e: any) => setForm({...form, payment_details: e.target.value})}
            />
          )}

          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-8 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-300 disabled:opacity-50"
            >
              <Save size={18} /> {isSaving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
