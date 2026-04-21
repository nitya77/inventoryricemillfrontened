"use client";
import API_BASE_URL from "@/utils/api";

import {
  BarChart3, Warehouse, Package, TrendingUp, TrendingDown,
  ArrowDown, ArrowUp, RefreshCw, Printer, AlertTriangle,
  CheckCircle2, Clock, ShoppingCart, ChevronDown, ChevronUp, Search, Filter
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "Raw":        { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  dot: "bg-orange-500" },
  "Finished":   { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  "By-Product": { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  dot: "bg-indigo-500" },
};

function StatCard({ label, value, unit = "", sub = "", icon: Icon, color = "indigo" }: any) {
  const palette: Record<string, string> = {
    indigo:  "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange:  "bg-orange-50 text-orange-600 border-orange-100",
    rose:    "bg-rose-50 text-rose-600 border-rose-100",
    slate:   "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-lg shadow-slate-100/50 flex flex-col gap-4">
      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${palette[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-slate-900 tracking-tighter">{Number(value).toLocaleString()}</span>
          {unit && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{unit}</span>}
        </div>
        {sub && <p className="text-[10px] text-slate-400 font-semibold mt-1">{sub}</p>}
      </div>
    </div>
  );
}

type SortKey = "name" | "variety" | "type" | "current_stock" | "total_procured" | "total_sold" | "total_milled";

export default function StockReportPage() {
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("type");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const router = useRouter();

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/stock`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setItems(data.items || []);
      setSummary(data.summary || null);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let rows = [...items];
    if (typeFilter !== "All") rows = rows.filter(r => r.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.variety?.toLowerCase().includes(q) ||
        r.type?.toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      const av = isNaN(Number(a[sortKey])) ? String(a[sortKey] || "").toLowerCase() : Number(a[sortKey]);
      const bv = isNaN(Number(b[sortKey])) ? String(b[sortKey] || "").toLowerCase() : Number(b[sortKey]);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [items, typeFilter, search, sortKey, sortDir]);

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === "asc" ? <ChevronUp size={12} className="text-indigo-600" /> : <ChevronDown size={12} className="text-indigo-600" />
      : <ChevronDown size={12} className="text-slate-300" />;

  const handlePrint = () => window.print();

  const stockStatus = (qty: number) => {
    if (qty <= 0)   return { label: "Out of Stock",  cls: "bg-red-50 text-red-600 border-red-100",    dot: "bg-red-500 animate-pulse" };
    if (qty < 500)  return { label: "Low Stock",     cls: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-500 animate-pulse" };
    return { label: "In Stock", cls: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" };
  };

  return (
    <div className="space-y-8 pb-20 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-indigo-600 rounded-full" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Reports</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <BarChart3 size={32} /> Item Stock Report
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Complete stock status with procurement, milling, and sales history per product.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchReport} title="Refresh"
            className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Print Header — only visible when printing */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-black text-slate-900">Mill-X — Item Stock Report</h1>
        <p className="text-sm text-slate-500">Generated: {lastRefreshed.toLocaleString('en-IN')}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm font-bold text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-5 print:grid-cols-4 print:gap-3">
          <StatCard label="Total Products" value={summary.totalProducts} icon={Package} color="indigo" sub={`${summary.rawProducts} Raw · ${summary.finishedProducts} Finished · ${summary.byProducts} By-Product`} />
          <StatCard label="Total Stock" value={summary.totalCurrentStock} unit="Kg" icon={Warehouse} color="emerald" />
          <StatCard label="Total Procured" value={summary.totalProcured} unit="Kg" icon={ArrowDown} color="orange" />
          <StatCard label="Total Sold" value={summary.totalSold} unit="Kg" icon={ArrowUp} color="slate" />
          <div className="col-span-2 md:col-span-4 xl:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl border border-slate-800 p-7 flex flex-col justify-between shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Last Refreshed</span>
            </div>
            <p className="text-white font-black text-lg tracking-tight">
              {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
            <p className="text-slate-500 font-semibold text-xs mt-1">
              {lastRefreshed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 print:hidden">
        <div className="relative flex-1 group max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input type="text" placeholder="Search by product name or variety..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold outline-none focus:border-indigo-600 transition-all shadow-sm" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-600 transition-all shadow-sm cursor-pointer">
          <option value="All">All Types</option>
          <option value="Raw">Raw Only</option>
          <option value="Finished">Finished Only</option>
          <option value="By-Product">By-Product Only</option>
        </select>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">
          <Filter size={14} />
          {filtered.length} items
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-100 overflow-hidden print:rounded-none print:shadow-none print:border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                <th className="px-8 py-5">#</th>
                <th className="px-8 py-5 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => toggleSort("name")}>
                  <span className="flex items-center gap-1">Product <SortIcon k="name" /></span>
                </th>
                <th className="px-8 py-5 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => toggleSort("variety")}>
                  <span className="flex items-center gap-1">Variety <SortIcon k="variety" /></span>
                </th>
                <th className="px-8 py-5 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => toggleSort("type")}>
                  <span className="flex items-center gap-1">Type <SortIcon k="type" /></span>
                </th>
                <th className="px-8 py-5 cursor-pointer hover:text-indigo-600 transition-colors text-right" onClick={() => toggleSort("current_stock")}>
                  <span className="flex items-center justify-end gap-1">Current Stock <SortIcon k="current_stock" /></span>
                </th>
                <th className="px-8 py-5 cursor-pointer hover:text-indigo-600 transition-colors text-right" onClick={() => toggleSort("total_procured")}>
                  <span className="flex items-center justify-end gap-1">Procured <SortIcon k="total_procured" /></span>
                </th>
                <th className="px-8 py-5 cursor-pointer hover:text-indigo-600 transition-colors text-right" onClick={() => toggleSort("total_milled")}>
                  <span className="flex items-center justify-end gap-1">Milled <SortIcon k="total_milled" /></span>
                </th>
                <th className="px-8 py-5 cursor-pointer hover:text-indigo-600 transition-colors text-right" onClick={() => toggleSort("total_sold")}>
                  <span className="flex items-center justify-end gap-1">Sold <SortIcon k="total_sold" /></span>
                </th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right print:hidden">Pending Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(10).fill(0).map((__, j) => (
                      <td key={j} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded-lg" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 border-dashed">
                      <Package size={28} className="text-slate-200" />
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">No products found</p>
                  </div>
                </td></tr>
              ) : filtered.map((item, idx) => {
                const status = stockStatus(Number(item.current_stock));
                const tc = TYPE_COLORS[item.type] || TYPE_COLORS["Raw"];
                const hasPending = Number(item.pending_purchase_qty) > 0 || Number(item.pending_sale_qty) > 0;
                return (
                  <tr 
                    key={item.id} 
                    onClick={() => router.push(`/reports/stock/${item.id}/ledger`)}
                    className="group hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <td className="px-8 py-5 text-[10px] font-black text-slate-300">{idx + 1}</td>
                    <td className="px-8 py-5 max-w-[200px]">
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-700 transition-colors truncate" title={item.name}>{item.name}</p>
                    </td>
                    <td className="px-8 py-5 max-w-[150px]">
                      <span className="text-xs font-bold text-slate-500 italic truncate block" title={item.variety}>{item.variety || "—"}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${tc.bg} ${tc.text} ${tc.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
                        {item.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`text-base font-black tracking-tighter ${Number(item.current_stock) <= 0 ? "text-red-600" : Number(item.current_stock) < 500 ? "text-amber-600" : "text-slate-900"}`}>
                        {Number(item.current_stock).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold ml-1 uppercase">{item.unit || "Kg"}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm font-bold text-slate-600">{Number(item.total_procured).toLocaleString()}</span>
                      <span className="text-[9px] text-slate-300 font-bold ml-1 uppercase">{item.unit || "Kg"}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm font-bold text-slate-600">{Number(item.total_milled).toLocaleString()}</span>
                      <span className="text-[9px] text-slate-300 font-bold ml-1 uppercase">{item.unit || "Kg"}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm font-bold text-slate-600">{Number(item.total_sold).toLocaleString()}</span>
                      <span className="text-[9px] text-slate-300 font-bold ml-1 uppercase">{item.unit || "Kg"}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${status.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right print:hidden">
                      {hasPending ? (
                        <div className="flex flex-col items-end gap-1">
                          {Number(item.pending_purchase_qty) > 0 && (
                            <span className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                              <ArrowDown size={10} /> {Number(item.pending_purchase_qty).toLocaleString()} Buy
                            </span>
                          )}
                          {Number(item.pending_sale_qty) > 0 && (
                            <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                              <ArrowUp size={10} /> {Number(item.pending_sale_qty).toLocaleString()} Sell
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-200 uppercase tracking-widest">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals Footer */}
            {!loading && filtered.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white">
                  <td className="px-8 py-5" colSpan={4}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Total ({filtered.length} items)
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-base font-black text-white">
                      {filtered.reduce((s, r) => s + Number(r.current_stock), 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-500 ml-1 font-bold uppercase">Kg</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black text-slate-300">
                      {filtered.reduce((s, r) => s + Number(r.total_procured), 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black text-slate-300">
                      {filtered.reduce((s, r) => s + Number(r.total_milled), 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black text-slate-300">
                      {filtered.reduce((s, r) => s + Number(r.total_sold), 0).toLocaleString()}
                    </span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Low Stock Alert Box */}
      {!loading && items.some(r => Number(r.current_stock) < 500) && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex gap-4 print:hidden">
          <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-amber-700 mb-1">Low Stock Alert</p>
            <p className="text-xs font-semibold text-amber-600">
              The following items are running low (below 500 Kg):{" "}
              <strong>{items.filter(r => Number(r.current_stock) < 500 && Number(r.current_stock) > 0).map(r => r.name).join(", ") || "—"}</strong>
            </p>
            {items.some(r => Number(r.current_stock) <= 0) && (
              <p className="text-xs font-semibold text-red-600 mt-1">
                Out of stock:{" "}
                <strong>{items.filter(r => Number(r.current_stock) <= 0).map(r => r.name).join(", ")}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  );
}
